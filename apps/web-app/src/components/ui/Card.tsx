"use client";

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
}

/**
 * Card Component
 * 🍎 Apple Design: Consistent card styling
 */
export function Card({
    children,
    variant = 'default',
    padding = 'md',
    className = '',
    onClick,
}: CardProps) {
    const baseStyle: React.CSSProperties = {
        borderRadius: 16,
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
        default: {
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
        },
        elevated: {
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
        outlined: {
            backgroundColor: 'transparent',
            border: '2px solid #E5E7EB',
        },
    };

    const paddingStyles: Record<string, string> = {
        none: '0',
        sm: '12px',
        md: '20px',
        lg: '28px',
    };

    return (
        <div
            style={{
                ...baseStyle,
                ...variantStyles[variant],
                padding: paddingStyles[padding],
            }}
            className={className}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number | string;
    icon?: string;
    trend?: { value: number; isPositive: boolean };
    color?: string;
    onClick?: () => void;
}

/**
 * StatCard Component
 * 🍎 Apple Design: Dashboard statistics card
 */
export function StatCard({
    title,
    value,
    icon = '📊',
    trend,
    color = '#3B82F6',
    onClick,
}: StatCardProps) {
    return (
        <Card variant="elevated" onClick={onClick}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{
                        fontSize: 13,
                        color: '#6B7280',
                        marginBottom: 8,
                        fontWeight: 500,
                    }}>
                        {title}
                    </p>
                    <p style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: '#1F2937',
                        lineHeight: 1,
                    }}>
                        {value}
                    </p>
                    {trend && (
                        <p style={{
                            fontSize: 12,
                            marginTop: 8,
                            color: trend.isPositive ? '#10B981' : '#EF4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            {Math.abs(trend.value)}%
                            <span style={{ color: '#9CA3AF' }}>จากเดือนที่แล้ว</span>
                        </p>
                    )}
                </div>
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                }}>
                    {icon}
                </div>
            </div>
        </Card>
    );
}

export default Card;
