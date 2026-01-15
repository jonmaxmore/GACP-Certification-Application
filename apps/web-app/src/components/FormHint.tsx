'use client';

import React, { useState } from 'react';

interface FormHintProps {
    /** Main hint text displayed in tooltip/popover */
    hint: string;
    /** Optional example value to show */
    example?: string;
    /** Position of tooltip */
    position?: 'top' | 'bottom' | 'left' | 'right';
    /** Whether the field is required */
    required?: boolean;
    /** Icon type */
    icon?: 'info' | 'help' | 'warning';
}

const icons = {
    info: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    help: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    warning: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
};

const iconColors = {
    info: 'text-blue-500 hover:text-blue-600',
    help: 'text-content-tertiary hover:text-dtam',
    warning: 'text-amber-500 hover:text-amber-600',
};

export function FormHint({
    hint,
    example,
    position = 'top',
    required = false,
    icon = 'help',
}: FormHintProps) {
    const [isOpen, setIsOpen] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-dtam-dark',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-dtam-dark',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-dtam-dark',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-dtam-dark',
    };

    return (
        <div className="relative inline-flex">
            <button
                type="button"
                className={`${iconColors[icon]} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-dtam rounded-full`}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Show hint"
            >
                {icons[icon]}
            </button>

            {isOpen && (
                <div
                    className={`absolute z-50 ${positionClasses[position]} w-64 max-w-xs`}
                    role="tooltip"
                >
                    <div className="bg-dtam-dark text-white text-sm rounded-lg shadow-lg p-3">
                        <p className="leading-relaxed">{hint}</p>

                        {example && (
                            <div className="mt-2 pt-2 border-t border-dtam-800">
                                <span className="text-dtam-300 text-xs">ตัวอย่าง:</span>
                                <p className="text-white font-mono text-xs mt-1">{example}</p>
                            </div>
                        )}

                        {required && (
                            <div className="mt-2 flex items-center gap-1 text-amber-400 text-xs">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>ช่องนี้จำเป็นต้องกรอก</span>
                            </div>
                        )}
                    </div>

                    {/* Arrow */}
                    <div
                        className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
                    />
                </div>
            )}
        </div>
    );
}

// Wrapper for form labels with hints
interface FormLabelWithHintProps {
    label: string;
    htmlFor?: string;
    hint?: string;
    hintExample?: string;
    required?: boolean;
    className?: string;
}

export function FormLabelWithHint({
    label,
    htmlFor,
    hint,
    hintExample,
    required = false,
    className = '',
}: FormLabelWithHintProps) {
    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <label
                htmlFor={htmlFor}
                className="text-sm font-bold text-dtam-dark"
            >
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {hint && (
                <FormHint
                    hint={hint}
                    example={hintExample}
                    required={required}
                />
            )}
        </div>
    );
}

export default FormHint;
