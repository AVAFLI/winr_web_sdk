import { DailyEntryGrant, MilestoneAward } from '../types';

/**
 * Daily entry grant result model
 */
export class DailyEntryGrantModel implements DailyEntryGrant {
  public entries: number;
  public streakDay: number;
  public totalEntries: number;
  public weeklyBonusEntries?: number;
  public monthlyBonusEntries?: number;
  public milestone?: MilestoneAward;

  constructor(data: DailyEntryGrant) {
    this.entries = data.entries;
    this.streakDay = data.streakDay;
    this.totalEntries = data.totalEntries;
    this.weeklyBonusEntries = data.weeklyBonusEntries;
    this.monthlyBonusEntries = data.monthlyBonusEntries;
    this.milestone = data.milestone;
  }

  /**
   * Get total entries awarded in this claim (base + bonuses)
   */
  public getTotalAwarded(): number {
    return (
      this.entries +
      (this.weeklyBonusEntries || 0) +
      (this.monthlyBonusEntries || 0) +
      (this.milestone?.bonusEntries || 0)
    );
  }

  /**
   * Check if any bonuses were awarded
   */
  public hasBonuses(): boolean {
    return !!(
      this.weeklyBonusEntries ||
      this.monthlyBonusEntries ||
      this.milestone
    );
  }

  /**
   * Check if a weekly bonus was awarded
   */
  public hasWeeklyBonus(): boolean {
    return !!this.weeklyBonusEntries && this.weeklyBonusEntries > 0;
  }

  /**
   * Check if a monthly bonus was awarded
   */
  public hasMonthlyBonus(): boolean {
    return !!this.monthlyBonusEntries && this.monthlyBonusEntries > 0;
  }

  /**
   * Check if a milestone was achieved
   */
  public hasMilestone(): boolean {
    return !!this.milestone;
  }

  /**
   * Get a user-friendly summary message
   */
  public getSummaryMessage(): string {
    const parts = [`${this.entries} base entries`];
    
    if (this.hasWeeklyBonus()) {
      parts.push(`${this.weeklyBonusEntries} weekly bonus`);
    }
    
    if (this.hasMonthlyBonus()) {
      parts.push(`${this.monthlyBonusEntries} monthly bonus`);
    }
    
    if (this.hasMilestone()) {
      parts.push(`${this.milestone!.bonusEntries} milestone bonus`);
    }
    
    const total = this.getTotalAwarded();
    return `Claimed ${total} entries! (${parts.join(' + ')})`;
  }

  /**
   * Get milestone achievement message if applicable
   */
  public getMilestoneMessage(): string | null {
    if (!this.milestone) return null;
    
    const { day, bonusEntries, badge } = this.milestone;
    let message = `🎉 ${day}-day milestone reached! +${bonusEntries} bonus entries`;
    
    if (badge) {
      message += ` and ${badge} badge earned!`;
    }
    
    return message;
  }

  /**
   * Get bonus breakdown for display
   */
  public getBonusBreakdown(): Array<{ type: string; amount: number; description: string }> {
    const bonuses = [];
    
    if (this.hasWeeklyBonus()) {
      bonuses.push({
        type: 'weekly',
        amount: this.weeklyBonusEntries!,
        description: 'Weekly streak bonus',
      });
    }
    
    if (this.hasMonthlyBonus()) {
      bonuses.push({
        type: 'monthly',
        amount: this.monthlyBonusEntries!,
        description: 'Monthly streak bonus',
      });
    }
    
    if (this.hasMilestone()) {
      bonuses.push({
        type: 'milestone',
        amount: this.milestone!.bonusEntries,
        description: `${this.milestone!.day}-day milestone ${this.milestone!.badge || ''}`.trim(),
      });
    }
    
    return bonuses;
  }

  /**
   * Serialize to plain object
   */
  public toJSON(): DailyEntryGrant {
    return {
      entries: this.entries,
      streakDay: this.streakDay,
      totalEntries: this.totalEntries,
      weeklyBonusEntries: this.weeklyBonusEntries,
      monthlyBonusEntries: this.monthlyBonusEntries,
      milestone: this.milestone,
    };
  }

  /**
   * Create from plain object
   */
  public static fromJSON(data: DailyEntryGrant): DailyEntryGrantModel {
    return new DailyEntryGrantModel(data);
  }

  /**
   * Create a simple grant with just base entries
   */
  public static createSimple(
    entries: number,
    streakDay: number,
    totalEntries: number
  ): DailyEntryGrantModel {
    return new DailyEntryGrantModel({
      entries,
      streakDay,
      totalEntries,
    });
  }
}