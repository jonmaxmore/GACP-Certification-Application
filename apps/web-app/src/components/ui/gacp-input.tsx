"use client";

import React, { forwardRef } from 'react';

interface GACPInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    containerClassName?: string;
}

export const GACPInput = forwardRef<HTMLInputElement, GACPInputProps>(({
    label,
    error,
    hint,
    icon,
    iconPosition = 'left',
    containerClassName = '',
    className = '',
    required,
    ...props
}, ref) => {
    const hasIcon = !!icon;

    return (
        <div className={`mb-5 ${containerClassName}`}>
            {label && (
                <label className="gacp-label">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className={`
                        absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none
                        ${iconPosition === 'left' ? 'left-4' : 'right-4'}
                    `}>
                        {icon}
                    </span>
                )}
                <input
                    ref={ref}
                    className={`
                        w-full bg-white
                        border rounded-xl
                        text-slate-800 text-base
                        placeholder:text-slate-400
                        transition-all duration-200 ease-out
                        focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                        hover:border-primary-300
                        disabled:bg-surface-100 disabled:text-slate-400 disabled:cursor-not-allowed
                        ${error
                            ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                            : 'border-surface-200'
                        }
                        ${hasIcon && iconPosition === 'left' ? 'pl-12 pr-4 py-3.5' : ''}
                        ${hasIcon && iconPosition === 'right' ? 'pr-12 pl-4 py-3.5' : ''}
                        ${!hasIcon ? 'px-4 py-3.5' : ''}
                        ${className}
                    `.replace(/\s+/g, ' ').trim()}
                    required={required}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
            {hint && !error && (
                <p className="text-sm text-slate-500 mt-2">{hint}</p>
            )}
        </div>
    );
});

GACPInput.displayName = 'GACPInput';

export default GACPInput;
