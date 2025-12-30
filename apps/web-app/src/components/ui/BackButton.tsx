'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

/**
 * 🍎 Back Button Component
 * Apple HIG Navigation - Always provide clear back navigation
 */

interface BackButtonProps {
    label?: string;
    href?: string;
    className?: string;
}

export default function BackButton({
    label = 'กลับ',
    href,
    className = ''
}: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`nav-back-btn ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                color: '#1B5E20',
                fontWeight: 500,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: 'transparent',
                border: 'none',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(27, 94, 32, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
            }}
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M15 18L9 12L15 6" />
            </svg>
            <span>{label}</span>
        </button>
    );
}
