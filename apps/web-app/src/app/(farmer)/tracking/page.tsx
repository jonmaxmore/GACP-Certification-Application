"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api-client";

// Theme System
const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
        accent: "#16A34A", accentLight: "#22C55E", accentBg: "rgba(22, 163, 74, 0.08)",
        iconBg: "#E5F9E7", iconColor: "#16A34A",
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
        accent: "#10B981", accentLight: "#34D399", accentBg: "rgba(16, 185, 129, 0.15)",
        iconBg: "rgba(16, 185, 129, 0.15)", iconColor: "#34D399",
    }
};

// Large icons for empty state
const LargeIcons = {
    compass: (c: string) => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
};

// SVG Icons
const Icons = {
    home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    fileText: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    creditCard: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    user: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>,
    logout: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    compass: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
    check: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
    clock: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    award: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
};

interface Application { _id: string; applicationNumber?: string; status: string; createdAt: string; }

const STEPS = [
    { id: 1, label: "ยื่นคำขอ", statuses: ["DRAFT"] },
    { id: 2, label: "ชำระงวด 1", statuses: ["PAYMENT_1_PENDING"] },
    { id: 3, label: "ตรวจเอกสาร", statuses: ["SUBMITTED", "REVISION_REQ"] },
    { id: 4, label: "ชำระงวด 2", statuses: ["PAYMENT_2_PENDING"] },
    { id: 5, label: "ตรวจสถานที่", statuses: ["AUDIT_PENDING", "AUDIT_SCHEDULED"] },
    { id: 6, label: "รับรอง", statuses: ["CERTIFIED"] },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "ร่าง", color: "#8A8A8A" },
    PAYMENT_1_PENDING: { label: "รอชำระเงินงวด 1", color: "#F59E0B" },
    SUBMITTED: { label: "รอตรวจเอกสาร", color: "#3B82F6" },
    REVISION_REQ: { label: "ต้องแก้ไข", color: "#EF4444" },
    PAYMENT_2_PENDING: { label: "รอชำระเงินงวด 2", color: "#F59E0B" },
    AUDIT_PENDING: { label: "รอตรวจสถานที่", color: "#8B5CF6" },
    AUDIT_SCHEDULED: { label: "นัดตรวจแล้ว", color: "#06B6D4" },
    CERTIFIED: { label: "ได้รับการรับรอง", color: "#10B981" },
};

export default function TrackingPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ firstName?: string; lastName?: string } | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme");
        setIsDark(savedTheme === "dark");

        // Note: auth_token is now httpOnly cookie (not accessible via JS)
        const userData = localStorage.getItem("user");
        if (!userData) { window.location.href = "/login"; return; }
        try {
            setUser(JSON.parse(userData));
            loadApplications();
        } catch { window.location.href = "/login"; }
    }, []);

    const loadApplications = async () => {
        // Fetch applications from backend API only (production mode)
        const result = await api.get<{ data: Application[] }>("/v2/applications/my");
        if (result.success && result.data?.data) {
            setApplications(result.data.data);
        }
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };

    if (!user || !mounted) {
        return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.bg }}><div className="spinner" style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%" }} /><style jsx>{`@keyframes spin { to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }`}</style></div>;
    }

    const navItems = [
        { href: "/dashboard", icon: Icons.home, label: "หน้าหลัก" },
        { href: "/applications", icon: Icons.fileText, label: "คำขอ" },
        { href: "/certificates", icon: Icons.award, label: "ใบรับรอง" },
        { href: "/tracking", icon: Icons.compass, label: "ติดตาม", active: true },
        { href: "/payments", icon: Icons.creditCard, label: "การเงิน" },
        { href: "/profile", icon: Icons.user, label: "โปรไฟล์" },
    ];

    const getStepForStatus = (status: string) => STEPS.findIndex(s => s.statuses.includes(status)) + 1;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: t.bg, color: t.text, fontFamily: "'Kanit', sans-serif", transition: "all 0.3s" }}>

            {/* Sidebar */}
            <aside className="sidebar" style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: "72px", backgroundColor: t.surface, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 600, color: "#FFF", marginBottom: "32px" }}>G</div>
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "12px 0", textDecoration: "none", position: "relative" }}>
                            {item.active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "28px", backgroundColor: t.accent, borderRadius: "0 3px 3px 0" }} />}
                            {item.icon(item.active ? t.accent : t.textMuted)}
                            <span style={{ fontSize: "10px", fontWeight: 500, color: item.active ? t.accent : t.textMuted }}>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <button onClick={toggleTheme} style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{isDark ? Icons.sun(t.iconColor) : Icons.moon(t.iconColor)}</button>
                    <button onClick={handleLogout} style={{ width: "40px", height: "40px", borderRadius: "12px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Icons.logout(t.textMuted)}</button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className="mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "72px", backgroundColor: t.surface, borderTop: `1px solid ${t.border}`, display: "none", justifyContent: "space-around", alignItems: "center", zIndex: 100 }}>
                {navItems.map((item) => <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 12px", textDecoration: "none" }}>{item.icon(item.active ? t.accent : t.textMuted)}<span style={{ fontSize: "10px", fontWeight: 500, color: item.active ? t.accent : t.textMuted }}>{item.label}</span></Link>)}
            </nav>

            {/* Main */}
            <main className="main-content" style={{ marginLeft: "72px", padding: "32px 40px", maxWidth: "1200px" }}>
                <header style={{ marginBottom: "32px" }}>
                    <h1 style={{ fontSize: "28px", fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>ติดตามสถานะคำขอ</h1>
                    <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "4px" }}>ตรวจสอบความคืบหน้าการขอใบรับรอง GACP</p>
                </header>

                {applications.length > 0 ? applications.map((app) => {
                    const currentStep = getStepForStatus(app.status);
                    const statusInfo = STATUS_CONFIG[app.status];
                    return (
                        <div key={app._id} style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "28px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                                <div>
                                    <p style={{ fontSize: "12px", color: t.textMuted, marginBottom: "4px" }}>เลขที่คำขอ</p>
                                    <p style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>{app.applicationNumber || `#${app._id.slice(-6).toUpperCase()}`}</p>
                                </div>
                                <span style={{ padding: "8px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: 600, backgroundColor: `${statusInfo?.color}15`, color: statusInfo?.color, border: `1px solid ${statusInfo?.color}30` }}>
                                    {statusInfo?.label}
                                </span>
                            </div>

                            {/* Progress Steps */}
                            <div style={{ position: "relative", marginBottom: "24px" }}>
                                <div style={{ height: "4px", backgroundColor: t.border, borderRadius: "2px" }} />
                                <div style={{ position: "absolute", top: 0, left: 0, height: "4px", borderRadius: "2px", width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`, background: `linear-gradient(90deg, ${t.accent} 0%, ${t.accentLight} 100%)`, transition: "width 0.5s" }} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }}>
                                {STEPS.map((step) => {
                                    const isDone = step.id < currentStep;
                                    const isCurrent = step.id === currentStep;
                                    return (
                                        <div key={step.id} style={{ textAlign: "center" }}>
                                            <div style={{
                                                width: "48px", height: "48px", borderRadius: "16px", margin: "0 auto 8px",
                                                backgroundColor: isDone ? t.accent : isCurrent ? t.accentBg : t.border,
                                                border: isCurrent ? `2px solid ${t.accent}` : "none",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                {isDone ? Icons.check("#FFF") : isCurrent ? Icons.clock(t.accent) : <span style={{ fontSize: "14px", fontWeight: 500, color: t.textMuted }}>{step.id}</span>}
                                            </div>
                                            <span style={{ fontSize: "11px", color: isCurrent ? t.accent : t.textMuted, fontWeight: isCurrent ? 600 : 400 }}>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ marginTop: "24px", padding: "16px", backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: "12px" }}>
                                <p style={{ fontSize: "13px", color: t.textSecondary, margin: 0 }}>
                                    <strong>วันที่ยื่น:</strong> {new Date(app.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    );
                }) : (
                    <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "60px", textAlign: "center" }}>
                        <div style={{ width: "80px", height: "80px", borderRadius: "20px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                            {LargeIcons.compass(t.iconColor)}
                        </div>
                        <h3 style={{ fontSize: "18px", fontWeight: 500, color: t.text, marginBottom: "8px" }}>ยังไม่มีคำขอที่ต้องติดตาม</h3>
                        <p style={{ fontSize: "14px", color: t.textMuted }}>ยื่นคำขอรับรองมาตรฐาน GACP เพื่อเริ่มต้น</p>
                        <Link href="/applications/new" style={{ display: "inline-block", marginTop: "20px", padding: "12px 24px", borderRadius: "12px", background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, color: "#FFF", fontWeight: 500, textDecoration: "none" }}>
                            ยื่นคำขอใหม่
                        </Link>
                    </div>
                )}
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @media (max-width: 1024px) { .sidebar { display: none !important; } .mobile-nav { display: flex !important; } .main-content { margin-left: 0 !important; padding: 24px 20px 100px !important; } }
                @media (max-width: 640px) { .main-content > div > div:last-child { grid-template-columns: repeat(3, 1fr) !important; } }
            `}</style>
        </div>
    );
}

