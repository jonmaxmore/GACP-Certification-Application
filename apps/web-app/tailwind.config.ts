import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import plugin from "tailwindcss/plugin";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '"Noto Sans Thai"', 'system-ui', 'sans-serif'],
                thai: ['"Sarabun"', '"Noto Sans Thai"', 'sans-serif'],
            },
            fontSize: {
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
                primary: {
                    DEFAULT: "#006837", // MOPH Green
                    foreground: "#ffffff",
                    hover: "#00502a",
                    50: '#f2fcf5',
                    100: '#e1f8e8',
                    200: '#c4edd4',
                    300: '#95dbb6',
                    400: '#5fc292',
                    500: '#34a873',
                    600: '#006837',
                    700: '#0e6b40',
                    800: '#105536',
                    900: '#0e462d',
                },
                background: {
                    DEFAULT: "#f0fdf4", // Mint green
                    paper: "#ffffff",
                    subtle: "#f8fafc",
                },
                text: {
                    main: "#1e293b",
                    secondary: "#475569",
                    muted: "#94a3b8",
                    light: "#ffffff",
                },
                success: {
                    DEFAULT: "#22c55e",
                    bg: "#dcfce7",
                    text: "#15803d"
                },
                danger: {
                    DEFAULT: "#ef4444",
                    bg: "#fee2e2",
                    text: "#b91c1c"
                },
                warning: {
                    DEFAULT: "#f59e0b",
                    bg: "#fef3c7",
                    text: "#b45309"
                },
                dtam: {
                    light: '#4caf50',
                    DEFAULT: '#006837',
                    dark: '#1b5e20',
                    50: '#f2fcf5',
                },
            },
            boxShadow: {
                'soft': '0 2px 8px -2px rgba(0,0,0,0.08)',
                'card': '0 4px 20px -4px rgba(46,125,50,0.15), 0 2px 8px -2px rgba(0,0,0,0.08)',
                'elevated': '0 12px 40px -12px rgba(46,125,50,0.25), 0 4px 16px -4px rgba(0,0,0,0.1)',
                'premium': '0 4px 6px -1px rgba(46,125,50,0.1), 0 10px 20px -5px rgba(46,125,50,0.15), 0 25px 50px -12px rgba(0,0,0,0.12)',
                'premium-hover': '0 8px 12px -2px rgba(46,125,50,0.15), 0 20px 35px -8px rgba(46,125,50,0.2), 0 35px 60px -15px rgba(0,0,0,0.18)',
                'green-glow': '0 0 40px rgba(46,125,50,0.5), 0 8px 24px -4px rgba(46,125,50,0.4)',
                'green-glow-hover': '0 0 60px rgba(46,125,50,0.6), 0 12px 36px -6px rgba(46,125,50,0.5)',
                'glass': '0 8px 32px -4px rgba(46,125,50,0.2), 0 4px 16px -2px rgba(0,0,0,0.1), inset 0 1px 0 0 rgba(255,255,255,0.6)',
            },
            borderRadius: {
                'sm': '0.25rem',
                'DEFAULT': '0.375rem',
                'md': '0.5rem',
                'lg': '0.625rem',
                'xl': '0.75rem',
                '2xl': '0.875rem',
                '3xl': '1rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-left': 'slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'scale-in': 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideLeft: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                float: {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-6px)' },
                    '100%': { transform: 'translateY(0px)' },
                },
            },
        },
    },
    plugins: [
        forms,
        plugin(function ({ addBase, addComponents, theme }) {
            addBase({
                'body': {
                    backgroundColor: theme('colors.background.DEFAULT'),
                    color: theme('colors.text.main'),
                    '-webkit-font-smoothing': 'antialiased',
                    'line-height': '1.625',
                },
                'h1, h2, h3, h4, h5, h6': {
                    color: theme('colors.primary.DEFAULT'),
                    fontWeight: theme('fontWeight.bold'),
                    letterSpacing: theme('letterSpacing.tight'),
                },
                'h1': { fontSize: theme('fontSize.3xl') }, // Fallback, override with md:text-4xl in component usage if needed
                'h2': { fontSize: theme('fontSize.2xl') },
                'h3': { fontSize: theme('fontSize.xl') },
                'h4': { fontSize: theme('fontSize.lg') },
                'p': { fontSize: theme('fontSize.base'), color: theme('colors.text.secondary') },
                'small': { fontSize: theme('fontSize.sm'), color: theme('colors.text.muted') },
                'label': {
                    display: 'block',
                    fontSize: theme('fontSize.sm'),
                    fontWeight: theme('fontWeight.medium'),
                    color: theme('colors.text.secondary'),
                    marginBottom: '0.375rem',
                },
                'input, select, textarea': {
                    width: '100%',
                    borderColor: theme('colors.gray.200'),
                    borderRadius: theme('borderRadius.xl'),
                    padding: '0.75rem 1rem',
                    backgroundColor: '#ffffff',
                    color: theme('colors.text.main'),
                    transition: 'all 0.2s',
                    '&:focus': {
                        outline: 'none',
                        boxShadow: `0 0 0 2px ${theme('colors.primary.DEFAULT')}20`,
                        borderColor: theme('colors.primary.DEFAULT'),
                    },
                    '&:disabled': {
                        backgroundColor: theme('colors.gray.50'),
                        color: theme('colors.text.muted'),
                        cursor: 'not-allowed',
                    },
                    '&:hover': {
                        borderColor: theme('colors.gray.300'),
                    }
                }
            });

            addComponents({
                '.gacp-btn-primary': {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme('spacing.2'),
                    padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
                    borderRadius: theme('borderRadius.xl'),
                    fontWeight: theme('fontWeight.semibold'),
                    color: '#ffffff',
                    transition: 'all 0.2s',
                    boxShadow: theme('boxShadow.md'),
                    position: 'relative',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${theme('colors.primary.DEFAULT')} 0%, ${theme('colors.primary.hover')} 100%)`,
                    '&:hover:not(:disabled)': {
                        boxShadow: theme('boxShadow.lg'),
                        transform: 'translateY(-2px)',
                        filter: 'brightness(110%)',
                    },
                    '&:active:not(:disabled)': {
                        transform: 'scale(0.95) translateY(0)',
                        boxShadow: theme('boxShadow.md'),
                    },
                    '&:disabled': {
                        backgroundColor: theme('colors.gray.200'),
                        color: theme('colors.gray.400'),
                        boxShadow: 'none',
                        cursor: 'not-allowed',
                        background: theme('colors.gray.200'),
                    }
                },
                '.gacp-btn-secondary': {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme('spacing.2'),
                    padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
                    borderRadius: theme('borderRadius.xl'),
                    fontWeight: theme('fontWeight.semibold'),
                    color: theme('colors.text.main'),
                    backgroundColor: '#ffffff',
                    border: `1px solid ${theme('colors.gray.200')}`,
                    transition: 'all 0.2s',
                    boxShadow: theme('boxShadow.sm'),
                    '&:hover:not(:disabled)': {
                        borderColor: theme('colors.primary.DEFAULT'),
                        color: theme('colors.primary.DEFAULT'),
                        backgroundColor: theme('colors.primary.50'),
                        transform: 'translateY(-2px)',
                        boxShadow: theme('boxShadow.md'),
                    },
                    '&:active:not(:disabled)': {
                        transform: 'scale(0.95)',
                        backgroundColor: theme('colors.gray.50'),
                    },
                    '&:disabled': {
                        backgroundColor: theme('colors.gray.50'),
                        color: theme('colors.gray.300'),
                        borderColor: theme('colors.gray.200'),
                        cursor: 'not-allowed',
                    }
                },
                '.gacp-card': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: theme('borderRadius.2xl'),
                    boxShadow: theme('boxShadow.sm'),
                    padding: theme('spacing.6'),
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    '&:hover': {
                        boxShadow: theme('boxShadow.lg'),
                        borderColor: theme('colors.primary.100'),
                        transform: 'translateY(-4px)',
                    }
                },
                '.gacp-badge': {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: theme('spacing.1.5'),
                    padding: `${theme('spacing.1')} ${theme('spacing.3')}`,
                    borderRadius: theme('borderRadius.full'),
                    fontSize: theme('fontSize.xs'),
                    fontWeight: theme('fontWeight.bold'),
                    textTransform: 'uppercase',
                    letterSpacing: theme('letterSpacing.wide'),
                },
                '.gacp-badge-success': {
                    backgroundColor: theme('colors.success.bg'),
                    color: theme('colors.success.text'),
                    border: `1px solid ${theme('colors.success.DEFAULT')}33`,
                },
                '.gacp-badge-warning': {
                    backgroundColor: theme('colors.warning.bg'),
                    color: theme('colors.warning.text'),
                    border: `1px solid ${theme('colors.warning.DEFAULT')}33`,
                },
                '.gacp-badge-danger': {
                    backgroundColor: theme('colors.danger.bg'),
                    color: theme('colors.danger.text'),
                    border: `1px solid ${theme('colors.danger.DEFAULT')}33`,
                },
                '.gacp-badge-neutral': {
                    backgroundColor: theme('colors.gray.100'),
                    color: theme('colors.text.muted'),
                    border: `1px solid ${theme('colors.gray.200')}`,
                },
                '.gacp-selection': {
                    position: 'relative',
                    padding: theme('spacing.6'),
                    borderRadius: theme('borderRadius.2xl'),
                    borderWidth: '2px',
                    borderColor: 'transparent',
                    backgroundColor: '#ffffff',
                    boxShadow: theme('boxShadow.sm'),
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    ringWidth: '1px',
                    ringColor: theme('colors.gray.100'),
                    '&:hover': {
                        boxShadow: theme('boxShadow.md'),
                        ringColor: theme('colors.primary.200'),
                        transform: 'translateY(-4px)',
                        backgroundColor: `${theme('colors.primary.50')}4d`, // 30% opacity equivalent
                    },
                    '&.selected': {
                        borderColor: theme('colors.primary.DEFAULT'),
                        backgroundColor: theme('colors.primary.50'),
                        ringWidth: '0px',
                        boxShadow: theme('boxShadow.lg'),
                    }
                },
                '.gacp-title': {
                    fontSize: theme('fontSize.2xl'),
                    fontWeight: theme('fontWeight.bold'),
                    color: theme('colors.primary.DEFAULT'),
                    marginBottom: theme('spacing.2'),
                },
                '.gacp-subtitle': {
                    fontSize: theme('fontSize.base'),
                    color: theme('colors.text.muted'),
                    lineHeight: theme('lineHeight.relaxed'),
                }
            });
        }),
    ],
};

export default config;
