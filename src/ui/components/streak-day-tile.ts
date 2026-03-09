interface StreakDayState {
  day: number;
  entries: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isToday: boolean;
}

/**
 * Individual day tile in the streak dashboard
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

    // Add completion animation
    this.element.style.transform = 'scale(1.2)';
    this.element.style.transition = 'transform 0.3s ease';

    setTimeout(() => {
      if (this.element) {
        this.element.style.transform = 'scale(1.05)';
      }
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

    const { day, entries, isCompleted, isCurrent, isToday } = this.state;

    // Update classes
    this.element.className = 'winr-streak-day';
    if (isCompleted) this.element.classList.add('completed');
    if (isCurrent) this.element.classList.add('current');
    if (isToday) this.element.classList.add('today');

    // Update content
    this.element.innerHTML = `
      <div class="winr-streak-day-number">Day ${day}</div>
      <div class="winr-streak-day-entries">${entries}</div>
      <div class="winr-streak-day-label">entries</div>
      ${this.getStatusIndicator()}
    `;

    // Add accessibility attributes
    this.element.setAttribute('role', 'listitem');
    this.element.setAttribute('aria-label', this.getAriaLabel());
  }

  private getStatusIndicator(): string {
    const { isCompleted, isCurrent, isToday } = this.state;

    if (isCompleted) {
      return '<div class="winr-streak-status">✓</div>';
    }
    
    if (isCurrent && isToday) {
      return '<div class="winr-streak-status">⭐</div>';
    }
    
    if (isCurrent) {
      return '<div class="winr-streak-status">○</div>';
    }

    return '';
  }

  private getAriaLabel(): string {
    const { day, entries, isCompleted, isCurrent, isToday } = this.state;
    
    let label = `Day ${day}, ${entries} entries`;
    
    if (isCompleted) {
      label += ', completed';
    } else if (isCurrent && isToday) {
      label += ', available to claim today';
    } else if (isCurrent) {
      label += ', current streak day';
    } else {
      label += ', upcoming';
    }
    
    return label;
  }
}

// Add the CSS for status indicators
const statusStyles = `
.winr-streak-status {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
  color: var(--winr-color-success);
}

.winr-streak-day.completed .winr-streak-status {
  color: white;
}

.winr-streak-day.current .winr-streak-status {
  color: var(--winr-color-primary);
  animation: winr-pulse 2s infinite;
}

@keyframes winr-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
`;

// Inject status styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('winr-streak-status-styles')) {
  const style = document.createElement('style');
  style.id = 'winr-streak-status-styles';
  style.textContent = statusStyles;
  document.head.appendChild(style);
}