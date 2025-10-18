/**
 * Leafylitics Design System - Colors
 * Based on PRD styling guidelines: Scientific Nature theme
 */

export const colors = {
  // Primary Colors
  primary: {
    forestGreen: '#2E7D32',
    leafGreen: '#66BB6A',
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    earthBeige: '#F5F3E7',
    ashGray: '#E0E0E0',
    darkGray: '#424242',
    black: '#000000',
  },

  // Accent Colors
  accent: {
    deepBlue: '#1565C0',
    skyBlue: '#42A5F5',
  },

  // Semantic Colors
  semantic: {
    success: '#66BB6A', // Healthy
    warning: '#FFB300', // Moderate confidence
    error: '#D32F2F', // Diseased
    uncertain: '#B0BEC5', // Low confidence
    info: '#42A5F5',
  },

  // Disease-specific colors
  disease: {
    healthy: '#66BB6A',
    diseased: '#D32F2F',
    deficiency: '#FFB300',
    pest: '#FF5722',
  },

  // UI Element Colors
  ui: {
    background: '#FFFFFF',
    backgroundSecondary: '#F5F3E7',
    border: '#E0E0E0',
    text: '#424242',
    textSecondary: '#757575',
    textLight: '#9E9E9E',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

export type Colors = typeof colors;

export default colors;

