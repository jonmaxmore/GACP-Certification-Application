"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api-client";
import { verifyStaffRole } from "@/hooks/use-access";

// Design tokens - exact match to Farmer Login
const colors = {
    primary: "#1B5E20",
    primaryLight: "#1B5E2014",
    background: "#F5F7FA",
    card: "#FFFFFF",
    text: "#1B5E20",
    textDark: "#1E293B",
    textGray: "#64748B",
    border: "#E0E0E0",
    inputBg: "#FFFFFF",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
};

// Icons
const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke={colors.primary} strokeWidth="2" />
        <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke={colors.primary} strokeWidth="2" />
    </svg>
);

const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7L12 13L21 7" />
    </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
        {open ? (
            <>
                <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
            </>
        ) : (
            <>
                <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12" />
                <path d="M2 12C2 12 5 19 12 19C19 19 22 12 22 12" />
                <path d="M4 4L20 20" />
            </>
        )}
    </svg>
);

const ShieldIcon = () => (
    <svg width="40" height="40" viewBox="0 0 48 48" fill={colors.primary}>
        <path d="M24 4L8 10V22C8 32.5 14.5 42 24 46C33.5 42 40 32.5 40 22V10L24 4Z" />
        <path d="M24 8L12 13V22C12 30 17 38 24 41C31 38 36 30 36 22V13L24 8Z" fill="white" fillOpacity="0.3" />
        <path d="M20 24L23 27L28 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

export default function StaffLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Validate email format
        if (!email.includes("@")) {
            setError("กรุณากรอกอีเมลให้ถูกต้อง");
            setIsLoading(false);
            return;
        }

        try {
            // Use new staff auth endpoint
            const result = await api.post<{
                data: {
                    token?: string;
                    user: {
                        role: string;
                        roleDisplayName?: string;
                        permissions?: string[];
                        dashboardUrl?: string;
                        [key: string]: unknown
                    };
                };
            }>("/v2/auth-staff/login", {
                username: email, // API accepts username or email
                password,
                userType: "DTAM_STAFF",
            });

            if (!result.success) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            const { user, token } = result.data.data;

            // Validate staff role
            const staffRoles = ['REVIEWER_AUDITOR', 'SCHEDULER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN', 'admin', 'reviewer', 'manager', 'inspector'];
            if (!staffRoles.includes(user.role)) {
                setError("บัญชีนี้ไม่ใช่บัญชีเจ้าหน้าที่");
                setIsLoading(false);
                return;
            }

            // Save token and user
            localStorage.setItem("staff_token", token || "");
            localStorage.setItem("staff_user", JSON.stringify(user));

            setIsLoading(false);

            // Navigate to dashboard URL from backend (or default)
            const dashboardUrl = user.dashboardUrl || "/staff/dashboard";
            router.push(dashboardUrl);
        } catch (err) {
            console.error("Login error:", err);
            setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: colors.background,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "'Sarabun', sans-serif"
        }}>
            <div style={{ width: "100%", maxWidth: "420px" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        margin: "0 auto 20px",
                        backgroundColor: colors.primaryLight,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <ShieldIcon />
                    </div>
                    <h1 style={{ fontSize: "26px", fontWeight: 900, color: colors.primary, marginBottom: "12px" }}>
                        ระบบเจ้าหน้าที่ GACP
                    </h1>
                    <div style={{
                        display: "inline-block",
                        padding: "8px 20px",
                        backgroundColor: colors.primaryLight,
                        borderRadius: "24px",
                        border: `1px solid ${colors.primary}40`,
                        fontSize: "13px",
                        fontWeight: 600,
                        color: colors.primary
                    }}>
                        กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                    </div>
                </div>

                {/* Card */}
                <div style={{
                    backgroundColor: colors.card,
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                }}>
                    {/* Warning Badge */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 16px",
                        backgroundColor: colors.warningLight,
                        borderRadius: "12px",
                        marginBottom: "20px",
                        border: `1px solid ${colors.warning}40`
                    }}>
                        <span style={{ fontSize: "20px" }}>⚠️</span>
                        <span style={{ fontSize: "13px", color: "#92400E", fontWeight: 500 }}>
                            สำหรับเจ้าหน้าที่ที่ได้รับอนุญาตเท่านั้น
                        </span>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            padding: "12px 16px",
                            backgroundColor: "#FEF2F2",
                            borderRadius: "12px",
                            color: "#DC2626",
                            fontSize: "14px",
                            marginBottom: "16px"
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: colors.primary, display: "block", marginBottom: "8px" }}>
                                อีเมลเจ้าหน้าที่
                            </label>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}>
                                    <MailIcon />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="officer@dtam.go.th"
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px 14px 48px",
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: "12px",
                                        fontSize: "16px",
                                        outline: "none"
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: colors.primary, display: "block", marginBottom: "8px" }}>
                                รหัสผ่าน
                            </label>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}>
                                    <LockIcon />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="กรอกรหัสผ่าน"
                                    style={{
                                        width: "100%",
                                        padding: "14px 48px 14px 48px",
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: "12px",
                                        fontSize: "16px",
                                        outline: "none"
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "4px"
                                    }}
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                padding: "16px",
                                backgroundColor: isLoading ? "#94A3B8" : colors.primary,
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "16px",
                                fontWeight: 700,
                                cursor: isLoading ? "not-allowed" : "pointer",
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px"
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                                    กำลังตรวจสอบ...
                                </>
                            ) : (
                                <>
                                    🔐 เข้าสู่ระบบเจ้าหน้าที่
                                </>
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", fontSize: "13px", color: colors.textGray, marginTop: "20px" }}>
                        หากยังไม่มีบัญชี กรุณาติดต่อผู้ดูแลระบบ
                    </p>
                </div>

                {/* Back Link */}
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <Link href="/" style={{ color: colors.primary, textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
                        ← กลับหน้าหลัก
                    </Link>
                </div>

                {/* Footer */}
                <div style={{ textAlign: "center", marginTop: "32px" }}>
                    <p style={{ fontSize: "12px", color: colors.textGray }}>
                        🔒 ระบบรักษาความปลอดภัยระดับสูง
                    </p>
                    <p style={{ fontSize: "11px", color: colors.textGray, marginTop: "4px" }}>
                        Staff Portal v2.6.0
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

