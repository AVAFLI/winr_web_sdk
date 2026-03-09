import { WINRError, WINRErrorCode, RewardedVideoProvider } from '../../types';
import { logger } from '../../services/logger';
import { analyticsAdapter } from '../../services/analytics';

/**
 * Bonus entries screen — matches iOS BonusEntriesView.swift
 * Simple: title, description, "WATCH & CLAIM" button, skip text
 */
export class BonusEntriesScreen {
  private element: HTMLElement | null = null;
  private callbacks: {
    onBonusEarned?: (entries: number) => void;
    onError?: (error: WINRError) => void;
    onClose?: () => void;
  } = {};
  private isLoading = false;

  constructor(
    private rewardedVideoProvider: RewardedVideoProvider | null,
    private maxBonusEntries: number = 50
  ) {}

  public setCallbacks(callbacks: {
    onBonusEarned?: (entries: number) => void;
    onError?: (error: WINRError) => void;
    onClose?: () => void;
  }): void {
    this.callbacks = callbacks;
  }

  public render(): HTMLElement {
    this.element = document.createElement('div');
    this.element.className = 'winr-bonus-entries';
    this.buildUI();
    analyticsAdapter.track('winr_bonus_entries_viewed', {
      hasProvider: !!this.rewardedVideoProvider,
    });
    return this.element;
  }

  private buildUI(): void {
    if (!this.element) return;

    const entries = this.maxBonusEntries;

    // Title
    const title = document.createElement('h2');
    title.className = 'winr-bonus-title';
    title.textContent = 'BONUS ENTRIES';

    // Description
    const desc = document.createElement('p');
    desc.className = 'winr-bonus-desc';
    desc.textContent = `Watch a short video to double today's ${entries} entries.`;

    // Watch & Claim button
    const claimBtn = document.createElement('button');
    claimBtn.className = 'winr-bonus-claim-btn';
    claimBtn.textContent = `WATCH & CLAIM ${entries * 2} ENTRIES`;
    claimBtn.addEventListener('click', () => this.handleWatch());

    // Skip button
    const skipBtn = document.createElement('button');
    skipBtn.className = 'winr-bonus-skip';
    skipBtn.textContent = `No thanks, continue with ${entries} entries`;
    skipBtn.addEventListener('click', () => {
      analyticsAdapter.track('winr_bonus_entries_skipped');
      this.callbacks.onClose?.();
    });

    this.element.appendChild(title);
    this.element.appendChild(desc);
    this.element.appendChild(claimBtn);
    this.element.appendChild(skipBtn);
  }

  private async handleWatch(): Promise<void> {
    if (!this.rewardedVideoProvider || this.isLoading) {
      // If no provider, just skip
      this.callbacks.onClose?.();
      return;
    }

    this.isLoading = true;
    analyticsAdapter.track('winr_rewarded_video_started');

    try {
      await this.rewardedVideoProvider.load();
      const result = await this.rewardedVideoProvider.show();

      if (result.success && result.reward) {
        const bonusEntries = Math.min(result.reward.amount || this.maxBonusEntries, this.maxBonusEntries);
        analyticsAdapter.track('winr_rewarded_video_completed', { bonusEntries });
        this.callbacks.onBonusEarned?.(bonusEntries);
      } else {
        this.isLoading = false;
        analyticsAdapter.track('winr_rewarded_video_failed', { reason: 'incomplete' });
      }
    } catch (error) {
      logger.error('Rewarded video error:', error);
      this.isLoading = false;
      this.callbacks.onError?.(
        new WINRError(
          WINRErrorCode.RewardedVideoUnavailable,
          'Failed to show rewarded video',
          error instanceof Error ? error : undefined
        )
      );
    }
  }
}
