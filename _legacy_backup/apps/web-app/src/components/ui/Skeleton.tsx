"use client";

import { CSSProperties } from "react";

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
    style?: CSSProperties;
    animated?: boolean;
}

/**
 * Skeleton Loading Component
 * Provides visual placeholder while content is loading
 * Improves perceived performance
 */
export function Skeleton({
    width = "100%",
    height = "20px",
    borderRadius = "8px",
    className = "",
    style = {},
    animated = true,
}: SkeletonProps) {
    return (
        <>
            <div
                className={`skeleton ${className}`}
                style={{
                    width,
                    height,
                    borderRadius,
                    backgroundColor: "rgba(0, 0, 0, 0.08)",
                    ...style,
                }}
                aria-hidden="true"
                role="presentation"
            />
            {animated && (
                <style jsx>{`
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                    .skeleton {
                        background: linear-gradient(
                            90deg,
                            rgba(0, 0, 0, 0.06) 25%,
                            rgba(0, 0, 0, 0.10) 50%,
                            rgba(0, 0, 0, 0.06) 75%
                        );
                        background-size: 200% 100%;
                        animation: shimmer 1.5s infinite;
                    }
                `}</style>
            )}
        </>
    );
}

/**
 * Dashboard Skeleton - Loading state for dashboard page
 */
export function DashboardSkeleton({ isDark = false }: { isDark?: boolean }) {
    const bgColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";
    const shimmerLight = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";

    return (
        <div style={{ padding: "32px 40px", maxWidth: "1400px", marginLeft: "72px" }}>
            {/* Header Skeleton */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <Skeleton width={100} height={16} style={{ marginBottom: "8px", backgroundColor: bgColor }} />
                    <Skeleton width={200} height={32} style={{ backgroundColor: bgColor }} />
                </div>
                <Skeleton width={140} height={44} borderRadius="12px" style={{ backgroundColor: bgColor }} />
            </div>

            {/* Stats Grid Skeleton */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{
                        backgroundColor: bgColor,
                        borderRadius: "16px",
                        padding: "20px",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                            <Skeleton width={80} height={14} style={{ backgroundColor: shimmerLight }} />
                            <Skeleton width={36} height={36} borderRadius="10px" style={{ backgroundColor: shimmerLight }} />
                        </div>
                        <Skeleton width={60} height={40} style={{ backgroundColor: shimmerLight }} />
                    </div>
                ))}
            </div>

            {/* Content Grid Skeleton */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
                {/* Left Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Hero Card */}
                    <div style={{ backgroundColor: bgColor, borderRadius: "20px", padding: "28px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <div>
                                <Skeleton width={100} height={14} style={{ marginBottom: "8px", backgroundColor: shimmerLight }} />
                                <Skeleton width={180} height={28} style={{ backgroundColor: shimmerLight }} />
                            </div>
                            <Skeleton width={100} height={28} borderRadius="100px" style={{ backgroundColor: shimmerLight }} />
                        </div>
                    </div>

                    {/* Stepper */}
                    <div style={{ backgroundColor: bgColor, borderRadius: "20px", padding: "24px" }}>
                        <Skeleton width={120} height={14} style={{ marginBottom: "20px", backgroundColor: shimmerLight }} />
                        <Skeleton width="100%" height={3} style={{ marginBottom: "20px", backgroundColor: shimmerLight }} />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} style={{ textAlign: "center" }}>
                                    <Skeleton width={36} height={36} borderRadius="12px" style={{ margin: "0 auto 6px", backgroundColor: shimmerLight }} />
                                    <Skeleton width={40} height={12} style={{ margin: "0 auto", backgroundColor: shimmerLight }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Activity */}
                    <div style={{ backgroundColor: bgColor, borderRadius: "20px", padding: "24px", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                            <Skeleton width={100} height={14} style={{ backgroundColor: shimmerLight }} />
                            <Skeleton width={60} height={14} style={{ backgroundColor: shimmerLight }} />
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: "12px",
                                padding: "12px", borderRadius: "12px", marginBottom: "12px",
                                backgroundColor: shimmerLight,
                            }}>
                                <Skeleton width={36} height={36} borderRadius="10px" />
                                <div style={{ flex: 1 }}>
                                    <Skeleton width={100} height={14} style={{ marginBottom: "4px" }} />
                                    <Skeleton width={60} height={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Animated shimmer styles */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}

/**
 * Card Skeleton - Generic card loading state
 */
export function CardSkeleton({ isDark = false }: { isDark?: boolean }) {
    const bgColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";

    return (
        <div style={{
            backgroundColor: bgColor,
            borderRadius: "16px",
            padding: "20px",
        }}>
            <Skeleton width={120} height={16} style={{ marginBottom: "12px" }} />
            <Skeleton width="100%" height={12} style={{ marginBottom: "8px" }} />
            <Skeleton width="80%" height={12} />
        </div>
    );
}

export default Skeleton;
