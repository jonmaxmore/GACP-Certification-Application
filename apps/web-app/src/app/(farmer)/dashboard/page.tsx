"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient as api } from "@/lib/api";

// SVG Icons
const Icons = {
    home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    fileText: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    creditCard: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    bell: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    user: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>,
    plus: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    logout: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /></svg>,
    check: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
    file: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>,
    clock: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    award: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
    alertTriangle: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    compass: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
};

interface User { id: string; firstName?: string; lastName?: string; companyName?: string; accountType?: string; }
interface Application { _id: string; applicationNumber?: string; status: string; createdAt: string; }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "ร่าง", color: "#6B7280" },
    PAYMENT_1_PENDING: { label: "รอชำระเงินงวด 1", color: "#F59E0B" },
    SUBMITTED: { label: "รอตรวจเอกสาร", color: "#3B82F6" },
    REVISION_REQ: { label: "ต้องแก้ไข", color: "#EF4444" },
    PAYMENT_2_PENDING: { label: "รอชำระเงินงวด 2", color: "#F59E0B" },
    AUDIT_PENDING: { label: "รอตรวจสถานที่", color: "#8B5CF6" },
    AUDIT_SCHEDULED: { label: "นัดตรวจแล้ว", color: "#06B6D4" },
    CERTIFIED: { label: "ได้รับการรับรอง", color: "#16A34A" },
};

const STEPS = [
    { id: 1, label: "ยื่นคำขอ" }, { id: 2, label: "ชำระงวด 1" }, { id: 3, label: "ตรวจเอกสาร" },
    { id: 4, label: "ชำระงวด 2" }, { id: 5, label: "ตรวจสถานที่" }, { id: 6, label: "รับรอง" },
];

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) {
            setIsRedirecting(true);
            // Clear any stale cookies by calling logout API before redirect
            fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
                window.location.href = "/login";
            });
            return;
        }
        try { setUser(JSON.parse(userData)); loadApplications(); }
        catch {
            setIsRedirecting(true);
            fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
                window.location.href = "/login";
            });
        }
    }, []);


    const toggleTheme = () => { const newTheme = !isDark; setIsDark(newTheme); localStorage.setItem("theme", newTheme ? "dark" : "light"); };

    const loadApplications = async () => {
        setLoadError(null);
        try {
            const result = await api.get<Application[]>("/applications/my");
            if (result.success && result.data) {
                // Handle both array response and nested data response
                const apps = Array.isArray(result.data) ? result.data : (result.data as any).data || [];
                setApplications(apps);
            } else {
                setLoadError("ไม่สามารถโหลดข้อมูลคำขอได้");
            }
        } catch (error) {
            console.error('[Dashboard] Load applications error:', error);
            setLoadError("ไม่สามารถโหลดข้อมูลคำขอได้");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user"); localStorage.removeItem("gacp_wizard_state"); sessionStorage.clear();
        window.location.href = "/api/auth/logout";
    };

    const getDisplayName = () => {
        if (!user) return "";
        if (user.accountType === "JURISTIC" && user.companyName) return user.companyName;
        return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "ผู้ใช้";
    };

    const getGreeting = (): string => {
        const h = new Date().getHours();
        if (h >= 5 && h < 12) return "สวัสดีตอนเช้า";
        if (h >= 12 && h < 17) return "สวัสดีตอนบ่าย";
        if (h >= 17 && h < 21) return "สวัสดีตอนเย็น";
        return "สวัสดี";
    };

    const latestApp = applications[0];
    const statusInfo = latestApp ? STATUS_CONFIG[latestApp.status] || STATUS_CONFIG.DRAFT : null;
    const getCurrentStep = (s: string): number => {
        switch (s) {
            case "DRAFT": return 1; case "PAYMENT_1_PENDING": return 2; case "SUBMITTED": case "REVISION_REQ": return 3;
            case "PAYMENT_2_PENDING": return 4; case "AUDIT_PENDING": case "AUDIT_SCHEDULED": return 5; case "CERTIFIED": return 6; default: return 0;
        }
    };
    const currentStep = latestApp ? getCurrentStep(latestApp.status) : 0;

    const navItems = [
        { href: "/dashboard", icon: Icons.home, label: "หน้าหลัก", active: true },
        { href: "/applications", icon: Icons.fileText, label: "คำขอ" },
        { href: "/certificates", icon: Icons.award, label: "ใบรับรอง" },
        { href: "/tracking", icon: Icons.compass, label: "ติดตาม" },
        { href: "/payments", icon: Icons.creditCard, label: "การเงิน" },
        { href: "/profile", icon: Icons.user, label: "โปรไฟล์" },
    ];

    const accentColor = isDark ? "#10B981" : "#16A34A";
    const mutedColor = isDark ? "#64748B" : "#9CA3AF";

    if (!user || !mounted || isRedirecting) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-stone-50'}`}>
                <div className="p-8 max-w-6xl ml-20 animate-pulse">
                    <div className="flex justify-between items-center mb-8">
                        <div><div className={`w-24 h-4 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded mb-2`} /><div className={`w-48 h-8 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded`} /></div>
                        <div className={`w-32 h-11 ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'} rounded-xl`} />
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-7">
                        {[1, 2, 3, 4].map(i => <div key={i} className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl p-5`}><div className={`w-20 h-3 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded mb-3`} /><div className={`w-14 h-10 ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-100'} rounded`} /></div>)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-stone-50 text-slate-800'}`}>
            {/* Sidebar - Desktop */}
            <aside className={`fixed left-0 top-0 bottom-0 w-[72px] border-r flex flex-col items-center py-5 transition-colors hidden lg:flex ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-semibold text-xl mb-8">G</div>
                <nav className="flex-1 flex flex-col gap-1 w-full">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-3 relative">
                            {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-emerald-500 rounded-r" />}
                            {item.icon(item.active ? accentColor : mutedColor)}
                            <span className={`text-[10px] font-medium ${item.active ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-col items-center gap-3">
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-emerald-900/30 hover:bg-emerald-900/50' : 'bg-emerald-50 hover:bg-emerald-100'}`}>
                        {isDark ? Icons.sun(accentColor) : Icons.moon(accentColor)}
                    </button>
                    <button onClick={handleLogout} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700">
                        {Icons.logout(mutedColor)}
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className={`fixed bottom-0 left-0 right-0 h-[72px] border-t flex justify-around items-center px-4 z-50 lg:hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2 px-3">
                        {item.icon(item.active ? accentColor : mutedColor)}
                        <span className={`text-[10px] font-medium ${item.active ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Main Content */}
            <main className="lg:ml-[72px] p-6 lg:p-8 max-w-6xl pb-24 lg:pb-8">
                {/* Header */}
                <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <div>
                        <p className={`text-sm mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{getGreeting()}</p>
                        <h1 className="text-2xl lg:text-3xl font-medium">{getDisplayName()}</h1>
                    </div>
                    <Link href="/applications/new" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 transition-transform">
                        {Icons.plus("#FFF")} ยื่นคำขอใหม่
                    </Link>
                </header>

                {/* Error State */}
                {loadError && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center justify-between ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-100'}`}>
                        <div className="flex items-center gap-3">
                            {Icons.alertTriangle("#EF4444")}
                            <span className="text-red-500 text-sm">{loadError}</span>
                        </div>
                        <button onClick={loadApplications} className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg font-medium hover:bg-red-600">ลองใหม่</button>
                    </div>
                )}

                {/* Payment Pending Card */}
                {latestApp && ['PAYMENT_1_PENDING', 'PAYMENT_2_PENDING'].includes(latestApp.status) && (
                    <div className={`rounded-2xl p-6 mb-7 flex flex-wrap items-center justify-between gap-5 ${isDark ? 'bg-amber-900/20 border border-amber-800/50' : 'bg-amber-50 border border-amber-200'}`}>
                        <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">{Icons.creditCard("#F59E0B")}</div>
                            <div>
                                <h3 className="font-semibold mb-1">{latestApp.status === 'PAYMENT_1_PENDING' ? 'รอชำระค่าธรรมเนียมงวด 1' : 'รอชำระค่าตรวจสถานที่งวด 2'}</h3>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{latestApp.status === 'PAYMENT_1_PENDING' ? 'ชำระ 5,000 บาท' : 'ชำระ 25,000 บาท'}</p>
                            </div>
                        </div>
                        <Link href="/payments" className="flex items-center gap-2 px-5 py-3 bg-amber-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-amber-500/30 hover:-translate-y-0.5 transition-transform">
                            {Icons.creditCard("#FFF")} ไปชำระเงิน
                        </Link>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                    {[
                        { icon: Icons.file, label: "คำขอทั้งหมด", value: applications.length },
                        { icon: Icons.clock, label: "รอดำเนินการ", value: applications.filter(a => !["CERTIFIED", "DRAFT"].includes(a.status)).length },
                        { icon: Icons.award, label: "ได้รับรองแล้ว", value: applications.filter(a => a.status === "CERTIFIED").length },
                        { icon: Icons.alertTriangle, label: "หมดอายุ", value: 0 },
                    ].map((stat, i) => (
                        <div key={i} className={`rounded-2xl p-5 border transition-all hover:-translate-y-0.5 hover:shadow-lg ${isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</span>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>{stat.icon(accentColor)}</div>
                            </div>
                            <div className="text-3xl font-semibold text-emerald-500">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className={`rounded-2xl p-7 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <h2 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>สถานะปัจจุบัน</h2>
                                    <p className="text-2xl font-medium">{latestApp ? (latestApp.applicationNumber || `#${latestApp._id.slice(-6).toUpperCase()}`) : "ยังไม่มีคำขอ"}</p>
                                </div>
                                {statusInfo && (
                                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${statusInfo.color}15`, color: statusInfo.color, border: `1px solid ${statusInfo.color}30` }}>
                                        {statusInfo.label}
                                    </span>
                                )}
                            </div>
                            {!latestApp && (
                                <div className="text-center py-8">
                                    <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>{Icons.file(accentColor)}</div>
                                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>เริ่มต้นยื่นคำขอใบรับรอง GACP</p>
                                </div>
                            )}
                        </div>

                        {/* Stepper */}
                        <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h3 className={`text-sm font-medium mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ขั้นตอนการดำเนินการ</h3>
                            <div className="relative mb-5">
                                <div className={`h-1 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                                <div className="absolute top-0 left-0 h-1 rounded bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />
                            </div>
                            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                                {STEPS.map(step => {
                                    const isDone = step.id < currentStep;
                                    const isCurrent = step.id === currentStep;
                                    return (
                                        <div key={step.id} className="text-center">
                                            <div className={`w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500' : isCurrent ? (isDark ? 'bg-emerald-900/50 border-2 border-emerald-500' : 'bg-emerald-50 border-2 border-emerald-500') : (isDark ? 'bg-slate-700' : 'bg-slate-200')}`}>
                                                {isDone ? Icons.check("#FFF") : <span className={`text-sm font-medium ${isCurrent ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{step.id}</span>}
                                            </div>
                                            <span className={`text-[10px] ${isCurrent ? 'text-emerald-500 font-semibold' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Activity */}
                        <div className={`rounded-2xl p-6 border flex-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>กิจกรรมล่าสุด</h3>
                                <Link href="/notifications" className="text-xs text-emerald-500 font-medium hover:underline">ดูทั้งหมด</Link>
                            </div>
                            {applications.length > 0 ? (
                                <div className="space-y-3">
                                    {applications.slice(0, 3).map((app, i) => (
                                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${STATUS_CONFIG[app.status]?.color}15` }}>
                                                {Icons.file(STATUS_CONFIG[app.status]?.color || mutedColor)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{app.applicationNumber || `#${app._id.slice(-6)}`}</p>
                                                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{STATUS_CONFIG[app.status]?.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>{Icons.bell(accentColor)}</div>
                                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ยังไม่มีกิจกรรม</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ลิงก์ด่วน</h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                {[{ icon: Icons.fileText, label: "ดาวน์โหลดแบบฟอร์ม" }, { icon: Icons.user, label: "ติดต่อเจ้าหน้าที่" }].map((link, i) => (
                                    <Link key={i} href="#" className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors ${isDark ? 'bg-slate-700/50 border-slate-700 hover:bg-emerald-900/30 hover:border-emerald-800' : 'bg-slate-50 border-slate-100 hover:bg-emerald-50 hover:border-emerald-200'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>{link.icon(accentColor)}</div>
                                        <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
