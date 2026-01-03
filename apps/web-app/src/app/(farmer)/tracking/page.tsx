"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api-client";

const Icons = {
    home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    fileText: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    creditCard: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    user: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>,
    logout: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="5" /></svg>,
    compass: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
    compassLarge: (c: string) => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
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
    DRAFT: { label: "ร่าง", color: "#6B7280" },
    PAYMENT_1_PENDING: { label: "รอชำระเงินงวด 1", color: "#F59E0B" },
    SUBMITTED: { label: "รอตรวจเอกสาร", color: "#3B82F6" },
    REVISION_REQ: { label: "ต้องแก้ไข", color: "#EF4444" },
    PAYMENT_2_PENDING: { label: "รอชำระเงินงวด 2", color: "#F59E0B" },
    AUDIT_PENDING: { label: "รอตรวจสถานที่", color: "#8B5CF6" },
    AUDIT_SCHEDULED: { label: "นัดตรวจแล้ว", color: "#06B6D4" },
    CERTIFIED: { label: "ได้รับการรับรอง", color: "#10B981" },
};

export default function TrackingPage() {
    const [user, setUser] = useState<{ firstName?: string } | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) { window.location.href = "/login"; return; }
        try { setUser(JSON.parse(userData)); loadApplications(); }
        catch { window.location.href = "/login"; }
    }, []);

    const loadApplications = async () => {
        const result = await api.get<{ data: Application[] }>("/v2/applications/my");
        if (result.success && result.data?.data) setApplications(result.data.data);
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };
    const getStepForStatus = (status: string) => STEPS.findIndex(s => s.statuses.includes(status)) + 1;

    const accentColor = isDark ? "#10B981" : "#16A34A";
    const mutedColor = isDark ? "#64748B" : "#9CA3AF";

    if (!user || !mounted) return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-stone-50'}`}><div className="w-10 h-10 border-3 border-slate-300 border-t-emerald-500 rounded-full animate-spin" /></div>;

    const navItems = [
        { href: "/dashboard", icon: Icons.home, label: "หน้าหลัก" },
        { href: "/applications", icon: Icons.fileText, label: "คำขอ" },
        { href: "/certificates", icon: Icons.award, label: "ใบรับรอง" },
        { href: "/tracking", icon: Icons.compass, label: "ติดตาม", active: true },
        { href: "/payments", icon: Icons.creditCard, label: "การเงิน" },
        { href: "/profile", icon: Icons.user, label: "โปรไฟล์" },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-stone-50 text-slate-800'}`}>
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 bottom-0 w-[72px] border-r flex-col items-center py-5 hidden lg:flex ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
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
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>{isDark ? Icons.sun(accentColor) : Icons.moon(accentColor)}</button>
                    <button onClick={handleLogout} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700">{Icons.logout(mutedColor)}</button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className={`fixed bottom-0 left-0 right-0 h-[72px] border-t flex justify-around items-center z-50 lg:hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {navItems.map(item => <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2 px-3">{item.icon(item.active ? accentColor : mutedColor)}<span className={`text-[10px] font-medium ${item.active ? 'text-emerald-500' : 'text-slate-400'}`}>{item.label}</span></Link>)}
            </nav>

            <main className="lg:ml-[72px] p-6 lg:p-8 max-w-5xl pb-24 lg:pb-8">
                <header className="mb-8"><h1 className="text-2xl lg:text-3xl font-medium">ติดตามสถานะคำขอ</h1><p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ตรวจสอบความคืบหน้าการขอใบรับรอง GACP</p></header>

                {applications.length > 0 ? applications.map(app => {
                    const currentStep = getStepForStatus(app.status);
                    const statusInfo = STATUS_CONFIG[app.status];
                    return (
                        <div key={app._id} className={`rounded-2xl p-7 mb-5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                                <div>
                                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>เลขที่คำขอ</p>
                                    <p className="text-xl font-semibold">{app.applicationNumber || `#${app._id.slice(-6).toUpperCase()}`}</p>
                                </div>
                                <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: `${statusInfo?.color}15`, color: statusInfo?.color, border: `1px solid ${statusInfo?.color}30` }}>
                                    {statusInfo?.label}
                                </span>
                            </div>

                            {/* Progress */}
                            <div className="relative mb-6">
                                <div className={`h-1 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                                <div className="absolute top-0 left-0 h-1 rounded bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />
                            </div>

                            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                                {STEPS.map(step => {
                                    const isDone = step.id < currentStep;
                                    const isCurrent = step.id === currentStep;
                                    return (
                                        <div key={step.id} className="text-center">
                                            <div className={`w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500' : isCurrent ? (isDark ? 'bg-emerald-900/50 border-2 border-emerald-500' : 'bg-emerald-50 border-2 border-emerald-500') : (isDark ? 'bg-slate-700' : 'bg-slate-200')}`}>
                                                {isDone ? Icons.check("#FFF") : isCurrent ? Icons.clock(accentColor) : <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{step.id}</span>}
                                            </div>
                                            <span className={`text-xs ${isCurrent ? 'text-emerald-500 font-semibold' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <strong>วันที่ยื่น:</strong> {new Date(app.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    );
                }) : (
                    <div className={`rounded-2xl p-16 text-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <div className={`w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>{Icons.compassLarge(accentColor)}</div>
                        <h3 className="text-lg font-medium mb-2">ยังไม่มีคำขอที่ต้องติดตาม</h3>
                        <p className={`text-sm mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ยื่นคำขอรับรองมาตรฐาน GACP เพื่อเริ่มต้น</p>
                        <Link href="/applications/new" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-medium">ยื่นคำขอใหม่</Link>
                    </div>
                )}
            </main>
        </div>
    );
}
