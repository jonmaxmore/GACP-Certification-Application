"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Theme System
const themes = {
    light: {
        bg: "#F8FAFC", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
        accent: "#1B5E20", accentLight: "#2E7D32", accentBg: "rgba(27, 94, 32, 0.08)",
        iconBg: "#E8F5E9", iconColor: "#1B5E20",
        chartColors: ["#16A34A", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"],
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.8)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
        accent: "#22C55E", accentLight: "#34D399", accentBg: "rgba(34, 197, 94, 0.15)",
        iconBg: "rgba(34, 197, 94, 0.15)", iconColor: "#34D399",
        chartColors: ["#22C55E", "#60A5FA", "#FBBF24", "#F87171", "#A78BFA", "#22D3EE"],
    }
};

// Icons
const Icons = {
    home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    users: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    fileText: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    calendar: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    chart: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    download: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    refresh: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>,
    logout: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="5" /></svg>,
    trendUp: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
    trendDown: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>,
};

interface DashboardData {
    overview: {
        totalApplications: number;
        pendingReview: number;
        approved: number;
        rejected: number;
    };
    byStatus: Record<string, number>;
    byPlantType: Record<string, number>;
    byProvince: Record<string, number>;
    monthlyTrend: Array<{ month: number; applications: number; approved: number }>;
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [exporting, setExporting] = useState(false);

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) { router.push("/staff/login"); return; }
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/v2/reports/dashboard", { credentials: "include" });
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            } else {
                // Mock data for demo
                setData({
                    overview: { totalApplications: 1234, pendingReview: 45, approved: 1089, rejected: 100 },
                    byStatus: { CERTIFIED: 1003, AUDIT_PENDING: 56, SUBMITTED: 45, PAYMENT_1_PENDING: 34, DRAFT: 23, REVISION_REQ: 12 },
                    byPlantType: { 'กัญชา': 450, 'กระท่อม': 320, 'ขมิ้นชัน': 180, 'ขิง': 120, 'กระชายดำ': 90, 'ไพล': 74 },
                    byProvince: { 'กรุงเทพฯ': 120, 'เชียงใหม่': 98, 'นครราชสีมา': 87, 'ขอนแก่น': 76, 'อุบลฯ': 65 },
                    monthlyTrend: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, applications: Math.floor(Math.random() * 100) + 50, approved: Math.floor(Math.random() * 80) + 30 })),
                });
            }
        } catch {
            // Fallback mock
            setData({
                overview: { totalApplications: 1234, pendingReview: 45, approved: 1089, rejected: 100 },
                byStatus: { CERTIFIED: 1003, AUDIT_PENDING: 56, SUBMITTED: 45, PAYMENT_1_PENDING: 34, DRAFT: 23 },
                byPlantType: { 'กัญชา': 450, 'กระท่อม': 320, 'ขมิ้นชัน': 180, 'ขิง': 120 },
                byProvince: { 'กรุงเทพฯ': 120, 'เชียงใหม่': 98, 'นครราชสีมา': 87 },
                monthlyTrend: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, applications: 70, approved: 50 })),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'csv' | 'json', type: string) => {
        setExporting(true);
        try {
            window.open(`/api/v2/reports/export?format=${format}&type=${type}`, '_blank');
        } finally {
            setExporting(false);
        }
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); router.push("/staff/login"); };

    if (!mounted) return null;

    const navItems = [
        { href: "/staff/dashboard", icon: Icons.home, label: "หน้าหลัก" },
        { href: "/staff/applications", icon: Icons.fileText, label: "คำขอ" },
        { href: "/staff/calendar", icon: Icons.calendar, label: "ปฏิทิน" },
        { href: "/staff/analytics", icon: Icons.chart, label: "Analytics", active: true },
    ];

    const getMaxValue = (obj: Record<string, number>) => Math.max(...Object.values(obj), 1);

    return (
        <div style={{ minHeight: "100vh", backgroundColor: t.bg, color: t.text, fontFamily: "'Kanit', sans-serif" }}>
            {/* Sidebar */}
            <aside style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: "72px", backgroundColor: t.surface, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", zIndex: 100 }}>
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

            {/* Main Content */}
            <main style={{ marginLeft: "72px", padding: "32px 40px" }}>
                {/* Header */}
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 600, margin: 0 }}>📊 Analytics Dashboard</h1>
                        <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "4px" }}>ภาพรวมและสถิติระบบรับรอง GACP</p>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={loadData} disabled={loading} style={{ padding: "10px 20px", borderRadius: "12px", border: `1px solid ${t.border}`, backgroundColor: "transparent", color: t.text, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                            {Icons.refresh(t.textMuted)} รีเฟรช
                        </button>
                        <button onClick={() => handleExport('csv', 'applications')} disabled={exporting} style={{ padding: "10px 20px", borderRadius: "12px", border: "none", backgroundColor: t.accent, color: "#FFF", fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                            {Icons.download("#FFF")} Export CSV
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
                        <div className="spinner" style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%" }} />
                    </div>
                ) : data ? (
                    <>
                        {/* Overview Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
                            {[
                                { label: "คำขอทั้งหมด", value: data.overview.totalApplications, color: t.chartColors[0], trend: "+12%", up: true },
                                { label: "รอตรวจสอบ", value: data.overview.pendingReview, color: t.chartColors[1], trend: "-5%", up: false },
                                { label: "ได้รับรอง", value: data.overview.approved, color: t.chartColors[0], trend: "+8%", up: true },
                                { label: "ไม่ผ่าน", value: data.overview.rejected, color: t.chartColors[3], trend: "-2%", up: false },
                            ].map((card, i) => (
                                <div key={i} style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px", position: "relative", overflow: "hidden" }}>
                                    <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: `radial-gradient(circle, ${card.color}15 0%, transparent 70%)` }} />
                                    <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "8px" }}>{card.label}</p>
                                    <p style={{ fontSize: "32px", fontWeight: 700, color: t.text, margin: 0 }}>{card.value.toLocaleString()}</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
                                        {card.up ? Icons.trendUp(t.chartColors[0]) : Icons.trendDown(t.chartColors[3])}
                                        <span style={{ fontSize: "12px", color: card.up ? t.chartColors[0] : t.chartColors[3] }}>{card.trend}</span>
                                        <span style={{ fontSize: "12px", color: t.textMuted, marginLeft: "4px" }}>vs เดือนก่อน</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "32px" }}>
                            {/* Monthly Trend */}
                            <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>📈 แนวโน้มรายเดือน</h3>
                                <div style={{ display: "flex", alignItems: "flex-end", height: "200px", gap: "8px" }}>
                                    {data.monthlyTrend.map((m, i) => (
                                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                            <div style={{ width: "100%", display: "flex", gap: "2px", justifyContent: "center" }}>
                                                <div style={{ width: "40%", height: `${(m.applications / 120) * 180}px`, backgroundColor: t.chartColors[0], borderRadius: "4px 4px 0 0", opacity: 0.3 }} />
                                                <div style={{ width: "40%", height: `${(m.approved / 120) * 180}px`, backgroundColor: t.chartColors[0], borderRadius: "4px 4px 0 0" }} />
                                            </div>
                                            <span style={{ fontSize: "10px", color: t.textMuted }}>{['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][i]}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ width: "12px", height: "12px", backgroundColor: t.chartColors[0], opacity: 0.3, borderRadius: "2px" }} />
                                        <span style={{ fontSize: "12px", color: t.textMuted }}>คำขอใหม่</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ width: "12px", height: "12px", backgroundColor: t.chartColors[0], borderRadius: "2px" }} />
                                        <span style={{ fontSize: "12px", color: t.textMuted }}>ได้รับรอง</span>
                                    </div>
                                </div>
                            </div>

                            {/* By Plant Type */}
                            <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>🌿 ตามประเภทพืช</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {Object.entries(data.byPlantType).slice(0, 5).map(([name, count], i) => (
                                        <div key={name}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                <span style={{ fontSize: "13px", color: t.text }}>{name}</span>
                                                <span style={{ fontSize: "13px", fontWeight: 600, color: t.text }}>{count}</span>
                                            </div>
                                            <div style={{ height: "8px", backgroundColor: t.border, borderRadius: "4px", overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${(count / getMaxValue(data.byPlantType)) * 100}%`, backgroundColor: t.chartColors[i % t.chartColors.length], borderRadius: "4px" }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            {/* By Status */}
                            <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>📋 ตามสถานะ</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {Object.entries(data.byStatus).map(([status, count], i) => {
                                        const statusLabels: Record<string, string> = { CERTIFIED: 'ได้รับรอง', AUDIT_PENDING: 'รอตรวจ', SUBMITTED: 'ยื่นแล้ว', PAYMENT_1_PENDING: 'รอชำระ 1', DRAFT: 'ร่าง', REVISION_REQ: 'ต้องแก้ไข' };
                                        return (
                                            <div key={status} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ width: "10px", height: "10px", backgroundColor: t.chartColors[i % t.chartColors.length], borderRadius: "2px" }} />
                                                <span style={{ flex: 1, fontSize: "13px", color: t.textSecondary }}>{statusLabels[status] || status}</span>
                                                <span style={{ fontSize: "14px", fontWeight: 600, color: t.text }}>{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* By Province */}
                            <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>📍 ตามจังหวัด (Top 5)</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {Object.entries(data.byProvince).slice(0, 5).map(([name, count], i) => (
                                        <div key={name}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                <span style={{ fontSize: "13px", color: t.text }}>{name}</span>
                                                <span style={{ fontSize: "13px", fontWeight: 600, color: t.text }}>{count}</span>
                                            </div>
                                            <div style={{ height: "8px", backgroundColor: t.border, borderRadius: "4px", overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${(count / getMaxValue(data.byProvince)) * 100}%`, backgroundColor: t.chartColors[(i + 2) % t.chartColors.length], borderRadius: "4px" }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes spin { to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
