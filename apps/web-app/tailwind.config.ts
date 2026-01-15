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
                sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
                thai: ['var(--font-sarabun)', 'Sarabun', 'sans-serif'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
                'base': ['1rem', { lineHeight: '1.5rem' }],      // 16px - Standard Reading
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
                '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
            },
            colors: {
                primary: {
                    DEFAULT: "#006837", // Official DTAM Green
                    foreground: "#ffffff",
                    hover: "#00542d",
                    active: "#004022",
                    50: '#e6f0eb',
                    100: '#cce2d7',
                    200: '#99c5af',
                    300: '#66a787',
                    400: '#338a5f',
                    500: '#006837',
                    600: '#005d31',
                    700: '#00532c',
                    800: '#004926',
                    900: '#003e21',
                },
                secondary: {
                    DEFAULT: "#f8fafc",
                    foreground: "#0f172a",
                },
                accent: {
                    DEFAULT: "#eab308", // Golden Yellow for Thai Official/Royal accents
                    foreground: "#422006",
                },
                background: {
                    DEFAULT: "#f8fafc", // Cool Gray 50 - Cleaner than Mint
                    paper: "#ffffff",
                    subtle: "#f1f5f9",
                    input: "#ffffff",
                },
                text: {
                    main: "#1e293b",     // Slate 800 - High Contrast
                    secondary: "#475569", // Slate 600
                    muted: "#94a3b8",     // Slate 400
                    inverse: "#ffffff",
                },
                border: {
                    DEFAULT: "#e2e8f0", // Slate 200
                    focus: "#006837",
                },
                status: {
                    success: "#16a34a",
                    successBg: "#f0fdf4",
                    warning: "#ca8a04",
                    warningBg: "#fefce8",
                    error: "#dc2626",
                    errorBg: "#fef2f2",
                    info: "#2563eb",
                    infoBg: "#eff6ff",
                }
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)', // Clean, modern Application shadow
            },
            borderRadius: {
                'sm': '0.125rem', // 2px
                'DEFAULT': '0.25rem', // 4px
                'md': '0.375rem', // 6px - Standard Bootstrap/Tailwind feel
                'lg': '0.5rem',   // 8px - Modern Standard
                'xl': '0.75rem',  // 12px
                '2xl': '1rem',    // 16px - Cards only
                'full': '9999px',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out forwards',
                'slide-up': 'slideUp 0.3s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [
        forms,
        plugin(function ({ addBase, addComponents, theme }) {
            addBase({
                'html': { fontSize: '16px' },
                'body': {
                    backgroundColor: theme('colors.background.DEFAULT'),
                    color: theme('colors.text.main'),
                    fontFamily: theme('fontFamily.thai'), // Default to Thai font
                    '-webkit-font-smoothing': 'antialiased',
                },
                'h1, h2, h3, h4, h5, h6': {
                    color: theme('colors.text.main'), // Headings in slate-900 for professionalism
                    fontWeight: theme('fontWeight.bold'),
                    lineHeight: '1.2',
                },
                'label': {
                    display: 'block',
                    fontSize: theme('fontSize.sm'),
                    fontWeight: theme('fontWeight.semibold'), // Slightly bolder for readability
                    color: theme('colors.text.main'),
                    marginBottom: '0.5rem',
                },
                // STANDARD INPUT STYLING (Medical Grade)
                'input[type="text"], input[type="email"], input[type="password"], input[type="number"], select, textarea': {
                    display: 'block',
                    width: '100%',
                    padding: '0.625rem 0.875rem', // ~10px 14px
                    fontSize: theme('fontSize.base'),
                    lineHeight: '1.5',
                    color: theme('colors.text.main'),
                    backgroundColor: theme('colors.background.input'),
                    backgroundImage: 'none', // Reset for select
                    border: `1px solid ${theme('colors.border.DEFAULT')}`,
                    borderRadius: theme('borderRadius.md'), // 6px
                    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                    '&:focus': {
                        outline: 'none',
                        borderColor: theme('colors.primary.500'),
                        boxShadow: `0 0 0 3px ${theme('colors.primary.100')}`, // Subtle ring
                    },
                    '&:disabled': {
                        backgroundColor: theme('colors.secondary.DEFAULT'),
                        color: theme('colors.text.muted'),
                        cursor: 'not-allowed',
                    },
                    '&::placeholder': {
                        color: theme('colors.text.muted'),
                    }
                }
            });

            addComponents({
                // CARD COMPONENT (Clean, White, Subtle Shadow)
                '.gacp-card': {
                    backgroundColor: theme('colors.background.paper'),
                    border: `1px solid ${theme('colors.slate.200')}`,
                    borderRadius: theme('borderRadius.lg'), // 8px
                    boxShadow: theme('boxShadow.sm'), // Minimal shadow
                    padding: theme('spacing.6'), // 24px
                    marginBottom: theme('spacing.6'),
                },

                // BUTTONS (Solid, High Contrast)
                '.gacp-btn-primary': {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme('spacing.2'),
                    padding: '0.625rem 1.25rem', // Match input height
                    fontSize: theme('fontSize.sm'),
                    fontWeight: theme('fontWeight.medium'),
                    color: '#ffffff',
                    backgroundColor: theme('colors.primary.DEFAULT'),
                    border: '1px solid transparent',
                    borderRadius: theme('borderRadius.md'),
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover:not(:disabled)': {
                        backgroundColor: theme('colors.primary.600'),
                    },
                    '&:active:not(:disabled)': {
                        backgroundColor: theme('colors.primary.700'),
                        transform: 'translateY(1px)',
                    },
                    '&:disabled': {
                        backgroundColor: theme('colors.slate.200'),
                        color: theme('colors.slate.400'),
                        cursor: 'not-allowed',
                    }
                },
                '.gacp-btn-secondary': {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme('spacing.2'),
                    padding: '0.625rem 1.25rem',
                    fontSize: theme('fontSize.sm'),
                    fontWeight: theme('fontWeight.medium'),
                    color: theme('colors.text.main'),
                    backgroundColor: '#ffffff',
                    border: `1px solid ${theme('colors.border.DEFAULT')}`,
                    borderRadius: theme('borderRadius.md'),
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover:not(:disabled)': {
                        backgroundColor: theme('colors.slate.50'),
                        borderColor: theme('colors.slate.300'),
                        color: theme('colors.text.main'),
                    },
                    '&:active:not(:disabled)': {
                        backgroundColor: theme('colors.slate.100'),
                    },
                    '&:disabled': {
                        backgroundColor: theme('colors.slate.50'),
                        color: theme('colors.slate.300'),
                        cursor: 'not-allowed',
                    }
                },

                // SELECTION CARD (Radio/Checkbox alternative)
                '.gacp-selection': {
                    display: 'flex',
                    alignItems: 'center',
                    padding: theme('spacing.4'),
                    backgroundColor: '#ffffff',
                    border: `1px solid ${theme('colors.border.DEFAULT')}`,
                    borderRadius: theme('borderRadius.lg'),
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                        borderColor: theme('colors.primary.300'),
                        backgroundColor: theme('colors.primary.50'),
                    },
                    '&.selected': {
                        borderColor: theme('colors.primary.600'),
                        backgroundColor: theme('colors.primary.50'),
                        boxShadow: `inset 0 0 0 1px ${theme('colors.primary.600')}`,
                    }
                }
            });
        }),
    ],
};

export default config;
