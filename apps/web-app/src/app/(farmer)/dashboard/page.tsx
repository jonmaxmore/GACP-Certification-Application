"use client";

// ... imports
import { useEffect, useState } from "react";
import Link from "next/link";
import { ApplicationService, Application } from "@/lib/services/application-service";
import { AuthService } from "@/lib/services/auth-service";
import { useRouter } from "next/navigation";
import { IconLeaf, IconDocument, IconCheckCircle, IconClock, IconSearch, IconWarning } from "@/components/ui/icons";

interface User { id: string; firstName?: string; lastName?: string; companyName?: string; accountType?: string; }

const STATUS_MAP: Record<string, { label: string; color: string; ring: string; bg: string }> = {
    DRAFT: { label: "ร่างคำขอ", color: "text-slate-600", ring: "ring-slate-200", bg: "bg-slate-50" },
    SUBMITTED: { label: "รอตรวจเอกสาร", color: "text-blue-600", ring: "ring-blue-200", bg: "bg-blue-50" },
    PAYMENT_1_PENDING: { label: "รอชำระค่าธรรมเนียม", color: "text-amber-600", ring: "ring-amber-200", bg: "bg-amber-50" },
    PAID_PHASE_1: { label: "ชำระเงินแล้ว (งวด 1)", color: "text-emerald-600", ring: "ring-emerald-200", bg: "bg-emerald-50" },
    REVISION_REQUIRED: { label: "ต้องแก้ไขเอกสาร", color: "text-red-600", ring: "ring-red-200", bg: "bg-red-50" },
    DOCUMENT_APPROVED: { label: "เอกสารผ่านการตรวจสอบ", color: "text-indigo-600", ring: "ring-indigo-200", bg: "bg-indigo-50" },
    PENDING_AUDIT: { label: "รอตรวจประเมิน", color: "text-purple-600", ring: "ring-purple-200", bg: "bg-purple-50" },
    APPROVED: { label: "ได้รับการรับรอง", color: "text-green-600", ring: "ring-green-200", bg: "bg-green-50" },
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, certified: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const sessionUser = AuthService.getUser();
        if (!sessionUser) { router.push("/login"); return; }
        setUser(sessionUser);
        fetchDashboardData();
    }, [router]);

    const fetchDashboardData = async () => {
        try {
            const appRes = await ApplicationService.getMyApplications();

            if (appRes.success && appRes.data) {
                const apps = (Array.isArray(appRes.data) ? appRes.data : (appRes.data as any).data || []) as Application[];
                setApplications(apps);
                setStats({
                    total: apps.length,
                    active: apps.filter(a => !['APPROVED', 'REJECTED'].includes(a.status)).length,
                    certified: apps.filter(a => a.status === 'APPROVED').length
                });
            }
        } catch (e) {
            console.error(e);
            // Fallback for Demo if API fails
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getGreeting = () => {
        const h = new Date().getHours();
        return h < 12 ? "สวัสดีตอนเช้า" : h < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";
    };

    if (!user || isLoading) return <div className="p-8"><div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto"></div></div>;

    const activeApp = applications[0]; // Simplified for Demo: Show latest

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            {/* 1. Hero Section (Gradient Card) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white shadow-xl shadow-emerald-200">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className="text-emerald-50 mb-1 font-medium">{getGreeting()},</p>
                        <h1 className="text-3xl font-bold tracking-tight">{user.firstName} {user.lastName}</h1>
                        <p className="text-sm text-emerald-100 opacity-90 mt-1">{user.companyName || 'เกษตรกรผู้ปลูกสมุนไพร'}</p>
                    </div>
                    <div>
                        <Link
                            href="/applications/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            <IconLeaf className="w-5 h-5" />
                            ยื่นคำขอใหม่
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. Status Overview (Glass Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "คำขอทั้งหมด", value: stats.total, color: "text-slate-600", bg: "bg-white", icon: IconDocument },
                    { label: "กำลังดำเนินการ", value: stats.active, color: "text-amber-600", bg: "bg-amber-50", icon: IconClock },
                    { label: "รอตรวจแปลง", value: 0, color: "text-purple-600", bg: "bg-purple-50", icon: IconSearch }, // Mock
                    { label: "ใบรับรอง", value: stats.certified, color: "text-emerald-600", bg: "bg-emerald-50", icon: IconCheckCircle },
                ].map((stat, i) => (
                    <div key={i} className={`p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md ${stat.bg}`}>
                        <stat.icon className={`w-8 h-8 mb-2 opacity-80 ${stat.color}`} />
                        <span className="text-3xl font-bold text-slate-800">{stat.value}</span>
                        <span className="text-xs font-medium text-slate-500 mt-1">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* 3. Action Center (Active Application) */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                        รายการล่าสุด
                    </h2>

                    {activeApp ? (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden group hover:border-emerald-200 transition-all">
                            <div className="p-6 border-b border-slate-50 flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-800">คำขอใบรับรอง GACP</h3>
                                    <p className="text-sm text-slate-500 font-mono mt-0.5">#{activeApp._id?.slice(-8).toUpperCase()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${STATUS_MAP[activeApp.status]?.bg || 'bg-slate-100'} ${STATUS_MAP[activeApp.status]?.color || 'text-slate-600'} ${STATUS_MAP[activeApp.status]?.ring || 'ring-slate-200'}`}>
                                    {STATUS_MAP[activeApp.status]?.label || activeApp.status}
                                </span>
                            </div>
                            <div className="p-6 bg-slate-50/50">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">ดำเนินการล่าสุด</span>
                                        <span className="text-sm font-medium text-slate-700">
                                            {new Date(activeApp.updatedAt || activeApp.createdAt).toLocaleDateString('th-TH', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/applications/new?step=${activeApp.status === 'PAYMENT_1_PENDING' ? 6 : activeApp.status === 'PAID_PHASE_1' ? 8 : 0}`}
                                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-all"
                                    >
                                        ดำเนินการต่อ →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IconDocument className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-medium">ยังไม่มีคำขอใบรับรอง</h3>
                            <p className="text-slate-500 text-sm mt-1">เริ่มต้นยื่นคำขอแรกของคุณได้เลย</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800">เมนูด่วน</h2>
                    <div className="grid gap-3">
                        <button className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><IconDocument /></div>
                            <div>
                                <h4 className="font-bold text-slate-700 text-sm">คู่มือการใช้งาน</h4>
                                <p className="text-xs text-slate-500">สำหรับเกษตรกร</p>
                            </div>
                        </button>
                        <button className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><IconWarning /></div>
                            <div>
                                <h4 className="font-bold text-slate-700 text-sm">แจ้งปัญหา</h4>
                                <p className="text-xs text-slate-500">ติดต่อเจ้าหน้าที่</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
