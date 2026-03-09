import {
  Campaign,
  StreakState,
  SDKConfig,
  DailyEntryGrant,
  WINRError,
  WINRErrorCode,
} from '../../types';
import { CampaignModel } from '../../domain/campaign';
import { logger } from '../../services/logger';
import { StreakDashboard } from './streak-dashboard';
import { BonusEntriesScreen } from './bonus-entries';
import { HowItWorksScreen } from './how-it-works';
import { EmailCaptureScreen } from './email-capture';

/**
 * State machine matching iOS WINRExperienceViewModel.State
 */
type ExperienceState =
  | { kind: 'loading' }
  | { kind: 'emailCapture' }
  | { kind: 'streak'; claimedToday: boolean }
  | { kind: 'bonus'; baseEntries: number }
  | { kind: 'howItWorks' }
  | { kind: 'completed'; totalEntries: number }
  | { kind: 'error'; message: string };

interface ExperienceCallbacks {
  onComplete: (result: DailyEntryGrant) => void;
  onError: (error: WINRError) => void;
  onEmailRequired: () => void;
  onClose?: () => void;
  onShowInfo?: () => void;
  onHideInfo?: () => void;
}

/**
 * Main experience screen — matches iOS WINRExperienceView.swift
 * Implements state machine: loading → emailCapture → streak → bonus → completed
 */
export class ExperienceScreen {
  private element: HTMLElement | null = null;
  private contentEl: HTMLElement | null = null;
  private callbacks?: ExperienceCallbacks;
  private campaignModel: CampaignModel | null = null;
  private state: ExperienceState = { kind: 'loading' };
  private previousState: ExperienceState | null = null;
  private isProcessing = false;

  // Track header update callback for modal
  public onHeaderUpdate?: (state: {
    showBack: boolean;
    showInfo: boolean;
  }) => void;

  constructor(
    private campaign: Campaign | null,
    private streakState: StreakState | null,
    private sdkConfig: SDKConfig | null,
    private claimedToday = false,
    private hasEmail = false
  ) {
    this.campaignModel = campaign ? CampaignModel.fromJSON(campaign) : null;
  }

  public setCallbacks(callbacks: ExperienceCallbacks): void {
    this.callbacks = callbacks;
  }

  public render(): HTMLElement {
    this.element = document.createElement('div');
    this.element.className = 'winr-experience-screen';

    // Content container (screens render into this)
    this.contentEl = document.createElement('div');
    this.contentEl.style.width = '100%';
    this.contentEl.style.height = '100%';
    this.element.appendChild(this.contentEl);

    // Start state machine
    if (!this.campaignModel || !this.campaignModel.isActive()) {
      this.transitionTo({ kind: 'error', message: 'No active campaign at the moment.' });
    } else if (!this.hasEmail) {
      this.transitionTo({ kind: 'emailCapture' });
    } else if (!this.claimedToday) {
      this.transitionTo({ kind: 'streak', claimedToday: false });
    } else {
      this.transitionTo({ kind: 'streak', claimedToday: true });
    }

    return this.element;
  }

  /** Navigate to How It Works (called from header info button) */
  public showHowItWorks(): void {
    this.previousState = this.state;
    this.transitionTo({ kind: 'howItWorks' });
  }

  /** Navigate back from How It Works */
  public hideHowItWorks(): void {
    if (this.previousState) {
      this.transitionTo(this.previousState);
      this.previousState = null;
    }
  }

  // ── State machine ──

  private transitionTo(newState: ExperienceState): void {
    this.state = newState;
    this.renderState();
    this.notifyHeader();
  }

  private notifyHeader(): void {
    const isHowItWorks = this.state.kind === 'howItWorks';
    const infoAvailable = this.state.kind === 'streak' || this.state.kind === 'emailCapture';

    this.onHeaderUpdate?.({
      showBack: isHowItWorks,
      showInfo: infoAvailable && !isHowItWorks,
    });
  }

  private renderState(): void {
    if (!this.contentEl) return;
    this.contentEl.innerHTML = '';

    switch (this.state.kind) {
      case 'loading':
        this.renderLoading();
        break;
      case 'emailCapture':
        this.renderEmailCapture();
        break;
      case 'streak':
        this.renderStreak(this.state.claimedToday);
        break;
      case 'bonus':
        this.renderBonus(this.state.baseEntries);
        break;
      case 'howItWorks':
        this.renderHowItWorks();
        break;
      case 'completed':
        this.renderCompleted(this.state.totalEntries);
        break;
      case 'error':
        this.renderError(this.state.message);
        break;
    }
  }

  // ── Renderers ──

  private renderLoading(): void {
    const el = document.createElement('div');
    el.className = 'winr-loading-state';
    el.innerHTML = `
      <div class="winr-loading-spinner"></div>
      <span class="winr-loading-text">Loading today's reward…</span>
    `;
    this.contentEl!.appendChild(el);
  }

  private renderEmailCapture(): void {
    const screen = new EmailCaptureScreen(
      this.sdkConfig,
      this.campaign,
      this.sdkConfig?.rulesUrl || this.campaign?.rulesUrl,
      undefined // prefillEmail
    );
    screen.setCallbacks({
      onSubmitted: () => {
        this.hasEmail = true;
        this.transitionTo({ kind: 'streak', claimedToday: false });
      },
      onError: (err) => this.callbacks?.onError(err),
    });
    this.contentEl!.appendChild(screen.render());
  }

  private renderStreak(claimedToday: boolean): void {
    if (!this.campaignModel) return;

    const dashboard = new StreakDashboard(
      this.campaignModel,
      this.streakState,
      this.sdkConfig
    );
    dashboard.setClaimedToday(claimedToday);
    dashboard.setCallbacks({
      onClaim: () => this.handleClaim(),
      onClose: () => this.callbacks?.onClose?.(),
    });
    this.contentEl!.appendChild(dashboard.render());
  }

  private renderBonus(baseEntries: number): void {
    const bonus = new BonusEntriesScreen(null, baseEntries);
    bonus.setCallbacks({
      onBonusEarned: (entries) => {
        const total = (this.streakState?.totalEntriesEarned || 0) + baseEntries + entries;
        this.transitionTo({ kind: 'completed', totalEntries: total });
        this.callbacks?.onComplete({
          entries: baseEntries + entries,
          streakDay: this.streakState?.currentDay || 1,
          totalEntries: total,
        });
      },
      onClose: () => {
        const total = (this.streakState?.totalEntriesEarned || 0) + baseEntries;
        this.transitionTo({ kind: 'completed', totalEntries: total });
        this.callbacks?.onComplete({
          entries: baseEntries,
          streakDay: this.streakState?.currentDay || 1,
          totalEntries: total,
        });
      },
      onError: (err) => this.callbacks?.onError(err),
    });
    this.contentEl!.appendChild(bonus.render());
  }

  private renderHowItWorks(): void {
    const hiw = new HowItWorksScreen();
    hiw.setCallbacks({
      onClose: () => this.hideHowItWorks(),
    });
    this.contentEl!.appendChild(hiw.render());
  }

  private renderCompleted(totalEntries: number): void {
    const el = document.createElement('div');
    el.className = 'winr-card-state';
    el.innerHTML = `
      <h2>Entries Claimed!</h2>
      <p>+${totalEntries} entries added to this month's drawing.</p>
    `;
    const btn = document.createElement('button');
    btn.textContent = 'Close';
    btn.addEventListener('click', () => this.callbacks?.onClose?.());
    el.appendChild(btn);
    this.contentEl!.appendChild(el);
  }

  private renderError(message: string): void {
    const el = document.createElement('div');
    el.className = 'winr-card-state';
    el.innerHTML = `
      <h2>Something went wrong.</h2>
      <p>${message || 'Please try again later.'}</p>
    `;
    const btn = document.createElement('button');
    btn.textContent = 'Close';
    btn.addEventListener('click', () => this.callbacks?.onClose?.());
    el.appendChild(btn);
    this.contentEl!.appendChild(el);
  }

  // ── Actions ──

  private async handleClaim(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      logger.debug('Claiming daily entries...');

      const currentDay = this.streakState?.currentDay || 1;
      const entries = this.campaignModel?.getBaseEntries(currentDay) || 0;

      // TODO: Call backend API
      const result: DailyEntryGrant = {
        entries,
        streakDay: currentDay,
        totalEntries: (this.streakState?.totalEntriesEarned || 0) + entries,
      };

      this.claimedToday = true;

      // If campaign has ads, go to bonus; otherwise complete
      if (this.campaignModel?.hasAdsEnabled() && this.campaignModel.doublingEnabled) {
        this.transitionTo({ kind: 'bonus', baseEntries: entries });
      } else {
        this.transitionTo({ kind: 'completed', totalEntries: result.totalEntries });
        this.callbacks?.onComplete(result);
      }
    } catch (error) {
      logger.error('Claim failed:', error);
      this.callbacks?.onError(
        new WINRError(
          WINRErrorCode.NetworkError,
          'Failed to claim entries. Please try again.',
          error instanceof Error ? error : undefined
        )
      );
    } finally {
      this.isProcessing = false;
    }
  }
}
