import { StorageProvider } from '../types';

/**
 * localStorage wrapper that gracefully handles errors and unavailability
 */
export class LocalStorageProvider implements StorageProvider {
  private isAvailable: boolean = false;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  public getItem(key: string): string | null {
    if (!this.isAvailable) return null;
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`LocalStorage getItem failed for key "${key}":`, error);
      return null;
    }
  }

  public setItem(key: string, value: string): void {
    if (!this.isAvailable) return;
    
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`LocalStorage setItem failed for key "${key}":`, error);
      
      // Try to clear some space if quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanup();
        try {
          localStorage.setItem(key, value);
        } catch (retryError) {
          console.error(`LocalStorage setItem retry failed for key "${key}":`, retryError);
        }
      }
    }
  }

  public removeItem(key: string): void {
    if (!this.isAvailable) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`LocalStorage removeItem failed for key "${key}":`, error);
    }
  }

  public clear(): void {
    if (!this.isAvailable) return;
    
    try {
      // Only clear WINR-related keys to avoid affecting other apps
      this.clearWINRKeys();
    } catch (error) {
      console.warn('LocalStorage clear failed:', error);
    }
  }

  private checkAvailability(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }

      // Test localStorage functionality
      const testKey = '__winr_storage_test__';
      const testValue = 'test';
      
      window.localStorage.setItem(testKey, testValue);
      const retrieved = window.localStorage.getItem(testKey);
      window.localStorage.removeItem(testKey);
      
      return retrieved === testValue;
    } catch {
      return false;
    }
  }

  private clearWINRKeys(): void {
    const keys = [];
    
    // Collect all WINR-related keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('winr_')) {
        keys.push(key);
      }
    }
    
    // Remove WINR keys
    keys.forEach(key => localStorage.removeItem(key));
  }

  private cleanup(): void {
    try {
      // Remove old or unnecessary WINR data to free up space
      const keysToCheck = [
        'winr_device_fingerprint',
        'winr_last_claim_date',
      ];
      
      keysToCheck.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            // Check if it's old data that can be safely removed
            const data = JSON.parse(item);
            if (data.timestamp && Date.now() - data.timestamp > 30 * 24 * 60 * 60 * 1000) {
              // Remove data older than 30 days
              localStorage.removeItem(key);
            }
          } catch {
            // If parsing fails, the data might be corrupted, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('LocalStorage cleanup failed:', error);
    }
  }

  /**
   * Get storage usage information
   */
  public getUsageInfo(): { used: number; available: boolean } {
    if (!this.isAvailable) {
      return { used: 0, available: false };
    }

    try {
      const test = new Array(1024).join('a'); // 1KB test string
      let used = 0;
      
      // Estimate used space by testing storage capacity
      while (used < 10240) { // Test up to 10MB
        try {
          const testKey = `__winr_size_test_${used}__`;
          localStorage.setItem(testKey, test);
          localStorage.removeItem(testKey);
          used += 1;
        } catch {
          break;
        }
      }
      
      return { used: used * 1024, available: true };
    } catch {
      return { used: 0, available: false };
    }
  }
}

// Export singleton instance
export const localStorageProvider = new LocalStorageProvider();