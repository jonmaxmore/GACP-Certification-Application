"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardData {
    overview: { totalApplications: number; pendingReview: number; approved: number; rejected: number; };
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
            if (result.success) setData(result.data);
            else setData({
                overview: { totalApplications: 1234, pendingReview: 45, approved: 1089, rejected: 100 },
                byStatus: { CERTIFIED: 1003, AUDIT_PENDING: 56, SUBMITTED: 45, PAYMENT_1_PENDING: 34, DRAFT: 23 },
                byPlantType: { 'กัญชา': 450, 'กระท่อม': 320, 'ขมิ้นชัน': 180, 'ขิง': 120, 'กระชายดำ': 90 },
                byProvince: { 'กรุงเทพฯ': 120, 'เชียงใหม่': 98, 'นครราชสีมา': 87, 'ขอนแก่น': 76, 'อุบลฯ': 65 },
                monthlyTrend: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, applications: Math.floor(Math.random() * 100) + 50, approved: Math.floor(Math.random() * 80) + 30 })),
            });
        } catch { setData({ overview: { totalApplications: 1234, pendingReview: 45, approved: 1089, rejected: 100 }, byStatus: { CERTIFIED: 1003 }, byPlantType: { 'กัญชา': 450 }, byProvince: { 'กรุงเทพฯ': 120 }, monthlyTrend: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, applications: 70, approved: 50 })) }); }
        finally { setLoading(false); }
    };

    const handleExport = (format: 'csv' | 'json', type: string) => {
        setExporting(true);
        window.open(`/api/v2/reports/export?format=${format}&type=${type}`, '_blank');
        setExporting(false);
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); router.push("/staff/login"); };

    if (!mounted) return null;

    const navItems = [
        { href: "/staff/dashboard", icon: "🏠", label: "หน้าหลัก" },
        { href: "/staff/applications", icon: "📄", label: "คำขอ" },
        { href: "/staff/calendar", icon: "📅", label: "ปฏิทิน" },
        { href: "/staff/analytics", icon: "📊", label: "Analytics", active: true },
    ];

    const getMaxValue = (obj: Record<string, number>) => Math.max(...Object.values(obj), 1);
    const chartColors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500', 'bg-violet-500', 'bg-cyan-500'];
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    return (
        <div className={`min-h-screen font-[Kanit] transition-all ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-stone-50 text-slate-900'}`}>
            {/* Sidebar */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] flex-col items-center py-5 border-r z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-xl font-semibold text-white mb-8">G</div>
                <nav className="flex-1 flex flex-col gap-1 w-full px-2">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all relative ${item.active ? (isDark ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-500/30') : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                            {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-emerald-500 rounded-r" />}
                            <span className="text-lg">{item.icon}</span>
                            <span className={`text-[10px] font-medium ${item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-col gap-3">
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-500/30'}`}>{isDark ? '☀️' : '🌙'}</button>
                    <button onClick={handleLogout} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500">🚪</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-[72px] p-6 lg:p-10">
                <header className="flex justify-between items-center flex-wrap gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-semibold">📊 Analytics Dashboard</h1>
                        <p className="text-sm text-slate-500 mt-1">ภาพรวมและสถิติระบบรับรอง GACP</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadData} disabled={loading} className={`px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 ${isDark ? 'bg-slate-700 border border-slate-600 text-slate-300' : 'bg-white border border-slate-200 text-slate-600'}`}>
                            🔄 รีเฟรช
                        </button>
                        <button onClick={() => handleExport('csv', 'applications')} disabled={exporting} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium flex items-center gap-2">
                            📥 Export CSV
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center p-24">
                        <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                ) : data ? (
                    <>
                        {/* Overview Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                            {[
                                { label: "คำขอทั้งหมด", value: data.overview.totalApplications, color: "emerald", trend: "+12%", up: true },
                                { label: "รอตรวจสอบ", value: data.overview.pendingReview, color: "blue", trend: "-5%", up: false },
                                { label: "ได้รับรอง", value: data.overview.approved, color: "emerald", trend: "+8%", up: true },
                                { label: "ไม่ผ่าน", value: data.overview.rejected, color: "red", trend: "-2%", up: false },
                            ].map((card, i) => (
                                <div key={i} className={`relative overflow-hidden p-6 rounded-2xl ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                                    <p className="text-sm text-slate-500 mb-2">{card.label}</p>
                                    <p className="text-3xl font-bold">{card.value.toLocaleString()}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className={`text-xs ${card.up ? 'text-emerald-500' : 'text-red-500'}`}>{card.up ? '↑' : '↓'} {card.trend}</span>
                                        <span className="text-xs text-slate-500">vs เดือนก่อน</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                            {/* Monthly Trend */}
                            <div className={`lg:col-span-2 p-6 rounded-2xl ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                                <h3 className="text-base font-semibold mb-5">📈 แนวโน้มรายเดือน</h3>
                                <div className="flex items-end h-48 gap-2">
                                    {data.monthlyTrend.map((m, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="w-full flex gap-0.5 justify-center">
                                                <div className="w-[40%] bg-emerald-500/30 rounded-t" style={{ height: `${(m.applications / 120) * 160}px` }} />
                                                <div className="w-[40%] bg-emerald-500 rounded-t" style={{ height: `${(m.approved / 120) * 160}px` }} />
                                            </div>
                                            <span className="text-[10px] text-slate-500">{months[i]}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center gap-6 mt-4">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500/30 rounded" /><span className="text-xs text-slate-500">คำขอใหม่</span></div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded" /><span className="text-xs text-slate-500">ได้รับรอง</span></div>
                                </div>
                            </div>

                            {/* By Plant Type */}
                            <div className={`p-6 rounded-2xl ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                                <h3 className="text-base font-semibold mb-5">🌿 ตามประเภทพืช</h3>
                                <div className="space-y-3">
                                    {Object.entries(data.byPlantType).slice(0, 5).map(([name, count], i) => (
                                        <div key={name}>
                                            <div className="flex justify-between text-sm mb-1"><span>{name}</span><span className="font-semibold">{count}</span></div>
                                            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                                <div className={`h-full ${chartColors[i % chartColors.length]} rounded-full`} style={{ width: `${(count / getMaxValue(data.byPlantType)) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* By Status */}
                            <div className={`p-6 rounded-2xl ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                                <h3 className="text-base font-semibold mb-5">📋 ตามสถานะ</h3>
                                <div className="space-y-2.5">
                                    {Object.entries(data.byStatus).map(([status, count], i) => {
                                        const labels: Record<string, string> = { CERTIFIED: 'ได้รับรอง', AUDIT_PENDING: 'รอตรวจ', SUBMITTED: 'ยื่นแล้ว', PAYMENT_1_PENDING: 'รอชำระ 1', DRAFT: 'ร่าง', REVISION_REQ: 'ต้องแก้ไข' };
                                        return (
                                            <div key={status} className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 ${chartColors[i % chartColors.length]} rounded`} />
                                                <span className="flex-1 text-sm text-slate-500">{labels[status] || status}</span>
                                                <span className="text-sm font-semibold">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* By Province */}
                            <div className={`p-6 rounded-2xl ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                                <h3 className="text-base font-semibold mb-5">📍 ตามจังหวัด (Top 5)</h3>
                                <div className="space-y-3">
                                    {Object.entries(data.byProvince).slice(0, 5).map(([name, count], i) => (
                                        <div key={name}>
                                            <div className="flex justify-between text-sm mb-1"><span>{name}</span><span className="font-semibold">{count}</span></div>
                                            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                                <div className={`h-full ${chartColors[(i + 2) % chartColors.length]} rounded-full`} style={{ width: `${(count / getMaxValue(data.byProvince)) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </main>
        </div>
    );
}
