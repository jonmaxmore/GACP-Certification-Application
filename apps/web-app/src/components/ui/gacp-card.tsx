"use client";

import React from 'react';

interface GACPCardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'highlighted' | 'success' | 'warning' | 'danger';
    padding?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    selected?: boolean;
    hoverable?: boolean;
    className?: string;
}

const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

const variantClasses = {
    default: 'bg-white border-surface-200',
    highlighted: 'bg-primary-50 border-primary-200',
    success: 'bg-primary-50 border-primary-500',
    warning: 'bg-secondary-50 border-secondary-400',
    danger: 'bg-red-50 border-red-300',
};

export function GACPCard({
    children,
    title,
    subtitle,
    icon,
    variant = 'default',
    padding = 'md',
    onClick,
    selected = false,
    hoverable = false,
    className = '',
}: GACPCardProps) {
    const isClickable = !!onClick;

    return (
        <div
            onClick={onClick}
            className={`
                rounded-2xl border shadow-card
                transition-all duration-200 ease-out
                ${paddingClasses[padding]}
                ${variantClasses[variant]}
                ${selected ? 'ring-2 ring-primary-500 border-primary-500' : ''}
                ${isClickable ? 'cursor-pointer' : ''}
                ${hoverable || isClickable ? 'hover:shadow-float hover:-translate-y-0.5' : ''}
                ${className}
            `.replace(/\s+/g, ' ').trim()}
        >
            {(icon || title || subtitle) && (
                <div className="flex items-center gap-3 mb-4">
                    {icon && (
                        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                            {icon}
                        </div>
                    )}
                    {(title || subtitle) && (
                        <div>
                            {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
                            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                        </div>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}

export default GACPCard;
