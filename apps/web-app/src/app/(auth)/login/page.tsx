"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api-client";
import { PersonIcon, BuildingIcon, GroupIcon, LockIcon, EyeIcon } from "@/components/ui/icons";

// Design tokens - exact match to Mobile App
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
};

const ACCOUNT_TYPES = [
    { type: "INDIVIDUAL", label: "บุคคลธรรมดา", subtitle: "เกษตรกรรายย่อย", idLabel: "เลขบัตรประชาชน 13 หลัก", idHint: "1-2345-67890-12-3" },
    { type: "JURISTIC", label: "นิติบุคคล", subtitle: "บริษัท / ห้างหุ้นส่วน", idLabel: "เลขทะเบียนนิติบุคคล 13 หลัก", idHint: "0-1055-12345-67-8" },
    { type: "COMMUNITY_ENTERPRISE", label: "วิสาหกิจชุมชน", subtitle: "กลุ่มเกษตรกร", idLabel: "เลขทะเบียนวิสาหกิจชุมชน", idHint: "XXXX-XXXX-XXX" },
];

export default function LoginPage() {
    const router = useRouter();
    const [accountType, setAccountType] = useState("INDIVIDUAL");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginState, setLoginState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);

    // Load remembered credentials on mount
    useEffect(() => {
        const remembered = localStorage.getItem("remember_login");
        if (remembered) {
            try {
                const data = JSON.parse(remembered);
                setAccountType(data.accountType || "INDIVIDUAL");
                setIdentifier(data.identifier || "");
                setRememberMe(true);
            } catch { }
        }
    }, []);

    const currentConfig = ACCOUNT_TYPES.find((t) => t.type === accountType)!;

    // Thai error message mapping
    const translateError = (englishError: string): string => {
        const errorMap: Record<string, string> = {
            // Login errors
            "Invalid credentials": "เลขประจำตัวหรือรหัสผ่านไม่ถูกต้อง",
            "Invalid email or password": "เลขประจำตัวหรือรหัสผ่านไม่ถูกต้อง",
            "User not found": "ไม่พบบัญชีผู้ใช้นี้ กรุณาลงทะเบียนก่อน",
            "Account is locked": "บัญชีถูกล็อค กรุณารอ 30 นาทีแล้วลองใหม่",
            "Account locked. Try again in": "บัญชีถูกล็อคชั่วคราว กรุณารอสักครู่แล้วลองใหม่",
            "Account is disabled": "บัญชีนี้ถูกระงับการใช้งาน",
            "Account not verified": "บัญชียังไม่ได้ยืนยันตัวตน",
            "Password incorrect": "รหัสผ่านไม่ถูกต้อง",
            // Network errors
            "Failed to fetch": "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต",
            "Network Error": "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
            "Internal Server Error": "เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง",
        };

        // Check exact match first
        if (errorMap[englishError]) return errorMap[englishError];

        // Check partial matches
        for (const [key, value] of Object.entries(errorMap)) {
            if (englishError.toLowerCase().includes(key.toLowerCase())) return value;
        }

        // Return original if no translation found, or generic Thai error
        if (/[a-z]/i.test(englishError)) {
            return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
        }
        return englishError;
    };

    const formatThaiId = (value: string) => {
        const digits = value.replace(/\D/g, "");
        let formatted = "";
        for (let i = 0; i < digits.length && i < 13; i++) {
            if (i === 1 || i === 5 || i === 10 || i === 12) formatted += "-";
            formatted += digits[i];
        }
        return formatted;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        setLoginState('loading');

        // Input sanitization - prevent XSS
        const cleanIdentifier = identifier.replace(/-/g, "").replace(/[<>'"&]/g, "");
        const cleanPassword = password.trim();

        // Validate before sending
        if (!cleanIdentifier || cleanIdentifier.length < 10) {
            setError("กรุณากรอกเลขประจำตัวให้ครบถ้วน (อย่างน้อย 10 หลัก)");
            setIsLoading(false);
            setLoginState('error');
            return;
        }
        if (!cleanPassword || cleanPassword.length < 8) {
            setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
            setIsLoading(false);
            setLoginState('error');
            return;
        }

        try {
            // Timeout after 10 seconds
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            // Use local proxy API which sets cookie from same origin
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountType,
                    identifier: cleanIdentifier,
                    password: cleanPassword,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const result = await response.json();
            console.log('[Login] Response:', result);

            if (!result.success) {
                console.error('[Login] API call failed:', result);
                // Provide more specific error messages
                let errorMsg = result.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
                if (response.status === 401) {
                    errorMsg = "เลขประจำตัวหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
                } else if (response.status === 429) {
                    errorMsg = "มีการเข้าสู่ระบบผิดพลาดหลายครั้ง กรุณารอ 5 นาทีแล้วลองใหม่";
                } else if (response.status >= 500) {
                    errorMsg = "เซิร์ฟเวอร์มีปัญหาชั่วคราว กรุณาลองใหม่ในอีกสักครู่";
                }
                setError(errorMsg);
                setIsLoading(false);
                setLoginState('error');
                return;
            }

            // Handle nested response structure from apiClient
            const responseData = result.data?.data || result.data;
            const token = responseData?.tokens?.accessToken || responseData?.token;

            if (!token) {
                console.error('[Login] Token not found in response:', result.data);
                setError("ไม่พบข้อมูล Token จากเซิร์ฟเวอร์ กรุณาติดต่อผู้ดูแลระบบ");
                setIsLoading(false);
                setLoginState('error');
                return;
            }

            // Note: auth_token is now set as httpOnly cookie by backend
            // We only store non-sensitive user data for display purposes
            localStorage.setItem("user", JSON.stringify(responseData?.user || {}));

            // Handle Remember Me (only stores account type and identifier for convenience)
            if (rememberMe) {
                localStorage.setItem("remember_login", JSON.stringify({ accountType, identifier: cleanIdentifier }));
            } else {
                localStorage.removeItem("remember_login");
            }

            // Show success state before redirecting
            setIsLoading(false);
            setLoginState('success');

            // Wait 1.5 seconds to show success animation, then redirect
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1500);

        } catch (err) {
            console.error('[Login] Network error:', err);
            // Check if timeout
            if (err instanceof Error && err.name === 'AbortError') {
                setError("การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง");
            } else {
                setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง");
            }
            setIsLoading(false);
            setLoginState('error');
        }
    };

    const getIcon = (type: string, isSelected: boolean) => {
        const color = isSelected ? "#FFFFFF" : "#6B7280";
        switch (type) {
            case "INDIVIDUAL": return <PersonIcon color={color} />;
            case "JURISTIC": return <BuildingIcon color={color} />;
            case "COMMUNITY_ENTERPRISE": return <GroupIcon color={color} />;
            default: return null;
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
            fontFamily: "'Sarabun', sans-serif",
            position: "relative"
        }}>
            {/* Loading Overlay */}
            {loginState === 'loading' && (
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
            )}

            {/* Success Overlay */}
            {loginState === 'success' && (
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
            )}

            <div style={{ width: "100%", maxWidth: "420px", opacity: loginState === 'idle' || loginState === 'error' ? 1 : 0.3, transition: "opacity 0.3s" }}>
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
                        <svg width="40" height="40" viewBox="0 0 48 48" fill={colors.primary}>
                            <path d="M24 4C24 4 12 14 12 28C12 36 17 44 24 44C31 44 36 36 36 28C36 14 24 4 24 4Z" />
                            <path d="M24 8C24 8 16 16 16 27C16 33 19 38 24 38C29 38 32 33 32 27C32 16 24 8 24 8Z" fill="white" fillOpacity="0.3" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: "26px", fontWeight: 900, color: colors.primary, marginBottom: "12px" }}>
                        ระบบรับรองมาตรฐาน GACP
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
                    {/* Account Type Selector */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ fontSize: "14px", color: colors.textGray, display: "block", marginBottom: "12px" }}>
                            ประเภทผู้ใช้งาน
                        </label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {ACCOUNT_TYPES.map((type) => {
                                const isSelected = accountType === type.type;
                                return (
                                    <button
                                        key={type.type}
                                        type="button"
                                        onClick={() => { setAccountType(type.type); setIdentifier(""); }}
                                        style={{
                                            flex: 1,
                                            padding: "12px 8px",
                                            borderRadius: "12px",
                                            border: isSelected ? "none" : `1px solid ${colors.border}`,
                                            backgroundColor: isSelected ? colors.primary : colors.card,
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        <div style={{ marginBottom: "6px", display: "flex", justifyContent: "center" }}>
                                            {getIcon(type.type, isSelected)}
                                        </div>
                                        <div style={{ fontSize: "12px", fontWeight: 700, color: isSelected ? "#FFFFFF" : colors.textDark }}>
                                            {type.label}
                                        </div>
                                        <div style={{ fontSize: "10px", color: isSelected ? "rgba(255,255,255,0.8)" : colors.textGray }}>
                                            {type.subtitle}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            style={{ padding: "12px 16px", backgroundColor: "#FEF2F2", borderRadius: "12px", color: "#DC2626", fontSize: "14px", marginBottom: "16px" }}
                        >
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Identifier */}
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: colors.primary, display: "block", marginBottom: "8px" }}>
                                {currentConfig.idLabel}
                            </label>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}>
                                    <PersonIcon color={colors.primary} />
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(formatThaiId(e.target.value))}
                                    placeholder={currentConfig.idHint}
                                    maxLength={17}
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px 14px 48px",
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: "12px",
                                        fontSize: "16px",
                                        fontFamily: "monospace",
                                        letterSpacing: "1px",
                                        outline: "none"
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: "12px" }}>
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
                                    onKeyUp={(e) => setCapsLockOn(e.getModifierState("CapsLock"))}
                                    onKeyDown={(e) => setCapsLockOn(e.getModifierState("CapsLock"))}
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
                            {/* Caps Lock Warning */}
                            {capsLockOn && (
                                <p style={{ fontSize: "12px", color: "#F59E0B", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                                    ⚠️ Caps Lock เปิดอยู่
                                </p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{ width: "18px", height: "18px", accentColor: colors.primary }}
                                />
                                <span style={{ fontSize: "14px", color: colors.textGray }}>จดจำการเข้าสู่ระบบ</span>
                            </label>
                            <Link href="/forgot-password" style={{ fontSize: "14px", color: colors.primary, textDecoration: "none", fontWeight: 500 }}>
                                ลืมรหัสผ่าน?
                            </Link>
                        </div>

                        {/* Submit - 🍎 Liquid Glass Design */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="liquid-glass-btn"
                            style={{
                                width: "100%",
                                padding: "18px",
                                backgroundColor: isLoading ? "#94A3B8" : colors.primary,
                                color: "#FFFFFF",
                                fontSize: "17px",
                                fontWeight: 700,
                                border: "none",
                                borderRadius: "16px",
                                cursor: isLoading ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                boxShadow: isLoading
                                    ? "none"
                                    : "0 4px 14px rgba(27, 94, 32, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                                transform: "scale(1)",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                minHeight: "54px",
                                letterSpacing: "0.5px"
                            }}
                        >
                            {isLoading ? (
                                <span className="spinner"></span>
                            ) : (
                                <>เข้าสู่ระบบ <span style={{ fontSize: "22px", fontWeight: 400 }}>→</span></>
                            )}
                        </button>
                    </form>
                </div>

                {/* Register Link */}
                <div style={{ textAlign: "center", marginTop: "28px" }}>
                    <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "12px" }}>
                        ยังไม่มีบัญชีใช้งาน?
                    </p>
                    <Link
                        href="/register"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 28px",
                            border: `1px solid ${colors.border}`,
                            borderRadius: "12px",
                            color: colors.textDark,
                            fontSize: "14px",
                            fontWeight: 600,
                            textDecoration: "none",
                            backgroundColor: colors.card
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20C4 16.6863 7.58172 14 12 14" />
                            <path d="M16 19L19 19M19 19L19 16M19 19L16 16" />
                        </svg>
                        ลงทะเบียนผู้ใช้ใหม่
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                input:focus { border-color: ${colors.primary} !important; box-shadow: 0 0 0 3px rgba(27, 94, 32, 0.15); }
                
                /* 🍎 Liquid Glass Button Effects */
                .liquid-glass-btn:hover:not(:disabled) {
                    transform: scale(1.02) translateY(-1px);
                    box-shadow: 0 8px 20px rgba(27, 94, 32, 0.5), 0 4px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25);
                    background-color: #166534 !important;
                }
                .liquid-glass-btn:active:not(:disabled) {
                    transform: scale(0.98);
                    box-shadow: 0 2px 8px rgba(27, 94, 32, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .liquid-glass-btn:focus {
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(27, 94, 32, 0.3), 0 4px 14px rgba(27, 94, 32, 0.4);
                }
                
                /* Card hover effect */
                .glass-card:hover {
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                }
                
                .spinner {
                    width: 20px; height: 20px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                .loading-spinner {
                    animation: spin 1s linear infinite;
                }
                .success-check {
                    animation: scaleIn 0.4s ease;
                }
                .check-path {
                    stroke-dasharray: 30;
                    stroke-dashoffset: 30;
                    animation: drawCheck 0.5s ease 0.3s forwards;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { 
                    from { transform: scale(0.5); opacity: 0; } 
                    to { transform: scale(1); opacity: 1; } 
                }
                @keyframes drawCheck {
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </div>
    );
}

