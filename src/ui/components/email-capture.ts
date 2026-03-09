import { WINRError, WINRErrorCode, SDKConfig } from '../../types';
import { logger } from '../../services/logger';
import { analyticsAdapter } from '../../services/analytics';
import { NetworkClient } from '../../network/client';
import { WINR_CONSTANTS } from '../../types';

/**
 * Email capture and age gate component
 * Handles email collection and age verification
 */
export class EmailCaptureScreen {
  private element: HTMLElement | null = null;
  private callbacks: {
    onSubmitted?: () => void;
    onError?: (error: WINRError) => void;
  } = {};

  constructor(private sdkConfig: SDKConfig | null) {}

  /**
   * Set callback functions
   */
  public setCallbacks(callbacks: {
    onSubmitted?: () => void;
    onError?: (error: WINRError) => void;
  }): void {
    this.callbacks = callbacks;
  }

  /**
   * Render the email capture screen
   */
  public render(): HTMLElement {
    this.element = document.createElement('div');
    this.element.className = 'winr-email-capture';
    this.element.innerHTML = this.getHTML();
    
    this.setupEventListeners();
    
    // Track screen view
    analyticsAdapter.track('winr_email_capture_viewed');
    
    return this.element;
  }

  private getHTML(): string {
    const title = this.sdkConfig?.copy?.welcomeTitle || 'Enter Your Email';
    const subtitle = this.sdkConfig?.copy?.welcomeSubtitle || 'Get notified when you win!';
    const consentText = this.sdkConfig?.copy?.emailConsentText || 
      'I agree to receive promotional emails and updates.';
    const ageGateText = this.sdkConfig?.copy?.ageGateText ||
      `I confirm that I am ${this.sdkConfig?.ageGateMinAge || 13} years of age or older.`;

    return `
      <div class="winr-email-form">
        <div class="winr-form-header">
          <h2 style="
            color: var(--winr-color-text);
            font-size: var(--winr-font-size-xl);
            font-weight: var(--winr-font-weight-bold);
            text-align: center;
            margin: 0 0 var(--winr-spacing-sm) 0;
          ">${title}</h2>
          <p style="
            color: var(--winr-color-text-secondary);
            font-size: var(--winr-font-size-base);
            text-align: center;
            margin: 0 0 var(--winr-spacing-lg) 0;
          ">${subtitle}</p>
        </div>

        <form id="winr-email-form" class="winr-form">
          <div class="winr-input-group">
            <label for="winr-email-input" style="
              color: var(--winr-color-text);
              font-size: var(--winr-font-size-sm);
              font-weight: var(--winr-font-weight-medium);
              display: block;
              margin-bottom: var(--winr-spacing-xs);
            ">Email Address</label>
            <input
              type="email"
              id="winr-email-input"
              placeholder="your@email.com"
              required
              style="
                width: 100%;
                padding: var(--winr-spacing-sm);
                border: 2px solid var(--winr-color-surface);
                border-radius: var(--winr-border-radius-md);
                font-size: var(--winr-font-size-base);
                font-family: var(--winr-font-family);
                background: var(--winr-color-surface);
                color: var(--winr-color-text);
                box-sizing: border-box;
                transition: border-color 0.2s ease;
              "
            />
            <div id="winr-email-error" class="winr-error-message" style="
              color: var(--winr-color-error);
              font-size: var(--winr-font-size-sm);
              margin-top: var(--winr-spacing-xs);
              display: none;
            "></div>
          </div>

          ${this.sdkConfig?.ageGateEnabled ? `
          <div class="winr-checkbox-group" style="margin: var(--winr-spacing-md) 0;">
            <label class="winr-checkbox-label" style="
              display: flex;
              align-items: flex-start;
              gap: var(--winr-spacing-sm);
              cursor: pointer;
              color: var(--winr-color-text);
              font-size: var(--winr-font-size-sm);
              line-height: 1.4;
            ">
              <input
                type="checkbox"
                id="winr-age-consent"
                required
                style="
                  margin: 0;
                  transform: scale(1.2);
                  accent-color: var(--winr-color-primary);
                "
              />
              <span>${ageGateText}</span>
            </label>
          </div>
          ` : ''}

          <div class="winr-checkbox-group" style="margin: var(--winr-spacing-md) 0;">
            <label class="winr-checkbox-label" style="
              display: flex;
              align-items: flex-start;
              gap: var(--winr-spacing-sm);
              cursor: pointer;
              color: var(--winr-color-text);
              font-size: var(--winr-font-size-sm);
              line-height: 1.4;
            ">
              <input
                type="checkbox"
                id="winr-email-consent"
                style="
                  margin: 0;
                  transform: scale(1.2);
                  accent-color: var(--winr-color-primary);
                "
              />
              <span>${consentText}</span>
            </label>
          </div>

          <div class="winr-form-actions" style="
            display: flex;
            gap: var(--winr-spacing-sm);
            margin-top: var(--winr-spacing-lg);
          ">
            <button
              type="button"
              id="winr-skip-button"
              class="winr-button winr-button-secondary"
              style="
                flex: 1;
                padding: var(--winr-spacing-sm) var(--winr-spacing-md);
                border: 2px solid var(--winr-color-primary);
                border-radius: var(--winr-border-radius-md);
                background: transparent;
                color: var(--winr-color-primary);
                font-family: var(--winr-font-family);
                font-size: var(--winr-font-size-base);
                font-weight: var(--winr-font-weight-medium);
                cursor: pointer;
                transition: all 0.2s ease;
              "
            >Skip</button>
            
            <button
              type="submit"
              id="winr-submit-button"
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
                opacity: 0.5;
              "
              disabled
            >Submit Email</button>
          </div>
        </form>
      </div>
    `;
  }

  private setupEventListeners(): void {
    if (!this.element) return;

    const form = this.element.querySelector('#winr-email-form') as HTMLFormElement;
    const emailInput = this.element.querySelector('#winr-email-input') as HTMLInputElement;
    const ageConsent = this.element.querySelector('#winr-age-consent') as HTMLInputElement;
    const emailConsent = this.element.querySelector('#winr-email-consent') as HTMLInputElement;
    const submitButton = this.element.querySelector('#winr-submit-button') as HTMLButtonElement;
    const skipButton = this.element.querySelector('#winr-skip-button') as HTMLButtonElement;
    const errorElement = this.element.querySelector('#winr-email-error') as HTMLElement;

    // Email input validation
    emailInput.addEventListener('input', () => {
      this.clearError();
      this.updateSubmitButtonState();
    });

    emailInput.addEventListener('blur', () => {
      this.validateEmail();
    });

    // Age consent handling
    if (ageConsent) {
      ageConsent.addEventListener('change', () => {
        this.updateSubmitButtonState();
      });
    }

    // Email consent handling
    emailConsent.addEventListener('change', () => {
      this.updateSubmitButtonState();
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Skip button
    skipButton.addEventListener('click', () => {
      analyticsAdapter.track('winr_email_capture_skipped');
      this.callbacks.onSubmitted?.();
    });

    // Button hover effects
    submitButton.addEventListener('mouseenter', () => {
      if (!submitButton.disabled) {
        submitButton.style.transform = 'translateY(-2px)';
        submitButton.style.boxShadow = 'var(--winr-shadow-md)';
      }
    });

    submitButton.addEventListener('mouseleave', () => {
      submitButton.style.transform = 'none';
      submitButton.style.boxShadow = 'none';
    });

    skipButton.addEventListener('mouseenter', () => {
      skipButton.style.backgroundColor = 'var(--winr-color-primary)';
      skipButton.style.color = 'white';
    });

    skipButton.addEventListener('mouseleave', () => {
      skipButton.style.backgroundColor = 'transparent';
      skipButton.style.color = 'var(--winr-color-primary)';
    });
  }

  private validateEmail(): boolean {
    const emailInput = this.element?.querySelector('#winr-email-input') as HTMLInputElement;
    const email = emailInput?.value?.trim();
    
    if (!email) {
      this.showError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showError('Please enter a valid email address');
      return false;
    }

    return true;
  }

  private updateSubmitButtonState(): void {
    if (!this.element) return;

    const emailInput = this.element.querySelector('#winr-email-input') as HTMLInputElement;
    const ageConsent = this.element.querySelector('#winr-age-consent') as HTMLInputElement;
    const submitButton = this.element.querySelector('#winr-submit-button') as HTMLButtonElement;

    const hasEmail = emailInput?.value?.trim();
    const hasAgeConsent = !ageConsent || ageConsent.checked;
    const isValid = hasEmail && hasAgeConsent;

    submitButton.disabled = !isValid;
    submitButton.style.opacity = isValid ? '1' : '0.5';
    submitButton.style.cursor = isValid ? 'pointer' : 'not-allowed';
  }

  private async handleSubmit(): Promise<void> {
    if (!this.validateEmail()) return;

    const emailInput = this.element?.querySelector('#winr-email-input') as HTMLInputElement;
    const emailConsent = this.element?.querySelector('#winr-email-consent') as HTMLInputElement;
    const submitButton = this.element?.querySelector('#winr-submit-button') as HTMLButtonElement;

    const email = emailInput.value.trim();
    const hasEmailConsent = emailConsent?.checked || false;

    try {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';

      // Submit email to API
      await this.submitEmail(email, hasEmailConsent);

      // Track success
      analyticsAdapter.track('winr_email_captured', {
        hasEmailConsent,
      });

      logger.info('Email submitted successfully');
      this.callbacks.onSubmitted?.();

    } catch (error) {
      logger.error('Failed to submit email:', error);
      
      const winrError = error instanceof WINRError 
        ? error 
        : new WINRError(
            WINRErrorCode.NetworkError,
            'Failed to submit email',
            error instanceof Error ? error : undefined
          );
      
      this.showError(winrError.message);
      this.callbacks.onError?.(winrError);

    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Email';
      this.updateSubmitButtonState();
    }
  }

  private async submitEmail(email: string, hasConsent: boolean): Promise<void> {
    // Create a temporary network client for this request
    // In a real implementation, this would use the main SDK's client
    const client = new NetworkClient({
      baseURL: WINR_CONSTANTS.API_BASE_URL,
      apiKey: '', // Will be set by the main SDK
      logger: logger,
    });

    await client.post('/submitEmail', {
      email,
      hasConsent,
    });
  }

  private showError(message: string): void {
    const errorElement = this.element?.querySelector('#winr-email-error') as HTMLElement;
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  private clearError(): void {
    const errorElement = this.element?.querySelector('#winr-email-error') as HTMLElement;
    if (errorElement) {
      errorElement.style.display = 'none';
      errorElement.textContent = '';
    }
  }
}