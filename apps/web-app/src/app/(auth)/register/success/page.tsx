"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { colors } from "@/lib/design-tokens";


function RegisterSuccessContent() {
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    // Get registered user info from query params or localStorage
    const identifier = searchParams.get("id") || "";
    const accountType = searchParams.get("type") || "";
    const name = searchParams.get("name") || "";

    useEffect(() => {
        setMounted(true);
    }, []);

    const getAccountTypeThai = () => {
        switch (accountType) {
            case "INDIVIDUAL": return "บุคคลธรรมดา";
            case "JURISTIC": return "นิติบุคคล";
            case "COMMUNITY_ENTERPRISE": return "วิสาหกิจชุมชน";
            default: return "ผู้สมัคร";
        }
    };

    if (!mounted) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
                <div style={{ width: 40, height: 40, border: "3px solid #E5E7EB", borderTopColor: colors.primary, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.background, padding: "24px", fontFamily: "'Kanit', sans-serif" }}>
            <div style={{ maxWidth: "420px", margin: "0 auto" }}>
                {/* Success Card */}
                <div style={{
                    backgroundColor: colors.card,
                    borderRadius: "20px",
                    padding: "32px 24px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                    textAlign: "center",
                    marginTop: "40px",
                }}>
                    {/* Success Animation */}
                    <div style={{
                        width: "100px",
                        height: "100px",
                        background: colors.successBg,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        animation: "scaleIn 0.5s ease-out",
                    }}>
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="3">
                            <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <h1 style={{ fontSize: "24px", fontWeight: 700, color: colors.success, marginBottom: "8px" }}>
                        ลงทะเบียนสำเร็จ!
                    </h1>
                    <p style={{ fontSize: "14px", color: colors.textGray, marginBottom: "24px" }}>
                        ยินดีต้อนรับเข้าสู่ระบบรับรอง GACP
                    </p>

                    {/* User Info Summary */}
                    {(identifier || name) && (
                        <div style={{
                            background: "#F9FAFB",
                            borderRadius: "12px",
                            padding: "16px",
                            marginBottom: "24px",
                            textAlign: "left",
                        }}>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: colors.textGray, marginBottom: "12px" }}>
                                📋 ข้อมูลบัญชีของคุณ
                            </p>
                            {accountType && (
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "13px", color: colors.textGray }}>ประเภทบัญชี:</span>
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: colors.textDark }}>{getAccountTypeThai()}</span>
                                </div>
                            )}
                            {identifier && (
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "13px", color: colors.textGray }}>เลขประจำตัว:</span>
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: colors.textDark, fontFamily: "monospace" }}>{identifier}</span>
                                </div>
                            )}
                            {name && (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "13px", color: colors.textGray }}>ชื่อ:</span>
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: colors.textDark }}>{name}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Next Steps */}
                    <div style={{
                        background: "#E8F5E9",
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "24px",
                        textAlign: "left",
                    }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: colors.primary, marginBottom: "12px" }}>
                            📝 ขั้นตอนถัดไป
                        </p>
                        <ol style={{ paddingLeft: "20px", margin: 0 }}>
                            <li style={{ fontSize: "13px", color: colors.textDark, marginBottom: "8px" }}>
                                เข้าสู่ระบบด้วยเลขประจำตัวและรหัสผ่าน
                            </li>
                            <li style={{ fontSize: "13px", color: colors.textDark, marginBottom: "8px" }}>
                                เพิ่มข้อมูลสถานประกอบการ
                            </li>
                            <li style={{ fontSize: "13px", color: colors.textDark }}>
                                ยื่นคำขอรับรองมาตรฐาน GACP
                            </li>
                        </ol>
                    </div>

                    {/* CTA Button */}
                    <Link href="/login" style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "16px",
                        background: `linear-gradient(135deg, ${colors.primary} 0%, #2E7D32 100%)`,
                        color: "white",
                        fontSize: "16px",
                        fontWeight: 600,
                        textDecoration: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 16px rgba(27, 94, 32, 0.3)",
                    }}>
                        เข้าสู่ระบบ
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18L15 12L9 6" />
                        </svg>
                    </Link>
                </div>

                {/* Footer */}
                <div style={{ marginTop: "24px", textAlign: "center" }}>
                    <p style={{ fontSize: "12px", color: colors.textGray }}>
                        🔒 ข้อมูลของคุณถูกเก็บรักษาอย่างปลอดภัย
                    </p>
                </div>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
            <div style={{ width: 40, height: 40, border: "3px solid #E5E7EB", borderTopColor: colors.primary, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
    );
}

export default function RegisterSuccessPage() {
    return (
        <>
            <Suspense fallback={<LoadingFallback />}>
                <RegisterSuccessContent />
            </Suspense>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes scaleIn {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
}

