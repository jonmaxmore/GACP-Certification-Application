"use client";

import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    required?: boolean;
}

/**
 * Input - Consistent input styling matching login page
 * rounded-xl, border-slate-200, focus:emerald-500
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, leftIcon, rightIcon, required, className = "", ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold text-emerald-700 mb-2">
                        {label}
                        {required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full py-3.5 px-4 
              ${leftIcon ? "pl-12" : ""} 
              ${rightIcon ? "pr-12" : ""} 
              border border-slate-200 rounded-xl 
              text-base text-slate-900
              placeholder:text-slate-400
              outline-none 
              focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100
              disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
              ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}
              ${className}
            `}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {hint && !error && (
                    <p className="text-xs text-slate-500 mt-1.5">{hint}</p>
                )}
                {error && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        ⚠️ {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

/**
 * Select - Consistent select styling matching login page
 */
export const Select = forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement> & {
        label?: string;
        error?: string;
        required?: boolean;
    }
>(({ label, error, required, className = "", children, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-emerald-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            <select
                ref={ref}
                className={`
          w-full py-3.5 px-4 
          border border-slate-200 rounded-xl 
          text-base text-slate-900
          outline-none 
          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100
          disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
          ${error ? "border-red-400" : ""}
          ${className}
        `}
                {...props}
            >
                {children}
            </select>
            {error && (
                <p className="text-xs text-red-500 mt-1.5">⚠️ {error}</p>
            )}
        </div>
    );
});

Select.displayName = "Select";
