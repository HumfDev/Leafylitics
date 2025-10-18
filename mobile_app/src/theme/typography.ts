/**
 * Leafylitics Typography System
 */

export const typography = {
  fonts: {
    // Headings: Inter Bold / IBM Plex Sans
    heading: 'System',
    headingBold: 'System',
    
    // Body: Source Sans Pro / Noto Sans
    body: 'System',
    bodyBold: 'System',
    
    // Monospace: JetBrains Mono
    mono: 'Courier',
  },

  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export type Typography = typeof typography;
export default typography;

