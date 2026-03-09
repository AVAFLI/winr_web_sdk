import { WINRError, WINRErrorCode, SDKConfig, Campaign } from '../../types';
import { logger } from '../../services/logger';
import { analyticsAdapter } from '../../services/analytics';
import { NetworkClient } from '../../network/client';
import { WINR_CONSTANTS } from '../../types';

/**
 * Email capture and age gate — matches iOS EmailCaptureView.swift
 */
export class EmailCaptureScreen {
  private element: HTMLElement | null = null;
  private isAgeConfirmed = false;
  private emailValue = '';
  private callbacks: {
    onSubmitted?: () => void;
    onError?: (error: WINRError) => void;
  } = {};

  constructor(
    private sdkConfig: SDKConfig | null,
    private campaign: Campaign | null = null,
    private rulesUrl?: string,
    private prefillEmail?: string
  ) {
    if (prefillEmail) this.emailValue = prefillEmail;
  }

  public setCallbacks(callbacks: {
    onSubmitted?: () => void;
    onError?: (error: WINRError) => void;
  }): void {
    this.callbacks = callbacks;
  }

  public render(): HTMLElement {
    this.element = document.createElement('div');
    this.element.className = 'winr-email-capture';
    this.buildUI();
    analyticsAdapter.track('winr_email_capture_viewed');
    return this.element;
  }

  private formatPrize(value: number): string {
    return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' CASH';
  }

  private buildUI(): void {
    if (!this.element) return;

    const logoUrl = this.sdkConfig?.branding?.logoUrl;
    const welcomeTitle = this.sdkConfig?.copy?.welcomeTitle
      || (this.campaign ? `WIN ${this.formatPrize(this.campaign.prizeValue)}!` : 'WIN PRIZES!');
    const welcomeSubtitle = this.sdkConfig?.copy?.welcomeSubtitle
      || 'Just submit this entry form for your FREE chance to win.';
    const ageText = this.sdkConfig?.copy?.ageGateText || 'I confirm I am 18 years of age or older';
    const effectiveRulesUrl = this.rulesUrl || this.sdkConfig?.rulesUrl || this.campaign?.rulesUrl;
    const rulesLinkText = this.sdkConfig?.copy?.rulesLinkText || 'Official Rules';

    // Logo
    if (logoUrl) {
      const logoWrap = document.createElement('div');
      logoWrap.className = 'winr-email-logo';
      const img = document.createElement('img');
      img.src = logoUrl;
      img.alt = 'Logo';
      logoWrap.appendChild(img);
      this.element.appendChild(logoWrap);
    }

    // Title + subtitle
    const titles = document.createElement('div');
    titles.className = 'winr-email-titles';
    const h2 = document.createElement('h2');
    h2.textContent = welcomeTitle;
    const sub = document.createElement('p');
    sub.textContent = welcomeSubtitle;
    titles.appendChild(h2);
    titles.appendChild(sub);
    this.element.appendChild(titles);

    // Email field group
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'winr-email-field-group';

    const label = document.createElement('label');
    label.className = 'winr-email-field-label';
    label.textContent = 'Email';
    fieldGroup.appendChild(label);

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'winr-email-input-wrapper';

    const icon = document.createElement('span');
    icon.className = 'winr-envelope-icon';
    icon.textContent = '✉';
    inputWrapper.appendChild(icon);

    const input = document.createElement('input');
    input.className = 'winr-email-input';
    input.type = 'email';
    input.placeholder = 'Ex. johndoe@gmail.com';
    input.autocomplete = 'email';
    input.setAttribute('autocapitalize', 'none');
    input.setAttribute('autocorrect', 'off');
    if (this.prefillEmail) input.value = this.prefillEmail;
    inputWrapper.appendChild(input);

    fieldGroup.appendChild(inputWrapper);

    const errorEl = document.createElement('div');
    errorEl.className = 'winr-email-error';
    errorEl.id = 'winr-email-error';
    fieldGroup.appendChild(errorEl);

    this.element.appendChild(fieldGroup);

    // Age gate checkbox
    const ageGate = document.createElement('div');
    ageGate.className = 'winr-age-gate';

    const ageIcon = document.createElement('span');
    ageIcon.className = 'winr-age-gate-icon';
    ageIcon.textContent = '☐';

    const ageLabel = document.createElement('span');
    ageLabel.className = 'winr-age-gate-text';
    ageLabel.textContent = ageText;

    ageGate.appendChild(ageIcon);
    ageGate.appendChild(ageLabel);
    this.element.appendChild(ageGate);

    // CTA button
    const btn = document.createElement('button');
    btn.className = 'winr-enter-button inactive';
    btn.textContent = 'ENTER NOW';
    this.element.appendChild(btn);

    // Legal links
    const legal = document.createElement('div');
    legal.className = 'winr-legal-links';
    const legalParts: string[] = ['<span>By entering, you agree to the</span>'];
    if (effectiveRulesUrl) {
      legalParts.push(`<a href="${effectiveRulesUrl}" target="_blank" rel="noopener">${rulesLinkText}</a>`);
    } else {
      legalParts.push(`<a href="#">${rulesLinkText}</a>`);
    }
    legalParts.push('<span>&amp;</span>');
    legalParts.push('<a href="https://winfrastructure.us/privacy" target="_blank" rel="noopener">Privacy Policy</a>');
    legal.innerHTML = legalParts.join(' ');
    this.element.appendChild(legal);

    // Event listeners
    input.addEventListener('input', () => {
      this.emailValue = input.value;
      this.clearError();
      this.updateButtonState(btn);
    });

    ageGate.addEventListener('click', () => {
      this.isAgeConfirmed = !this.isAgeConfirmed;
      ageIcon.textContent = this.isAgeConfirmed ? '☑' : '☐';
      ageIcon.style.color = this.isAgeConfirmed ? 'var(--winr-btn-color)' : 'var(--winr-muted)';
      this.updateButtonState(btn);
    });

    btn.addEventListener('click', () => {
      this.handleSubmit(input, inputWrapper, errorEl);
    });
  }

  private updateButtonState(btn: HTMLButtonElement): void {
    const isReady = this.emailValue.trim().length > 0 && this.isAgeConfirmed;
    btn.className = 'winr-enter-button ' + (isReady ? 'active' : 'inactive');
  }

  private handleSubmit(
    input: HTMLInputElement,
    wrapper: HTMLElement,
    errorEl: HTMLElement
  ): void {
    const trimmed = this.emailValue.trim();

    if (!trimmed) {
      this.showError(wrapper, errorEl, 'Email is required');
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(trimmed)) {
      this.showError(wrapper, errorEl, 'Please enter a valid email address');
      return;
    }

    if (!this.isAgeConfirmed) {
      this.showError(wrapper, errorEl, 'You must be 18+ to enter');
      return;
    }

    this.clearError();

    // Fire-and-forget backend submit
    this.submitEmailToBackend(trimmed).catch(() => {});

    analyticsAdapter.track('winr_email_captured');
    logger.info('Email submitted successfully');
    this.callbacks.onSubmitted?.();
  }

  private async submitEmailToBackend(email: string): Promise<void> {
    const client = new NetworkClient({
      baseURL: WINR_CONSTANTS.API_BASE_URL,
      apiKey: '',
      logger: logger,
    });
    await client.post('/submitEmail', { email, hasConsent: true });
  }

  private showError(wrapper: HTMLElement, errorEl: HTMLElement, msg: string): void {
    wrapper.classList.add('error');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  private clearError(): void {
    if (!this.element) return;
    const wrapper = this.element.querySelector('.winr-email-input-wrapper');
    const errorEl = this.element.querySelector('#winr-email-error') as HTMLElement;
    wrapper?.classList.remove('error');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
  }
}
