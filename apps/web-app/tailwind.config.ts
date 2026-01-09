import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        // Desktop-first breakpoints (max-width)
        screens: {
            '2xl': { max: '1535px' },
            'xl': { max: '1279px' },
            'lg': { max: '1023px' },
            'md': { max: '767px' },
            'sm': { max: '639px' },
            // Standard min-width breakpoints for progressive enhancement
            'desktop': '1280px',
            'wide': '1920px',
        },
        extend: {
            fontFamily: {
                sans: ['Inter', '"Noto Sans Thai"', 'system-ui', 'sans-serif'],
                thai: ['"Sarabun"', '"Noto Sans Thai"', 'sans-serif'],
            },
            fontSize: {
                // Desktop-optimized sizes (larger base)
                'xs': ['0.8125rem', { lineHeight: '1.25rem' }],    // 13px
                'sm': ['0.875rem', { lineHeight: '1.375rem' }],    // 14px
                'base': ['1rem', { lineHeight: '1.625rem' }],      // 16px
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],     // 18px
                'xl': ['1.25rem', { lineHeight: '1.875rem' }],     // 20px
                '2xl': ['1.5rem', { lineHeight: '2rem' }],         // 24px
                '3xl': ['1.875rem', { lineHeight: '2.375rem' }],   // 30px
                '4xl': ['2.25rem', { lineHeight: '2.75rem' }],     // 36px
            },
            colors: {
                // DTAM CI: Emerald Green (สมุนไพร/ความน่าเชื่อถือ)
                primary: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                    950: '#022c22',
                },
                // Gold accent (มาตรฐานระดับสูง)
                gold: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                },
                // High-contrast text colors (WCAG AA compliant)
                content: {
                    primary: '#111827',    // gray-900 (contrast 16:1)
                    secondary: '#374151',  // gray-700 (contrast 9:1)
                    tertiary: '#6b7280',   // gray-500 (contrast 5:1)
                    muted: '#9ca3af',      // gray-400 - use sparingly
                    inverse: '#ffffff',
                },
                // Surface colors
                surface: {
                    50: '#fafafa',
                    100: '#f4f4f5',
                    200: '#e4e4e7',
                    300: '#d4d4d8',
                },
                // Secondary colors (amber for warnings, highlights)
                secondary: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '88': '22rem',
                '104': '26rem',
                '128': '32rem',
            },
            maxWidth: {
                'desktop': '1440px',
                'wide': '1920px',
            },
            boxShadow: {
                'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
                'card': '0 4px 16px -4px rgba(0, 0, 0, 0.1)',
                'elevated': '0 8px 32px -8px rgba(0, 0, 0, 0.12)',
                'button': '0 4px 14px -2px rgba(16, 185, 129, 0.35)',
                'button-hover': '0 6px 20px -2px rgba(16, 185, 129, 0.45)',
            },
            borderRadius: {
                'xl': '0.875rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.98)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [forms],
};

export default config;
