"use client";

import { LoginState } from '@/hooks/useLogin';

interface LoginOverlaysProps {
    loginState: LoginState;
}

/**
 * Login Overlays - Loading and Success states
 * 🍎 Apple Single Responsibility: Only handles overlay UI
 */
export function LoginOverlays({ loginState }: LoginOverlaysProps) {
    if (loginState === 'loading') {
        return (
            <div style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(27, 94, 32, 0.95)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                animation: "fadeIn 0.3s ease"
            }}>
                <div className="loading-spinner" style={{
                    width: "60px",
                    height: "60px",
                    border: "4px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#FFFFFF",
                    borderRadius: "50%",
                    marginBottom: "24px"
                }} />
                <p style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 600 }}>กำลังเข้าสู่ระบบ...</p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginTop: "8px" }}>กรุณารอสักครู่</p>
            </div>
        );
    }

    if (loginState === 'success') {
        return (
            <div style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(22, 163, 74, 0.97)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                animation: "fadeIn 0.3s ease"
            }}>
                <div className="success-check" style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "24px"
                }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17L4 12" className="check-path" />
                    </svg>
                </div>
                <p style={{ color: "#FFFFFF", fontSize: "22px", fontWeight: 700 }}>เข้าสู่ระบบสำเร็จ!</p>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", marginTop: "8px" }}>กำลังพาคุณไปยังหน้าหลัก...</p>
            </div>
        );
    }

    return null;
}
