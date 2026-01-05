'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

/**
 * Back Button Component
 * Eco-Professional Navigation with Tailwind CSS
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
            className={`
                inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                text-emerald-700 font-medium text-sm
                bg-transparent hover:bg-emerald-50
                transition-all duration-200 cursor-pointer border-none
                ${className}
            `}
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
