"use client";

import { colors } from "@/lib/design-tokens";

interface LoadingSpinnerProps {
    message?: string;
    size?: "sm" | "md" | "lg";
    fullScreen?: boolean;
}

/**
 * 🍎 Apple-standard Loading Spinner
 * Used as Suspense fallback and loading states
 */
export function LoadingSpinner({
    message = "กำลังโหลด...",
    size = "md",
    fullScreen = false
}: LoadingSpinnerProps) {
    const sizes = {
        sm: { spinner: 24, text: 12 },
        md: { spinner: 40, text: 14 },
        lg: { spinner: 60, text: 16 },
    };

    const { spinner, text } = sizes[size];

    const content = (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: 24,
        }}>
            <div
                className="loading-spinner"
                style={{
                    width: spinner,
                    height: spinner,
                    border: `3px solid ${colors.primaryLight}`,
                    borderTopColor: colors.primary,
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                }}
            />
            {message && (
                <p style={{
                    color: colors.textGray,
                    fontSize: text,
                    fontWeight: 500,
                }}>
                    {message}
                </p>
            )}
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );

    if (fullScreen) {
        return (
            <div style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.background,
                zIndex: 9999,
            }}>
                {content}
            </div>
        );
    }

    return content;
}

/**
 * Full page loading for route transitions
 */
export function PageLoading() {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background,
        }}>
            <LoadingSpinner size="lg" message="กำลังโหลดหน้า..." />
        </div>
    );
}

export default LoadingSpinner;
