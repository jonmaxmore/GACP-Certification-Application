"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Theme System with proper icon background colors
const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
        accent: "#16A34A", accentLight: "#22C55E",
        iconBg: "#E5F9E7", // Light green background for icons
        iconColor: "#16A34A", // Dark green for icon stroke
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
        accent: "#10B981", accentLight: "#34D399",
        iconBg: "rgba(16, 185, 129, 0.15)", // Semi-transparent green for dark mode
        iconColor: "#34D399", // Bright green visible in dark mode
    }
};

// Larger icons for empty states (48px)
const LargeIcons = {
    bell: (c: string) => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
};

// Regular icons for menu (22px)
const Icons = {
    home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    fileText: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    creditCard: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    user: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>,
    logout: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    compass: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
    bell: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
};

interface Notification { id: string; title: string; message: string; type: 'INFO' | 'SUCCESS' | 'WARNING'; read: boolean; createdAt: string; }

const MOCK_NOTIFICATIONS: Notification[] = [];

export default function NotificationsPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ firstName?: string; lastName?: string } | null>(null);
    const [notifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [hoveredNav, setHoveredNav] = useState<string | null>(null);

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
    const handleLogout = () => { localStorage.removeItem("auth_token"); localStorage.removeItem("user"); document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; router.push("/login"); };

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
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", width: "100%", padding: "0 8px" }}>
                    {navItems.map((item) => {
                        const isHovered = hoveredNav === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onMouseEnter={() => setHoveredNav(item.href)}
                                onMouseLeave={() => setHoveredNav(null)}
                                style={{
                                    display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                                    padding: "10px 0", textDecoration: "none", borderRadius: "12px",
                                    backgroundColor: isHovered ? t.iconBg : "transparent",
                                    border: isHovered ? `1px solid ${t.accent}40` : "1px solid transparent",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {item.icon(isHovered ? t.iconColor : t.textMuted)}
                                <span style={{ fontSize: "10px", fontWeight: 500, color: isHovered ? t.iconColor : t.textMuted }}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <button onClick={toggleTheme} style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{isDark ? Icons.sun(t.iconColor) : Icons.moon(t.iconColor)}</button>
                    <button onClick={handleLogout} style={{ width: "40px", height: "40px", borderRadius: "12px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Icons.logout(t.textMuted)}</button>
                </div>
            </aside>

            <nav className="mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "72px", backgroundColor: t.surface, borderTop: `1px solid ${t.border}`, display: "none", justifyContent: "space-around", alignItems: "center", zIndex: 100 }}>
                {navItems.map((item) => <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 12px", textDecoration: "none" }}>{item.icon(t.textMuted)}<span style={{ fontSize: "10px", fontWeight: 500, color: t.textMuted }}>{item.label}</span></Link>)}
            </nav>

            <main className="main-content" style={{ marginLeft: "72px", padding: "32px 40px", maxWidth: "1000px" }}>
                <header style={{ marginBottom: "28px" }}>
                    <h1 style={{ fontSize: "28px", fontWeight: 500, margin: 0 }}>การแจ้งเตือน</h1>
                    <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "4px" }}>ข้อความและการอัปเดตจากระบบ</p>
                </header>

                {notifications.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {notifications.map((n) => (
                            <div key={n.id} style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "20px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {Icons.bell(t.iconColor)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>{n.title}</p>
                                    <p style={{ fontSize: "13px", color: t.textSecondary, marginTop: "4px" }}>{n.message}</p>
                                    <p style={{ fontSize: "11px", color: t.textMuted, marginTop: "8px" }}>{new Date(n.createdAt).toLocaleDateString('th-TH')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "60px", textAlign: "center" }}>
                        {/* Large icon with light green background */}
                        <div style={{
                            width: "80px", height: "80px", borderRadius: "20px",
                            backgroundColor: t.iconBg,
                            border: `1px solid ${t.accent}30`,
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            marginBottom: "20px"
                        }}>
                            {LargeIcons.bell(t.iconColor)}
                        </div>
                        <h3 style={{ fontSize: "18px", fontWeight: 500, color: t.text, marginBottom: "8px" }}>ไม่มีการแจ้งเตือน</h3>
                        <p style={{ fontSize: "14px", color: t.textMuted }}>เมื่อมีการแจ้งเตือนใหม่ จะแสดงที่นี่</p>
                    </div>
                )}
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
