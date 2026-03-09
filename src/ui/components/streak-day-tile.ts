export interface StreakDayState {
  day: number;
  entries: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isToday: boolean;
}

/**
 * Compact streak day tile — matches iOS CompactStreakTile (90×115)
 * States: today (🔥 + pulse), claimed (✅), locked (🔒)
 */
export class StreakDayTile {
  private element: HTMLElement | null = null;
  private state: StreakDayState;

  constructor(state: StreakDayState) {
    this.state = state;
  }

  public render(): HTMLElement {
    this.element = document.createElement('div');
    this.updateElement();
    return this.element;
  }

  public update(newState: StreakDayState): void {
    this.state = newState;
    this.updateElement();
  }

  public isCompleted(): boolean {
    return this.state.isCompleted;
  }

  public isCurrent(): boolean {
    return this.state.isCurrent;
  }

  public animateCompletion(): void {
    if (!this.element) return;
    this.element.style.transform = 'scale(1.2)';
    this.element.style.transition = 'transform 0.3s ease';
    setTimeout(() => {
      if (this.element) this.element.style.transform = 'scale(1.05)';
    }, 300);
    setTimeout(() => {
      if (this.element) {
        this.element.style.transform = '';
        this.element.style.transition = '';
      }
    }, 600);
  }

  private updateElement(): void {
    if (!this.element) return;

    const { day, entries, isCompleted, isToday } = this.state;

    // Determine tile class
    let tileClass = 'winr-tile';
    if (isToday) tileClass += ' is-today';
    else if (isCompleted) tileClass += ' is-claimed';
    else tileClass += ' is-locked';

    this.element.className = tileClass;

    // Status icon
    let statusIcon: string;
    if (isToday) {
      statusIcon = '🔥';
    } else if (isCompleted) {
      statusIcon = '✅';
    } else {
      statusIcon = '🔒';
    }

    this.element.innerHTML = `
      <span class="winr-tile-pill">DAY ${day}</span>
      <span class="winr-tile-entries">${entries}</span>
      <span class="winr-tile-label">Entries</span>
      <span class="winr-tile-icon">${statusIcon}</span>
    `;

    // Accessibility
    this.element.setAttribute('role', 'listitem');
    this.element.setAttribute('aria-label', this.getAriaLabel());
  }

  private getAriaLabel(): string {
    const { day, entries, isCompleted, isToday } = this.state;
    let label = `Day ${day}, ${entries} entries`;
    if (isCompleted) label += ', completed';
    else if (isToday) label += ', available to claim today';
    else label += ', locked';
    return label;
  }
}
