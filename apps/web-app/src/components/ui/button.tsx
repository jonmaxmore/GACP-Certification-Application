"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    children: ReactNode;
}

/**
 * Button - Consistent button styling matching login page
 * Primary: Emerald gradient with shadow
 * Secondary: White with emerald hover
 */
export function Button({
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    children,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:cursor-not-allowed";

    const sizeStyles = {
        sm: "px-4 py-2 text-sm rounded-xl",
        md: "px-6 py-3 text-base rounded-xl",
        lg: "px-8 py-4 text-lg rounded-2xl",
    };

    const variantStyles = {
        primary: `
      bg-gradient-to-br from-emerald-600 to-emerald-500 
      text-white 
      shadow-lg shadow-emerald-600/25 
      hover:shadow-xl hover:-translate-y-0.5 
      active:scale-[0.98] 
      disabled:bg-slate-300 disabled:shadow-none disabled:transform-none
    `,
        secondary: `
      bg-white 
      text-slate-700 
      border border-slate-200 
      hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 
      active:scale-[0.98]
      disabled:bg-slate-100 disabled:text-slate-400
    `,
        outline: `
      bg-transparent 
      text-emerald-600 
      border-2 border-emerald-600 
      hover:bg-emerald-50 
      active:scale-[0.98]
      disabled:border-slate-200 disabled:text-slate-400
    `,
        danger: `
      bg-red-600 
      text-white 
      shadow-lg shadow-red-600/25 
      hover:bg-red-700 hover:shadow-xl 
      active:scale-[0.98]
      disabled:bg-slate-300 disabled:shadow-none
    `,
        ghost: `
      bg-transparent 
      text-slate-600 
      hover:bg-slate-100 hover:text-slate-800 
      active:scale-[0.98]
      disabled:text-slate-300
    `,
    };

    return (
        <button
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
                <>
                    {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
                </>
            )}
        </button>
    );
}

/**
 * LinkButton - Styled link matching secondary button
 */
export function LinkButton({
    href,
    children,
    className = "",
}: {
    href: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <a
            href={href}
            className={`
        inline-flex items-center gap-2 px-6 py-3 
        border border-slate-200 rounded-xl 
        text-slate-700 text-sm font-semibold 
        bg-white 
        hover:border-emerald-300 hover:text-emerald-700 
        transition-colors
        ${className}
      `}
        >
            {children}
        </a>
    );
}
