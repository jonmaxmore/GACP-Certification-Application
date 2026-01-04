import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // Thai-friendly sans-serif fonts
                sans: ['"Sarabun"', '"Inter"', 'system-ui', 'sans-serif'],
            },
            colors: {
                // CI: กรมการแพทย์แผนไทยฯ (Modern interpretation)
                primary: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981', // Main brand - buttons/links
                    600: '#059669', // Hover state
                    700: '#047857', // Dark text
                    800: '#065f46',
                    900: '#064e3b', // Navbar/headers
                },
                secondary: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b', // Gold - badges/secondary actions
                    600: '#d97706',
                    700: '#b45309',
                },
                surface: {
                    50: '#fafaf9',  // App background (eye-friendly)
                    100: '#f5f5f4', // Card background alt
                    200: '#e7e5e4',
                },
                // Keep slate for text
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
            },
            boxShadow: {
                // Apple-style soft shadows
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'float': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
                'card': '0 4px 24px -4px rgba(0, 0, 0, 0.06)',
                'button': '0 4px 14px -2px rgba(16, 185, 129, 0.35)',
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            },
        },
    },
    plugins: [forms],
};

export default config;
