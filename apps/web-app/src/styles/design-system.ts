/**
 * GACP Design System 2025
 * Modern platform design tokens and theming
 * Font: Kanit (Google Fonts - Free)
 * Theme: Green Primary + Gold Accent
 */

// ============ Color Palette ============
export const colors = {
    // Primary - Forest Green
    primary: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
        800: '#065F46',
    },
    // Accent - Warm Gold
    accent: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F59E0B',
        600: '#D97706',
    },
    // Neutral Gray
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },
    // Semantic
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    // Base
    white: '#FFFFFF',
    black: '#000000',
};

// ============ Theme Presets ============
export const lightTheme = {
    // Backgrounds
    bg: colors.gray[50],
    bgCard: colors.white,
    bgElevated: colors.white,
    bgMuted: colors.gray[100],
    bgAccent: colors.primary[50],

    // Text Colors
    text: colors.gray[900],
    textSecondary: colors.gray[600],
    textMuted: colors.gray[400],
    textOnPrimary: colors.white,

    // Primary Colors
    primary: colors.primary[600],
    primaryLight: colors.primary[500],
    primaryLighter: colors.primary[100],
    primaryBg: colors.primary[50],

    // Accent Colors
    accent: colors.accent[500],
    accentLight: colors.accent[400],
    accentBg: colors.accent[50],

    // Borders
    border: colors.gray[200],
    borderLight: colors.gray[100],
    borderFocus: colors.primary[500],

    // Shadows
    shadow: 'rgba(0, 0, 0, 0.08)',
    shadowStrong: 'rgba(0, 0, 0, 0.15)',

    // Component specific
    inputBg: colors.white,
    cardBg: colors.white,
    headerGradient: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[500]} 100%)`,
    buttonGradient: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[500]} 100%)`,
    accentGradient: `linear-gradient(135deg, ${colors.accent[500]} 0%, ${colors.accent[400]} 100%)`,
};

export const darkTheme = {
    // Backgrounds
    bg: colors.gray[900],
    bgCard: colors.gray[800],
    bgElevated: colors.gray[700],
    bgMuted: colors.gray[800],
    bgAccent: `${colors.primary[600]}20`,

    // Text Colors
    text: colors.gray[50],
    textSecondary: colors.gray[300],
    textMuted: colors.gray[500],
    textOnPrimary: colors.white,

    // Primary Colors
    primary: colors.primary[500],
    primaryLight: colors.primary[400],
    primaryLighter: `${colors.primary[500]}30`,
    primaryBg: `${colors.primary[600]}15`,

    // Accent Colors
    accent: colors.accent[400],
    accentLight: colors.accent[300],
    accentBg: `${colors.accent[500]}15`,

    // Borders
    border: colors.gray[700],
    borderLight: colors.gray[800],
    borderFocus: colors.primary[500],

    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowStrong: 'rgba(0, 0, 0, 0.5)',

    // Component specific
    inputBg: colors.gray[800],
    cardBg: colors.gray[800],
    headerGradient: `linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.primary[600]} 100%)`,
    buttonGradient: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[400]} 100%)`,
    accentGradient: `linear-gradient(135deg, ${colors.accent[500]} 0%, ${colors.accent[400]} 100%)`,
};

// ============ Typography ============
export const typography = {
    fontFamily: "'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",

    // Font Sizes
    fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
    },

    // Font Weights
    fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    // Line Heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

// ============ Spacing ============
export const spacing = {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
};

// ============ Border Radius ============
export const radius = {
    none: '0px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
};

// ============ Shadows ============
export const shadows = {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    card: '0 4px 20px rgba(0, 0, 0, 0.08)',
    cardHover: '0 8px 30px rgba(0, 0, 0, 0.12)',
    button: '0 4px 14px rgba(16, 185, 129, 0.4)',
};

// ============ Transitions ============
export const transitions = {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
    bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// ============ Z-Index ============
export const zIndex = {
    dropdown: 100,
    modal: 200,
    toast: 300,
    tooltip: 400,
};

// ============ Breakpoints ============
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
};

// ============ Theme Hook ============
export type Theme = typeof lightTheme;

export const getTheme = (isDark: boolean): Theme => {
    return isDark ? darkTheme : lightTheme;
};

