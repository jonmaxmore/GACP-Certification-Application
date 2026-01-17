"use client";

import { useEffect, useState, ReactNode, useCallback } from "react";
import { apiClient as api } from "@/lib/api";
import { colors } from "@/lib/design-tokens";

interface SystemGuardProps {
    children: ReactNode;
}


/**
 * SystemGuard Component
 * Wraps the entire application and monitors backend connectivity
 * Shows a friendly "Server Down" screen when backend is unavailable
 */
export default function SystemGuard({ children }: SystemGuardProps) {
    // Start assuming online so pages load immediately (better UX)
    // Only block if confirmed offline after multiple failed checks
    const [isChecking, setIsChecking] = useState(false); // Don't show checking state initially
    const [isOnline, setIsOnline] = useState(true); // Assume online initially
    const [retryCount, setRetryCount] = useState(0);
    const [failedChecks, setFailedChecks] = useState(0); // Track consecutive failures

    const checkServer = useCallback(async () => {
        setIsChecking(true);
        const online = await api.health();
        setIsOnline(online);
        setIsChecking(false);

        if (online) {
            setRetryCount(0);
            setFailedChecks(0);
        } else {
            // Only mark as offline after 2+ consecutive failures
            setFailedChecks(prev => {
                const newCount = prev + 1;
                if (newCount >= 2) setIsOnline(false);
                return newCount;
            });
        }
    }, []);

    useEffect(() => {
        // Initial check
        // eslint-disable-next-line react-hooks/set-state-in-effect
        checkServer();

        // Periodic health check every 30 seconds
        const interval = setInterval(checkServer, 30000);

        return () => {
            clearInterval(interval);
        };
    }, [checkServer]);

    const handleRetry = async () => {
        setRetryCount(prev => prev + 1);
        await checkServer();
    };

    // CHANGED: Never block page rendering - always show content
    // Health check only for background monitoring, not blocking
    // This allows login/register pages to always be visible
    if (false && !isOnline && !isChecking) {  // Disabled blocking - always show children
        return (
            <div style={{
                minHeight: "100vh",
                backgroundColor: colors.background,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                fontFamily: "'Sarabun', sans-serif",
            }}>
                <div style={{
                    backgroundColor: colors.card,
                    borderRadius: "24px",
                    padding: "48px",
                    maxWidth: "480px",
                    width: "100%",
                    textAlign: "center",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}>
                    {/* Error Icon */}
                    <div style={{
                        width: "80px",
                        height: "80px",
                        margin: "0 auto 24px",
                        backgroundColor: "#FEE2E2",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8V12M12 16H12.01" strokeLinecap="round" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: colors.textDark,
                        marginBottom: "16px",
                    }}>
                        เซิร์ฟเวอร์ไม่พร้อมให้บริการ
                    </h1>

                    {/* Description */}
                    <p style={{
                        fontSize: "16px",
                        color: colors.textGray,
                        marginBottom: "32px",
                        lineHeight: 1.6,
                    }}>
                        ระบบกำลังปรับปรุงหรือเกิดปัญหาชั่วคราว
                        <br />
                        กรุณาลองใหม่อีกครั้งในอีกสักครู่
                    </p>

                    {/* Retry Button */}
                    <button
                        onClick={handleRetry}
                        disabled={isChecking}
                        style={{
                            width: "100%",
                            padding: "16px 24px",
                            backgroundColor: isChecking ? colors.textGray : colors.primary,
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "16px",
                            fontWeight: 600,
                            cursor: isChecking ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            transition: "all 0.2s",
                        }}
                    >
                        {isChecking ? (
                            <>
                                <span className="spinner" />
                                กำลังตรวจสอบ...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 4V10H7M23 20V14H17" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                ลองเชื่อมต่อใหม่
                            </>
                        )}
                    </button>

                    {/* Retry Count */}
                    {retryCount > 0 && (
                        <p style={{
                            marginTop: "16px",
                            fontSize: "14px",
                            color: colors.textGray,
                        }}>
                            พยายามเชื่อมต่อแล้ว {retryCount} ครั้ง
                        </p>
                    )}

                    {/* Support Info */}
                    <div style={{
                        marginTop: "32px",
                        paddingTop: "24px",
                        borderTop: `1px solid ${colors.textGray}33`,
                    }}>
                        <p style={{
                            fontSize: "14px",
                            color: colors.textGray,
                        }}>
                            หากปัญหายังไม่หาย กรุณาติดต่อ
                            <br />
                            <strong>02-123-4567</strong> หรือ <strong>support@gacp.go.th</strong>
                        </p>
                    </div>
                </div>

                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');
                    .spinner {
                        width: 20px;
                        height: 20px;
                        border: 2px solid rgba(255,255,255,0.3);
                        border-top-color: #fff;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Server is online - render children
    return <>{children}</>;
}

