'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'interactive' | 'bordered';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    header?: ReactNode;
    footer?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            variant = 'default',
            padding = 'md',
            header,
            footer,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
            bg-white rounded-2xl
            transition-all duration-200
        `;

        const variants = {
            default: 'border border-gray-200 shadow-soft',
            elevated: 'shadow-card',
            interactive: `
                border border-gray-200 shadow-soft
                hover:shadow-card hover:border-primary-200
                cursor-pointer
            `,
            bordered: 'border-2 border-gray-200',
        };

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        };

        return (
            <div
                ref={ref}
                className={cn(baseStyles, variants[variant], className)}
                {...props}
            >
                {header && (
                    <div className={cn(
                        'border-b border-gray-100',
                        padding === 'sm' && 'px-4 py-3',
                        padding === 'md' && 'px-6 py-4',
                        padding === 'lg' && 'px-8 py-5',
                    )}>
                        {header}
                    </div>
                )}
                <div className={cn(paddings[padding])}>
                    {children}
                </div>
                {footer && (
                    <div className={cn(
                        'border-t border-gray-100 bg-gray-50/50',
                        padding === 'sm' && 'px-4 py-3',
                        padding === 'md' && 'px-6 py-4',
                        padding === 'lg' && 'px-8 py-5',
                    )}>
                        {footer}
                    </div>
                )}
            </div>
        );
    }
);

Card.displayName = 'Card';

export { Card };
