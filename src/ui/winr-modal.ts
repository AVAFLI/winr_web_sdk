import {
  Campaign,
  DailyEntryGrant,
  WINRError,
  WINRErrorCode,
  Theme,
  PresentationOptions,
  StreakState,
  SDKConfig,
} from '../types';
import { createTheme } from './theme';
import { injectStyles } from './styles';
import { logger } from '../services/logger';
import { ExperienceScreen } from './components/experience-screen';
import { EmailCaptureScreen } from './components/email-capture';

/**
 * Main WINR modal that orchestrates the entire user experience
 */
export class WINRModal {
  private element: HTMLElement | null = null;
  private theme: Theme;
  private cleanupStyles?: () => void;
  private currentScreen: 'experience' | 'email' | 'success' = 'experience';
  private experienceScreen?: ExperienceScreen;
  private emailScreen?: EmailCaptureScreen;

  constructor(
    private campaign: Campaign | null,
    private streakState: StreakState | null,
    private sdkConfig: SDKConfig | null,
    private options: PresentationOptions = {}
  ) {
    this.theme = createTheme(this.sdkConfig?.branding);
  }

  /**
   * Present the modal
   */
  public async present(): Promise<DailyEntryGrant> {
    return new Promise((resolve, reject) => {
      try {
        this.show(resolve, reject);
      } catch (error) {
        reject(new WINRError(
          WINRErrorCode.InvalidState,
          'Failed to present modal',
          error instanceof Error ? error : undefined
        ));
      }
    });
  }

  /**
   * Present inline in a container
   */
  public async presentInline(containerId: string): Promise<DailyEntryGrant> {
    return new Promise((resolve, reject) => {
      try {
        const container = document.getElementById(containerId);
        if (!container) {
          reject(new WINRError(
            WINRErrorCode.InvalidState,
            `Container element with ID "${containerId}" not found`
          ));
          return;
        }

        this.showInline(container, resolve, reject);
      } catch (error) {
        reject(new WINRError(
          WINRErrorCode.InvalidState,
          'Failed to present inline modal',
          error instanceof Error ? error : undefined
        ));
      }
    });
  }

  /**
   * Dismiss the modal
   */
  public dismiss(): void {
    if (!this.element) return;

    logger.debug('Dismissing WINR modal');

    // Add exit animation
    this.element.classList.add('winr-modal-exit');

    // Remove after animation
    setTimeout(() => {
      this.cleanup();
      this.options.onClose?.();
    }, 200);
  }

  private show(
    resolve: (value: DailyEntryGrant) => void,
    reject: (reason?: any) => void
  ): void {
    // Inject styles
    this.cleanupStyles = injectStyles(this.theme);

    // Create modal structure
    this.element = this.createElement();
    document.body.appendChild(this.element);

    // Set up event handlers
    this.setupEventHandlers(resolve, reject);

    // Initialize first screen
    this.showCurrentScreen();

    // Focus management
    this.focusModal();

    logger.debug('WINR modal presented');
  }

  private showInline(
    container: HTMLElement,
    resolve: (value: DailyEntryGrant) => void,
    reject: (reason?: any) => void
  ): void {
    // Inject styles
    this.cleanupStyles = injectStyles(this.theme);

    // Create modal content without overlay
    this.element = this.createInlineElement();
    container.appendChild(this.element);

    // Set up event handlers
    this.setupEventHandlers(resolve, reject);

    // Initialize first screen
    this.showCurrentScreen();

    logger.debug('WINR modal presented inline');
  }

  private createElement(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'winr-modal-overlay';
    overlay.innerHTML = `
      <div class="winr-modal">
        <div class="winr-modal-header">
          <button class="winr-close-button" aria-label="Close">×</button>
          ${this.sdkConfig?.branding?.logoUrl ? `<img src="${this.sdkConfig.branding.logoUrl}" alt="Logo" class="winr-logo">` : ''}
          <h1 class="winr-header-title">${this.getWelcomeTitle()}</h1>
          <p class="winr-header-subtitle">${this.getWelcomeSubtitle()}</p>
        </div>
        <div class="winr-modal-content" id="winr-content">
          <!-- Content will be populated by screen components -->
        </div>
      </div>
    `;
    return overlay;
  }

  private createInlineElement(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'winr-modal';
    modal.innerHTML = `
      <div class="winr-modal-header">
        <button class="winr-close-button" aria-label="Close">×</button>
        ${this.sdkConfig?.branding?.logoUrl ? `<img src="${this.sdkConfig.branding.logoUrl}" alt="Logo" class="winr-logo">` : ''}
        <h1 class="winr-header-title">${this.getWelcomeTitle()}</h1>
        <p class="winr-header-subtitle">${this.getWelcomeSubtitle()}</p>
      </div>
      <div class="winr-modal-content" id="winr-content">
        <!-- Content will be populated by screen components -->
      </div>
    `;
    return modal;
  }

  private setupEventHandlers(
    resolve: (value: DailyEntryGrant) => void,
    reject: (reason?: any) => void
  ): void {
    if (!this.element) return;

    // Close button
    const closeButton = this.element.querySelector('.winr-close-button');
    closeButton?.addEventListener('click', () => {
      reject(new WINRError(WINRErrorCode.InvalidState, 'Modal dismissed by user'));
      this.dismiss();
    });

    // Click outside to close (only for overlay mode)
    if (this.element.classList.contains('winr-modal-overlay')) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          reject(new WINRError(WINRErrorCode.InvalidState, 'Modal dismissed by user'));
          this.dismiss();
        }
      });
    }

    // Escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        reject(new WINRError(WINRErrorCode.InvalidState, 'Modal dismissed by user'));
        this.dismiss();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Screen transition handlers
    this.setupScreenHandlers(resolve, reject);
  }

  private setupScreenHandlers(
    resolve: (value: DailyEntryGrant) => void,
    reject: (reason?: any) => void
  ): void {
    // Experience screen completion
    const handleExperienceComplete = (result: DailyEntryGrant) => {
      logger.debug('Experience completed:', result);
      this.options.onComplete?.(result);
      resolve(result);
      this.showSuccessAnimation(result);
    };

    // Experience screen error
    const handleExperienceError = (error: WINRError) => {
      logger.error('Experience error:', error);
      this.options.onError?.(error);
      reject(error);
    };

    // Email required
    const handleEmailRequired = () => {
      logger.debug('Email capture required');
      this.currentScreen = 'email';
      this.showCurrentScreen();
    };

    // Email submitted
    const handleEmailSubmitted = () => {
      logger.debug('Email submitted, returning to experience');
      this.currentScreen = 'experience';
      this.showCurrentScreen();
    };

    // Store handlers for screen initialization
    this.experienceScreen?.setCallbacks({
      onComplete: handleExperienceComplete,
      onError: handleExperienceError,
      onEmailRequired: handleEmailRequired,
    });

    this.emailScreen?.setCallbacks({
      onSubmitted: handleEmailSubmitted,
      onError: handleExperienceError,
    });
  }

  private showCurrentScreen(): void {
    const contentElement = this.element?.querySelector('#winr-content');
    if (!contentElement) return;

    switch (this.currentScreen) {
      case 'experience':
        this.showExperienceScreen(contentElement);
        break;
      case 'email':
        this.showEmailScreen(contentElement);
        break;
      case 'success':
        this.showSuccessScreen(contentElement);
        break;
    }
  }

  private showExperienceScreen(container: Element): void {
    this.experienceScreen = new ExperienceScreen(
      this.campaign,
      this.streakState,
      this.sdkConfig
    );
    container.innerHTML = '';
    container.appendChild(this.experienceScreen.render());
  }

  private showEmailScreen(container: Element): void {
    this.emailScreen = new EmailCaptureScreen(this.sdkConfig);
    container.innerHTML = '';
    container.appendChild(this.emailScreen.render());
  }

  private showSuccessScreen(container: Element): void {
    const successElement = document.createElement('div');
    successElement.className = 'winr-success-animation';
    successElement.innerHTML = `
      <div class="winr-success-icon">🎉</div>
      <h3 style="color: var(--winr-color-text); text-align: center; margin: var(--winr-spacing-md) 0;">
        Entries Claimed Successfully!
      </h3>
      <p style="color: var(--winr-color-text-secondary); text-align: center; margin: 0;">
        Come back tomorrow to continue your streak!
      </p>
    `;
    
    container.innerHTML = '';
    container.appendChild(successElement);

    // Auto-dismiss after success animation
    setTimeout(() => {
      this.dismiss();
    }, 3000);
  }

  private showSuccessAnimation(result: DailyEntryGrant): void {
    this.currentScreen = 'success';
    setTimeout(() => {
      this.showCurrentScreen();
    }, 500);
  }

  private focusModal(): void {
    // Focus the first interactive element
    const firstButton = this.element?.querySelector('button, input, [tabindex]') as HTMLElement;
    firstButton?.focus();
  }

  private cleanup(): void {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }

    if (this.cleanupStyles) {
      this.cleanupStyles();
      this.cleanupStyles = undefined;
    }

    logger.debug('WINR modal cleaned up');
  }

  private getWelcomeTitle(): string {
    return this.sdkConfig?.copy?.welcomeTitle ||
           this.campaign?.title ||
           'Daily Entries';
  }

  private getWelcomeSubtitle(): string {
    return this.sdkConfig?.copy?.welcomeSubtitle ||
           `Win ${this.campaign?.prizeDescription || 'amazing prizes'}!`;
  }
}