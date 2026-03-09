import { RewardedVideoProvider } from '../types';
import { logger } from '../services/logger';

/**
 * Abstract base class for rewarded video providers
 */
export abstract class BaseRewardedVideoProvider implements RewardedVideoProvider {
  protected isLoaded: boolean = false;
  protected isLoading: boolean = false;

  public abstract isAvailable(): Promise<boolean>;
  public abstract show(): Promise<{ success: boolean; reward?: { type: string; amount: number } }>;
  public abstract load(): Promise<void>;

  protected setLoaded(loaded: boolean): void {
    this.isLoaded = loaded;
  }

  protected setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  protected isCurrentlyLoaded(): boolean {
    return this.isLoaded && !this.isLoading;
  }
}

/**
 * Mock rewarded video provider for testing
 */
export class MockRewardedVideoProvider extends BaseRewardedVideoProvider {
  private shouldSucceed: boolean;
  private loadDelay: number;
  private showDelay: number;

  constructor(options: {
    shouldSucceed?: boolean;
    loadDelay?: number;
    showDelay?: number;
  } = {}) {
    super();
    this.shouldSucceed = options.shouldSucceed ?? true;
    this.loadDelay = options.loadDelay ?? 1000;
    this.showDelay = options.showDelay ?? 2000;
  }

  public async isAvailable(): Promise<boolean> {
    // Simulate some async check
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.shouldSucceed;
  }

  public async load(): Promise<void> {
    if (this.isLoading || this.isLoaded) return;

    this.setLoading(true);
    logger.debug('Mock rewarded video: Loading...');

    try {
      await new Promise(resolve => setTimeout(resolve, this.loadDelay));
      
      if (this.shouldSucceed) {
        this.setLoaded(true);
        logger.debug('Mock rewarded video: Loaded successfully');
      } else {
        throw new Error('Mock load failure');
      }
    } catch (error) {
      logger.error('Mock rewarded video: Load failed', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  public async show(): Promise<{ success: boolean; reward?: { type: string; amount: number } }> {
    if (!this.isCurrentlyLoaded()) {
      logger.warn('Mock rewarded video: Not loaded, attempting to load first');
      await this.load();
    }

    logger.debug('Mock rewarded video: Showing...');

    try {
      await new Promise(resolve => setTimeout(resolve, this.showDelay));
      
      if (this.shouldSucceed) {
        this.setLoaded(false); // Need to reload after showing
        logger.debug('Mock rewarded video: Shown successfully');
        return {
          success: true,
          reward: { type: 'entries', amount: 50 }
        };
      } else {
        throw new Error('Mock show failure');
      }
    } catch (error) {
      logger.error('Mock rewarded video: Show failed', error);
      return { success: false };
    }
  }
}

/**
 * Google AdMob rewarded video provider for web
 */
export class AdMobRewardedVideoProvider extends BaseRewardedVideoProvider {
  private adUnitId: string;
  private initialized: boolean = false;

  constructor(adUnitId: string) {
    super();
    this.adUnitId = adUnitId;
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if Google AdSense is available
      if (typeof window === 'undefined' || !('google' in window)) {
        throw new Error('Google AdSense not available');
      }

      // Initialize AdSense (this is a simplified example)
      logger.debug('AdMob: Initializing...');
      this.initialized = true;
    } catch (error) {
      logger.error('AdMob: Initialization failed', error);
      throw error;
    }
  }

  public async isAvailable(): Promise<boolean> {
    try {
      await this.initialize();
      return true;
    } catch {
      return false;
    }
  }

  public async load(): Promise<void> {
    if (this.isLoading || this.isLoaded) return;

    this.setLoading(true);
    logger.debug('AdMob: Loading rewarded video...');

    try {
      await this.initialize();
      
      // Load the ad (simplified implementation)
      // In a real implementation, you would use the Google AdSense SDK
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90% success rate
            resolve(void 0);
          } else {
            reject(new Error('Ad load failed'));
          }
        }, 1500);
      });

      this.setLoaded(true);
      logger.debug('AdMob: Rewarded video loaded');
    } catch (error) {
      logger.error('AdMob: Load failed', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  public async show(): Promise<{ success: boolean; reward?: { type: string; amount: number } }> {
    if (!this.isCurrentlyLoaded()) {
      logger.warn('AdMob: Not loaded, attempting to load first');
      await this.load();
    }

    logger.debug('AdMob: Showing rewarded video...');

    try {
      // Show the ad (simplified implementation)
      const result = await new Promise<boolean>((resolve) => {
        setTimeout(() => {
          resolve(Math.random() > 0.05); // 95% completion rate
        }, 3000);
      });

      this.setLoaded(false); // Need to reload after showing

      if (result) {
        logger.debug('AdMob: Rewarded video completed');
        return {
          success: true,
          reward: { type: 'entries', amount: 50 }
        };
      } else {
        logger.debug('AdMob: Rewarded video not completed');
        return { success: false };
      }
    } catch (error) {
      logger.error('AdMob: Show failed', error);
      return { success: false };
    }
  }
}

/**
 * Unity Ads rewarded video provider
 */
export class UnityAdsRewardedVideoProvider extends BaseRewardedVideoProvider {
  private gameId: string;
  private placementId: string;
  private initialized: boolean = false;

  constructor(gameId: string, placementId: string = 'rewardedVideo') {
    super();
    this.gameId = gameId;
    this.placementId = placementId;
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if Unity Ads is available
      if (typeof window === 'undefined' || !('UnityAds' in window)) {
        throw new Error('Unity Ads not available');
      }

      const UnityAds = (window as any).UnityAds;
      await new Promise((resolve, reject) => {
        UnityAds.init({
          gameId: this.gameId,
          onComplete: resolve,
          onError: reject,
        });
      });

      this.initialized = true;
      logger.debug('Unity Ads: Initialized');
    } catch (error) {
      logger.error('Unity Ads: Initialization failed', error);
      throw error;
    }
  }

  public async isAvailable(): Promise<boolean> {
    try {
      await this.initialize();
      const UnityAds = (window as any).UnityAds;
      return UnityAds.isReady(this.placementId);
    } catch {
      return false;
    }
  }

  public async load(): Promise<void> {
    if (this.isLoading || this.isLoaded) return;

    this.setLoading(true);
    logger.debug('Unity Ads: Loading...');

    try {
      await this.initialize();
      const UnityAds = (window as any).UnityAds;

      await new Promise((resolve, reject) => {
        UnityAds.load({
          placementId: this.placementId,
          onComplete: () => {
            this.setLoaded(true);
            resolve(void 0);
          },
          onError: reject,
        });
      });

      logger.debug('Unity Ads: Loaded');
    } catch (error) {
      logger.error('Unity Ads: Load failed', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  public async show(): Promise<{ success: boolean; reward?: { type: string; amount: number } }> {
    if (!this.isCurrentlyLoaded()) {
      logger.warn('Unity Ads: Not loaded, attempting to load first');
      await this.load();
    }

    logger.debug('Unity Ads: Showing...');

    try {
      const UnityAds = (window as any).UnityAds;
      
      const result = await new Promise<boolean>((resolve) => {
        UnityAds.show({
          placementId: this.placementId,
          onComplete: () => resolve(true),
          onSkipped: () => resolve(false),
          onError: () => resolve(false),
        });
      });

      this.setLoaded(false); // Need to reload

      if (result) {
        logger.debug('Unity Ads: Completed');
        return {
          success: true,
          reward: { type: 'entries', amount: 50 }
        };
      } else {
        logger.debug('Unity Ads: Not completed');
        return { success: false };
      }
    } catch (error) {
      logger.error('Unity Ads: Show failed', error);
      return { success: false };
    }
  }
}

/**
 * Factory function to create rewarded video provider
 */
export function createRewardedVideoProvider(config: {
  provider: 'mock' | 'admob' | 'unity' | 'none';
  adUnitId?: string;
  gameId?: string;
  placementId?: string;
  mockOptions?: {
    shouldSucceed?: boolean;
    loadDelay?: number;
    showDelay?: number;
  };
}): RewardedVideoProvider | null {
  switch (config.provider) {
    case 'mock':
      return new MockRewardedVideoProvider(config.mockOptions);
    
    case 'admob':
      return config.adUnitId ? new AdMobRewardedVideoProvider(config.adUnitId) : null;
    
    case 'unity':
      return config.gameId ? new UnityAdsRewardedVideoProvider(config.gameId, config.placementId) : null;
    
    case 'none':
    default:
      return null;
  }
}