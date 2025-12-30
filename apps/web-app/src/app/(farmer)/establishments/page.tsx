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
    home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    fileText: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    creditCard: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    user: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>,
    logout: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    compass: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
    plus: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    mapPin: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
};

export default function EstablishmentsPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ firstName?: string } | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        // Note: auth_token is now httpOnly cookie (not accessible via JS)
        const userData = localStorage.getItem("user");
        if (!userData) { window.location.href = "/login"; return; }
        try { setUser(JSON.parse(userData)); } catch { window.location.href = "/login"; }
    }, []);

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };

    if (!user || !mounted) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.bg }}><div className="spinner" style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%" }} /><style jsx>{`@keyframes spin { to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }`}</style></div>;

    const navItems = [
        { href: "/dashboard", icon: Icons.home, label: "หน้าหลัก" },
        { href: "/applications", icon: Icons.fileText, label: "คำขอ" },
        { href: "/tracking", icon: Icons.compass, label: "ติดตาม" },
        { href: "/payments", icon: Icons.creditCard, label: "การเงิน" },
        { href: "/profile", icon: Icons.user, label: "โปรไฟล์" },
    ];

    return (
        <div style={{ minHeight: "100vh", backgroundColor: t.bg, color: t.text, fontFamily: "'Kanit', sans-serif", transition: "all 0.3s" }}>
            <aside className="sidebar" style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: "72px", backgroundColor: t.surface, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 600, color: "#FFF", marginBottom: "32px" }}>G</div>
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                    {navItems.map((item) => <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "12px 0", textDecoration: "none" }}>{item.icon(t.textMuted)}<span style={{ fontSize: "10px", fontWeight: 500, color: t.textMuted }}>{item.label}</span></Link>)}
                </nav>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <button onClick={toggleTheme} style={{ width: "40px", height: "40px", borderRadius: "12px", background: t.accentBg, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{isDark ? Icons.sun(t.accent) : Icons.moon(t.accent)}</button>
                    <button onClick={handleLogout} style={{ width: "40px", height: "40px", borderRadius: "12px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Icons.logout(t.textMuted)}</button>
                </div>
            </aside>

            <nav className="mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "72px", backgroundColor: t.surface, borderTop: `1px solid ${t.border}`, display: "none", justifyContent: "space-around", alignItems: "center", zIndex: 100 }}>
                {navItems.map((item) => <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 12px", textDecoration: "none" }}>{item.icon(t.textMuted)}<span style={{ fontSize: "10px", fontWeight: 500, color: t.textMuted }}>{item.label}</span></Link>)}
            </nav>

            <main className="main-content" style={{ marginLeft: "72px", padding: "32px 40px", maxWidth: "1000px" }}>
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 500, margin: 0 }}>แปลงปลูกของฉัน</h1>
                        <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "4px" }}>จัดการข้อมูลแปลงเพาะปลูก</p>
                    </div>
                    <Link href="/establishments/new" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "12px", background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, color: "#FFF", fontWeight: 500, fontSize: "14px", textDecoration: "none", boxShadow: `0 4px 16px ${isDark ? "rgba(16, 185, 129, 0.25)" : "rgba(22, 163, 74, 0.25)"}` }}>
                        {Icons.plus("#FFF")}
                        เพิ่มแปลงปลูก
                    </Link>
                </header>

                <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "48px", textAlign: "center" }}>
                    {Icons.mapPin(t.border)}
                    <h3 style={{ fontSize: "18px", marginTop: "16px", color: t.text }}>ยังไม่มีแปลงปลูก</h3>
                    <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "8px" }}>เพิ่มข้อมูลแปลงเพาะปลูกของคุณ</p>
                    <Link href="/establishments/new" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "20px", padding: "12px 24px", borderRadius: "12px", background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, color: "#FFF", fontWeight: 500, textDecoration: "none" }}>
                        {Icons.plus("#FFF")}
                        เพิ่มแปลงปลูกใหม่
                    </Link>
                </div>
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes spin { to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }
                @media (max-width: 1024px) { .sidebar { display: none !important; } .mobile-nav { display: flex !important; } .main-content { margin-left: 0 !important; padding: 24px 20px 100px !important; } }
            `}</style>
        </div>
    );
}

