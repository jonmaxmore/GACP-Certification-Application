'use client';

import React from 'react';

// Official Government Colors
export const OFFICIAL_COLORS = {
    primary: '#00695C',      // Deep Teal
    primaryLight: '#E0F2F1', // Light Teal
    primaryDark: '#004D40',  // Dark Teal
    text: '#263238',         // Charcoal
    textSecondary: '#546E7A', // Slate
    textMuted: '#90A4AE',    // Light Gray
    border: '#CFD8DC',       // Border Gray
    background: '#FAFAFA',   // Background
    white: '#FFFFFF',
    success: '#2E7D32',      // Green
    successLight: '#E8F5E9',
    warning: '#EF6C00',      // Orange
    warningLight: '#FFF8E1',
    error: '#C62828',        // Red
    errorLight: '#FFEBEE',
    info: '#1565C0',         // Blue
    infoLight: '#E3F2FD',
};

interface SectionHeaderProps {
    stepNumber?: number;
    title: string;
    subtitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ stepNumber, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-6 border-l-4 border-[#00695C] pl-4">
        {stepNumber && (
            <span className="px-2 py-0.5 bg-[#00695C] text-white text-xs font-medium rounded">
                ขั้นตอนที่ {stepNumber}
            </span>
        )}
        <div>
            <h2 className="text-lg font-semibold text-[#263238]">{title}</h2>
            {subtitle && <p className="text-xs text-[#90A4AE]">{subtitle}</p>}
        </div>
    </div>
);

interface FormFieldProps {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, required, hint, error, children }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-[#263238] mb-1.5">
            {label}
            {required && <span className="text-[#C62828] ml-0.5">*</span>}
        </label>
        {hint && <p className="text-xs text-[#90A4AE] mb-1.5">{hint}</p>}
        {children}
        {error && <p className="text-xs text-[#C62828] mt-1">{error}</p>}
    </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

export const Input: React.FC<InputProps> = ({ hasError, className = '', ...props }) => (
    <input
        className={`
            w-full px-3 py-2.5 rounded-lg border text-sm transition-all duration-150
            ${hasError
                ? 'border-[#C62828] focus:ring-2 focus:ring-[#FFCDD2]'
                : 'border-[#CFD8DC] focus:border-[#00695C] focus:ring-2 focus:ring-[#E0F2F1]'
            }
            focus:outline-none disabled:bg-[#ECEFF1] disabled:text-[#90A4AE]
            ${className}
        `}
        {...props}
    />
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    hasError?: boolean;
}

export const Select: React.FC<SelectProps> = ({ hasError, className = '', children, ...props }) => (
    <select
        className={`
            w-full px-3 py-2.5 rounded-lg border text-sm transition-all duration-150
            ${hasError
                ? 'border-[#C62828] focus:ring-2 focus:ring-[#FFCDD2]'
                : 'border-[#CFD8DC] focus:border-[#00695C] focus:ring-2 focus:ring-[#E0F2F1]'
            }
            focus:outline-none disabled:bg-[#ECEFF1] disabled:text-[#90A4AE]
            ${className}
        `}
        {...props}
    >
        {children}
    </select>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    hasError?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({ hasError, className = '', ...props }) => (
    <textarea
        className={`
            w-full px-3 py-2.5 rounded-lg border text-sm transition-all duration-150 resize-none
            ${hasError
                ? 'border-[#C62828] focus:ring-2 focus:ring-[#FFCDD2]'
                : 'border-[#CFD8DC] focus:border-[#00695C] focus:ring-2 focus:ring-[#E0F2F1]'
            }
            focus:outline-none disabled:bg-[#ECEFF1] disabled:text-[#90A4AE]
            ${className}
        `}
        {...props}
    />
);

interface CardButtonProps {
    selected?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

export const CardButton: React.FC<CardButtonProps> = ({ selected, disabled, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`
            relative p-4 rounded-lg border-2 text-left transition-all duration-150 w-full
            ${disabled
                ? 'border-[#CFD8DC] bg-[#FAFAFA] cursor-not-allowed opacity-60'
                : selected
                    ? 'border-[#00695C] bg-[#E0F2F1]'
                    : 'border-[#CFD8DC] bg-white hover:border-[#00695C]'
            }
        `}
    >
        {selected && (
            <span className="absolute top-2 right-2 w-5 h-5 bg-[#00695C] rounded-full flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </span>
        )}
        {children}
    </button>
);

interface InfoBoxProps {
    type?: 'info' | 'warning' | 'success' | 'error';
    title?: string;
    children: React.ReactNode;
}

export const InfoBox: React.FC<InfoBoxProps> = ({ type = 'info', title, children }) => {
    const styles = {
        info: { bg: '#E3F2FD', border: '#90CAF9', text: '#1565C0', icon: '#1976D2' },
        warning: { bg: '#FFF8E1', border: '#FFE082', text: '#EF6C00', icon: '#F57C00' },
        success: { bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32', icon: '#43A047' },
        error: { bg: '#FFEBEE', border: '#EF9A9A', text: '#C62828', icon: '#E53935' },
    };
    const s = styles[type];

    return (
        <div style={{ backgroundColor: s.bg, borderColor: s.border }} className="p-4 rounded-lg border">
            {title && (
                <p style={{ color: s.text }} className="font-medium text-sm mb-1">{title}</p>
            )}
            <div style={{ color: s.text }} className="text-xs">{children}</div>
        </div>
    );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className = '',
    disabled,
    children,
    ...props
}) => {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-2';
    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-2.5 text-sm',
        lg: 'px-8 py-3 text-base',
    };
    const variants = {
        primary: disabled
            ? 'bg-[#CFD8DC] text-[#90A4AE] cursor-not-allowed'
            : 'bg-[#00695C] text-white hover:bg-[#004D40] shadow-md hover:shadow-lg',
        secondary: disabled
            ? 'bg-[#ECEFF1] text-[#90A4AE] cursor-not-allowed'
            : 'bg-[#E0F2F1] text-[#00695C] hover:bg-[#B2DFDB]',
        outline: disabled
            ? 'border border-[#CFD8DC] text-[#90A4AE] cursor-not-allowed'
            : 'border-2 border-[#00695C] text-[#00695C] hover:bg-[#E0F2F1]',
    };

    return (
        <button
            className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

// Navigation buttons for wizard
interface WizardNavProps {
    onBack?: () => void;
    onNext?: () => void;
    nextDisabled?: boolean;
    nextLabel?: string;
    backLabel?: string;
    showBack?: boolean;
}

export const WizardNav: React.FC<WizardNavProps> = ({
    onBack,
    onNext,
    nextDisabled,
    nextLabel = 'ดำเนินการต่อ',
    backLabel = 'ย้อนกลับ',
    showBack = true,
}) => (
    <div className="pt-8 border-t border-[#CFD8DC] flex justify-between items-center mt-8">
        {showBack ? (
            <Button variant="outline" onClick={onBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
                {backLabel}
            </Button>
        ) : <div />}
        <Button variant="primary" onClick={onNext} disabled={nextDisabled}>
            {nextLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
            </svg>
        </Button>
    </div>
);
