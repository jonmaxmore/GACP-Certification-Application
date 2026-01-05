"use client";

import { ReactNode } from "react";

interface PageContainerProps {
    children: ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
    className?: string;
    centered?: boolean;
}

const maxWidthClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full",
};

/**
 * PageContainer - Consistent page wrapper matching login page style
 * Background: stone-50, Centered content, Mobile responsive
 */
export function PageContainer({
    children,
    maxWidth = "md",
    className = "",
    centered = true,
}: PageContainerProps) {
    return (
        <div className={`min-h-screen bg-stone-50 p-4 md:p-6 ${className}`}>
            <div
                className={`w-full ${maxWidthClasses[maxWidth]} ${centered ? "mx-auto" : ""
                    }`}
            >
                {children}
            </div>
        </div>
    );
}

/**
 * FormCard - White card with shadow matching login page
 */
export function FormCard({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
            {children}
        </div>
    );
}

/**
 * PageHeader - Logo and title section matching login page
 */
export function PageHeader({
    title,
    subtitle,
    showLogo = true,
}: {
    title: string;
    subtitle?: string;
    showLogo?: boolean;
}) {
    return (
        <div className="text-center mb-8">
            {showLogo && (
                <div className="w-20 h-20 mx-auto mb-5 bg-emerald-50 rounded-full flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 48 48" className="fill-emerald-700">
                        <path d="M24 4C24 4 12 14 12 28C12 36 17 44 24 44C31 44 36 36 36 28C36 14 24 4 24 4Z" />
                        <path d="M24 8C24 8 16 16 16 27C16 33 19 38 24 38C29 38 32 33 32 27C32 16 24 8 24 8Z" fill="white" fillOpacity="0.3" />
                    </svg>
                </div>
            )}
            <h1 className="text-2xl font-black text-emerald-700 mb-3">{title}</h1>
            {subtitle && (
                <div className="inline-block px-5 py-2 bg-emerald-50 rounded-full border border-emerald-200 text-sm font-semibold text-emerald-700">
                    {subtitle}
                </div>
            )}
        </div>
    );
}
