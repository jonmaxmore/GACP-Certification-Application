/**
 * Agri UI Config - Shared Design Tokens
 * ใช้ร่วมกันระหว่าง Web และ Mobile
 */

// Brand Colors
export const colors = {
    primary: '#16A34A',      // GACP Green
    primaryDark: '#15803D',
    primaryLight: '#22C55E',

    secondary: '#1E40AF',    // Blue
    accent: '#F59E0B',       // Amber

    background: '#F5F7FA',
    surface: '#FFFFFF',

    text: {
        primary: '#111827',
        secondary: '#6B7280',
        muted: '#9CA3AF',
    },

    status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
    },

    border: '#E5E7EB',
};

// Typography
export const fonts = {
    primary: 'Inter, sans-serif',
    thai: 'Noto Sans Thai, sans-serif',
};

// Spacing
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Border Radius
export const radius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export default {
    colors,
    fonts,
    spacing,
    radius,
};
