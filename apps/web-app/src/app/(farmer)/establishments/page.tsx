"use client";

import Link from "next/link";

const colors = { primary: "#1B5E20", background: "#F5F7FA", card: "#FFFFFF", textDark: "#1E293B", textGray: "#64748B", heroStart: "#1E293B", heroEnd: "#0F172A" };

export default function EstablishmentsPage() {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.background, fontFamily: "'Sarabun', sans-serif" }}>
            <div style={{ background: `linear-gradient(135deg, ${colors.heroStart}, ${colors.heroEnd})`, padding: "24px", color: "#FFF" }}>
                <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <Link href="/dashboard" style={{ color: "#FFF", textDecoration: "none" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                        </Link>
                        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>แปลงปลูกของฉัน</h1>
                    </div>
                    <Link href="/establishments/new" style={{ padding: "10px 16px", backgroundColor: colors.primary, color: "#FFF", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>+ เพิ่มแปลง</Link>
                </div>
            </div>

            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
                <div style={{ backgroundColor: colors.card, borderRadius: "16px", padding: "48px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏡</div>
                    <h2 style={{ color: colors.textDark, marginBottom: "8px" }}>ยังไม่มีแปลงปลูก</h2>
                    <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "20px" }}>เพิ่มข้อมูลแปลงเพาะปลูกของคุณ</p>
                    <Link href="/establishments/new" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", backgroundColor: colors.primary, color: "#FFF", borderRadius: "12px", textDecoration: "none", fontWeight: 600 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><path d="M12 5V19M5 12H19" /></svg>
                        เพิ่มแปลงปลูกใหม่
                    </Link>
                </div>
            </div>

            <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;900&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        </div>
    );
}
