"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient as api } from "@/lib/api";
import { formatThaiDate } from "@/utils/thai-date";
import StaffLayout from "../components/StaffLayout";
import {
    IconDocument, IconSearch, IconCheckCircle, IconClock, IconLeaf
} from "@/components/ui/icons";

interface Application {
    id: string;
    applicantName: string;
    plantType: string;
    status: string;
    submittedAt: string;
    submissionCount?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    SUBMITTED: { label: "ยื่นคำขอใหม่", color: "bg-blue-100 text-blue-700" },
    PENDING_REVIEW: { label: "รอตรวจเอกสาร", color: "bg-amber-100 text-amber-700" },
    REVISION_REQUIRED: { label: "ส่งคืนแก้ไข", color: "bg-orange-100 text-orange-700" },
    DOCUMENT_APPROVED: { label: "เอกสารผ่าน", color: "bg-indigo-100 text-indigo-700" },
    PENDING_AUDIT: { label: "รอตรวจแปลง", color: "bg-violet-100 text-violet-700" },
    APPROVED: { label: "รับรองแล้ว", color: "bg-emerald-100 text-emerald-700" },
};

export default function StaffApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        const token = localStorage.getItem("staff_token");
        if (!token) { router.push("/staff/login"); return; }
        fetchApplications();
    }, [router]);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const result = await api.get<{ data: { applications: Application[] } }>('/api/v2/applications');
            if (result.success && result.data?.data?.applications) {
                setApplications(result.data.data.applications);
            } else {
                setApplications([
                    { id: "APP-67-001", applicantName: "สมชาย ใจดี", plantType: "กัญชา", status: "PENDING_REVIEW", submittedAt: "2024-12-08" },
                    { id: "APP-67-002", applicantName: "บจก. สมุนไพรไทย", plantType: "ฟ้าทะลายโจร", status: "APPROVED", submittedAt: "2024-12-05" },
                    { id: "APP-67-003", applicantName: "วิสาหกิจชุมชนแม่ริม", plantType: "ขมิ้นชัน", status: "REVISION_REQUIRED", submittedAt: "2024-12-01" },
                    { id: "APP-67-004", applicantName: "สวนลุงแดง", plantType: "กัญชง", status: "PENDING_AUDIT", submittedAt: "2024-12-10" },
                ]);
            }
        } catch { setApplications([]); }
        finally { setIsLoading(false); }
    };

    const filteredApps = applications.filter(app => filter === "all" || app.status === filter);
    const stats = [
        { label: "คำขอทั้งหมด", value: applications.length, Icon: IconDocument, bgColor: "bg-slate-600" },
        { label: "รอตรวจเอกสาร", value: applications.filter(a => a.status === 'PENDING_REVIEW').length, Icon: IconClock, bgColor: "bg-amber-500" },
        { label: "รอตรวจแปลง", value: applications.filter(a => a.status === 'PENDING_AUDIT').length, Icon: IconSearch, bgColor: "bg-violet-500" },
        { label: "อนุมัติแล้ว", value: applications.filter(a => a.status === 'APPROVED').length, Icon: IconCheckCircle, bgColor: "bg-emerald-500" },
    ];

    if (isLoading) {
        return (
            <StaffLayout title="คำขอทั้งหมด" subtitle="กำลังโหลดข้อมูล...">
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                </div>
            </StaffLayout>
        );
    }

    return (
        <StaffLayout title="คำขอทั้งหมด" subtitle="รายการคำขอใบรับรอง GACP">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className={`p-4 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</span>
                            <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                <stat.Icon size={16} className="text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-semibold">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
                        className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === f.key
                            ? "bg-emerald-600 text-white"
                            : `${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border text-slate-600 hover:border-emerald-300`
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className={`rounded-xl overflow-hidden border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={isDark ? 'bg-slate-700' : 'bg-slate-50'}>
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">เลขที่คำขอ</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">ผู้ยื่น</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">พืช</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">วันที่ยื่น</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            {filteredApps.map(app => {
                                const config = STATUS_CONFIG[app.status] || { label: app.status, color: "bg-gray-100" };
                                return (
                                    <tr key={app.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{app.id}</td>
                                        <td className="px-6 py-4 font-medium">{app.applicantName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                <IconLeaf size={12} /> {app.plantType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${config.color}`}>
                                                {config.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">{formatThaiDate(app.submittedAt)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/staff/applications/${app.id}`} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                                                ตรวจสอบ
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredApps.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <IconLeaf size={32} className="mx-auto mb-3" />
                        <p>ไม่พบข้อมูลคำขอ</p>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}
