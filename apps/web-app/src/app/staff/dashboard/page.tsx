"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StaffLayout from "../components/StaffLayout";
import {
    IconDocument, IconSearch, IconChart, IconCreditCard, IconCalendar,
    IconCheckCircle, IconClock, IconUser
} from "@/components/ui/icons";
import { ApplicationService, DashboardStats, Application } from "@/lib/services/application-service";

interface StaffUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
}

interface PendingItem {
    id: string;
    applicantName: string;
    plantType: string;
    status: string;
    submittedAt: string;
    submissionCount?: number;
    waitTime: string;
}

const ROLE_LABELS: Record<string, { label: string }> = {
    REVIEWER_AUDITOR: { label: "ผู้ตรวจเอกสาร/ตรวจประเมิน" },
    SCHEDULER: { label: "เจ้าหน้าที่จัดคิว" },
    ACCOUNTANT: { label: "พนักงานบัญชี" },
    ADMIN: { label: "ผู้ดูแลระบบ" },
    assessor: { label: "ผู้ตรวจสอบ" },
    scheduler: { label: "เจ้าหน้าที่จัดคิว" },
    accountant: { label: "พนักงานบัญชี" },
    admin: { label: "ผู้ดูแลระบบ" },
};

export default function StaffDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<StaffUser | null>(null);
    const [activeTab, setActiveTab] = useState<"documents" | "audits">("documents");
    const [pendingDocuments, setPendingDocuments] = useState<PendingItem[]>([]);
    const [pendingAudits, setPendingAudits] = useState<PendingItem[]>([]);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({ total: 0, pending: 0, approved: 0, todayChecked: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        const userData = localStorage.getItem("staff_user");
        if (!token || !userData) { router.push("/staff/login"); return; }
        try {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            if (parsed.role === "SCHEDULER") setActiveTab("audits");
            fetchPendingData();
        } catch { router.push("/staff/login"); }
    }, [router]);

    const fetchPendingData = async () => {
        try {
            const [pendingRes, auditsRes, statsRes] = await Promise.all([
                ApplicationService.getPendingReviews(),
                ApplicationService.getPendingAudits(),
                ApplicationService.getStats()
            ]);

            if (pendingRes.success) {
                setPendingDocuments(mapApplicationsToPendingItems(pendingRes.data as Application[]));
            }
            if (auditsRes.success) {
                setPendingAudits(mapApplicationsToPendingItems(auditsRes.data as Application[]));
            }
            if (statsRes.success && statsRes.data) {
                setDashboardStats(statsRes.data);
            }
        } catch (e) {
            console.error('Error fetching dashboard data:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const mapApplicationsToPendingItems = (apps: Application[] | undefined): PendingItem[] => {
        if (!apps || !Array.isArray(apps)) return [];
        return apps.map(app => ({
            id: app._id || app.applicationNumber || 'Unknown',
            applicantName: app.data?.applicantInfo?.name || 'ไม่ระบุ',
            plantType: app.data?.formData?.plantId || 'ไม่ระบุ',
            status: app.status,
            submittedAt: app.audit?.scheduledDate || app.createdAt,
            submissionCount: (app.rejectCount || 0) + 1,
            waitTime: getWaitTime(app.createdAt)
        }));
    };

    const getWaitTime = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const hours = Math.floor(diff / 3600000);
        return hours < 24 ? `${hours} ชม.` : `${Math.floor(hours / 24)} วัน`;
    };

    if (!user || isLoading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div></div>;

    const roleInfo = ROLE_LABELS[user.role] || { label: user.role };

    return (
        <StaffLayout title="Dashboard" subtitle={`ภาพรวมการทำงาน (${roleInfo.label})`}>
            {/* 1. Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "งานทั้งหมดในระบบ", value: dashboardStats.total, icon: IconCalendar, color: "text-slate-400" },
                    { label: "รอตรวจเอกสาร", value: pendingDocuments.length, icon: IconDocument, color: "text-amber-500" },
                    { label: "รอเข้าตรวจแปลง", value: pendingAudits.length, icon: IconSearch, color: "text-purple-500" },
                    { label: "อนุมัติวันนี้", value: dashboardStats.todayChecked, icon: IconCheckCircle, color: "text-emerald-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <h3 className="text-3xl font-bold mt-2 text-slate-800 dark:text-slate-100">{stat.value}</h3>
                            </div>
                            <stat.icon size={24} className={stat.color} />
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. Work Queue (Tabs & Table) */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-8">
                {/* Tabs */}
                {user.role === "REVIEWER_AUDITOR" && (
                    <div className="flex border-b border-slate-200 dark:border-slate-700">
                        {[
                            { key: "documents", label: `รอตรวจเอกสาร (${pendingDocuments.length})`, icon: IconDocument },
                            { key: "audits", label: `รอตรวจประเมิน (${pendingAudits.length})`, icon: IconSearch }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.key
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/10'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Table Header */}
                <div className="px-6 py-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                        {activeTab === "documents" ? "รายการเอกสารรอตรวจสอบ" : "รายการนัดหมายตรวจแปลง"}
                    </h3>
                    <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 border border-amber-200">Priority: สูง</span>
                    </div>
                </div>

                {/* Table Body */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 font-semibold">
                            <tr>
                                <th className="px-6 py-3">JobID</th>
                                <th className="px-6 py-3">ผู้ยื่นคำขอ</th>
                                <th className="px-6 py-3">ชนิดพืช</th>
                                <th className="px-6 py-3">สถานะ</th>
                                <th className="px-6 py-3">เวลารอคอย</th>
                                <th className="px-6 py-3 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {(activeTab === "documents" ? pendingDocuments : pendingAudits).map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-500">#{item.id?.slice(-6)}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.applicantName}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.plantType}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${item.submissionCount === 1
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.submissionCount === 1 ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                                            {item.submissionCount === 1 ? 'ยื่นใหม่' : `แก้ไขครั้งที่ ${(item.submissionCount || 1) - 1}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">{item.waitTime}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/staff/applications/${item.id}`}
                                            className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold transition-colors shadow-sm"
                                        >
                                            ตรวจสอบ
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {(activeTab === "documents" ? pendingDocuments : pendingAudits).length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <IconCheckCircle className="text-slate-400" size={24} />
                                        </div>
                                        <p>ไม่มีรายการที่ต้องดำเนินการในขณะนี้</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Internal Tools */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-200">เครื่องมือเจ้าหน้าที่</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { title: "จัดการผู้ใช้", icon: IconUser, href: "/staff/management", color: "bg-blue-100 text-blue-600" },
                            { title: "รายงานสถิติ", icon: IconChart, href: "/staff/analytics", color: "bg-emerald-100 text-emerald-600" },
                            { title: "ระบบบัญชี", icon: IconCreditCard, href: "/staff/accounting", color: "bg-amber-100 text-amber-600" },
                            { title: "ตารางงาน", icon: IconCalendar, href: "/staff/calendar", color: "bg-purple-100 text-purple-600" },
                        ].map((tool, i) => (
                            <Link key={i} href={tool.href} className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tool.color} dark:bg-opacity-20`}>
                                    <tool.icon size={20} />
                                </div>
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{tool.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                    <div className="relative z-10">
                        <h3 className="font-semibold mb-1">สถานะระบบ</h3>
                        <p className="text-xs text-slate-400 mb-4">Version 2.0.1 (Stable)</p>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-300">Database</span>
                                <span className="text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Connected</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-300">API Gateway</span>
                                <span className="text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Online</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <p className="text-xs text-slate-400">Last backup: 2 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}
