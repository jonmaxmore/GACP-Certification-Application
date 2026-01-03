"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api-client";
import { formatThaiDate } from "@/utils/thai-date";

interface Application {
    id: string;
    applicantName: string;
    plantType: string;
    status: string;
    submittedAt: string;
    submissionCount?: number;
}

// 🎨 Eco-Professional Theme - Modern Pastel Colors with Icons
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    SUBMITTED: { label: "ยื่นคำขอใหม่", color: "bg-blue-100 text-blue-700 border-blue-200", icon: "📥" },
    PENDING_REVIEW: { label: "รอตรวจเอกสาร", color: "bg-amber-100 text-amber-800 border-amber-200", icon: "👀" },
    REVISION_REQUIRED: { label: "ส่งคืนแก้ไข", color: "bg-orange-100 text-orange-700 border-orange-200", icon: "📝" },
    DOCUMENT_APPROVED: { label: "เอกสารผ่าน", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: "✅" },
    PENDING_AUDIT: { label: "รอตรวจแปลง", color: "bg-purple-100 text-purple-700 border-purple-200", icon: "🚜" },
    APPROVED: { label: "รับรองแล้ว", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: "🏆" },
};

export default function StaffApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        if (!token) {
            router.push("/staff/login");
            return;
        }
        fetchApplications();
    }, [router]);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const result = await api.get<{ data: { applications: Application[] } }>('/v2/applications');
            if (result.success && result.data?.data?.applications) {
                setApplications(result.data.data.applications);
            } else {
                // Mock data for demo
                setApplications([
                    { id: "APP-67-001", applicantName: "สมชาย ใจดี", plantType: "กัญชา", status: "PENDING_REVIEW", submittedAt: "2024-12-08" },
                    { id: "APP-67-002", applicantName: "บจก. สมุนไพรไทย", plantType: "ฟ้าทะลายโจร", status: "APPROVED", submittedAt: "2024-12-05" },
                    { id: "APP-67-003", applicantName: "วิสาหกิจชุมชนแม่ริม", plantType: "ขมิ้นชัน", status: "REVISION_REQUIRED", submittedAt: "2024-12-01" },
                    { id: "APP-67-004", applicantName: "สวนลุงแดง", plantType: "กัญชง", status: "PENDING_AUDIT", submittedAt: "2024-12-10" },
                ]);
            }
        } catch {
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredApps = applications.filter(app => filter === "all" || app.status === filter);

    // 📊 Calculate stats for dashboard cards
    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'PENDING_REVIEW').length,
        audit: applications.filter(a => a.status === 'PENDING_AUDIT').length,
        approved: applications.filter(a => a.status === 'APPROVED').length,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-emerald-800 gap-4">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                <p className="animate-pulse">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800">
            {/* 🌿 Eco-Professional Navbar */}
            <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/staff/dashboard" className="p-2 rounded-full hover:bg-emerald-600 transition">
                            ← กลับ
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                🌿 ระบบตรวจสอบ GACP
                            </h1>
                            <p className="text-emerald-100 text-xs">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs">
                            จนท.
                        </div>
                        <span className="text-sm hidden sm:inline">เจ้าหน้าที่ตรวจสอบ</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* 📊 Dashboard Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="คำขอทั้งหมด" value={stats.total} icon="📂" />
                    <StatCard label="รอตรวจเอกสาร" value={stats.pending} icon="👀" highlight />
                    <StatCard label="รอตรวจแปลง" value={stats.audit} icon="🚜" />
                    <StatCard label="อนุมัติแล้ว" value={stats.approved} icon="🏆" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-700">รายการคำขอใบรับรอง</h2>

                    {/* 🎛️ Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                        {[
                            { key: "all", label: "ทั้งหมด" },
                            { key: "PENDING_REVIEW", label: "รอตรวจ" },
                            { key: "REVISION_REQUIRED", label: "แก้ไข" },
                            { key: "PENDING_AUDIT", label: "ตรวจแปลง" },
                            { key: "APPROVED", label: "อนุมัติ" },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${filter === f.key
                                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md transform scale-105"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 📋 Applications Table/Cards */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">เลขที่คำขอ</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">เกษตรกร/ผู้ยื่น</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">พืชสมุนไพร</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">สถานะ</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">วันที่ยื่น</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredApps.map(app => (
                                    <ApplicationRow key={app.id} app={app} />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {filteredApps.map(app => (
                            <ApplicationCardMobile key={app.id} app={app} />
                        ))}
                    </div>

                    {filteredApps.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            <p className="text-4xl mb-2">🍃</p>
                            <p>ไม่พบข้อมูลคำขอ</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// --- Sub Components ---

const StatCard = ({ label, value, icon, highlight = false }: {
    label: string; value: number; icon: string; highlight?: boolean
}) => (
    <div className={`p-4 rounded-xl border ${highlight
            ? 'bg-amber-50 border-amber-200 shadow-md ring-1 ring-amber-200'
            : 'bg-white border-slate-200'
        }`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${highlight ? 'text-amber-700' : 'text-slate-800'}`}>{value}</p>
            </div>
            <span className="text-xl opacity-80">{icon}</span>
        </div>
    </div>
);

const ApplicationRow = ({ app }: { app: Application }) => {
    const config = STATUS_CONFIG[app.status] || { label: app.status, color: "bg-gray-100", icon: "❓" };
    return (
        <tr className="hover:bg-emerald-50/30 transition-colors">
            <td className="px-6 py-4 font-mono text-xs text-slate-500">{app.id}</td>
            <td className="px-6 py-4">
                <div className="font-medium text-slate-800">{app.applicantName}</div>
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-600 text-xs border border-stone-200">
                    🌱 {app.plantType}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                    {config.icon} {config.label}
                </span>
            </td>
            <td className="px-6 py-4 text-slate-500 text-sm">{formatThaiDate(app.submittedAt)}</td>
            <td className="px-6 py-4 text-right">
                <Link href={`/staff/applications/${app.id}`} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm hover:underline">
                    ตรวจสอบ &gt;
                </Link>
            </td>
        </tr>
    );
};

const ApplicationCardMobile = ({ app }: { app: Application }) => {
    const config = STATUS_CONFIG[app.status] || { label: app.status, color: "bg-gray-100", icon: "❓" };
    return (
        <div className="p-4 active:bg-slate-50">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="font-mono text-xs text-slate-400 block mb-1">{app.id}</span>
                    <h3 className="font-bold text-slate-800">{app.applicantName}</h3>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${config.color}`}>
                    {config.label}
                </span>
            </div>
            <div className="flex justify-between items-center mt-3">
                <div className="flex gap-2 text-xs text-slate-500">
                    <span className="bg-stone-100 px-2 py-1 rounded">🌱 {app.plantType}</span>
                    <span className="flex items-center">📅 {formatThaiDate(app.submittedAt)}</span>
                </div>
                <Link href={`/staff/applications/${app.id}`} className="text-sm text-emerald-600 font-semibold border border-emerald-200 px-3 py-1.5 rounded-lg bg-emerald-50">
                    ตรวจสอบ
                </Link>
            </div>
        </div>
    );
};
