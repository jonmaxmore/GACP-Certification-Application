"use client";

import Link from "next/link";

const colors = { primary: "#1B5E20", background: "#F5F7FA", card: "#FFFFFF", textDark: "#1E293B", textGray: "#64748B", heroStart: "#1E293B", heroEnd: "#0F172A" };

export default function NewApplicationPage() {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.background, fontFamily: "'Sarabun', sans-serif" }}>
            <div style={{ background: `linear-gradient(135deg, ${colors.heroStart}, ${colors.heroEnd})`, padding: "24px", color: "#FFF" }}>
                <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
                    <Link href="/applications" style={{ color: "#FFF", textDecoration: "none" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    </Link>
                    <h1 style={{ fontSize: "20px", fontWeight: 700 }}>ยื่นคำขอใหม่</h1>
                </div>
            </div>

            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
                <div style={{ backgroundColor: colors.card, borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: colors.textDark, marginBottom: "16px" }}>เลือกประเภทพืช</h2>
                    <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "24px" }}>เลือกพืชที่ต้องการยื่นขอรับรองมาตรฐาน GACP</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {["กัญชา", "กระท่อม", "ขมิ้นชัน", "ข่า", "กระชายดำ", "ไพล"].map((plant) => (
                            <button key={plant} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", borderRadius: "12px", border: "1px solid #E0E0E0", backgroundColor: "#FFF", cursor: "pointer", textAlign: "left" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🌿</div>
                                <span style={{ fontSize: "16px", fontWeight: 600, color: colors.textDark }}>{plant}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;900&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        </div>
    );
}
