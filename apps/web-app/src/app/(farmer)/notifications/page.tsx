"use client";

import Link from "next/link";

const colors = { primary: "#1B5E20", background: "#F5F7FA", card: "#FFFFFF", textDark: "#1E293B", textGray: "#64748B", heroStart: "#1E293B", heroEnd: "#0F172A" };

export default function NotificationsPage() {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.background, fontFamily: "'Sarabun', sans-serif" }}>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${colors.heroStart}, ${colors.heroEnd})`, padding: "24px", color: "#FFF" }}>
                <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
                    <Link href="/dashboard" style={{ color: "#FFF", textDecoration: "none" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    </Link>
                    <h1 style={{ fontSize: "20px", fontWeight: 700 }}>การแจ้งเตือน</h1>
                </div>
            </div>

            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
                <div style={{ backgroundColor: colors.card, borderRadius: "16px", padding: "48px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔔</div>
                    <h2 style={{ color: colors.textDark, marginBottom: "8px" }}>ไม่มีการแจ้งเตือน</h2>
                    <p style={{ color: colors.textGray, fontSize: "14px" }}>เมื่อมีการแจ้งเตือนใหม่ จะแสดงที่นี่</p>
                </div>
            </div>

            <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;900&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        </div>
    );
}
