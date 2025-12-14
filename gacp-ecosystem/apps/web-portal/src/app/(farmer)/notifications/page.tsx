"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/apiClient";

// Theme System
const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
        accent: "#16A34A", accentLight: "#22C55E", accentBg: "rgba(22, 163, 74, 0.08)",
        iconBg: "#E5F9E7", iconColor: "#16A34A",
        info: "#3B82F6", infoBg: "rgba(59, 130, 246, 0.08)",
        success: "#10B981", successBg: "rgba(16, 185, 129, 0.08)",
        warning: "#F59E0B", warningBg: "rgba(245, 158, 11, 0.08)",
        danger: "#EF4444", dangerBg: "rgba(239, 68, 68, 0.08)",
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
        accent: "#10B981", accentLight: "#34D399", accentBg: "rgba(16, 185, 129, 0.15)",
        iconBg: "rgba(16, 185, 129, 0.15)", iconColor: "#34D399",
        info: "#60A5FA", infoBg: "rgba(96, 165, 250, 0.15)",
        success: "#34D399", successBg: "rgba(52, 211, 153, 0.15)",
        warning: "#FBBF24", warningBg: "rgba(251, 191, 36, 0.15)",
        danger: "#F87171", dangerBg: "rgba(248, 113, 113, 0.15)",
    }
};

// Icons
const Icons = {
    home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    fileText: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    creditCard: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    user: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>,
    logout: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    compass: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
    award: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
    bell: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    check: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
    checkAll: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="18 8 11 16 7 12" /><polyline points="14 8 7 16 3 12" /></svg>,
    info: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
    alertTriangle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    checkCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    xCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
    arrowRight: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
};

const LargeIcons = {
    bell: (c: string) => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
};

interface Notification {
    id: string;
    _id?: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
    read: boolean;
    createdAt: string;
    actionUrl?: string;
    actionLabel?: string;
}

// Demo notifications for when API not available
const DEMO_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        title: "ยินดีต้อนรับสู่ระบบ GACP",
        message: "ระบบพร้อมให้บริการแล้ว คุณสามารถเริ่มยื่นคำขอรับรองมาตรฐานได้เลย",
        type: "SUCCESS",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        actionUrl: "/applications/new",
        actionLabel: "ยื่นคำขอใหม่"
    },
    {
        id: "2",
        title: "เอกสารถูกตรวจสอบแล้ว",
        message: "คำขอ #APP-2024-001 ผ่านการตรวจเอกสารเบื้องต้น กรุณาชำระเงินงวดที่ 2",
        type: "INFO",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        actionUrl: "/payments?app=APP-2024-001",
        actionLabel: "ชำระเงิน"
    },
    {
        id: "3",
        title: "นัดหมายตรวจประเมินสถานที่",
        message: "เจ้าหน้าที่จะเข้าตรวจประเมินสถานที่ในวันที่ 20 ธ.ค. 2567 เวลา 10:00 น.",
        type: "WARNING",
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        actionUrl: "/tracking",
        actionLabel: "ดูรายละเอียด"
    },
];

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) { router.push("/login"); return; }
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const result = await api.get<{ data: Notification[] }>("/v2/notifications");
            if (result.success && result.data?.data) {
                setNotifications(result.data.data);
            } else {
                // Fallback to demo
                setNotifications(DEMO_NOTIFICATIONS);
            }
        } catch {
            setNotifications(DEMO_NOTIFICATIONS);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.post(`/v2/notifications/${id}/read`, {});
            setNotifications(prev => prev.map(n =>
                (n.id === id || n._id === id) ? { ...n, read: true } : n
            ));
        } catch {
            // Local update anyway
            setNotifications(prev => prev.map(n =>
                (n.id === id || n._id === id) ? { ...n, read: true } : n
            ));
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post("/v2/notifications/read-all", {});
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'SUCCESS': return { color: t.success, bg: t.successBg, icon: <Icons.checkCircle /> };
            case 'WARNING': return { color: t.warning, bg: t.warningBg, icon: <Icons.alertTriangle /> };
            case 'DANGER': return { color: t.danger, bg: t.dangerBg, icon: <Icons.xCircle /> };
            default: return { color: t.info, bg: t.infoBg, icon: <Icons.info /> };
        }
    };

    const formatTime = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 60) return `${mins} นาทีที่แล้ว`;
        if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
        if (days < 7) return `${days} วันที่แล้ว`;
        return new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const filteredNotifications = filter === 'UNREAD'
        ? notifications.filter(n => !n.read)
        : notifications;

    if (!mounted) return null;

    const navItems = [
        { href: "/dashboard", icon: Icons.home, label: "หน้าหลัก" },
        { href: "/applications", icon: Icons.fileText, label: "คำขอ" },
        { href: "/certificates", icon: Icons.award, label: "ใบรับรอง" },
        { href: "/tracking", icon: Icons.compass, label: "ติดตาม" },
        { href: "/payments", icon: Icons.creditCard, label: "การเงิน" },
        { href: "/profile", icon: Icons.user, label: "โปรไฟล์" },
    ];

    return (
        <div style={{ minHeight: "100vh", backgroundColor: t.bg, color: t.text, fontFamily: "'Kanit', sans-serif" }}>
            {/* Sidebar */}
            <aside className="sidebar" style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: "72px", backgroundColor: t.surface, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 600, color: "#FFF", marginBottom: "32px" }}>G</div>
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "12px 0", textDecoration: "none" }}>
                            {item.icon(t.textMuted)}
                            <span style={{ fontSize: "10px", fontWeight: 500, color: t.textMuted }}>{item.label}</span>
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
                {navItems.slice(0, 5).map((item) => <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 12px", textDecoration: "none" }}>{item.icon(t.textMuted)}<span style={{ fontSize: "10px", fontWeight: 500, color: t.textMuted }}>{item.label}</span></Link>)}
            </nav>

            {/* Main Content */}
            <main className="main-content" style={{ marginLeft: "72px", padding: "32px 40px", maxWidth: "800px" }}>
                {/* Header */}
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 500, margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
                            การแจ้งเตือน
                            {unreadCount > 0 && (
                                <span style={{
                                    padding: "4px 12px", borderRadius: "100px", fontSize: "13px", fontWeight: 600,
                                    backgroundColor: t.accent, color: "#FFF"
                                }}>
                                    {unreadCount} ใหม่
                                </span>
                            )}
                        </h1>
                        <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "4px" }}>ข้อความและการอัปเดตจากระบบ</p>
                    </div>

                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} style={{
                            padding: "10px 20px", borderRadius: "12px",
                            border: `1px solid ${t.border}`, backgroundColor: "transparent",
                            color: t.textSecondary, fontSize: "13px", fontWeight: 500, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "8px",
                        }}>
                            {Icons.checkAll(t.textMuted)} อ่านทั้งหมด
                        </button>
                    )}
                </header>

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                    {[
                        { key: 'ALL', label: 'ทั้งหมด', count: notifications.length },
                        { key: 'UNREAD', label: 'ยังไม่อ่าน', count: unreadCount },
                    ].map((tab) => (
                        <button key={tab.key} onClick={() => setFilter(tab.key as 'ALL' | 'UNREAD')} style={{
                            padding: "10px 20px", borderRadius: "100px",
                            border: filter === tab.key ? "none" : `1px solid ${t.border}`,
                            backgroundColor: filter === tab.key ? t.accent : "transparent",
                            color: filter === tab.key ? "#FFF" : t.textSecondary,
                            fontSize: "13px", fontWeight: 500, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "8px",
                        }}>
                            {tab.label}
                            <span style={{
                                padding: "2px 8px", borderRadius: "100px", fontSize: "11px",
                                backgroundColor: filter === tab.key ? "rgba(255,255,255,0.2)" : t.accentBg,
                                color: filter === tab.key ? "#FFF" : t.accent,
                            }}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "60px", textAlign: "center" }}>
                        <div className="spinner" style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", margin: "0 auto" }} />
                        <p style={{ marginTop: "16px", color: t.textMuted }}>กำลังโหลด...</p>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {filteredNotifications.map((n) => {
                            const config = getTypeConfig(n.type);
                            return (
                                <div
                                    key={n.id || n._id}
                                    onClick={() => !n.read && markAsRead(n.id || n._id || '')}
                                    style={{
                                        backgroundColor: n.read ? t.bgCard : config.bg,
                                        border: `1px solid ${n.read ? t.border : config.color}30`,
                                        borderRadius: "16px", padding: "20px",
                                        cursor: n.read ? "default" : "pointer",
                                        transition: "all 0.2s",
                                        position: "relative",
                                    }}
                                >
                                    {!n.read && (
                                        <div style={{
                                            position: "absolute", top: "20px", right: "20px",
                                            width: "10px", height: "10px", borderRadius: "50%",
                                            backgroundColor: config.color,
                                        }} />
                                    )}

                                    <div style={{ display: "flex", gap: "16px" }}>
                                        <div style={{
                                            width: "44px", height: "44px", borderRadius: "12px",
                                            backgroundColor: config.bg, color: config.color,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0,
                                        }}>
                                            {config.icon}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                                                <h3 style={{ fontSize: "15px", fontWeight: 500, margin: 0, color: t.text }}>{n.title}</h3>
                                                <span style={{ fontSize: "12px", color: t.textMuted, whiteSpace: "nowrap" }}>{formatTime(n.createdAt)}</span>
                                            </div>
                                            <p style={{ fontSize: "13px", color: t.textSecondary, marginTop: "6px", lineHeight: 1.5 }}>{n.message}</p>

                                            {n.actionUrl && (
                                                <Link href={n.actionUrl} onClick={(e) => e.stopPropagation()} style={{
                                                    display: "inline-flex", alignItems: "center", gap: "6px",
                                                    marginTop: "12px", padding: "8px 16px", borderRadius: "10px",
                                                    backgroundColor: t.accent, color: "#FFF",
                                                    fontSize: "12px", fontWeight: 500, textDecoration: "none",
                                                }}>
                                                    {n.actionLabel || "ดูรายละเอียด"} {Icons.arrowRight("#FFF")}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "60px", textAlign: "center" }}>
                        <div style={{ width: "80px", height: "80px", borderRadius: "20px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                            {LargeIcons.bell(t.iconColor)}
                        </div>
                        <h3 style={{ fontSize: "18px", fontWeight: 500, color: t.text, marginBottom: "8px" }}>
                            {filter === 'UNREAD' ? "ไม่มีการแจ้งเตือนที่ยังไม่อ่าน" : "ไม่มีการแจ้งเตือน"}
                        </h3>
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
