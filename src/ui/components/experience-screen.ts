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

interface ExperienceCallbacks {
  onComplete: (result: DailyEntryGrant) => void;
  onError: (error: WINRError) => void;
  onEmailRequired: () => void;
}

/**
 * Main experience screen component
 */
export class ExperienceScreen {
  private element: HTMLElement | null = null;
  private callbacks?: ExperienceCallbacks;
  private streakDashboard?: StreakDashboard;
  private bonusSection?: BonusEntriesScreen;
  private howItWorksSection?: HowItWorksScreen;
  private isProcessing: boolean = false;
  private campaignModel: CampaignModel | null = null;

  constructor(
    campaign: Campaign | null,
    private streakState: StreakState | null,
    private sdkConfig: SDKConfig | null
  ) {
    this.campaignModel = campaign ? CampaignModel.fromJSON(campaign) : null;
  }

  public setCallbacks(callbacks: ExperienceCallbacks): void {
    this.callbacks = callbacks;
  }

  public render(): HTMLElement {
    this.element = document.createElement('div');
    this.element.className = 'winr-experience-screen';

    // Check if campaign is active
    if (!this.campaignModel) {
      this.renderNoCampaign();
      return this.element;
    }

    if (!this.isCampaignActive()) {
      this.renderInactiveCampaign();
      return this.element;
    }

    // Render main experience
    this.renderMainExperience();
    return this.element;
  }

  private renderMainExperience(): void {
    if (!this.element) return;

    // Streak dashboard
    this.streakDashboard = new StreakDashboard(
      this.campaignModel!,
      this.streakState,
      this.sdkConfig
    );

    // Stats section
    const statsElement = this.createStatsSection();

    // Main claim button
    const claimSection = this.createClaimSection();

    // Bonus entries section (assuming we have a rewarded video provider)
    this.bonusSection = new BonusEntriesScreen(
      null, // TODO: Pass actual rewarded video provider
      50 // Max bonus entries
    );
    this.bonusSection.setCallbacks({
      onBonusEarned: this.handleBonusEarned.bind(this),
      onError: this.handleBonusError.bind(this),
      onClose: this.handleBonusClose.bind(this),
    });

    // How it works section
    this.howItWorksSection = new HowItWorksScreen();

    // Assemble the screen
    this.element.innerHTML = '';
    this.element.appendChild(this.streakDashboard.render());
    this.element.appendChild(statsElement);
    this.element.appendChild(claimSection);
    
    if (this.campaignModel!.hasAdsEnabled()) {
      this.element.appendChild(this.bonusSection.render());
    }
    
    this.element.appendChild(this.howItWorksSection.render());
  }

  private createStatsSection(): HTMLElement {
    const stats = document.createElement('div');
    stats.className = 'winr-stats';

    const totalEntries = this.streakState?.totalEntriesEarned || 0;
    const currentDay = this.streakState?.currentDay || 1;
    const daysRemaining = this.campaignModel?.daysRemaining() || 0;

    stats.innerHTML = `
      <div class="winr-stat">
        <span class="winr-stat-value">${totalEntries.toLocaleString()}</span>
        <span class="winr-stat-label">Total Entries</span>
      </div>
      <div class="winr-stat">
        <span class="winr-stat-value">${currentDay}</span>
        <span class="winr-stat-label">Current Day</span>
      </div>
      <div class="winr-stat">
        <span class="winr-stat-value">${daysRemaining}</span>
        <span class="winr-stat-label">Days Left</span>
      </div>
    `;

    return stats;
  }

  private createClaimSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'winr-actions';

    const canClaim = this.canClaimToday();
    const buttonText = this.getClaimButtonText();
    const todayEntries = this.getTodayEntries();

    section.innerHTML = `
      <button 
        class="winr-primary-button" 
        id="winr-claim-button"
        ${!canClaim ? 'disabled' : ''}
      >
        <span id="winr-button-text">${buttonText}</span>
      </button>
      ${todayEntries > 0 ? `
        <p style="text-align: center; color: var(--winr-color-text-secondary); font-size: var(--winr-font-size-sm); margin: 0;">
          Claim ${todayEntries} entries for day ${this.streakState?.currentDay || 1}
        </p>
      ` : ''}
    `;

    // Add click handler
    const claimButton = section.querySelector('#winr-claim-button') as HTMLButtonElement;
    claimButton?.addEventListener('click', this.handleClaimRequest.bind(this));

    return section;
  }

  private async handleClaimRequest(): Promise<void> {
    if (this.isProcessing || !this.canClaimToday()) return;

    this.isProcessing = true;
    this.updateClaimButton(true, 'Claiming...');

    try {
      logger.debug('Claiming daily entries...');

      // TODO: Call API through WINR SDK instance
      // For now, simulate the response
      const mockResult: DailyEntryGrant = {
        entries: this.getTodayEntries(),
        streakDay: this.streakState?.currentDay || 1,
        totalEntries: (this.streakState?.totalEntriesEarned || 0) + this.getTodayEntries(),
      };

      // Check if we need email first
      if (this.needsEmailCapture()) {
        this.callbacks?.onEmailRequired();
        return;
      }

      // Success
      this.callbacks?.onComplete(mockResult);

    } catch (error) {
      logger.error('Claim failed:', error);
      this.callbacks?.onError(
        new WINRError(
          WINRErrorCode.NetworkError,
          'Failed to claim entries. Please try again.',
          error instanceof Error ? error : undefined
        )
      );
      this.updateClaimButton(false, this.getClaimButtonText());
    } finally {
      this.isProcessing = false;
    }
  }

  private async handleBonusClaimRequest(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      logger.debug('Claiming bonus entries...');

      // Show rewarded video
      // TODO: Implement actual rewarded video flow
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate ad

      // TODO: Call API to claim bonus
      const bonusAmount = 50; // From ad config

      // Update total entries
      if (this.streakState) {
        this.streakState.totalEntriesEarned += bonusAmount;
      }

      // Update UI
      this.refreshStats();

      logger.debug(`Claimed ${bonusAmount} bonus entries`);

    } catch (error) {
      logger.error('Bonus claim failed:', error);
      this.callbacks?.onError(
        new WINRError(
          WINRErrorCode.RewardedVideoUnavailable,
          'Bonus entries not available. Please try again later.',
          error instanceof Error ? error : undefined
        )
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private updateClaimButton(loading: boolean, text: string): void {
    const button = this.element?.querySelector('#winr-claim-button') as HTMLButtonElement;
    const buttonText = this.element?.querySelector('#winr-button-text');
    
    if (!button || !buttonText) return;

    button.disabled = loading;
    
    if (loading) {
      buttonText.innerHTML = `<span class="winr-spinner"></span> ${text}`;
    } else {
      buttonText.textContent = text;
    }
  }

  private refreshStats(): void {
    const statsElement = this.element?.querySelector('.winr-stats');
    if (!statsElement) return;

    const totalEntries = this.streakState?.totalEntriesEarned || 0;
    const totalElement = statsElement.querySelector('.winr-stat-value');
    if (totalElement) {
      totalElement.textContent = totalEntries.toLocaleString();
    }
  }

  private canClaimToday(): boolean {
    if (!this.streakState) return true; // First time claiming
    
    // Check if already claimed today
    if (!this.streakState.lastClaimedDate) return true;
    
    const today = new Date();
    const lastClaim = this.streakState.lastClaimedDate;
    
    return (
      today.getUTCFullYear() !== lastClaim.getUTCFullYear() ||
      today.getUTCMonth() !== lastClaim.getUTCMonth() ||
      today.getUTCDate() !== lastClaim.getUTCDate()
    );
  }

  private getTodayEntries(): number {
    if (!this.campaignModel) return 0;
    const day = this.streakState?.currentDay || 1;
    return this.campaignModel.getBaseEntries(day);
  }

  private getClaimButtonText(): string {
    if (!this.canClaimToday()) {
      return 'Come back tomorrow';
    }
    
    return this.sdkConfig?.copy?.dailyClaimButton || 'Claim Daily Entries';
  }

  private needsEmailCapture(): boolean {
    // TODO: Check if user has submitted email
    // For now, assume email is needed if age gate is enabled
    return this.sdkConfig?.ageGateEnabled === true;
  }

  private isCampaignActive(): boolean {
    return this.campaignModel?.isActive() === true;
  }

  private renderNoCampaign(): void {
    if (!this.element) return;

    this.element.innerHTML = `
      <div style="text-align: center; padding: var(--winr-spacing-xl);">
        <h3 style="color: var(--winr-color-text); margin-bottom: var(--winr-spacing-md);">
          No Active Campaign
        </h3>
        <p style="color: var(--winr-color-text-secondary); margin: 0;">
          There are no active campaigns at the moment. Check back soon!
        </p>
      </div>
    `;
  }

  private renderInactiveCampaign(): void {
    if (!this.element) return;

    const startDate = this.campaignModel?.startDate ? new Date(this.campaignModel.startDate) : null;
    const endDate = this.campaignModel?.endDate ? new Date(this.campaignModel.endDate) : null;
    const now = new Date();

    let message = 'This campaign is not currently active.';
    
    if (startDate && startDate > now) {
      message = `This campaign starts on ${startDate.toLocaleDateString()}.`;
    } else if (endDate && endDate < now) {
      message = `This campaign ended on ${endDate.toLocaleDateString()}.`;
    }

    this.element.innerHTML = `
      <div style="text-align: center; padding: var(--winr-spacing-xl);">
        <h3 style="color: var(--winr-color-text); margin-bottom: var(--winr-spacing-md);">
          ${this.campaignModel?.title || 'Campaign Inactive'}
        </h3>
        <p style="color: var(--winr-color-text-secondary); margin: 0;">
          ${message}
        </p>
      </div>
    `;
  }

  private handleBonusEarned(entries: number): void {
    logger.info(`Bonus entries earned: ${entries}`);
    // TODO: Update total entries display
  }

  private handleBonusError(error: WINRError): void {
    logger.error('Bonus entries error:', error);
    this.callbacks?.onError?.(error);
  }

  private handleBonusClose(): void {
    logger.debug('Bonus entries screen closed');
  }
}