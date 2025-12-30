"use client";

import React from 'react';

interface ModernButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    className?: string;
    type?: 'button' | 'submit';
}

export function ModernButton({
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
}: ModernButtonProps) {
    const baseStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '12px',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        border: 'none',
        outline: 'none',
        fontFamily: "'Kanit', sans-serif",
        width: fullWidth ? '100%' : 'auto',
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
        sm: { padding: '8px 16px', fontSize: '13px', borderRadius: '10px' },
        md: { padding: '12px 24px', fontSize: '14px' },
        lg: { padding: '14px 28px', fontSize: '15px', borderRadius: '14px' },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
        primary: {
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            color: 'white',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
        },
        secondary: {
            background: 'transparent',
            color: '#10B981',
            border: '1.5px solid #10B981',
        },
        ghost: {
            background: 'transparent',
            color: '#6B7280',
            border: '1px solid #E5E7EB',
        },
        danger: {
            background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
            color: 'white',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.35)',
        },
    };

    const combinedStyles = {
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            style={combinedStyles}
            className={className}
        >
            {loading && (
                <span style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
            )}
            {!loading && icon && iconPosition === 'left' && icon}
            {children}
            {!loading && icon && iconPosition === 'right' && icon}
        </button>
    );
}

export default ModernButton;

