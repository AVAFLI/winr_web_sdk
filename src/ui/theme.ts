import { Theme, WINRBranding } from '../types';

/**
 * Default WINR theme with dark aesthetic
 */
export const defaultTheme: Theme = {
  colors: {
    primary: '#6366f1', // Indigo
    secondary: '#8b5cf6', // Violet
    background: '#0f172a', // Dark slate
    surface: '#1e293b', // Lighter slate
    text: '#f8fafc', // Almost white
    textSecondary: '#cbd5e1', // Light gray
    success: '#10b981', // Emerald
    error: '#ef4444', // Red
    warning: '#f59e0b', // Amber
  },
  fonts: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    sizes: {
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
  },
  borderRadius: {
    sm: '0.25rem', // 4px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

/**
 * Create theme from branding configuration
 */
export function createTheme(branding?: WINRBranding): Theme {
  const theme: Theme = JSON.parse(JSON.stringify(defaultTheme)); // Deep clone

  if (branding) {
    if (branding.primaryColor) {
      theme.colors.primary = branding.primaryColor;
    }
    
    if (branding.secondaryColor) {
      theme.colors.secondary = branding.secondaryColor;
    }
    
    if (branding.backgroundColor) {
      theme.colors.background = branding.backgroundColor;
    }
    
    if (branding.fontFamily) {
      theme.fonts.family = branding.fontFamily;
    }
  }

  return theme;
}

/**
 * Generate CSS variables from theme
 */
export function generateCSSVariables(theme: Theme): string {
  const cssVars = [
    // Colors
    `--winr-color-primary: ${theme.colors.primary};`,
    `--winr-color-secondary: ${theme.colors.secondary};`,
    `--winr-color-background: ${theme.colors.background};`,
    `--winr-color-surface: ${theme.colors.surface};`,
    `--winr-color-text: ${theme.colors.text};`,
    `--winr-color-text-secondary: ${theme.colors.textSecondary};`,
    `--winr-color-success: ${theme.colors.success};`,
    `--winr-color-error: ${theme.colors.error};`,
    `--winr-color-warning: ${theme.colors.warning};`,
    
    // Fonts
    `--winr-font-family: ${theme.fonts.family};`,
    `--winr-font-size-sm: ${theme.fonts.sizes.sm};`,
    `--winr-font-size-base: ${theme.fonts.sizes.base};`,
    `--winr-font-size-lg: ${theme.fonts.sizes.lg};`,
    `--winr-font-size-xl: ${theme.fonts.sizes.xl};`,
    `--winr-font-size-2xl: ${theme.fonts.sizes['2xl']};`,
    `--winr-font-size-3xl: ${theme.fonts.sizes['3xl']};`,
    `--winr-font-weight-normal: ${theme.fonts.weights.normal};`,
    `--winr-font-weight-medium: ${theme.fonts.weights.medium};`,
    `--winr-font-weight-semibold: ${theme.fonts.weights.semibold};`,
    `--winr-font-weight-bold: ${theme.fonts.weights.bold};`,
    
    // Spacing
    `--winr-spacing-xs: ${theme.spacing.xs};`,
    `--winr-spacing-sm: ${theme.spacing.sm};`,
    `--winr-spacing-md: ${theme.spacing.md};`,
    `--winr-spacing-lg: ${theme.spacing.lg};`,
    `--winr-spacing-xl: ${theme.spacing.xl};`,
    `--winr-spacing-2xl: ${theme.spacing['2xl']};`,
    
    // Border radius
    `--winr-radius-sm: ${theme.borderRadius.sm};`,
    `--winr-radius-md: ${theme.borderRadius.md};`,
    `--winr-radius-lg: ${theme.borderRadius.lg};`,
    `--winr-radius-xl: ${theme.borderRadius.xl};`,
    `--winr-radius-full: ${theme.borderRadius.full};`,
    
    // Shadows
    `--winr-shadow-sm: ${theme.shadows.sm};`,
    `--winr-shadow-md: ${theme.shadows.md};`,
    `--winr-shadow-lg: ${theme.shadows.lg};`,
    `--winr-shadow-xl: ${theme.shadows.xl};`,
  ];

  return cssVars.join('\n  ');
}

/**
 * Light theme variant
 */
export const lightTheme: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
  },
};

/**
 * High contrast theme for accessibility
 */
export const highContrastTheme: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: '#ffffff',
    secondary: '#ffff00',
    background: '#000000',
    surface: '#333333',
    text: '#ffffff',
    textSecondary: '#cccccc',
  },
};

/**
 * Theme utilities
 */
export const ThemeUtils = {
  /**
   * Check if a color is light or dark
   */
  isLightColor(color: string): boolean {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
  },

  /**
   * Generate a contrasting text color
   */
  getContrastingTextColor(backgroundColor: string): string {
    return this.isLightColor(backgroundColor) ? '#000000' : '#ffffff';
  },

  /**
   * Lighten a color by percentage
   */
  lightenColor(color: string, percent: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
    const newG = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
    const newB = Math.min(255, Math.floor(b + (255 - b) * percent / 100));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  },

  /**
   * Darken a color by percentage
   */
  darkenColor(color: string, percent: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.floor(r * (100 - percent) / 100));
    const newG = Math.max(0, Math.floor(g * (100 - percent) / 100));
    const newB = Math.max(0, Math.floor(b * (100 - percent) / 100));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  },
};