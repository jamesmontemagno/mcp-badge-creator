/**
 * Badge theming types based on shield.io standards
 * Reference: https://shields.io/badges/static-badge
 */

export type BadgeStyle = 
  | 'flat' 
  | 'flat-square' 
  | 'plastic' 
  | 'for-the-badge' 
  | 'social';

export type BadgeColorScheme = 
  | 'default'
  | 'blue-green'
  | 'red-orange'
  | 'yellow-green'
  | 'blue-purple'
  | 'green-blue'
  | 'dark'
  | 'light';

export interface BadgeTheme {
  style: BadgeStyle;
  colorScheme: BadgeColorScheme;
  customColors?: {
    vscode?: string;
    vscodeInsiders?: string;
    visualStudio?: string;
    cursor?: string;
    default?: string;
  };
  logoColor?: 'white' | 'black' | 'auto';
  showLogo?: boolean;
}

export interface BadgeThemeSettings {
  theme: BadgeTheme;
  applyToAll?: boolean;
}

// Default theme configurations
export const DEFAULT_BADGE_THEMES: Record<BadgeColorScheme, Partial<BadgeTheme>> = {
  'default': {
    style: 'flat-square',
    customColors: {
      vscode: '0098FF',
      vscodeInsiders: '24bfa5',
      visualStudio: 'C16FDE',
      cursor: '000000',
      default: '555555'
    },
    logoColor: 'white',
    showLogo: true
  },
  'blue-green': {
    style: 'flat-square',
    customColors: {
      vscode: '2196F3',
      vscodeInsiders: '00BCD4',
      visualStudio: '4CAF50',
      cursor: '009688',
      default: '607D8B'
    },
    logoColor: 'white',
    showLogo: true
  },
  'red-orange': {
    style: 'flat-square',
    customColors: {
      vscode: 'F44336',
      vscodeInsiders: 'FF9800',
      visualStudio: 'FF5722',
      cursor: 'E91E63',
      default: '795548'
    },
    logoColor: 'white',
    showLogo: true
  },
  'yellow-green': {
    style: 'flat-square',
    customColors: {
      vscode: 'FFEB3B',
      vscodeInsiders: '8BC34A',
      visualStudio: '4CAF50',
      cursor: '689F38',
      default: '9E9E9E'
    },
    logoColor: 'black',
    showLogo: true
  },
  'blue-purple': {
    style: 'flat-square',
    customColors: {
      vscode: '3F51B5',
      vscodeInsiders: '9C27B0',
      visualStudio: '673AB7',
      cursor: '2196F3',
      default: '607D8B'
    },
    logoColor: 'white',
    showLogo: true
  },
  'green-blue': {
    style: 'flat-square',
    customColors: {
      vscode: '4CAF50',
      vscodeInsiders: '00BCD4',
      visualStudio: '2196F3',
      cursor: '009688',
      default: '795548'
    },
    logoColor: 'white',
    showLogo: true
  },
  'dark': {
    style: 'flat-square',
    customColors: {
      vscode: '1a1a1a',
      vscodeInsiders: '2d2d2d',
      visualStudio: '1e1e1e',
      cursor: '000000',
      default: '333333'
    },
    logoColor: 'white',
    showLogo: true
  },
  'light': {
    style: 'flat-square',
    customColors: {
      vscode: 'f0f0f0',
      vscodeInsiders: 'f5f5f5',
      visualStudio: 'fafafa',
      cursor: 'ffffff',
      default: 'e0e0e0'
    },
    logoColor: 'black',
    showLogo: true
  }
};

export const BADGE_STYLE_DESCRIPTIONS: Record<BadgeStyle, string> = {
  'flat': 'Clean flat design',
  'flat-square': 'Flat with square edges',
  'plastic': '3D plastic effect',
  'for-the-badge': 'Large rectangular style',
  'social': 'GitHub-style social badge'
};

export const BADGE_COLOR_SCHEME_DESCRIPTIONS: Record<BadgeColorScheme, string> = {
  'default': 'Original VS Code colors',
  'blue-green': 'Cool blue to green gradient',
  'red-orange': 'Warm red to orange theme',
  'yellow-green': 'Bright yellow to green',
  'blue-purple': 'Deep blue to purple',
  'green-blue': 'Nature green to blue',
  'dark': 'Dark theme colors',
  'light': 'Light theme colors'
};