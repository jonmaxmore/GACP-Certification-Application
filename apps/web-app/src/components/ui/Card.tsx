"use client";

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
}

const variantClasses = {
    default: 'bg-white border border-slate-200',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-transparent border-2 border-slate-200',
};

const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
};

/**
 * Card Component
 * Eco-Professional Design with Tailwind CSS
 */
export function Card({
    children,
    variant = 'default',
    padding = 'md',
    className = '',
    onClick,
}: CardProps) {
    return (
        <div
            className={`
                rounded-2xl transition-all duration-200
                ${variantClasses[variant]}
                ${paddingClasses[padding]}
                ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
                ${className}
            `}
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
    highlight?: boolean;
    onClick?: () => void;
}

/**
 * StatCard Component
 * Eco-Professional Dashboard Statistics Card
 */
export function StatCard({
    title,
    value,
    icon = '',
    trend,
    highlight = false,
    onClick,
}: StatCardProps) {
    return (
        <div
            className={`
                p-4 rounded-xl border transition-all duration-200
                ${highlight
                    ? 'bg-amber-50 border-amber-200 shadow-md ring-1 ring-amber-200'
                    : 'bg-white border-slate-200 hover:shadow-md'
                }
                ${onClick ? 'cursor-pointer' : ''}
            `}
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs text-slate-500 mb-2 font-medium">
                        {title}
                    </p>
                    <p className={`text-3xl font-bold leading-none ${highlight ? 'text-amber-700' : 'text-slate-800'}`}>
                        {value}
                    </p>
                    {trend && (
                        <p className={`text-xs mt-2 flex items-center gap-1 ${trend.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            {Math.abs(trend.value)}%
                            <span className="text-slate-400">จากเดือนที่แล้ว</span>
                        </p>
                    )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default Card;
