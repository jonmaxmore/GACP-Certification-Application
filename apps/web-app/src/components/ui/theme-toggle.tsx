"use client";

import React, { useEffect, useState } from 'react';

interface ThemeToggleProps {
    className?: string;
    size?: 'sm' | 'md';
}

export function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem("theme", newTheme ? "dark" : "light");

        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));

        // Also update document for immediate feedback
        document.documentElement.classList.toggle('dark', newTheme);
    };

    if (!mounted) {
        return null; // Avoid hydration mismatch
    }

    const buttonSize = size === 'sm' ? '36px' : '44px';
    const iconSize = size === 'sm' ? '16px' : '20px';

    return (
        <button
            onClick={toggleTheme}
            className={className}
            style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '12px',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : '#10B981'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {isDark ? (
                // Sun icon
                <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            ) : (
                // Moon icon
                <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            )}
        </button>
    );
}

export default ThemeToggle;

