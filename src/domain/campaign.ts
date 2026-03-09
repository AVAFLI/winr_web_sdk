import { Campaign, MilestoneConfig, StreakConfig } from '../types';

/**
 * Campaign model with utility methods
 */
export class CampaignModel implements Campaign {
  public id: string;
  public title: string;
  public prizeDescription: string;
  public prizeValue: number;
  public startDate: string;
  public endDate: string;
  public streakLadder: number[];
  public doublingEnabled: boolean;
  public maxDailyBaseEntries: number;
  public rulesUrl: string;
  public streakConfig: StreakConfig;
  public milestones: MilestoneConfig[];
  public adConfig?: {
    provider: 'applovin' | 'admob' | 'unity' | 'ironsource' | 'none';
    appKey?: string;
    adUnitId?: string;
    placementName?: string;
  };

  constructor(data: Campaign) {
    this.id = data.id;
    this.title = data.title;
    this.prizeDescription = data.prizeDescription;
    this.prizeValue = data.prizeValue;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.streakLadder = data.streakLadder;
    this.doublingEnabled = data.doublingEnabled;
    this.maxDailyBaseEntries = data.maxDailyBaseEntries;
    this.rulesUrl = data.rulesUrl;
    this.streakConfig = data.streakConfig;
    this.milestones = data.milestones;
    this.adConfig = data.adConfig;
  }

  /**
   * Check if the campaign is currently active
   */
  public isActive(): boolean {
    const now = new Date();
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return now >= start && now <= end;
  }

  /**
   * Get the number of days remaining in the campaign
   */
  public daysRemaining(): number {
    const now = new Date();
    const end = new Date(this.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Get base entries for a specific streak day
   */
  public getBaseEntries(streakDay: number): number {
    const index = Math.max(0, Math.min(streakDay - 1, this.streakLadder.length - 1));
    return this.streakLadder[index] || this.streakLadder[this.streakLadder.length - 1] || 60;
  }

  /**
   * Get milestone for a specific day if it exists
   */
  public getMilestone(day: number): MilestoneConfig | null {
    return this.milestones.find(milestone => milestone.day === day) || null;
  }

  /**
   * Format prize value as currency
   */
  public formatPrizeValue(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(this.prizeValue);
  }

  /**
   * Get campaign duration in days
   */
  public getDuration(): number {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if ads are configured and enabled
   */
  public hasAdsEnabled(): boolean {
    return this.adConfig?.provider !== 'none' && this.adConfig?.provider !== undefined;
  }

  /**
   * Get time until campaign starts (if not yet started)
   */
  public timeUntilStart(): number | null {
    const now = new Date();
    const start = new Date(this.startDate);
    if (now >= start) return null;
    return start.getTime() - now.getTime();
  }

  /**
   * Get time until campaign ends (if active)
   */
  public timeUntilEnd(): number | null {
    const now = new Date();
    const end = new Date(this.endDate);
    if (now >= end) return null;
    return end.getTime() - now.getTime();
  }

  /**
   * Serialize to plain object for storage
   */
  public toJSON(): Campaign {
    return {
      id: this.id,
      title: this.title,
      prizeDescription: this.prizeDescription,
      prizeValue: this.prizeValue,
      startDate: this.startDate,
      endDate: this.endDate,
      streakLadder: this.streakLadder,
      doublingEnabled: this.doublingEnabled,
      maxDailyBaseEntries: this.maxDailyBaseEntries,
      rulesUrl: this.rulesUrl,
      streakConfig: this.streakConfig,
      milestones: this.milestones,
      adConfig: this.adConfig,
    };
  }

  /**
   * Create CampaignModel from plain object
   */
  public static fromJSON(data: Campaign): CampaignModel {
    return new CampaignModel(data);
  }
}