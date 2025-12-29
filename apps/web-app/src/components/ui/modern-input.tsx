"use client";

import React, { forwardRef } from 'react';

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    containerClassName?: string;
    isDark?: boolean;
}

export const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(({
    label,
    error,
    hint,
    icon,
    iconPosition = 'left',
    containerClassName = '',
    isDark = false,
    ...props
}, ref) => {
    const hasIcon = !!icon;

    const containerStyle: React.CSSProperties = {
        marginBottom: '16px',
        fontFamily: "'Kanit', sans-serif",
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '13px',
        fontWeight: 500,
        color: isDark ? '#D1D5DB' : '#374151',
        marginBottom: '6px',
    };

    const inputWrapperStyle: React.CSSProperties = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: hasIcon
            ? iconPosition === 'left' ? '12px 14px 12px 42px' : '12px 42px 12px 14px'
            : '12px 14px',
        borderRadius: '12px',
        border: `1px solid ${error ? '#EF4444' : (isDark ? '#374151' : '#E5E7EB')}`,
        background: isDark ? '#1F2937' : '#FFFFFF',
        color: isDark ? '#F9FAFB' : '#111827',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: "'Kanit', sans-serif",
    };

    const iconStyle: React.CSSProperties = {
        position: 'absolute',
        [iconPosition === 'left' ? 'left' : 'right']: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: isDark ? '#6B7280' : '#9CA3AF',
        pointerEvents: 'none',
    };

    const errorStyle: React.CSSProperties = {
        fontSize: '12px',
        color: '#EF4444',
        marginTop: '4px',
    };

    const hintStyle: React.CSSProperties = {
        fontSize: '12px',
        color: isDark ? '#9CA3AF' : '#6B7280',
        marginTop: '4px',
    };

    return (
        <div style={containerStyle} className={containerClassName}>
            {label && (
                <label style={labelStyle}>
                    {label}
                    {props.required && <span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>}
                </label>
            )}
            <div style={inputWrapperStyle}>
                {icon && <span style={iconStyle}>{icon}</span>}
                <input
                    ref={ref}
                    style={inputStyle}
                    {...props}
                />
            </div>
            {error && <p style={errorStyle}>{error}</p>}
            {hint && !error && <p style={hintStyle}>{hint}</p>}
        </div>
    );
});

ModernInput.displayName = 'ModernInput';

export default ModernInput;
