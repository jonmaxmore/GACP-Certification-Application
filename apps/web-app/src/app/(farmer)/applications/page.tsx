"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api-client";

interface Application { _id: string; applicationNumber?: string; status: string; createdAt: string; plantType?: string; }

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string; bgGradient: string }> = {
    DRAFT: { label: "ร่าง", color: "slate", icon: "📝", bgGradient: "from-slate-500 to-slate-600" },
    PAYMENT_1_PENDING: { label: "รอชำระงวด 1", color: "amber", icon: "💳", bgGradient: "from-amber-500 to-orange-500" },
    SUBMITTED: { label: "รอตรวจเอกสาร", color: "blue", icon: "🔍", bgGradient: "from-blue-500 to-indigo-500" },
    REVISION_REQ: { label: "ต้องแก้ไข", color: "red", icon: "⚠️", bgGradient: "from-red-500 to-rose-500" },
    PAYMENT_2_PENDING: { label: "รอชำระงวด 2", color: "amber", icon: "💳", bgGradient: "from-amber-500 to-orange-500" },
    AUDIT_PENDING: { label: "รอตรวจสถานที่", color: "violet", icon: "🏭", bgGradient: "from-violet-500 to-purple-500" },
    AUDIT_SCHEDULED: { label: "นัดตรวจแล้ว", color: "cyan", icon: "📅", bgGradient: "from-cyan-500 to-teal-500" },
    CERTIFIED: { label: "ได้รับการรับรอง", color: "emerald", icon: "🏆", bgGradient: "from-emerald-500 to-green-500" },
};

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

    if (!user || !mounted) return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-stone-50 via-emerald-50/30 to-stone-100'}`}>
            <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-emerald-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
        </div>
    );

    const navItems = [
        { href: "/dashboard", icon: "🏠", label: "หน้าหลัก" },
        { href: "/applications", icon: "📄", label: "คำขอ", active: true },
        { href: "/tracking", icon: "🧭", label: "ติดตาม" },
        { href: "/payments", icon: "💳", label: "การเงิน" },
        { href: "/profile", icon: "👤", label: "โปรไฟล์" },
    ];

    return (
        <div className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-gradient-to-br from-stone-50 via-emerald-50/30 to-stone-100 text-slate-900'}`}>
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-200/40'}`} />
                <div className={`absolute top-1/2 -left-40 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-emerald-900/10' : 'bg-emerald-100/50'}`} />
            </div>

            {/* Sidebar - Glassmorphism */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-[76px] flex-col items-center py-6 border-r z-50 backdrop-blur-xl ${isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/70 border-slate-200/50'}`}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl font-bold text-white mb-8 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300">
                    G
                </div>
                <nav className="flex-1 flex flex-col gap-2 w-full px-2">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className={`group flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 relative ${item.active
                            ? (isDark ? 'bg-emerald-500/20 shadow-lg shadow-emerald-500/10' : 'bg-emerald-50 shadow-md shadow-emerald-500/10')
                            : 'hover:bg-slate-100/80 dark:hover:bg-slate-700/50'}`}>
                            {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-r-full" />}
                            <span className={`text-xl transition-transform duration-300 ${item.active ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                            <span className={`text-[10px] font-semibold tracking-wide ${item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-col gap-3">
                    <button onClick={toggleTheme} className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${isDark ? 'bg-emerald-500/20 hover:bg-emerald-500/30' : 'bg-emerald-50 hover:bg-emerald-100'}`}>
                        {isDark ? '☀️' : '🌙'}
                    </button>
                    <button onClick={handleLogout} className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-all duration-300">
                        🚪
                    </button>
                </div>
            </aside>

            {/* Mobile Nav - Glassmorphism */}
            <nav className={`lg:hidden fixed bottom-0 inset-x-0 h-20 flex justify-around items-center z-50 border-t backdrop-blur-xl ${isDark ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white/80 border-slate-200/50'}`}>
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 ${item.active ? (isDark ? 'bg-emerald-500/20' : 'bg-emerald-50') : ''}`}>
                        <span className={`text-xl ${item.active ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
                        <span className={`text-[10px] font-semibold ${item.active ? 'text-emerald-500' : 'text-slate-500'}`}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Main Content */}
            <main className="lg:ml-[76px] p-6 lg:p-10 pb-28 lg:pb-10 max-w-6xl relative z-10">
                {/* Header with Glass Card */}
                <header className={`flex justify-between items-center flex-wrap gap-6 mb-10 p-6 rounded-3xl backdrop-blur-sm ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                            คำขอของฉัน
                        </h1>
                        <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            จัดการคำขอรับรองมาตรฐาน GACP ทั้งหมดของคุณ
                        </p>
                    </div>
                    <Link href="/applications/new" className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all duration-300">
                        <span className="text-lg group-hover:rotate-90 transition-transform duration-300">➕</span>
                        ยื่นคำขอใหม่
                    </Link>
                </header>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "ทั้งหมด", value: applications.length, icon: "📊", color: "from-slate-500 to-slate-600" },
                        { label: "กำลังดำเนินการ", value: applications.filter(a => !['DRAFT', 'CERTIFIED'].includes(a.status)).length, icon: "⏳", color: "from-amber-500 to-orange-500" },
                        { label: "ได้รับรอง", value: applications.filter(a => a.status === 'CERTIFIED').length, icon: "🏆", color: "from-emerald-500 to-green-500" },
                        { label: "ร่าง", value: applications.filter(a => a.status === 'DRAFT').length, icon: "📝", color: "from-blue-500 to-indigo-500" },
                    ].map((stat, i) => (
                        <div key={i} className={`p-5 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/60 border-slate-200/50'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</span>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg shadow-lg`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Applications List */}
                {loading ? (
                    <div className={`rounded-3xl p-16 text-center backdrop-blur-sm ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/60 border border-slate-200/50'}`}>
                        <div className="relative w-16 h-16 mx-auto mb-6">
                            <div className="w-full h-full border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                        <p className="text-slate-500 font-medium">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : applications.length > 0 ? (
                    <div className="space-y-4">
                        {applications.map((app, index) => {
                            const statusInfo = STATUS_CONFIG[app.status] || { label: app.status, color: 'slate', icon: '📄', bgGradient: 'from-slate-500 to-slate-600' };
                            return (
                                <div
                                    key={app._id}
                                    className={`group p-6 rounded-3xl backdrop-blur-sm border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/30' : 'bg-white/60 border-slate-200/50 hover:border-emerald-300'}`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex justify-between items-center flex-wrap gap-4">
                                        <div className="flex items-center gap-5">
                                            {/* Status Icon with Gradient */}
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${statusInfo.bgGradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                {statusInfo.icon}
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold tracking-wide">
                                                    {app.applicationNumber || `#${app._id.slice(-6).toUpperCase()}`}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        📅 {new Date(app.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    {app.plantType && (
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                            🌿 {app.plantType}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Status Badge */}
                                            <span className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide bg-gradient-to-r ${statusInfo.bgGradient} text-white shadow-lg`}>
                                                {statusInfo.label}
                                            </span>
                                            {/* View Button */}
                                            <Link
                                                href={`/applications/${app._id}`}
                                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${isDark ? 'bg-slate-700 text-slate-200 hover:bg-emerald-600 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-emerald-500 hover:text-white'}`}
                                            >
                                                ดูรายละเอียด →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={`rounded-3xl p-20 text-center backdrop-blur-sm ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/60 border border-slate-200/50'}`}>
                        {/* Empty State Illustration */}
                        <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                            <span className="text-6xl">📋</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                            ยังไม่มีคำขอ
                        </h3>
                        <p className={`text-sm mb-8 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            เริ่มต้นยื่นคำขอรับรองมาตรฐาน GACP เพื่อรับการรับรองจากกรมการแพทย์แผนไทยฯ
                        </p>
                        <Link href="/applications/new" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-bold text-lg shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:-translate-y-2 transition-all duration-300">
                            <span className="text-xl">➕</span>
                            ยื่นคำขอแรกของคุณ
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
