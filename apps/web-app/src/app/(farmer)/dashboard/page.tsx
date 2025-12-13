"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/apiClient";

// Theme System - Light & Dark
const themes = {
    light: {
        bg: "#F8FAF9",
        bgCard: "#FFFFFF",
        bgCardHover: "#F1F5F3",
        surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)",
        borderHover: "rgba(0, 0, 0, 0.15)",
        text: "#1A1A1A",
        textSecondary: "#5A5A5A",
        textMuted: "#8A8A8A",
        accent: "#16A34A",
        accentLight: "#22C55E",
        accentBg: "rgba(22, 163, 74, 0.08)",
        iconBg: "#E5F9E7",
        iconColor: "#16A34A",
        shadow: "0 1px 3px rgba(0,0,0,0.08)",
        shadowHover: "0 8px 24px rgba(0,0,0,0.12)",
    },
    dark: {
        bg: "#0A0F1C",
        bgCard: "rgba(15, 23, 42, 0.6)",
        bgCardHover: "rgba(15, 23, 42, 0.8)",
        surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)",
        borderHover: "rgba(255, 255, 255, 0.15)",
        text: "#F8FAFC",
        textSecondary: "#94A3B8",
        textMuted: "#64748B",
        accent: "#10B981",
        accentLight: "#34D399",
        accentBg: "rgba(16, 185, 129, 0.15)",
        iconBg: "rgba(16, 185, 129, 0.15)",
        iconColor: "#34D399",
        shadow: "none",
        shadowHover: "0 20px 40px rgba(0,0,0,0.3)",
    }
};

// SVG Line Art Icons (Monochrome)
const Icons = {
    home: (color: string) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    fileText: (color: string) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
    creditCard: (color: string) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
    bell: (color: string) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    user: (color: string) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
        </svg>
    ),
    plus: (color: string) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    logout: (color: string) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    moon: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    ),
    sun: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    ),
    check: (color: string) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    file: (color: string) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
        </svg>
    ),
    clock: (color: string) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    award: (color: string) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
    ),
    alertTriangle: (color: string) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    compass: (color: string) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
    ),
};

interface User { id: string; firstName?: string; lastName?: string; companyName?: string; accountType?: string; email?: string; }
interface Application { _id: string; applicationNumber?: string; status: string; createdAt: string; }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "ร่าง", color: "#8A8A8A" },
    PAYMENT_1_PENDING: { label: "รอชำระเงินงวด 1", color: "#F59E0B" },
    SUBMITTED: { label: "รอตรวจเอกสาร", color: "#3B82F6" },
    REVISION_REQ: { label: "ต้องแก้ไข", color: "#EF4444" },
    PAYMENT_2_PENDING: { label: "รอชำระเงินงวด 2", color: "#F59E0B" },
    AUDIT_PENDING: { label: "รอตรวจสถานที่", color: "#8B5CF6" },
    AUDIT_SCHEDULED: { label: "นัดตรวจแล้ว", color: "#06B6D4" },
    CERTIFIED: { label: "ได้รับการรับรอง", color: "#16A34A" },
};

const STEPS = [
    { id: 1, label: "ยื่นคำขอ" },
    { id: 2, label: "ชำระงวด 1" },
    { id: 3, label: "ตรวจเอกสาร" },
    { id: 4, label: "ชำระงวด 2" },
    { id: 5, label: "ตรวจสถานที่" },
    { id: 6, label: "รับรอง" },
];

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme");
        setIsDark(savedTheme === "dark");

        // Note: auth_token is now httpOnly cookie (not accessible via JS)
        // We check for user data only; middleware handles actual auth
        const userData = localStorage.getItem("user");
        if (!userData) {
            setIsRedirecting(true);
            window.location.href = "/login";
            return;
        }
        try {
            setUser(JSON.parse(userData));
            loadApplications();
        } catch {
            setIsRedirecting(true);
            window.location.href = "/login";
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    const [loadError, setLoadError] = useState<string | null>(null);

    const loadApplications = async () => {
        setLoadError(null);
        const result = await api.get<{ data: Application[] }>("/v2/applications/my");
        if (result.success && result.data?.data) {
            setApplications(result.data.data);
        } else {
            setLoadError("ไม่สามารถโหลดข้อมูลคำขอได้ กรุณาลองใหม่");
        }
    };

    const handleLogout = () => {
        // Clear ALL app data
        localStorage.removeItem("user");
        localStorage.removeItem("gacp_wizard_state");
        localStorage.removeItem("gacp_wizard_last_saved");
        localStorage.removeItem("remember_login");
        sessionStorage.clear();
        // Navigate to logout API - it clears cookies and redirects to login
        window.location.href = "/api/auth/logout";
    };

    const getDisplayName = () => {
        if (!user) return "";
        if (user.accountType === "JURISTIC" && user.companyName) return user.companyName;
        return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "ผู้ใช้";
    };

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "สวัสดีตอนเช้า";
        if (hour >= 12 && hour < 17) return "สวัสดีตอนบ่าย";
        if (hour >= 17 && hour < 21) return "สวัสดีตอนเย็น";
        return "สวัสดี";
    };

    const latestApp = applications[0];
    const statusInfo = latestApp ? STATUS_CONFIG[latestApp.status] || STATUS_CONFIG.DRAFT : null;
    const getCurrentStep = (status: string): number => {
        switch (status) { case "DRAFT": return 1; case "PAYMENT_1_PENDING": return 2; case "SUBMITTED": case "REVISION_REQ": return 3; case "PAYMENT_2_PENDING": return 4; case "AUDIT_PENDING": case "AUDIT_SCHEDULED": return 5; case "CERTIFIED": return 6; default: return 0; }
    };
    const currentStep = latestApp ? getCurrentStep(latestApp.status) : 0;

    if (!user || !mounted || isRedirecting) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: t.bg }}>
                {/* Skeleton Loading for better perceived performance */}
                <div style={{ padding: "32px 40px", maxWidth: "1400px", marginLeft: "72px" }}>
                    {/* Header Skeleton */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                        <div>
                            <div style={{ width: 100, height: 16, backgroundColor: `${t.text}10`, borderRadius: 8, marginBottom: 8 }} />
                            <div style={{ width: 200, height: 32, backgroundColor: `${t.text}10`, borderRadius: 8 }} />
                        </div>
                        <div style={{ width: 140, height: 44, backgroundColor: `${t.accent}20`, borderRadius: 12 }} />
                    </div>

                    {/* Stats Skeleton */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20 }}>
                                <div style={{ width: 80, height: 14, backgroundColor: `${t.text}08`, borderRadius: 6, marginBottom: 12 }} />
                                <div style={{ width: 60, height: 40, backgroundColor: `${t.accent}15`, borderRadius: 8 }} />
                            </div>
                        ))}
                    </div>

                    {/* Content Skeleton */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
                        <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: 28, height: 200 }} />
                        <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: 24, height: 200 }} />
                    </div>
                </div>

                {/* Shimmer animation */}
                <style jsx>{`
                    @keyframes shimmer {
                        0% { opacity: 0.5; }
                        50% { opacity: 1; }
                        100% { opacity: 0.5; }
                    }
                    div[style*="backgroundColor"] { animation: shimmer 1.5s infinite; }
                `}</style>
            </div>
        );
    }

    const navItems = [
        { href: "/dashboard", icon: Icons.home, label: "หน้าหลัก", active: true },
        { href: "/applications", icon: Icons.fileText, label: "คำขอ" },
        { href: "/tracking", icon: Icons.compass, label: "ติดตาม" },
        { href: "/payments", icon: Icons.creditCard, label: "การเงิน" },
        { href: "/profile", icon: Icons.user, label: "โปรไฟล์" },
    ];

    return (
        <div style={{ minHeight: "100vh", backgroundColor: t.bg, color: t.text, fontFamily: "'Kanit', 'Sukhumvit Set', sans-serif", transition: "all 0.3s ease" }}>

            {/* Skip Navigation Link - Accessibility */}
            <a
                href="#main-content"
                className="skip-link"
                style={{
                    position: "absolute",
                    top: "-100px",
                    left: "16px",
                    padding: "12px 24px",
                    backgroundColor: t.accent,
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    zIndex: 9999,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                    transition: "top 0.2s",
                }}
                onFocus={(e) => e.currentTarget.style.top = "16px"}
                onBlur={(e) => e.currentTarget.style.top = "-100px"}
            >
                ข้ามไปยังเนื้อหาหลัก
            </a>

            {/* Sidebar - Desktop */}
            <aside className="sidebar" style={{
                position: "fixed", left: 0, top: 0, bottom: 0, width: "72px",
                backgroundColor: t.surface, borderRight: `1px solid ${t.border}`,
                display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0",
                transition: "all 0.3s ease",
            }}>
                {/* Logo */}
                <div style={{
                    width: "44px", height: "44px", borderRadius: "14px",
                    background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "20px", fontWeight: 600, color: "#FFF", marginBottom: "32px",
                }}>
                    G
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className="nav-link" style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                            padding: "12px 0", textDecoration: "none", position: "relative",
                            transition: "all 0.2s ease",
                        }}>
                            {item.active && (
                                <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "28px", backgroundColor: t.accent, borderRadius: "0 3px 3px 0" }} />
                            )}
                            {item.icon(item.active ? t.accent : t.textMuted)}
                            <span style={{ fontSize: "10px", fontWeight: 500, color: item.active ? t.accent : t.textMuted }}>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Theme Toggle + Logout */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <button
                        onClick={toggleTheme}
                        className="icon-btn"
                        aria-label={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
                        title={isDark ? "โหมดสว่าง" : "โหมดมืด"}
                        style={{
                            width: "40px", height: "40px", borderRadius: "12px",
                            backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.2s",
                        }}
                    >
                        {isDark ? Icons.sun(t.iconColor) : Icons.moon(t.iconColor)}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="icon-btn"
                        aria-label="ออกจากระบบ"
                        title="ออกจากระบบ"
                        style={{
                            width: "40px", height: "40px", borderRadius: "12px",
                            background: "transparent", border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        {Icons.logout(t.textMuted)}
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="mobile-nav" style={{
                position: "fixed", bottom: 0, left: 0, right: 0, height: "72px",
                backgroundColor: t.surface, borderTop: `1px solid ${t.border}`,
                display: "none", justifyContent: "space-around", alignItems: "center",
                padding: "0 16px", zIndex: 100,
            }}>
                {navItems.map((item) => (
                    <Link key={item.href} href={item.href} style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                        padding: "8px 12px", textDecoration: "none",
                    }}>
                        {item.icon(item.active ? t.accent : t.textMuted)}
                        <span style={{ fontSize: "10px", fontWeight: 500, color: item.active ? t.accent : t.textMuted }}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Main Content */}
            <main id="main-content" className="main-content" style={{ marginLeft: "72px", padding: "32px 40px", maxWidth: "1400px", transition: "all 0.3s ease" }}>

                {/* Header */}
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <p style={{ fontSize: "13px", color: t.textMuted, letterSpacing: "0.05em", marginBottom: "4px" }}>{getGreeting()}</p>
                        <h1 style={{ fontSize: "28px", fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>{getDisplayName()}</h1>
                    </div>

                    {/* Error State with Retry */}
                    {loadError && (
                        <div style={{
                            width: "100%",
                            padding: "16px 20px",
                            backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
                            border: `1px solid ${isDark ? "rgba(239, 68, 68, 0.3)" : "#FECACA"}`,
                            borderRadius: "12px",
                            marginBottom: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                {Icons.alertTriangle("#EF4444")}
                                <span style={{ color: "#EF4444", fontSize: "14px" }}>{loadError}</span>
                            </div>
                            <button
                                onClick={loadApplications}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#EF4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    fontFamily: "'Kanit', sans-serif",
                                }}
                            >
                                ลองใหม่
                            </button>
                        </div>
                    )}
                    <Link href="/applications/new" className="cta-btn" style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "12px 24px", borderRadius: "12px",
                        background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`,
                        color: "#FFF", fontWeight: 500, fontSize: "14px", textDecoration: "none",
                        boxShadow: `0 4px 16px ${isDark ? "rgba(16, 185, 129, 0.25)" : "rgba(22, 163, 74, 0.25)"}`,
                        transition: "all 0.2s ease",
                    }}>
                        {Icons.plus("#FFF")}
                        ยื่นคำขอใหม่
                    </Link>
                </header>

                {/* Pending Task Card - Shows when payment is pending */}
                {latestApp && ['PAYMENT_1_PENDING', 'PAYMENT_2_PENDING'].includes(latestApp.status) && (
                    <div style={{
                        background: `linear-gradient(135deg, ${isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)'} 0%, ${isDark ? 'rgba(234, 88, 12, 0.1)' : 'rgba(251, 191, 36, 0.08)'} 100%)`,
                        border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.25)'}`,
                        borderRadius: "20px",
                        padding: "24px",
                        marginBottom: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "20px",
                        flexWrap: "wrap",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "280px" }}>
                            <div style={{
                                width: "56px", height: "56px", borderRadius: "16px",
                                backgroundColor: "rgba(245, 158, 11, 0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                {Icons.creditCard("#F59E0B")}
                            </div>
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, color: t.text, margin: "0 0 4px" }}>
                                    {latestApp.status === 'PAYMENT_1_PENDING' ? 'รอชำระค่าธรรมเนียมงวด 1' : 'รอชำระค่าตรวจสถานที่งวด 2'}
                                </h3>
                                <p style={{ fontSize: "13px", color: t.textSecondary, margin: 0 }}>
                                    {latestApp.status === 'PAYMENT_1_PENDING'
                                        ? 'ชำระ 5,000 บาท เพื่อเริ่มกระบวนการตรวจสอบเอกสาร'
                                        : 'ชำระ 25,000 บาท เพื่อนัดหมายตรวจสถานที่ผลิต'
                                    }
                                </p>
                            </div>
                        </div>
                        <Link href="/payments" style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "12px 24px", borderRadius: "12px",
                            backgroundColor: "#F59E0B", color: "#FFF",
                            fontWeight: 600, fontSize: "14px", textDecoration: "none",
                            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                            transition: "all 0.2s ease",
                        }}>
                            {Icons.creditCard("#FFF")}
                            ไปชำระเงิน
                        </Link>
                    </div>
                )}

                {/* Revision Required Task Card */}
                {latestApp && latestApp.status === 'REVISION_REQ' && (
                    <div style={{
                        background: `linear-gradient(135deg, ${isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)'} 0%, ${isDark ? 'rgba(220, 38, 38, 0.1)' : 'rgba(252, 165, 165, 0.1)'} 100%)`,
                        border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`,
                        borderRadius: "20px",
                        padding: "24px",
                        marginBottom: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "20px",
                        flexWrap: "wrap",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "280px" }}>
                            <div style={{
                                width: "56px", height: "56px", borderRadius: "16px",
                                backgroundColor: "rgba(239, 68, 68, 0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                {Icons.alertTriangle("#EF4444")}
                            </div>
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, color: t.text, margin: "0 0 4px" }}>
                                    ต้องแก้ไขเอกสาร
                                </h3>
                                <p style={{ fontSize: "13px", color: t.textSecondary, margin: 0 }}>
                                    เจ้าหน้าที่ส่งคำขอแก้ไขเอกสาร กรุณาตรวจสอบและส่งใหม่
                                </p>
                            </div>
                        </div>
                        <Link href={`/applications/${latestApp._id}`} style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "12px 24px", borderRadius: "12px",
                            backgroundColor: "#EF4444", color: "#FFF",
                            fontWeight: 600, fontSize: "14px", textDecoration: "none",
                            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                            transition: "all 0.2s ease",
                        }}>
                            {Icons.fileText("#FFF")}
                            ดูรายละเอียด
                        </Link>
                    </div>
                )}

                {/* Audit Scheduled Task Card */}
                {latestApp && latestApp.status === 'AUDIT_SCHEDULED' && (
                    <div style={{
                        background: `linear-gradient(135deg, ${isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.08)'} 0%, ${isDark ? 'rgba(14, 165, 233, 0.1)' : 'rgba(125, 211, 252, 0.1)'} 100%)`,
                        border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.25)'}`,
                        borderRadius: "20px",
                        padding: "24px",
                        marginBottom: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "20px",
                        flexWrap: "wrap",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "280px" }}>
                            <div style={{
                                width: "56px", height: "56px", borderRadius: "16px",
                                backgroundColor: "rgba(6, 182, 212, 0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                {Icons.clock("#06B6D4")}
                            </div>
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, color: t.text, margin: "0 0 4px" }}>
                                    นัดหมายตรวจสถานที่แล้ว
                                </h3>
                                <p style={{ fontSize: "13px", color: t.textSecondary, margin: 0 }}>
                                    เจ้าหน้าที่จะติดต่อเพื่อยืนยันวันและเวลาตรวจสอบสถานที่ผลิต
                                </p>
                            </div>
                        </div>
                        <Link href={`/applications/${latestApp._id}`} style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "12px 24px", borderRadius: "12px",
                            backgroundColor: "#06B6D4", color: "#FFF",
                            fontWeight: 600, fontSize: "14px", textDecoration: "none",
                            boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
                            transition: "all 0.2s ease",
                        }}>
                            {Icons.file("#FFF")}
                            ดูรายละเอียด
                        </Link>
                    </div>
                )}

                {/* Stats Grid - Responsive */}
                <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
                    {[
                        { icon: Icons.file, label: "คำขอทั้งหมด", value: applications.length },
                        { icon: Icons.clock, label: "รอดำเนินการ", value: applications.filter(a => !["CERTIFIED", "DRAFT"].includes(a.status)).length },
                        { icon: Icons.award, label: "ได้รับรองแล้ว", value: applications.filter(a => a.status === "CERTIFIED").length },
                        { icon: Icons.alertTriangle, label: "หมดอายุ", value: 0 },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card" style={{
                            backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "16px",
                            padding: "20px", transition: "all 0.2s ease",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                <span style={{ fontSize: "12px", color: t.textMuted, fontWeight: 500 }}>{stat.label}</span>
                                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {stat.icon(t.iconColor)}
                                </div>
                            </div>
                            <div style={{ fontSize: "32px", fontWeight: 600, color: t.accent, letterSpacing: "-0.02em" }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="content-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>

                    {/* Left Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                        {/* Hero Card */}
                        <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "28px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                                <div>
                                    <h2 style={{ fontSize: "13px", color: t.textMuted, fontWeight: 500, margin: "0 0 8px 0", letterSpacing: "0.03em" }}>สถานะปัจจุบัน</h2>
                                    <p style={{ fontSize: "24px", fontWeight: 500, margin: 0 }}>
                                        {latestApp ? (latestApp.applicationNumber || `#${latestApp._id.slice(-6).toUpperCase()}`) : "ยังไม่มีคำขอ"}
                                    </p>
                                </div>
                                {statusInfo && (
                                    <span style={{ padding: "6px 14px", borderRadius: "100px", backgroundColor: `${statusInfo.color}15`, color: statusInfo.color, fontSize: "12px", fontWeight: 600, border: `1px solid ${statusInfo.color}30` }}>
                                        {statusInfo.label}
                                    </span>
                                )}
                            </div>
                            {!latestApp && (
                                <div style={{ textAlign: "center", padding: "32px 0" }}>
                                    <div style={{ width: "72px", height: "72px", borderRadius: "18px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                        {Icons.file(t.iconColor)}
                                    </div>
                                    <p style={{ color: t.textSecondary, fontSize: "14px" }}>เริ่มต้นยื่นคำขอใบรับรอง GACP</p>
                                </div>
                            )}
                        </div>

                        {/* Stepper */}
                        <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px" }}>
                            <h3 style={{ fontSize: "13px", color: t.textMuted, fontWeight: 500, margin: "0 0 20px 0", letterSpacing: "0.03em" }}>ขั้นตอนการดำเนินการ</h3>
                            <div style={{ position: "relative", marginBottom: "20px" }}>
                                <div style={{ height: "3px", backgroundColor: t.border, borderRadius: "2px" }} />
                                <div style={{ position: "absolute", top: 0, left: 0, height: "3px", borderRadius: "2px", width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`, background: `linear-gradient(90deg, ${t.accent} 0%, ${t.accentLight} 100%)`, transition: "width 0.5s ease" }} />
                            </div>
                            <div className="stepper-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
                                {STEPS.map((step) => {
                                    const isDone = step.id < currentStep;
                                    const isCurrent = step.id === currentStep;
                                    return (
                                        <div key={step.id} style={{ textAlign: "center" }}>
                                            <div style={{
                                                width: "36px", height: "36px", borderRadius: "12px", margin: "0 auto 6px",
                                                backgroundColor: isDone ? t.accent : isCurrent ? t.accentBg : t.border,
                                                border: isCurrent ? `2px solid ${t.accent}` : "none",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                transition: "all 0.3s ease",
                                            }}>
                                                {isDone ? Icons.check("#FFF") : <span style={{ fontSize: "13px", fontWeight: 500, color: isCurrent ? t.accent : t.textMuted }}>{step.id}</span>}
                                            </div>
                                            <span style={{ fontSize: "10px", color: isCurrent ? t.accent : t.textMuted, fontWeight: isCurrent ? 600 : 400 }}>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                        {/* Activity */}
                        <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px", flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h3 style={{ fontSize: "13px", color: t.textMuted, fontWeight: 500, margin: 0, letterSpacing: "0.03em" }}>กิจกรรมล่าสุด</h3>
                                <Link href="/notifications" style={{ fontSize: "12px", color: t.accent, textDecoration: "none", fontWeight: 500 }}>ดูทั้งหมด</Link>
                            </div>
                            {applications.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {applications.slice(0, 3).map((app, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px solid ${t.border}` }}>
                                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: `${STATUS_CONFIG[app.status]?.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {Icons.file(STATUS_CONFIG[app.status]?.color || t.textMuted)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: "13px", fontWeight: 500, margin: 0 }}>{app.applicationNumber || `#${app._id.slice(-6)}`}</p>
                                                <p style={{ fontSize: "11px", color: t.textMuted, margin: "2px 0 0" }}>{STATUS_CONFIG[app.status]?.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "32px 0" }}>
                                    <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                                        {Icons.bell(t.iconColor)}
                                    </div>
                                    <p style={{ fontSize: "13px", color: t.textMuted }}>ยังไม่มีกิจกรรม</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px" }}>
                            <h3 style={{ fontSize: "13px", color: t.textMuted, fontWeight: 500, margin: "0 0 14px 0", letterSpacing: "0.03em" }}>ลิงก์ด่วน</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                                {[
                                    { icon: Icons.fileText, label: "ดาวน์โหลดแบบฟอร์ม" },
                                    { icon: Icons.user, label: "ติดต่อเจ้าหน้าที่" },
                                ].map((link, i) => (
                                    <Link key={i} href="#" className="quick-link" style={{
                                        display: "flex", alignItems: "center", gap: "10px",
                                        padding: "12px", borderRadius: "12px",
                                        backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                                        border: `1px solid ${t.border}`,
                                        textDecoration: "none", color: t.textSecondary, fontSize: "12px", fontWeight: 500,
                                        transition: "all 0.2s ease",
                                    }}>
                                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {link.icon(t.iconColor)}
                                        </div>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                
                .stat-card:hover { transform: translateY(-2px); box-shadow: ${t.shadowHover}; border-color: ${t.borderHover}; }
                .cta-btn:hover { transform: translateY(-1px); }
                .quick-link:hover { background-color: ${t.accentBg} !important; border-color: ${t.accent}30 !important; color: ${t.accent} !important; }
                .icon-btn:hover { background-color: ${t.accentBg} !important; }
                
                /* Mobile Responsive */
                @media (max-width: 1024px) {
                    .sidebar { display: none !important; }
                    .mobile-nav { display: flex !important; }
                    .main-content { margin-left: 0 !important; padding: 24px 20px 100px !important; }
                }
                @media (max-width: 900px) {
                    .content-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 640px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .stepper-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 16px !important; }
                    .main-content header h1 { font-size: 22px !important; }
                }
            `}</style>
        </div>
    );
}
