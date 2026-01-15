"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient as api } from "@/lib/api/api-client";
import { AuthService } from "@/lib/services/auth-service";
import {
    IconDocument, IconPlus, IconChevronRight,
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

export default function ApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");

        const user = AuthService.getUser();
        if (!user) {
            router.push("/login");
            return;
        }

        loadApplications();
    }, [router]);

    const loadApplications = async () => {
        setLoading(true);
        const result = await api.get<Application[]>("/applications/my");
        if (result.success && result.data) {
            const apps = Array.isArray(result.data) ? result.data : (result.data as any).data || [];
            setApplications(apps);
        }
        setLoading(false);
    };

    if (!mounted) return (
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
        <div className="space-y-8 animate-fade-in">
            {/* Header with Official Gradient */}
            <div className="bg-gradient-to-br from-[#006837] to-[#004d28] rounded-[2rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-[url('/images/thai-pattern-bg.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-emerald-400/20 to-transparent"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black mb-2 tracking-tight">คำขอของฉัน</h1>
                        <p className="text-emerald-100 font-medium">จัดการและติดตามสถานะการรับรองมาตรฐาน GACP</p>
                    </div>
                    <Link href="/farmer/applications/new" className="bg-white text-[#006837] px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 shadow-lg shadow-black/10 transition-all flex items-center gap-2">
                        <IconPlus size={20} />
                        ยื่นคำขอใหม่
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                            <div className={`w-10 h-10 rounded-xl ${stat.color.replace('bg-', 'bg-')}/10 flex items-center justify-center text-${stat.color.replace('bg-', '')}`}>
                                <stat.Icon size={20} className={stat.color.replace('bg-', 'text-')} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800 group-hover:scale-110 transition-transform origin-left">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Applications List */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูล...</p>
                </div>
            ) : applications.length > 0 ? (
                <div className="space-y-4">
                    {applications.map((app) => {
                        const statusInfo = STATUS_CONFIG[app.status] || { label: app.status, Icon: IconDocument, bgClass: 'bg-slate-500' };
                        const StatusIcon = statusInfo.Icon;
                        return (
                            <div key={app._id} className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-[#006837]/20 transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className={`w-16 h-16 rounded-2xl ${statusInfo.bgClass} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform`}>
                                            <StatusIcon size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                                    {app.applicationNumber || `#${app._id.slice(-6).toUpperCase()}`}
                                                </h3>
                                                {app.plantType && (
                                                    <span className="bg-emerald-50 text-[#006837] px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-100">
                                                        <IconLeaf size={10} />
                                                        {app.plantType}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium">
                                                ยื่นระเบียบ: {new Date(app.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                        <div className={`px-4 py-2 rounded-xl text-sm font-bold ${statusInfo.bgClass.replace('bg-', 'bg-')}/10 ${statusInfo.bgClass.replace('bg-', 'text-')}`}>
                                            {statusInfo.label}
                                        </div>
                                        <Link href={`/farmer/applications/${app._id}`} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#006837] hover:text-white transition-all">
                                            <IconChevronRight size={20} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-emerald-50 flex items-center justify-center">
                        <IconFolderOpen size={40} className="text-[#006837]" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">เริ่มสร้างคำขอแรกของคุณ</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        ระบบจะช่วยแนะนำคุณทุกขั้นตอนในการขอรับรองมาตรฐาน GACP Thailand
                    </p>
                    <Link href="/farmer/applications/new" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#006837] text-white font-bold hover:bg-[#00502b] shadow-lg shadow-emerald-600/30 transition-all">
                        <IconPlus size={20} />
                        เริ่มยื่นคำขอ
                    </Link>
                </div>
            )}
        </div>
    );
}
// Helper icon for empty state
const IconFolderOpen = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
);
