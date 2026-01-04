"use client";

import React from 'react';

interface GACPButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    className?: string;
    type?: 'button' | 'submit';
}

const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
    md: 'px-6 py-3 text-base rounded-xl gap-2',
    lg: 'px-8 py-4 text-lg rounded-xl gap-2',
};

const variantClasses = {
    primary: `
        bg-gradient-to-br from-primary-600 to-primary-500
        text-white font-semibold
        shadow-lg shadow-primary-500/30
        hover:shadow-xl hover:shadow-primary-500/40
        hover:-translate-y-0.5
        active:scale-[0.98]
        disabled:from-surface-200 disabled:to-surface-200
        disabled:text-slate-400 disabled:shadow-none
        disabled:translate-y-0 disabled:scale-100
    `,
    secondary: `
        bg-white text-slate-800 font-semibold
        border border-surface-200
        hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700
        active:scale-[0.98]
    `,
    ghost: `
        bg-transparent text-slate-600 font-medium
        hover:bg-surface-100 hover:text-slate-800
        active:scale-[0.98]
    `,
    danger: `
        bg-gradient-to-br from-red-600 to-red-500
        text-white font-semibold
        shadow-lg shadow-red-500/30
        hover:shadow-xl hover:shadow-red-500/40
        hover:-translate-y-0.5
        active:scale-[0.98]
    `,
    gold: `
        bg-gradient-to-br from-secondary-600 to-secondary-500
        text-white font-semibold
        shadow-lg shadow-secondary-500/30
        hover:shadow-xl hover:shadow-secondary-500/40
        hover:-translate-y-0.5
        active:scale-[0.98]
    `,
};

export function GACPButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    className = '',
    type = 'button',
}: GACPButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center
                transition-all duration-200 ease-out
                cursor-pointer
                disabled:cursor-not-allowed
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `.replace(/\s+/g, ' ').trim()}
        >
            {loading && (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {!loading && icon && iconPosition === 'left' && icon}
            {children}
            {!loading && icon && iconPosition === 'right' && icon}
        </button>
    );
}

export default GACPButton;
