"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api-client";

interface Application { _id: string; applicationNumber?: string; status: string; createdAt: string; }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "ร่าง", color: "slate" },
    PAYMENT_1_PENDING: { label: "รอชำระงวด 1", color: "amber" },
    SUBMITTED: { label: "รอตรวจเอกสาร", color: "blue" },
    REVISION_REQ: { label: "ต้องแก้ไข", color: "red" },
    PAYMENT_2_PENDING: { label: "รอชำระงวด 2", color: "amber" },
    AUDIT_PENDING: { label: "รอตรวจสถานที่", color: "violet" },
    AUDIT_SCHEDULED: { label: "นัดตรวจแล้ว", color: "cyan" },
    CERTIFIED: { label: "ได้รับรอง", color: "emerald" },
};

const getStatusClasses = (color: string) => ({
    badge: `px-3 py-1 rounded-full text-xs font-medium ${color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : color === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : color === 'violet' ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400' : color === 'cyan' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`
});

export default function ApplicationsPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ firstName?: string } | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) { window.location.href = "/login"; return; }
        try { setUser(JSON.parse(userData)); loadApplications(); } catch { window.location.href = "/login"; }
    }, []);

    const loadApplications = async () => {
        setLoading(true);
        const result = await api.get<{ data: Application[] }>("/v2/applications/my");
        if (result.success && result.data?.data) setApplications(result.data.data);
        setLoading(false);
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };

    if (!user || !mounted) return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-stone-50'}`}><div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /></div>;

    const navItems = [
        { href: "/dashboard", icon: "🏠", label: "หน้าหลัก" },
        { href: "/applications", icon: "📄", label: "คำขอ", active: true },
        { href: "/tracking", icon: "🧭", label: "ติดตาม" },
        { href: "/payments", icon: "💳", label: "การเงิน" },
        { href: "/profile", icon: "👤", label: "โปรไฟล์" },
    ];

    return (
        <div className={`min-h-screen font-[Kanit] transition-all ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-stone-50 text-slate-900'}`}>
            {/* Sidebar */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] flex-col items-center py-5 border-r ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
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

            {/* Mobile Nav */}
            <nav className={`lg:hidden fixed bottom-0 inset-x-0 h-[72px] flex justify-around items-center z-50 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2 px-3">
                        <span className="text-lg">{item.icon}</span>
                        <span className={`text-[10px] font-medium ${item.active ? 'text-emerald-500' : 'text-slate-500'}`}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Main */}
            <main className="lg:ml-[72px] p-6 lg:p-10 pb-24 lg:pb-10 max-w-5xl">
                <header className="flex justify-between items-center flex-wrap gap-4 mb-7">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-medium">คำขอของฉัน</h1>
                        <p className="text-sm text-slate-500 mt-1">รายการคำขอรับรองมาตรฐาน GACP ทั้งหมด</p>
                    </div>
                    <Link href="/applications/new" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/30">
                        ➕ ยื่นคำขอใหม่
                    </Link>
                </header>

                {loading ? (
                    <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                        <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                        <p className="mt-4 text-slate-500">กำลังโหลด...</p>
                    </div>
                ) : applications.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {applications.map(app => {
                            const statusInfo = STATUS_CONFIG[app.status] || { label: app.status, color: 'slate' };
                            const statusCls = getStatusClasses(statusInfo.color);
                            return (
                                <div key={app._id} className={`flex justify-between items-center flex-wrap gap-4 p-5 rounded-2xl ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-13 h-13 rounded-xl flex items-center justify-center text-xl ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-50'}`}>📄</div>
                                        <div>
                                            <p className="text-base font-medium">{app.applicationNumber || `#${app._id.slice(-6).toUpperCase()}`}</p>
                                            <p className="text-xs text-slate-500 mt-1">{new Date(app.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={statusCls.badge}>{statusInfo.label}</span>
                                        <Link href={`/applications/${app._id}`} className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>ดูรายละเอียด</Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={`rounded-2xl p-16 text-center ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-4xl ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-50'}`}>📄</div>
                        <h3 className="text-lg font-medium mb-2">ยังไม่มีคำขอ</h3>
                        <p className="text-sm text-slate-500 mb-5">เริ่มต้นยื่นคำขอรับรองมาตรฐาน GACP</p>
                        <Link href="/applications/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/30">
                            ➕ ยื่นคำขอใหม่
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
