import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
const daisyui = require("daisyui");

const config = {
    darkMode: 'class',
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Modern "International App" Palette (Clean, High Contrast)
                primary: {
                    DEFAULT: "#1DB954", // Vivid Tech Green (Spotify-like)
                    foreground: "#ffffff",
                    hover: "#1aa34a",
                    active: "#168d40",
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                secondary: {
                    DEFAULT: "#18181b", // Zinc 900 (Dark)
                    foreground: "#ffffff",
                },
                accent: {
                    DEFAULT: "#3b82f6", // Modern Blue
                    foreground: "#ffffff",
                },
                background: {
                    DEFAULT: "#ffffff",
                    paper: "#ffffff",
                    subtle: "#f4f4f5", // Zinc 100
                    input: "#ffffff",
                },
                text: {
                    main: "#09090b",     // Zinc 950
                    secondary: "#71717a", // Zinc 500
                    muted: "#a1a1aa",     // Zinc 400
                    inverse: "#ffffff",
                },
            },
            boxShadow: {
                'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
                'card': '0 0 0 1px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.05)',
                'float': '0 10px 40px -10px rgba(0,0,0,0.08)',
            }
        },
    },
    plugins: [
        forms,
        require('tailwindcss-safe-area'),
        daisyui,
    ],
    daisyui: {
        themes: [
            {
                light: {
                    "primary": "#1DB954",
                    "secondary": "#18181b",
                    "accent": "#3b82f6",
                    "neutral": "#27272a",
                    "base-100": "#ffffff",
                    "--rounded-btn": "9999px", // Pill buttons (Modern)
                    "--rounded-box": "1rem",   // Smooth cards
                },
            },
        ],
    }
};

export default config;
