"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient as api } from "@/lib/api";
import {
    IconHome, IconDocument, IconCompass, IconCreditCard, IconUser,
    IconSun, IconMoon, IconLogout, IconPlus, IconChevronRight,
    IconDraft, IconCreditCard as IconPayment, IconSearch, IconWarning,
    IconBuilding, IconCalendar, IconCertificate, IconChart, IconClock, IconLeaf
} from "@/components/ui/icons";

interface Application { _id: string; applicationNumber?: string; status: string; createdAt: string; plantType?: string; }

const STATUS_CONFIG: Record<string, { label: string; Icon: React.FC<{ size?: number; className?: string }>; bgClass: string }> = {
    DRAFT: { label: "ร่าง", Icon: IconDraft, bgClass: "bg-slate-500" },
    PAYMENT_1_PENDING: { label: "รอชำระงวด 1", Icon: IconPayment, bgClass: "bg-amber-500" },
    SUBMITTED: { label: "รอตรวจเอกสาร", Icon: IconSearch, bgClass: "bg-blue-500" },
    REVISION_REQ: { label: "ต้องแก้ไข", Icon: IconWarning, bgClass: "bg-red-500" },
    PAYMENT_2_PENDING: { label: "รอชำระงวด 2", Icon: IconPayment, bgClass: "bg-amber-500" },
    AUDIT_PENDING: { label: "รอตรวจสถานที่", Icon: IconBuilding, bgClass: "bg-violet-500" },
    AUDIT_SCHEDULED: { label: "นัดตรวจแล้ว", Icon: IconCalendar, bgClass: "bg-cyan-500" },
    CERTIFIED: { label: "ได้รับการรับรอง", Icon: IconCertificate, bgClass: "bg-emerald-500" },
};

const NAV_ITEMS = [
    { href: "/dashboard", Icon: IconHome, label: "หน้าหลัก" },
    { href: "/applications", Icon: IconDocument, label: "คำขอ", active: true },
    { href: "/establishments", Icon: IconLeaf, label: "แปลงปลูก" },
    { href: "/tracking", Icon: IconCompass, label: "ติดตาม" },
    { href: "/payments", Icon: IconCreditCard, label: "การเงิน" },
    { href: "/profile", Icon: IconUser, label: "โปรไฟล์" },
];

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
        const result = await api.get<Application[]>("/applications/my");
        if (result.success && result.data) {
            const apps = Array.isArray(result.data) ? result.data : (result.data as any).data || [];
            setApplications(apps);
        }
        setLoading(false);
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };

    if (!user || !mounted) return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-stone-50'}`}>
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const stats = [
        { label: "ทั้งหมด", value: applications.length, Icon: IconChart, color: "bg-slate-600" },
        { label: "กำลังดำเนินการ", value: applications.filter(a => !['DRAFT', 'CERTIFIED'].includes(a.status)).length, Icon: IconClock, color: "bg-amber-500" },
        { label: "ได้รับรอง", value: applications.filter(a => a.status === 'CERTIFIED').length, Icon: IconCertificate, color: "bg-emerald-500" },
        { label: "ร่าง", value: applications.filter(a => a.status === 'DRAFT').length, Icon: IconDraft, color: "bg-blue-500" },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-stone-50 text-slate-900'}`}>
            {/* Sidebar - Clean iOS Style */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-6 border-r ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-lg font-semibold text-white mb-8">
                    G
                </div>
                <nav className="flex-1 flex flex-col gap-1 w-full px-3">
                    {NAV_ITEMS.map(item => (
                        <Link key={item.href} href={item.href}
                            className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all relative ${item.active
                                ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                                }`}>
                            {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-emerald-500 rounded-r" />}
                            <item.Icon size={22} className={item.active ? '' : ''} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-col gap-2">
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
                    </button>
                    <button onClick={handleLogout} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'}`}>
                        <IconLogout size={20} />
                    </button>
                </div>
            </aside>

            {/* Mobile Nav - iOS Tab Bar Style */}
            <nav className={`lg:hidden fixed bottom-0 inset-x-0 h-20 flex justify-around items-center border-t safe-area-pb ${isDark ? 'bg-slate-900/95 border-slate-800 backdrop-blur-lg' : 'bg-white/95 border-slate-200 backdrop-blur-lg'}`}>
                {NAV_ITEMS.map(item => (
                    <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2 px-4 min-w-[64px] ${item.active
                        ? 'text-emerald-500'
                        : (isDark ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                        <item.Icon size={24} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Main Content */}
            <main className="lg:ml-20 p-6 lg:p-8 pb-28 lg:pb-8 max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-start flex-wrap gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">คำขอของฉัน</h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            จัดการคำขอรับรองมาตรฐาน GACP
                        </p>
                    </div>
                    <Link href="/applications/new" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors shadow-sm">
                        <IconPlus size={18} />
                        ยื่นคำขอใหม่
                    </Link>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className={`p-4 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</span>
                                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                                    <stat.Icon size={16} className="text-white" />
                                </div>
                            </div>
                            <p className="text-2xl font-semibold">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Applications List */}
                {loading ? (
                    <div className={`rounded-xl p-16 text-center border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>กำลังโหลดข้อมูล...</p>
                    </div>
                ) : applications.length > 0 ? (
                    <div className="space-y-3">
                        {applications.map((app) => {
                            const statusInfo = STATUS_CONFIG[app.status] || { label: app.status, Icon: IconDocument, bgClass: 'bg-slate-500' };
                            const StatusIcon = statusInfo.Icon;
                            return (
                                <div key={app._id} className={`group flex justify-between items-center p-4 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/30' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-xl ${statusInfo.bgClass} flex items-center justify-center shadow-sm`}>
                                            <StatusIcon size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{app.applicationNumber || `#${app._id.slice(-6).toUpperCase()}`}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {new Date(app.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                                {app.plantType && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-md flex items-center gap-1 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                        <IconLeaf size={12} />
                                                        {app.plantType}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`hidden sm:inline-block px-3 py-1.5 rounded-lg text-xs font-medium ${statusInfo.bgClass} text-white`}>
                                            {statusInfo.label}
                                        </span>
                                        <Link href={`/applications/${app._id}`} className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-slate-700 text-slate-200 hover:bg-emerald-600 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white'}`}>
                                            ดูรายละเอียด
                                            <IconChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={`rounded-xl p-16 text-center border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-100 flex items-center justify-center">
                            <IconDocument size={32} className="text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">ยังไม่มีคำขอ</h3>
                        <p className={`text-sm mb-6 max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            เริ่มต้นยื่นคำขอรับรองมาตรฐาน GACP เพื่อรับการรับรองจากกรมการแพทย์แผนไทยฯ
                        </p>
                        <Link href="/applications/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
                            <IconPlus size={18} />
                            ยื่นคำขอแรกของคุณ
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}

