"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/services/api-client";
import { colors } from "@/lib/design-tokens";


export default function ForgotPasswordPage() {
    const [input, setInput] = useState("");
    const [inputType, setInputType] = useState<"phone" | "email">("phone");
    const [sent, setSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Validation  
    const validatePhone = (value: string) => /^0[689]\d{8}$/.test(value);
    const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const isValid = inputType === "phone"
        ? validatePhone(input)
        : validateEmail(input);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) {
            setError(inputType === "phone"
                ? "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0812345678)"
                : "กรุณากรอกอีเมลให้ถูกต้อง");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const result = await api.post("/auth-farmer/reset-password", {
                [inputType]: input
            });

            if (result.success) {
                setSent(true);
            } else {
                setError(result.error || "ไม่สามารถส่งลิงก์รีเซ็ตได้ กรุณาลองใหม่");
            }
        } catch {
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.background, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Kanit', sans-serif" }}>
            <div style={{ maxWidth: "400px", width: "100%" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
                    <h1 style={{ fontSize: "26px", fontWeight: 700, color: colors.primary }}>ลืมรหัสผ่าน</h1>
                    <p style={{ color: colors.textGray, marginTop: "8px" }}>กรอกข้อมูลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
                </div>

                <div style={{ backgroundColor: colors.card, borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                    {sent ? (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div style={{
                                width: "64px", height: "64px",
                                background: colors.successBg,
                                borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 16px",
                            }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 style={{ color: colors.success, marginBottom: "8px", fontWeight: 600 }}>ส่งลิงก์เรียบร้อยแล้ว!</h2>
                            <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "16px" }}>
                                {inputType === "phone" ? "กรุณาตรวจสอบ SMS ของคุณ" : "กรุณาตรวจสอบอีเมลของคุณ"}
                            </p>
                            <button onClick={() => { setSent(false); setInput(""); }} style={{
                                padding: "10px 20px",
                                background: "transparent",
                                border: `1px solid ${colors.primary}`,
                                borderRadius: "8px",
                                color: colors.primary,
                                fontSize: "14px",
                                cursor: "pointer",
                                fontFamily: "'Kanit', sans-serif",
                            }}>
                                ส่งอีกครั้ง
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Input Type Selector */}
                            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                                <button type="button" onClick={() => { setInputType("phone"); setInput(""); setError(""); }} style={{
                                    flex: 1, padding: "10px", borderRadius: "8px",
                                    border: inputType === "phone" ? `2px solid ${colors.primary}` : "1px solid #E0E0E0",
                                    background: inputType === "phone" ? "#E8F5E9" : "white",
                                    color: inputType === "phone" ? colors.primary : colors.textGray,
                                    fontSize: "13px", fontWeight: 500, cursor: "pointer",
                                    fontFamily: "'Kanit', sans-serif",
                                }}>
                                    📱 เบอร์โทรศัพท์
                                </button>
                                <button type="button" onClick={() => { setInputType("email"); setInput(""); setError(""); }} style={{
                                    flex: 1, padding: "10px", borderRadius: "8px",
                                    border: inputType === "email" ? `2px solid ${colors.primary}` : "1px solid #E0E0E0",
                                    background: inputType === "email" ? "#E8F5E9" : "white",
                                    color: inputType === "email" ? colors.primary : colors.textGray,
                                    fontSize: "13px", fontWeight: 500, cursor: "pointer",
                                    fontFamily: "'Kanit', sans-serif",
                                }}>
                                    ✉️ อีเมล
                                </button>
                            </div>

                            <label style={{ fontSize: "13px", fontWeight: 600, color: colors.primary, display: "block", marginBottom: "8px" }}>
                                {inputType === "phone" ? "เบอร์โทรศัพท์" : "อีเมล"}
                            </label>
                            <input
                                type={inputType === "email" ? "email" : "tel"}
                                value={input}
                                onChange={(e) => { setInput(e.target.value); setError(""); }}
                                placeholder={inputType === "phone" ? "0812345678" : "example@email.com"}
                                style={{
                                    width: "100%", padding: "14px 16px",
                                    border: `1px solid ${error ? colors.error : isValid && input ? colors.success : "#E0E0E0"}`,
                                    borderRadius: "12px", fontSize: "16px", marginBottom: "8px",
                                    outline: "none",
                                }}
                                required
                            />

                            {/* Validation Hint */}
                            {input && !isValid && (
                                <p style={{ fontSize: "12px", color: colors.textGray, marginBottom: "12px" }}>
                                    {inputType === "phone" ? `กรอกแล้ว ${input.length}/10 หลัก` : "รูปแบบอีเมลไม่ถูกต้อง"}
                                </p>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div style={{
                                    padding: "12px", backgroundColor: colors.errorBg,
                                    borderRadius: "8px", marginBottom: "16px",
                                    display: "flex", alignItems: "center", gap: "8px",
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.error} strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                                    </svg>
                                    <span style={{ color: colors.error, fontSize: "13px" }}>{error}</span>
                                </div>
                            )}

                            <button type="submit" disabled={isLoading || !isValid} style={{
                                width: "100%", padding: "16px",
                                backgroundColor: isLoading || !isValid ? "#9CA3AF" : colors.primary,
                                color: "#FFF", fontSize: "16px", fontWeight: 600,
                                border: "none", borderRadius: "12px",
                                cursor: isLoading || !isValid ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                fontFamily: "'Kanit', sans-serif",
                            }}>
                                {isLoading ? (
                                    <>
                                        <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                        กำลังส่ง...
                                    </>
                                ) : (
                                    "ส่งลิงก์รีเซ็ต"
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <Link href="/login" style={{ color: colors.primary, textDecoration: "none", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
                            <path d="M15 18L9 12L15 6" />
                        </svg>
                        กลับไปหน้าเข้าสู่ระบบ
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

