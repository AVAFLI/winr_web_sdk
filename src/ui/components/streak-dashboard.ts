import { Campaign, StreakState, SDKConfig } from '../../types';
import { CampaignModel } from '../../domain/campaign';
import { StreakDayTile } from './streak-day-tile';

/**
 * Streak dashboard component showing the 6-day streak progress
 */
export class StreakDashboard {
  private element: HTMLElement | null = null;
  private dayTiles: StreakDayTile[] = [];
  private campaignModel: CampaignModel = null!;

  constructor(
    campaign: Campaign,
    private streakState: StreakState | null,
    private sdkConfig: SDKConfig | null
  ) {
    this.campaignModel = CampaignModel.fromJSON(campaign);
  }

  public render(): HTMLElement {
    this.element = document.createElement('div');
    this.element.className = 'winr-streak-dashboard';

    // Title
    const title = document.createElement('h2');
    title.className = 'winr-streak-title';
    title.textContent = this.getStreakMessage();
    this.element.appendChild(title);

    // Streak grid
    const grid = this.createStreakGrid();
    this.element.appendChild(grid);

    return this.element;
  }

  private createStreakGrid(): HTMLElement {
    const grid = document.createElement('div');
    grid.className = 'winr-streak-grid';

    // Create tiles for days 1-6
    for (let day = 1; day <= 6; day++) {
      const tile = new StreakDayTile({
        day,
        entries: this.campaignModel.getBaseEntries(day),
        isCompleted: this.isDayCompleted(day),
        isCurrent: this.isCurrentDay(day),
        isToday: this.isTodayForDay(day),
      });

      this.dayTiles.push(tile);
      grid.appendChild(tile.render());
    }

    return grid;
  }

  private isDayCompleted(day: number): boolean {
    if (!this.streakState) return false;
    return day < (this.streakState.currentDay || 1);
  }

  private isCurrentDay(day: number): boolean {
    const currentDay = this.streakState?.currentDay || 1;
    return day === currentDay;
  }

  private isTodayForDay(day: number): boolean {
    // Check if today would be this day in the streak
    if (!this.streakState?.lastClaimedDate) {
      return day === 1; // First time, today is day 1
    }

    const today = new Date();
    const lastClaim = this.streakState.lastClaimedDate;
    
    // Check if already claimed today
    const alreadyClaimed = (
      today.getUTCFullYear() === lastClaim.getUTCFullYear() &&
      today.getUTCMonth() === lastClaim.getUTCMonth() &&
      today.getUTCDate() === lastClaim.getUTCDate()
    );

    if (alreadyClaimed) {
      return false; // Can't claim again today
    }

    // Check if this is the next day in sequence
    const daysDiff = Math.floor((today.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Next day in sequence
      return day === Math.min(this.streakState.currentDay + 1, 6);
    } else if (daysDiff > 1) {
      // Streak broken, start over
      return day === 1;
    }

    return false;
  }

  private getStreakMessage(): string {
    const customMessage = this.sdkConfig?.copy?.streakMessage;
    if (customMessage) return customMessage;

    if (!this.streakState) {
      return 'Start Your Streak Today!';
    }

    const currentDay = this.streakState.currentDay;
    const canClaimToday = this.canClaimToday();

    if (canClaimToday) {
      if (currentDay === 1) {
        return 'Start Your Streak Today!';
      } else {
        return `Continue Your ${currentDay}-Day Streak!`;
      }
    } else {
      return `${currentDay}-Day Streak Complete`;
    }
  }

  private canClaimToday(): boolean {
    if (!this.streakState?.lastClaimedDate) return true;
    
    const today = new Date();
    const lastClaim = this.streakState.lastClaimedDate;
    
    return (
      today.getUTCFullYear() !== lastClaim.getUTCFullYear() ||
      today.getUTCMonth() !== lastClaim.getUTCMonth() ||
      today.getUTCDate() !== lastClaim.getUTCDate()
    );
  }

  /**
   * Update the dashboard with new streak state
   */
  public updateStreakState(newState: StreakState): void {
    this.streakState = newState;
    
    // Update title
    const titleElement = this.element?.querySelector('.winr-streak-title');
    if (titleElement) {
      titleElement.textContent = this.getStreakMessage();
    }

    // Update tiles
    this.dayTiles.forEach((tile, index) => {
      const day = index + 1;
      tile.update({
        day,
        entries: this.campaignModel.getBaseEntries(day),
        isCompleted: this.isDayCompleted(day),
        isCurrent: this.isCurrentDay(day),
        isToday: this.isTodayForDay(day),
      });
    });
  }

  /**
   * Animate claim completion
   */
  public animateClaimComplete(day: number): void {
    const tile = this.dayTiles[day - 1];
    if (tile) {
      tile.animateCompletion();
    }
  }

  /**
   * Get the current day's entries amount
   */
  public getCurrentDayEntries(): number {
    const currentDay = this.streakState?.currentDay || 1;
    return this.campaignModel.getBaseEntries(currentDay);
  }

  /**
   * Check if streak is broken and needs reset
   */
  public isStreakBroken(): boolean {
    if (!this.streakState?.lastClaimedDate) return false;

    const today = new Date();
    const lastClaim = this.streakState.lastClaimedDate;
    const daysDiff = Math.floor((today.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));

    return daysDiff > 1;
  }

  /**
   * Get streak statistics
   */
  public getStreakStats(): {
    currentDay: number;
    totalEntries: number;
    daysCompleted: number;
    canClaimToday: boolean;
    isStreakBroken: boolean;
  } {
    return {
      currentDay: this.streakState?.currentDay || 1,
      totalEntries: this.streakState?.totalEntriesEarned || 0,
      daysCompleted: this.dayTiles.filter(tile => tile.isCompleted()).length,
      canClaimToday: this.canClaimToday(),
      isStreakBroken: this.isStreakBroken(),
    };
  }
}