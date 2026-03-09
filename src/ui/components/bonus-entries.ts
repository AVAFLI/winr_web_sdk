import { WINRError, WINRErrorCode, RewardedVideoProvider } from '../../types';
import { logger } from '../../services/logger';
import { analyticsAdapter } from '../../services/analytics';

/**
 * Bonus entries component via rewarded video
 * Handles rewarded video integration and bonus entry claiming
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

  /**
   * Set callback functions
   */
  public setCallbacks(callbacks: {
    onBonusEarned?: (entries: number) => void;
    onError?: (error: WINRError) => void;
    onClose?: () => void;
  }): void {
    this.callbacks = callbacks;
  }

  /**
   * Render the bonus entries screen
   */
  public render(): HTMLElement {
    this.element = document.createElement('div');
    this.element.className = 'winr-bonus-entries';
    this.element.innerHTML = this.getHTML();
    
    this.setupEventListeners();
    this.checkAdAvailability();
    
    // Track screen view
    analyticsAdapter.track('winr_bonus_entries_viewed', {
      hasProvider: !!this.rewardedVideoProvider,
    });
    
    return this.element;
  }

  private getHTML(): string {
    return `
      <div class="winr-bonus-container">
        <div class="winr-bonus-header" style="text-align: center; margin-bottom: var(--winr-spacing-lg);">
          <div class="winr-bonus-icon" style="
            font-size: 48px;
            margin-bottom: var(--winr-spacing-sm);
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
          ">🎬</div>
          <h2 style="
            color: var(--winr-color-text);
            font-size: var(--winr-font-size-xl);
            font-weight: var(--winr-font-weight-bold);
            margin: 0 0 var(--winr-spacing-sm) 0;
          ">Earn Bonus Entries</h2>
          <p style="
            color: var(--winr-color-text-secondary);
            font-size: var(--winr-font-size-base);
            margin: 0;
            line-height: 1.5;
          ">Watch a short video to earn up to <strong style="color: var(--winr-color-primary);">${this.maxBonusEntries} bonus entries</strong>!</p>
        </div>

        <div id="winr-bonus-content" class="winr-bonus-content">
          ${this.getContentHTML()}
        </div>

        <div class="winr-bonus-actions" style="
          display: flex;
          gap: var(--winr-spacing-sm);
          margin-top: var(--winr-spacing-lg);
        ">
          <button
            type="button"
            id="winr-bonus-close"
            class="winr-button winr-button-secondary"
            style="
              flex: 1;
              padding: var(--winr-spacing-sm) var(--winr-spacing-md);
              border: 2px solid var(--winr-color-text-secondary);
              border-radius: var(--winr-border-radius-md);
              background: transparent;
              color: var(--winr-color-text-secondary);
              font-family: var(--winr-font-family);
              font-size: var(--winr-font-size-base);
              font-weight: var(--winr-font-weight-medium);
              cursor: pointer;
              transition: all 0.2s ease;
            "
          >Close</button>
          
          <button
            type="button"
            id="winr-watch-video"
            class="winr-button winr-button-primary"
            style="
              flex: 2;
              padding: var(--winr-spacing-sm) var(--winr-spacing-md);
              border: 2px solid var(--winr-color-primary);
              border-radius: var(--winr-border-radius-md);
              background: var(--winr-color-primary);
              color: white;
              font-family: var(--winr-font-family);
              font-size: var(--winr-font-size-base);
              font-weight: var(--winr-font-weight-medium);
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: var(--winr-spacing-xs);
            "
            disabled
          >
            <span>🎬</span>
            <span id="winr-watch-text">Checking availability...</span>
          </button>
        </div>
      </div>
    `;
  }

  private getContentHTML(): string {
    if (!this.rewardedVideoProvider) {
      return `
        <div class="winr-no-ads" style="
          text-align: center;
          padding: var(--winr-spacing-lg);
          background: var(--winr-color-warning);
          border-radius: var(--winr-border-radius-md);
          border-left: 4px solid #f59e0b;
        ">
          <p style="
            color: var(--winr-color-text);
            margin: 0;
            font-weight: var(--winr-font-weight-medium);
          ">Bonus entries are not available right now.</p>
          <p style="
            color: var(--winr-color-text-secondary);
            margin: var(--winr-spacing-sm) 0 0 0;
            font-size: var(--winr-font-size-sm);
          ">Please try again later or continue with your regular entries.</p>
        </div>
      `;
    }

    return `
      <div class="winr-video-info" style="
        background: var(--winr-color-surface);
        border-radius: var(--winr-border-radius-md);
        padding: var(--winr-spacing-md);
        border: 2px solid transparent;
        transition: all 0.2s ease;
      ">
        <div class="winr-info-grid" style="
          display: grid;
          grid-template-columns: auto 1fr;
          gap: var(--winr-spacing-md);
          align-items: center;
        ">
          <div class="winr-info-icon" style="
            width: 48px;
            height: 48px;
            background: var(--winr-color-primary);
            border-radius: var(--winr-border-radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          ">⏱️</div>
          <div class="winr-info-text">
            <h3 style="
              color: var(--winr-color-text);
              font-size: var(--winr-font-size-base);
              font-weight: var(--winr-font-weight-semibold);
              margin: 0 0 var(--winr-spacing-xs) 0;
            ">30-Second Video</h3>
            <p style="
              color: var(--winr-color-text-secondary);
              font-size: var(--winr-font-size-sm);
              margin: 0;
              line-height: 1.4;
            ">Watch a short advertisement and earn bonus entries instantly.</p>
          </div>
        </div>

        <div class="winr-video-benefits" style="margin-top: var(--winr-spacing-md);">
          <div style="
            display: flex;
            align-items: center;
            gap: var(--winr-spacing-sm);
            color: var(--winr-color-success);
            font-size: var(--winr-font-size-sm);
            font-weight: var(--winr-font-weight-medium);
          ">
            <span>✓</span>
            <span>Quick and easy</span>
          </div>
          <div style="
            display: flex;
            align-items: center;
            gap: var(--winr-spacing-sm);
            color: var(--winr-color-success);
            font-size: var(--winr-font-size-sm);
            font-weight: var(--winr-font-weight-medium);
            margin-top: var(--winr-spacing-xs);
          ">
            <span>✓</span>
            <span>Instant bonus entries</span>
          </div>
          <div style="
            display: flex;
            align-items: center;
            gap: var(--winr-spacing-sm);
            color: var(--winr-color-success);
            font-size: var(--winr-font-size-sm);
            font-weight: var(--winr-font-weight-medium);
            margin-top: var(--winr-spacing-xs);
          ">
            <span>✓</span>
            <span>No personal information required</span>
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    if (!this.element) return;

    const watchButton = this.element.querySelector('#winr-watch-video') as HTMLButtonElement;
    const closeButton = this.element.querySelector('#winr-bonus-close') as HTMLButtonElement;

    // Watch video button
    watchButton.addEventListener('click', () => {
      this.handleWatchVideo();
    });

    // Close button
    closeButton.addEventListener('click', () => {
      analyticsAdapter.track('winr_bonus_entries_closed');
      this.callbacks.onClose?.();
    });

    // Button hover effects
    watchButton.addEventListener('mouseenter', () => {
      if (!watchButton.disabled) {
        watchButton.style.transform = 'translateY(-2px)';
        watchButton.style.boxShadow = 'var(--winr-shadow-lg)';
      }
    });

    watchButton.addEventListener('mouseleave', () => {
      watchButton.style.transform = 'none';
      watchButton.style.boxShadow = 'none';
    });

    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.borderColor = 'var(--winr-color-text)';
      closeButton.style.color = 'var(--winr-color-text)';
    });

    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.borderColor = 'var(--winr-color-text-secondary)';
      closeButton.style.color = 'var(--winr-color-text-secondary)';
    });
  }

  private async checkAdAvailability(): Promise<void> {
    const watchButton = this.element?.querySelector('#winr-watch-video') as HTMLButtonElement;
    const watchText = this.element?.querySelector('#winr-watch-text') as HTMLElement;

    if (!this.rewardedVideoProvider) {
      watchButton.disabled = true;
      watchButton.style.opacity = '0.5';
      watchText.textContent = 'Not Available';
      return;
    }

    try {
      // Load the ad in the background
      await this.rewardedVideoProvider.load();
      
      // Check if available
      const isAvailable = await this.rewardedVideoProvider.isAvailable();
      
      if (isAvailable) {
        watchButton.disabled = false;
        watchButton.style.opacity = '1';
        watchText.textContent = 'Watch Video';
        
        // Add pulsing animation to indicate readiness
        watchButton.style.animation = 'winr-pulse 2s infinite';
      } else {
        watchButton.disabled = true;
        watchButton.style.opacity = '0.5';
        watchText.textContent = 'No ads available';
        
        analyticsAdapter.track('winr_rewarded_video_unavailable');
      }

    } catch (error) {
      logger.error('Failed to load rewarded video:', error);
      
      watchButton.disabled = true;
      watchButton.style.opacity = '0.5';
      watchText.textContent = 'Error loading';
      
      const winrError = new WINRError(
        WINRErrorCode.RewardedVideoUnavailable,
        'Failed to load rewarded video',
        error instanceof Error ? error : undefined
      );
      
      this.callbacks.onError?.(winrError);
    }
  }

  private async handleWatchVideo(): Promise<void> {
    if (!this.rewardedVideoProvider || this.isLoading) return;

    const watchButton = this.element?.querySelector('#winr-watch-video') as HTMLButtonElement;
    const watchText = this.element?.querySelector('#winr-watch-text') as HTMLElement;

    try {
      this.isLoading = true;
      watchButton.disabled = true;
      watchButton.style.opacity = '0.5';
      watchButton.style.animation = 'none';
      watchText.textContent = 'Loading...';

      analyticsAdapter.track('winr_rewarded_video_started');

      // Show the rewarded video
      const result = await this.rewardedVideoProvider.show();

      if (result.success && result.reward) {
        // Calculate bonus entries based on reward
        const bonusEntries = Math.min(
          result.reward.amount || this.maxBonusEntries,
          this.maxBonusEntries
        );

        // Show success state
        this.showSuccessState(bonusEntries);
        
        analyticsAdapter.track('winr_rewarded_video_completed', {
          bonusEntries,
          rewardType: result.reward.type,
          rewardAmount: result.reward.amount,
        });

        // Notify callback
        this.callbacks.onBonusEarned?.(bonusEntries);

      } else {
        // Video was not completed or no reward
        watchText.textContent = 'Try Again';
        this.isLoading = false;
        watchButton.disabled = false;
        watchButton.style.opacity = '1';
        
        analyticsAdapter.track('winr_rewarded_video_failed', {
          reason: 'incomplete',
        });
      }

    } catch (error) {
      logger.error('Rewarded video error:', error);
      
      watchText.textContent = 'Error - Try Again';
      this.isLoading = false;
      watchButton.disabled = false;
      watchButton.style.opacity = '1';
      
      const winrError = new WINRError(
        WINRErrorCode.RewardedVideoUnavailable,
        'Failed to show rewarded video',
        error instanceof Error ? error : undefined
      );
      
      analyticsAdapter.track('winr_rewarded_video_error', {
        error: winrError.message,
      });
      
      this.callbacks.onError?.(winrError);
    }
  }

  private showSuccessState(bonusEntries: number): void {
    const contentElement = this.element?.querySelector('#winr-bonus-content');
    const watchButton = this.element?.querySelector('#winr-watch-video') as HTMLButtonElement;
    
    if (!contentElement) return;

    // Update content to show success
    contentElement.innerHTML = `
      <div class="winr-bonus-success" style="
        text-align: center;
        padding: var(--winr-spacing-lg);
        background: linear-gradient(135deg, var(--winr-color-success) 0%, #10b981 100%);
        border-radius: var(--winr-border-radius-md);
        color: white;
        animation: winr-bounce-in 0.5s ease-out;
      ">
        <div style="font-size: 48px; margin-bottom: var(--winr-spacing-sm);">🎉</div>
        <h3 style="
          font-size: var(--winr-font-size-xl);
          font-weight: var(--winr-font-weight-bold);
          margin: 0 0 var(--winr-spacing-sm) 0;
        ">Awesome!</h3>
        <p style="
          font-size: var(--winr-font-size-lg);
          margin: 0 0 var(--winr-spacing-sm) 0;
          font-weight: var(--winr-font-weight-semibold);
        ">+${bonusEntries} Bonus Entries</p>
        <p style="
          font-size: var(--winr-font-size-base);
          margin: 0;
          opacity: 0.9;
        ">These entries have been added to your total!</p>
      </div>
    `;

    // Update button to show success
    watchButton.style.background = 'var(--winr-color-success)';
    watchButton.style.borderColor = 'var(--winr-color-success)';
    watchButton.querySelector('#winr-watch-text')!.textContent = 'Video Complete!';
    watchButton.disabled = true;

    // Auto-close after showing success
    setTimeout(() => {
      this.callbacks.onClose?.();
    }, 3000);
  }
}