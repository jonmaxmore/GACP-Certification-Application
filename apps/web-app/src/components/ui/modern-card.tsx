"use client";

import React from 'react';

interface ModernCardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'highlighted' | 'success' | 'warning' | 'danger';
    padding?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    selected?: boolean;
    isDark?: boolean;
    className?: string;
}

export function ModernCard({
    children,
    title,
    subtitle,
    icon,
    variant = 'default',
    padding = 'md',
    onClick,
    selected = false,
    isDark = false,
    className = '',
}: ModernCardProps) {
    const isClickable = !!onClick;

    const paddingMap = { sm: '12px', md: '16px', lg: '24px' };

    const variantStyles: Record<string, React.CSSProperties> = {
        default: {
            background: isDark ? '#1F2937' : '#FFFFFF',
            border: selected ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
        },
        highlighted: {
            background: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5',
            border: '1px solid #10B981',
        },
        success: {
            background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5',
            border: '1px solid #10B981',
        },
        warning: {
            background: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
            border: '1px solid #F59E0B',
        },
        danger: {
            background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
            border: '1px solid #EF4444',
        },
    };

    const cardStyle: React.CSSProperties = {
        borderRadius: '14px',
        padding: paddingMap[padding],
        transition: 'all 0.2s ease',
        cursor: isClickable ? 'pointer' : 'default',
        boxShadow: selected
            ? '0 4px 16px rgba(16, 185, 129, 0.2)'
            : isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
        fontFamily: "'Kanit', sans-serif",
        ...variantStyles[variant],
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: (title || subtitle) ? '12px' : 0,
    };

    const iconWrapperStyle: React.CSSProperties = {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#10B981',
        flexShrink: 0,
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '15px',
        fontWeight: 600,
        color: isDark ? '#F9FAFB' : '#111827',
        margin: 0,
    };

    const subtitleStyle: React.CSSProperties = {
        fontSize: '13px',
        color: isDark ? '#9CA3AF' : '#6B7280',
        margin: 0,
    };

    return (
        <div
            style={cardStyle}
            onClick={onClick}
            className={className}
        >
            {(icon || title || subtitle) && (
                <div style={headerStyle}>
                    {icon && <div style={iconWrapperStyle}>{icon}</div>}
                    {(title || subtitle) && (
                        <div>
                            {title && <h3 style={titleStyle}>{title}</h3>}
                            {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
                        </div>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}

export default ModernCard;
