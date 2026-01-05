"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StaffLayout from "../components/StaffLayout";
import {
    IconDocument, IconSearch, IconChart, IconCreditCard, IconCalendar,
    IconCheckCircle, IconClock, IconUser
} from "@/components/ui/icons";

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
    const [dashboardStats, setDashboardStats] = useState({ total: 0, pending: 0, approved: 0, todayChecked: 0 });
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        const token = localStorage.getItem("staff_token");
        const userData = localStorage.getItem("staff_user");
        if (!token || !userData) { router.push("/staff/login"); return; }
        try {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            if (parsed.role === "SCHEDULER") setActiveTab("audits");
            fetchPendingData(token);
        } catch { router.push("/staff/login"); }
    }, [router]);

    const fetchPendingData = async (token: string) => {
        try {
            const [pendingRes, auditsRes, statsRes] = await Promise.all([
                fetch('/api/applications/pending-reviews', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/applications/auditor/assignments', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/applications/stats', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (pendingRes.ok) {
                const result = await pendingRes.json();
                if (result.success) setPendingDocuments(result.data?.map((app: any) => ({
                    id: app._id || app.applicationNumber, applicantName: app.data?.applicantInfo?.name || 'ไม่ระบุ',
                    plantType: app.data?.formData?.plantId || 'ไม่ระบุ', status: app.status,
                    submittedAt: app.createdAt, submissionCount: (app.rejectCount || 0) + 1, waitTime: getWaitTime(app.createdAt)
                })) || []);
            }
            if (auditsRes.ok) {
                const result = await auditsRes.json();
                if (result.success) setPendingAudits(result.data?.map((app: any) => ({
                    id: app._id || app.applicationNumber, applicantName: app.data?.applicantInfo?.name || 'ไม่ระบุ',
                    plantType: app.data?.formData?.plantId || 'ไม่ระบุ', status: app.status,
                    submittedAt: app.audit?.scheduledDate || app.createdAt, waitTime: getWaitTime(app.createdAt)
                })) || []);
            }
            if (statsRes.ok) {
                const result = await statsRes.json();
                if (result.success) setDashboardStats({ total: result.data?.total || 0, pending: result.data?.pending || 0, approved: result.data?.approved || 0, todayChecked: result.data?.todayChecked || 0 });
            }
        } catch (e) { console.error('Error:', e); }
    };

    const getWaitTime = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const hours = Math.floor(diff / 3600000);
        return hours < 24 ? `${hours} ชั่วโมง` : `${Math.floor(hours / 24)} วัน`;
    };

    if (!user) return null;

    const roleInfo = ROLE_LABELS[user.role] || { label: user.role };

    return (
        <StaffLayout title={`สวัสดี, ${user.firstName || 'เจ้าหน้าที่'}`} subtitle={roleInfo.label}>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "รอดำเนินการ", value: pendingDocuments.length + pendingAudits.length, Icon: IconClock, bgColor: "bg-slate-600" },
                    { label: "รอตรวจเอกสาร", value: pendingDocuments.length, Icon: IconDocument, bgColor: "bg-amber-500" },
                    { label: "รอตรวจแปลง", value: pendingAudits.length, Icon: IconSearch, bgColor: "bg-violet-500" },
                    { label: "อนุมัติแล้ว", value: dashboardStats.approved, Icon: IconCheckCircle, bgColor: "bg-emerald-500" },
                ].map((stat, i) => (
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

            {/* Tab Buttons */}
            {user.role === "REVIEWER_AUDITOR" && (
                <div className="flex gap-2 mb-6">
                    {[
                        { key: "documents", label: `รอตรวจเอกสาร (${pendingDocuments.length})` },
                        { key: "audits", label: `รอตรวจประเมิน (${pendingAudits.length})` }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`px-6 py-3 rounded-full font-semibold transition-all ${activeTab === tab.key
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                : `${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'} hover:border-emerald-300`
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Data Table */}
            <div className={`rounded-2xl shadow-lg overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h3 className="text-lg font-semibold">
                        {activeTab === "documents" ? "รอตรวจเอกสาร" : "รอตรวจประเมิน"}
                    </h3>
                    <span className="text-sm text-slate-500">เรียงตามรอนานที่สุด</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={isDark ? 'bg-slate-700' : 'bg-slate-100'}>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Job ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ผู้ยื่น</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">พืช</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">รอมานาน</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            {(activeTab === "documents" ? pendingDocuments : pendingAudits).map(item => (
                                <tr key={item.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{item.id?.slice(-8)}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{item.applicantName}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{item.plantType}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.submissionCount === 1 ? 'bg-emerald-100 text-emerald-700'
                                            : item.submissionCount === 2 ? 'bg-amber-100 text-amber-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {item.submissionCount === 1 ? 'ครั้งแรก' : `แก้ไขรอบ ${(item.submissionCount || 1) - 1}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-amber-600 font-medium">{item.waitTime}</td>
                                    <td className="px-6 py-4">
                                        <Link href={`/staff/applications/${item.id}`} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                                            ตรวจสอบ
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {(activeTab === "documents" ? pendingDocuments : pendingAudits).length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <IconCheckCircle size={32} className="mx-auto text-emerald-500 mb-3" />
                                        ไม่มีรายการรอดำเนินการ
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions for Admin/Accountant */}
            {(user.role === "ADMIN" || user.role === "admin" || user.role === "SUPER_ADMIN") && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    {[
                        { href: "/staff/management", Icon: IconUser, title: "จัดการบัญชี", desc: "สร้าง/แก้ไขเจ้าหน้าที่", color: "bg-slate-600" },
                        { href: "/staff/analytics", Icon: IconChart, title: "สถิติ", desc: "ดูรายงานและสถิติ", color: "bg-blue-500" },
                        { href: "/staff/accounting", Icon: IconCreditCard, title: "ระบบบัญชี", desc: "จัดการใบแจ้งหนี้", color: "bg-amber-500" },
                        { href: "/staff/calendar", Icon: IconCalendar, title: "ปฏิทิน", desc: "ตารางนัดหมาย", color: "bg-emerald-500" },
                    ].map((action, i) => (
                        <Link key={i} href={action.href} className={`p-5 rounded-xl transition-all hover:shadow-md ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-slate-200'}`}>
                            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}><action.Icon size={20} className="text-white" /></div>
                            <h3 className="font-semibold">{action.title}</h3>
                            <p className="text-sm text-slate-500">{action.desc}</p>
                        </Link>
                    ))}
                </div>
            )}

            {user.role === "ACCOUNTANT" || user.role === "accountant" ? (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">ระบบบัญชีและการเงิน</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Link href="/staff/accounting" className="p-6 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-colors">
                            <IconDocument size={28} className="mb-3" />
                            <h3 className="font-semibold text-lg">ใบแจ้งหนี้</h3>
                            <p className="text-emerald-100 text-sm">จัดการใบแจ้งหนี้ทั้งหมด</p>
                        </Link>
                        <Link href="/staff/accounting?tab=pending" className={`p-6 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-amber-200'}`}>
                            <IconClock size={28} className="mb-3 text-amber-500" />
                            <h3 className="font-semibold text-amber-700">รอชำระ</h3>
                            <p className="text-sm text-slate-500">ตรวจสอบรายการค้างชำระ</p>
                        </Link>
                        <Link href="/staff/analytics" className={`p-6 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                            <IconChart size={28} className="mb-3 text-blue-500" />
                            <h3 className="font-semibold">รายงาน</h3>
                            <p className="text-sm text-slate-500">สรุปรายได้และสถิติ</p>
                        </Link>
                    </div>
                </div>
            ) : null}
        </StaffLayout>
    );
}
