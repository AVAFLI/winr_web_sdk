import { analyticsAdapter } from '../../services/analytics';

/**
 * How It Works screen — matches iOS HowItWorksView.swift
 * Numbered step rows, pro-tip card, sticky "Got It!" CTA with gradient fade
 */
export class HowItWorksScreen {
  private element: HTMLElement | null = null;
  private callbacks: {
    onClose?: () => void;
  } = {};

  private readonly steps = [
    { icon: '📅', title: 'Visit Daily', desc: 'Open the app each day to claim your daily entries.' },
    { icon: '🔥', title: 'Build Your Streak', desc: 'Keep your streak alive — the longer it goes, the more entries you earn each day.' },
    { icon: '▶️', title: 'Watch & Double', desc: 'Watch an optional short video to double your daily entries.' },
    { icon: '🎁', title: 'Win Prizes', desc: 'Your entries go into the monthly prize drawing. More entries = better odds!' },
  ];

  constructor() {}

  public setCallbacks(callbacks: { onClose?: () => void }): void {
    this.callbacks = callbacks;
  }

  public render(): HTMLElement {
    this.element = document.createElement('div');
    this.element.className = 'winr-how-it-works';
    this.buildUI();
    analyticsAdapter.track('winr_how_it_works_viewed');
    return this.element;
  }

  private buildUI(): void {
    if (!this.element) return;

    // Scrollable content
    const scroll = document.createElement('div');
    scroll.className = 'winr-how-scroll';

    // Hero
    const hero = document.createElement('div');
    hero.className = 'winr-how-hero';
    hero.innerHTML = `
      <div class="winr-how-hero-emoji">🎰</div>
      <h2 class="winr-how-hero-title">How It Works</h2>
      <p class="winr-how-hero-desc">Earn entries every day for a chance to win big.</p>
    `;
    scroll.appendChild(hero);

    // Steps
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'winr-how-steps';

    this.steps.forEach((step, index) => {
      const row = document.createElement('div');
      row.className = 'winr-how-step';
      row.innerHTML = `
        <div class="winr-how-step-number">${index + 1}</div>
        <div class="winr-how-step-body">
          <div class="winr-how-step-header">
            <span class="winr-how-step-icon">${step.icon}</span>
            <h3 class="winr-how-step-title">${step.title}</h3>
          </div>
          <p class="winr-how-step-desc">${step.desc}</p>
        </div>
      `;
      stepsContainer.appendChild(row);
    });

    scroll.appendChild(stepsContainer);

    // Pro tip card
    const tip = document.createElement('div');
    tip.className = 'winr-how-tip';
    tip.innerHTML = `
      <span class="winr-how-tip-icon">💡</span>
      <p class="winr-how-tip-text">Pro tip: A 5-day streak earns a weekly bonus of extra entries!</p>
    `;
    scroll.appendChild(tip);

    this.element.appendChild(scroll);

    // Sticky footer CTA
    const footer = document.createElement('div');
    footer.className = 'winr-how-footer';

    const btn = document.createElement('button');
    btn.className = 'winr-how-gotit-btn';
    btn.textContent = 'Got It!';
    btn.addEventListener('click', () => {
      analyticsAdapter.track('winr_how_it_works_closed');
      this.callbacks.onClose?.();
    });

    footer.appendChild(btn);
    this.element.appendChild(footer);
  }
}
