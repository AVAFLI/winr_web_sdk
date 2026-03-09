import { analyticsAdapter } from '../../services/analytics';

/**
 * How It Works component
 * Displays information about how the streak system works
 */
export class HowItWorksScreen {
  private element: HTMLElement | null = null;
  private callbacks: {
    onClose?: () => void;
  } = {};

  constructor() {}

  /**
   * Set callback functions
   */
  public setCallbacks(callbacks: {
    onClose?: () => void;
  }): void {
    this.callbacks = callbacks;
  }

  /**
   * Render the how it works screen
   */
  public render(): HTMLElement {
    this.element = document.createElement('div');
    this.element.className = 'winr-how-it-works';
    this.element.innerHTML = this.getHTML();
    
    this.setupEventListeners();
    
    // Track screen view
    analyticsAdapter.track('winr_how_it_works_viewed');
    
    return this.element;
  }

  private getHTML(): string {
    return `
      <div class="winr-how-container">
        <div class="winr-how-header" style="text-align: center; margin-bottom: var(--winr-spacing-lg);">
          <h2 style="
            color: var(--winr-color-text);
            font-size: var(--winr-font-size-2xl);
            font-weight: var(--winr-font-weight-bold);
            margin: 0 0 var(--winr-spacing-sm) 0;
          ">How It Works</h2>
          <p style="
            color: var(--winr-color-text-secondary);
            font-size: var(--winr-font-size-base);
            margin: 0;
            line-height: 1.5;
          ">Build your daily streak to maximize your entries and chances to win!</p>
        </div>

        <div class="winr-steps-container" style="
          display: grid;
          gap: var(--winr-spacing-md);
          margin-bottom: var(--winr-spacing-xl);
        ">
          ${this.getStepHTML(1, '📅', 'Open Daily', 'Visit every day to maintain your streak', 'var(--winr-color-primary)')}
          ${this.getStepHTML(2, '🎯', 'Claim Entries', 'Tap to claim your daily entries - the longer your streak, the more entries you earn', 'var(--winr-color-secondary)')}
          ${this.getStepHTML(3, '🔥', 'Build Streak', 'Consecutive days increase your streak multiplier (up to 6 days)', '#f59e0b')}
          ${this.getStepHTML(4, '🏆', 'Win Prizes', 'More entries = better chances to win amazing prizes!', 'var(--winr-color-success)')}
        </div>

        <div class="winr-streak-info" style="
          background: var(--winr-color-surface);
          border-radius: var(--winr-border-radius-lg);
          padding: var(--winr-spacing-lg);
          margin-bottom: var(--winr-spacing-lg);
          border: 2px solid var(--winr-color-primary);
        ">
          <h3 style="
            color: var(--winr-color-text);
            font-size: var(--winr-font-size-lg);
            font-weight: var(--winr-font-weight-bold);
            margin: 0 0 var(--winr-spacing-md) 0;
            display: flex;
            align-items: center;
            gap: var(--winr-spacing-sm);
          ">
            <span style="font-size: 24px;">⚡</span>
            Streak Ladder
          </h3>
          
          <div class="winr-ladder-grid" style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: var(--winr-spacing-sm);
          ">
            ${this.getLadderDayHTML(1, '10', false)}
            ${this.getLadderDayHTML(2, '30', false)}
            ${this.getLadderDayHTML(3, '60', false)}
            ${this.getLadderDayHTML(4, '130', false)}
            ${this.getLadderDayHTML(5, '240', false)}
            ${this.getLadderDayHTML(6, '300', true)}
          </div>
          
          <p style="
            color: var(--winr-color-text-secondary);
            font-size: var(--winr-font-size-sm);
            margin: var(--winr-spacing-md) 0 0 0;
            text-align: center;
            line-height: 1.4;
          ">Miss a day? No worries! Your streak resets to day 1, but you can start building again immediately.</p>
        </div>

        <div class="winr-bonus-info" style="
          background: linear-gradient(135deg, var(--winr-color-primary) 0%, var(--winr-color-secondary) 100%);
          border-radius: var(--winr-border-radius-lg);
          padding: var(--winr-spacing-lg);
          color: white;
          margin-bottom: var(--winr-spacing-lg);
          text-align: center;
        ">
          <h3 style="
            font-size: var(--winr-font-size-lg);
            font-weight: var(--winr-font-weight-bold);
            margin: 0 0 var(--winr-spacing-sm) 0;
          ">💡 Pro Tips</h3>
          <ul style="
            list-style: none;
            padding: 0;
            margin: 0;
            text-align: left;
            max-width: 400px;
            margin: 0 auto;
          ">
            <li style="
              display: flex;
              align-items: flex-start;
              gap: var(--winr-spacing-sm);
              margin-bottom: var(--winr-spacing-sm);
              font-size: var(--winr-font-size-sm);
              line-height: 1.4;
            ">
              <span>✨</span>
              <span>Set a daily reminder to claim your entries</span>
            </li>
            <li style="
              display: flex;
              align-items: flex-start;
              gap: var(--winr-spacing-sm);
              margin-bottom: var(--winr-spacing-sm);
              font-size: var(--winr-font-size-sm);
              line-height: 1.4;
            ">
              <span>🎬</span>
              <span>Watch videos for bonus entries when available</span>
            </li>
            <li style="
              display: flex;
              align-items: flex-start;
              gap: var(--winr-spacing-sm);
              margin-bottom: var(--winr-spacing-sm);
              font-size: var(--winr-font-size-sm);
              line-height: 1.4;
            ">
              <span>🔔</span>
              <span>Enable notifications to never miss a day</span>
            </li>
            <li style="
              display: flex;
              align-items: flex-start;
              gap: var(--winr-spacing-sm);
              font-size: var(--winr-font-size-sm);
              line-height: 1.4;
            ">
              <span>🏆</span>
              <span>Consistency is key - aim for that 6-day streak!</span>
            </li>
          </ul>
        </div>

        <div class="winr-how-actions" style="text-align: center;">
          <button
            type="button"
            id="winr-how-close"
            class="winr-button winr-button-primary"
            style="
              padding: var(--winr-spacing-md) var(--winr-spacing-xl);
              border: 2px solid var(--winr-color-primary);
              border-radius: var(--winr-border-radius-lg);
              background: var(--winr-color-primary);
              color: white;
              font-family: var(--winr-font-family);
              font-size: var(--winr-font-size-base);
              font-weight: var(--winr-font-weight-semibold);
              cursor: pointer;
              transition: all 0.2s ease;
              min-width: 200px;
            "
          >Got It!</button>
        </div>
      </div>
    `;
  }

  private getStepHTML(
    number: number, 
    icon: string, 
    title: string, 
    description: string, 
    color: string
  ): string {
    return `
      <div class="winr-step" style="
        display: flex;
        align-items: flex-start;
        gap: var(--winr-spacing-md);
        padding: var(--winr-spacing-md);
        background: var(--winr-color-surface);
        border-radius: var(--winr-border-radius-lg);
        border: 2px solid transparent;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
      " onmouseenter="this.style.borderColor = '${color}'; this.style.transform = 'translateY(-2px)'; this.style.boxShadow = 'var(--winr-shadow-md)';" onmouseleave="this.style.borderColor = 'transparent'; this.style.transform = 'none'; this.style.boxShadow = 'none';">
        <div class="winr-step-number" style="
          width: 48px;
          height: 48px;
          background: ${color};
          border-radius: var(--winr-border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: var(--winr-font-weight-bold);
          font-size: var(--winr-font-size-lg);
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        ">${number}</div>
        <div class="winr-step-content" style="flex: 1; min-width: 0;">
          <div class="winr-step-icon" style="
            font-size: 24px;
            margin-bottom: var(--winr-spacing-xs);
          ">${icon}</div>
          <h3 style="
            color: var(--winr-color-text);
            font-size: var(--winr-font-size-lg);
            font-weight: var(--winr-font-weight-bold);
            margin: 0 0 var(--winr-spacing-xs) 0;
          ">${title}</h3>
          <p style="
            color: var(--winr-color-text-secondary);
            font-size: var(--winr-font-size-sm);
            line-height: 1.4;
            margin: 0;
          ">${description}</p>
        </div>
        <div class="winr-step-accent" style="
          position: absolute;
          top: 0;
          right: 0;
          width: 4px;
          height: 100%;
          background: ${color};
          opacity: 0.3;
        "></div>
      </div>
    `;
  }

  private getLadderDayHTML(day: number, entries: string, isMax: boolean): string {
    return `
      <div class="winr-ladder-day" style="
        background: ${isMax ? 'var(--winr-color-success)' : 'var(--winr-color-background)'};
        border: 2px solid ${isMax ? 'var(--winr-color-success)' : 'var(--winr-color-primary)'};
        border-radius: var(--winr-border-radius-md);
        padding: var(--winr-spacing-sm);
        text-align: center;
        transition: all 0.2s ease;
        position: relative;
        ${isMax ? 'animation: winr-pulse 2s infinite;' : ''}
      ">
        <div style="
          font-size: var(--winr-font-size-sm);
          font-weight: var(--winr-font-weight-medium);
          color: ${isMax ? 'white' : 'var(--winr-color-text-secondary)'};
          margin-bottom: var(--winr-spacing-xs);
        ">Day ${day}</div>
        <div style="
          font-size: var(--winr-font-size-lg);
          font-weight: var(--winr-font-weight-bold);
          color: ${isMax ? 'white' : 'var(--winr-color-text)'};
        ">${entries}</div>
        <div style="
          font-size: var(--winr-font-size-sm);
          color: ${isMax ? 'rgba(255,255,255,0.8)' : 'var(--winr-color-text-secondary)'};
        ">entries</div>
        ${isMax ? `
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          background: #fbbf24;
          color: white;
          border-radius: var(--winr-border-radius-full);
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        ">⭐</div>
        ` : ''}
      </div>
    `;
  }

  private setupEventListeners(): void {
    if (!this.element) return;

    const closeButton = this.element.querySelector('#winr-how-close') as HTMLButtonElement;

    // Close button
    closeButton.addEventListener('click', () => {
      analyticsAdapter.track('winr_how_it_works_closed');
      this.callbacks.onClose?.();
    });

    // Button hover effect
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.transform = 'translateY(-2px)';
      closeButton.style.boxShadow = 'var(--winr-shadow-lg)';
    });

    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.transform = 'none';
      closeButton.style.boxShadow = 'none';
    });
  }
}