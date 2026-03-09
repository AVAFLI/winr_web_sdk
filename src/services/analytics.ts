import { AnalyticsAdapter } from '../types';
import { logger } from './logger';

/**
 * Console-based analytics adapter for debugging
 */
export class ConsoleAnalyticsAdapter implements AnalyticsAdapter {
  private enabled: boolean;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  public track(event: string, properties?: Record<string, unknown>): void {
    if (!this.enabled) return;
    
    logger.debug('Analytics Track:', { event, properties });
  }

  public identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.enabled) return;
    
    logger.debug('Analytics Identify:', { userId, traits });
  }
}

/**
 * Composite analytics adapter that forwards to multiple adapters
 */
export class CompositeAnalyticsAdapter implements AnalyticsAdapter {
  private adapters: AnalyticsAdapter[] = [];

  constructor(adapters: AnalyticsAdapter[] = []) {
    this.adapters = adapters;
  }

  public addAdapter(adapter: AnalyticsAdapter): void {
    this.adapters.push(adapter);
  }

  public removeAdapter(adapter: AnalyticsAdapter): void {
    const index = this.adapters.indexOf(adapter);
    if (index > -1) {
      this.adapters.splice(index, 1);
    }
  }

  public track(event: string, properties?: Record<string, unknown>): void {
    this.adapters.forEach(adapter => {
      try {
        adapter.track(event, properties);
      } catch (error) {
        logger.error('Analytics adapter error:', error);
      }
    });
  }

  public identify(userId: string, traits?: Record<string, unknown>): void {
    this.adapters.forEach(adapter => {
      try {
        adapter.identify(userId, traits);
      } catch (error) {
        logger.error('Analytics adapter error:', error);
      }
    });
  }
}

/**
 * Google Analytics adapter (gtag)
 */
export class GoogleAnalyticsAdapter implements AnalyticsAdapter {
  private trackingId: string;

  constructor(trackingId: string) {
    this.trackingId = trackingId;
  }

  public track(event: string, properties?: Record<string, unknown>): void {
    try {
      if (typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (window as any).gtag;
        gtag('event', event, {
          custom_map: properties,
          send_to: this.trackingId,
        });
      }
    } catch (error) {
      logger.error('Google Analytics track error:', error);
    }
  }

  public identify(userId: string, traits?: Record<string, unknown>): void {
    try {
      if (typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (window as any).gtag;
        gtag('config', this.trackingId, {
          user_id: userId,
          custom_map: traits,
        });
      }
    } catch (error) {
      logger.error('Google Analytics identify error:', error);
    }
  }
}

/**
 * Amplitude adapter
 */
export class AmplitudeAdapter implements AnalyticsAdapter {
  private apiKey: string;
  private initialized: boolean = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.init();
  }

  private init(): void {
    try {
      if (typeof window !== 'undefined' && 'amplitude' in window) {
        const amplitude = (window as any).amplitude;
        amplitude.getInstance().init(this.apiKey);
        this.initialized = true;
      }
    } catch (error) {
      logger.error('Amplitude initialization error:', error);
    }
  }

  public track(event: string, properties?: Record<string, unknown>): void {
    if (!this.initialized) return;
    
    try {
      if (typeof window !== 'undefined' && 'amplitude' in window) {
        const amplitude = (window as any).amplitude;
        amplitude.getInstance().logEvent(event, properties);
      }
    } catch (error) {
      logger.error('Amplitude track error:', error);
    }
  }

  public identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.initialized) return;
    
    try {
      if (typeof window !== 'undefined' && 'amplitude' in window) {
        const amplitude = (window as any).amplitude;
        const identify = new amplitude.Identify();
        
        if (traits) {
          Object.entries(traits).forEach(([key, value]) => {
            identify.set(key, value);
          });
        }
        
        amplitude.getInstance().setUserId(userId);
        amplitude.getInstance().identify(identify);
      }
    } catch (error) {
      logger.error('Amplitude identify error:', error);
    }
  }
}

/**
 * Mixpanel adapter
 */
export class MixpanelAdapter implements AnalyticsAdapter {
  private token: string;
  private initialized: boolean = false;

  constructor(token: string) {
    this.token = token;
    this.init();
  }

  private init(): void {
    try {
      if (typeof window !== 'undefined' && 'mixpanel' in window) {
        const mixpanel = (window as any).mixpanel;
        mixpanel.init(this.token);
        this.initialized = true;
      }
    } catch (error) {
      logger.error('Mixpanel initialization error:', error);
    }
  }

  public track(event: string, properties?: Record<string, unknown>): void {
    if (!this.initialized) return;
    
    try {
      if (typeof window !== 'undefined' && 'mixpanel' in window) {
        const mixpanel = (window as any).mixpanel;
        mixpanel.track(event, properties);
      }
    } catch (error) {
      logger.error('Mixpanel track error:', error);
    }
  }

  public identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.initialized) return;
    
    try {
      if (typeof window !== 'undefined' && 'mixpanel' in window) {
        const mixpanel = (window as any).mixpanel;
        mixpanel.identify(userId);
        
        if (traits) {
          mixpanel.people.set(traits);
        }
      }
    } catch (error) {
      logger.error('Mixpanel identify error:', error);
    }
  }
}

/**
 * Create analytics adapter based on configuration
 */
export function createAnalyticsAdapter(config?: {
  type?: 'console' | 'google' | 'amplitude' | 'mixpanel';
  apiKey?: string;
  trackingId?: string;
  token?: string;
  enabled?: boolean;
}): AnalyticsAdapter {
  if (!config || config.enabled === false) {
    return new ConsoleAnalyticsAdapter(false);
  }

  switch (config.type) {
    case 'google':
      return config.trackingId 
        ? new GoogleAnalyticsAdapter(config.trackingId)
        : new ConsoleAnalyticsAdapter();
    
    case 'amplitude':
      return config.apiKey
        ? new AmplitudeAdapter(config.apiKey)
        : new ConsoleAnalyticsAdapter();
    
    case 'mixpanel':
      return config.token
        ? new MixpanelAdapter(config.token)
        : new ConsoleAnalyticsAdapter();
    
    case 'console':
    default:
      return new ConsoleAnalyticsAdapter(Boolean(config.enabled));
  }
}

/**
 * Global analytics adapter with setAdapter capability
 */
class GlobalAnalyticsAdapter implements AnalyticsAdapter {
  private adapter: AnalyticsAdapter;

  constructor() {
    this.adapter = new ConsoleAnalyticsAdapter(true);
  }

  public setAdapter(adapter: AnalyticsAdapter): void {
    this.adapter = adapter;
  }

  public track(event: string, properties?: Record<string, unknown>): void {
    this.adapter.track(event, properties);
  }

  public identify(userId: string, traits?: Record<string, unknown>): void {
    this.adapter.identify(userId, traits);
  }
}

/**
 * Global analytics adapter instance
 */
export const analyticsAdapter = new GlobalAnalyticsAdapter();