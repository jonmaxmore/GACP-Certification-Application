"use client";

import { useState } from "react";
import Link from "next/link";

const colors = { primary: "#1B5E20", background: "#F5F7FA", card: "#FFFFFF", textDark: "#1E293B", textGray: "#64748B" };

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.background, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Sarabun', sans-serif" }}>
            <div style={{ maxWidth: "400px", width: "100%" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h1 style={{ fontSize: "26px", fontWeight: 900, color: colors.primary }}>ลืมรหัสผ่าน</h1>
                    <p style={{ color: colors.textGray, marginTop: "8px" }}>กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
                </div>

                <div style={{ backgroundColor: colors.card, borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                    {sent ? (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✉️</div>
                            <h2 style={{ color: colors.primary, marginBottom: "8px" }}>ส่งอีเมลแล้ว!</h2>
                            <p style={{ color: colors.textGray, fontSize: "14px" }}>กรุณาตรวจสอบอีเมลของคุณ</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: colors.primary, display: "block", marginBottom: "8px" }}>เบอร์โทรศัพท์หรืออีเมล</label>
                            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="0812345678" style={{ width: "100%", padding: "14px 16px", border: "1px solid #E0E0E0", borderRadius: "12px", fontSize: "16px", marginBottom: "20px" }} required />
                            <button type="submit" style={{ width: "100%", padding: "16px", backgroundColor: colors.primary, color: "#FFF", fontSize: "16px", fontWeight: 700, border: "none", borderRadius: "12px", cursor: "pointer" }}>ส่งลิงก์รีเซ็ต</button>
                        </form>
                    )}
                </div>

                <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <Link href="/login" style={{ color: colors.primary, textDecoration: "none", fontSize: "14px" }}>← กลับไปหน้าเข้าสู่ระบบ</Link>
                </div>
            </div>

            <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;900&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        </div>
    );
}
