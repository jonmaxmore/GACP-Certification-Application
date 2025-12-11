"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Theme System
const themes = {
    light: { bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF", border: "rgba(0, 0, 0, 0.08)", text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A", accent: "#16A34A", accentLight: "#22C55E", accentBg: "rgba(22, 163, 74, 0.08)" },
    dark: { bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A", border: "rgba(255, 255, 255, 0.08)", text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B", accent: "#10B981", accentLight: "#34D399", accentBg: "rgba(16, 185, 129, 0.15)" }
};

const Icons = {
    chevronLeft: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>,
};

export default function NewEstablishmentPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [area, setArea] = useState("");

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const token = localStorage.getItem("auth_token");
        if (!token) { window.location.href = "/login"; }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("ฟีเจอร์นี้จะเปิดให้บริการเร็วๆ นี้");
    };

    if (!mounted) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.bg }}><div className="spinner" style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%" }} /><style jsx>{`@keyframes spin { to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }`}</style></div>;

    const inputStyle = { width: "100%", padding: "14px 16px", border: `1px solid ${t.border}`, borderRadius: "12px", fontSize: "15px", fontFamily: "'Kanit', sans-serif", backgroundColor: t.bgCard, color: t.text, outline: "none" };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: t.bg, color: t.text, fontFamily: "'Kanit', sans-serif", transition: "all 0.3s" }}>
            {/* Header */}
            <header style={{ padding: "20px 24px", borderBottom: `1px solid ${t.border}`, backgroundColor: t.surface }}>
                <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
                    <Link href="/establishments" style={{ color: t.textMuted, textDecoration: "none", display: "flex", alignItems: "center" }}>{Icons.chevronLeft(t.textMuted)}</Link>
                    <h1 style={{ fontSize: "20px", fontWeight: 500, margin: 0 }}>เพิ่มแปลงปลูกใหม่</h1>
                </div>
            </header>

            {/* Form */}
            <main style={{ maxWidth: "700px", margin: "0 auto", padding: "24px" }}>
                <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "28px" }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 500, color: t.textMuted, display: "block", marginBottom: "8px" }}>ชื่อแปลงปลูก</label>
                            <input type="text" placeholder="แปลงสมุนไพรบ้านใหม่" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 500, color: t.textMuted, display: "block", marginBottom: "8px" }}>ที่อยู่</label>
                            <textarea placeholder="123 หมู่ 4 ต.บางนา อ.เมือง จ.สมุทรปราการ" value={address} onChange={(e) => setAddress(e.target.value)} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} required />
                        </div>
                        <div style={{ marginBottom: "28px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 500, color: t.textMuted, display: "block", marginBottom: "8px" }}>พื้นที่ (ไร่)</label>
                            <input type="number" placeholder="10" value={area} onChange={(e) => setArea(e.target.value)} style={inputStyle} required />
                        </div>
                        <button type="submit" style={{ width: "100%", padding: "16px", background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, color: "#FFF", fontSize: "16px", fontWeight: 600, border: "none", borderRadius: "14px", cursor: "pointer" }}>
                            บันทึกแปลงปลูก
                        </button>
                    </form>
                </div>
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes spin { to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }
                input:focus, textarea:focus { outline: none; border-color: ${t.accent} !important; }
            `}</style>
        </div>
    );
}
