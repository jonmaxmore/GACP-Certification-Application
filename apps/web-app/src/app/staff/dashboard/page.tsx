"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api-client";

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

// Role labels
const ROLE_LABELS: Record<string, { label: string; icon: string }> = {
    REVIEWER_AUDITOR: { label: "ผู้ตรวจเอกสาร/ตรวจประเมิน", icon: "📋" },
    SCHEDULER: { label: "เจ้าหน้าที่จัดคิว", icon: "📅" },
    ACCOUNTANT: { label: "พนักงานบัญชี", icon: "💰" },
    ADMIN: { label: "ผู้ดูแลระบบ", icon: "⚙️" },
    SUPER_ADMIN: { label: "ผู้ดูแลสูงสุด", icon: "🔐" },
    // Consolidated roles (lowercase)
    assessor: { label: "ผู้ตรวจสอบ/ตรวจประเมิน", icon: "📋" },
    scheduler: { label: "เจ้าหน้าที่จัดคิว", icon: "📅" },
    accountant: { label: "พนักงานบัญชี", icon: "💰" },
    admin: { label: "ผู้ดูแลระบบ", icon: "⚙️" },
    // Legacy roles
    reviewer: { label: "ผู้ตรวจสอบ", icon: "📋" },
    manager: { label: "ผู้จัดการ", icon: "👔" },
    inspector: { label: "ผู้ตรวจประเมิน", icon: "🔍" },
};

export default function StaffDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<StaffUser | null>(null);
    const [activeTab, setActiveTab] = useState<"documents" | "audits">("documents");
    const [pendingDocuments, setPendingDocuments] = useState<PendingItem[]>([]);
    const [pendingAudits, setPendingAudits] = useState<PendingItem[]>([]);
    const [dashboardStats, setDashboardStats] = useState<{ total: number; pending: number; approved: number; todayChecked: number }>({ total: 0, pending: 0, approved: 0, todayChecked: 0 });

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        const userData = localStorage.getItem("staff_user");

        if (!token || !userData) {
            router.push("/staff/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            // Staff roles check - case-insensitive, include all consolidated roles
            const staffRoles = [
                'REVIEWER_AUDITOR', 'SCHEDULER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN',
                // Consolidated roles (lowercase)
                'assessor', 'scheduler', 'accountant', 'admin'
            ];
            const userRoleUpper = parsedUser.role.toUpperCase();
            const userRoleLower = parsedUser.role.toLowerCase();
            if (!staffRoles.some(r => r.toUpperCase() === userRoleUpper || r.toLowerCase() === userRoleLower)) {
                router.push("/staff/login");
                return;
            }
            setUser(parsedUser);

            // Set default tab based on role
            if (parsedUser.role === "SCHEDULER") {
                setActiveTab("audits");
            }
        } catch {
            router.push("/staff/login");
        }

        // Fetch real data from API
        fetchPendingData();
    }, [router]);

    const fetchPendingData = async () => {
        const token = localStorage.getItem("staff_token");
        if (!token) return;

        try {
            // Fetch pending reviews from real API
            const pendingRes = await fetch('/api/applications/pending-reviews', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (pendingRes.ok) {
                const result = await pendingRes.json();
                if (result.success && result.data) {
                    setPendingDocuments(result.data.map((app: { _id: string; applicationNumber: string; data?: { applicantInfo?: { name?: string }; formData?: { plantId?: string } }; status: string; createdAt: string; rejectCount?: number }) => ({
                        id: app._id || app.applicationNumber,
                        applicantName: app.data?.applicantInfo?.name || 'ไม่ระบุชื่อ',
                        plantType: app.data?.formData?.plantId || 'ไม่ระบุ',
                        status: app.status,
                        submittedAt: app.createdAt,
                        submissionCount: (app.rejectCount || 0) + 1,
                        waitTime: getWaitTime(app.createdAt)
                    })));
                }
            }

            // Fetch pending audits
            const auditsRes = await fetch('/api/applications/auditor/assignments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (auditsRes.ok) {
                const result = await auditsRes.json();
                if (result.success && result.data) {
                    setPendingAudits(result.data.map((app: { _id: string; applicationNumber: string; data?: { applicantInfo?: { name?: string }; formData?: { plantId?: string } }; status: string; createdAt: string; audit?: { scheduledDate?: string } }) => ({
                        id: app._id || app.applicationNumber,
                        applicantName: app.data?.applicantInfo?.name || 'ไม่ระบุชื่อ',
                        plantType: app.data?.formData?.plantId || 'ไม่ระบุ',
                        status: app.status,
                        submittedAt: app.audit?.scheduledDate || app.createdAt,
                        waitTime: getWaitTime(app.createdAt)
                    })));
                }
            }

            // Fetch dashboard stats
            const statsRes = await fetch('/api/applications/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (statsRes.ok) {
                const result = await statsRes.json();
                if (result.success && result.data) {
                    console.log('[Dashboard] Stats:', result.data);
                    setDashboardStats({
                        total: result.data.total || 0,
                        pending: result.data.pending || 0,
                        approved: result.data.approved || 0,
                        todayChecked: result.data.todayChecked || 0
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setPendingDocuments([]);
            setPendingAudits([]);
        }
    };

    const getWaitTime = (submittedAt: string): string => {
        const submitted = new Date(submittedAt);
        const now = new Date();
        const diffMs = now.getTime() - submitted.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24) return `${diffHours} ชั่วโมง`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} วัน`;
    };

    const handleLogout = () => {
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff_user");
        router.push("/staff/login");
    };

    const getSubmissionBadge = (count?: number) => {
        if (!count) return null;
        if (count === 1) return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">ครั้งแรก</span>;
        if (count === 2) return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">แก้ไขรอบ 1</span>;
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">แก้ไขรอบ 2 ⚠️</span>;
    };

    const getAuditStatusBadge = (status: string) => {
        switch (status) {
            case "WAITING_SCHEDULE":
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">รอจัดคิว</span>;
            case "SCHEDULED":
                return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">รอนัดหมาย</span>;
            case "WAITING_RESULT":
                return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">รอผล</span>;
            default:
                return null;
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin text-4xl">⏳</div>
            </div>
        );
    }

    const roleInfo = ROLE_LABELS[user.role] || { label: user.role, icon: "👤" };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🛡️</span>
                        <div>
                            <h1 className="font-bold">GACP Staff Portal</h1>
                            <p className="text-xs text-slate-400">ระบบเจ้าหน้าที่</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-semibold">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-emerald-400">{roleInfo.icon} {roleInfo.label}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                        >
                            ออกจากระบบ
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* KPI Snapshot */}
                <div className="bg-white rounded-xl shadow p-4 mb-6 flex gap-8">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-800">{pendingDocuments.length + pendingAudits.length}</p>
                        <p className="text-xs text-slate-500">รอดำเนินการ</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{dashboardStats.todayChecked}</p>
                        <p className="text-xs text-slate-500">ตรวจวันนี้</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{dashboardStats.approved}</p>
                        <p className="text-xs text-slate-500">อนุมัติแล้ว</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
                        <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
                        Real-time
                    </div>
                </div>

                {/* Dual-Mode Tabs for REVIEWER_AUDITOR */}
                {user.role === "REVIEWER_AUDITOR" && (
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setActiveTab("documents")}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "documents"
                                ? "bg-slate-800 text-white"
                                : "bg-white text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            📄 รอตรวจเอกสาร ({pendingDocuments.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("audits")}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "audits"
                                ? "bg-slate-800 text-white"
                                : "bg-white text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            🔍 รอตรวจประเมิน ({pendingAudits.length})
                        </button>
                    </div>
                )}

                {/* Document Review Table */}
                {(activeTab === "documents" || user.role === "SCHEDULER") && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-800">
                                📄 {user.role === "SCHEDULER" ? "รอจัดคิวนัดหมาย" : "รอตรวจเอกสาร"}
                            </h3>
                            <span className="text-sm text-slate-500">เรียงตามรอนานที่สุด</span>
                        </div>
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Job ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ผู้ยื่น</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">พืช</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">สถานะแก้ไข</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">รอมานาน</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(user.role === "SCHEDULER" ? pendingAudits : pendingDocuments).map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">{item.id}</td>
                                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">{item.applicantName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.plantType}</td>
                                        <td className="px-6 py-4">
                                            {user.role === "SCHEDULER" ? getAuditStatusBadge(item.status) : getSubmissionBadge(item.submissionCount)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-amber-600 font-medium">{item.waitTime}</td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/staff/applications/${item.id}`}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                                            >
                                                {user.role === "SCHEDULER" ? "📅 ลงนัด" : "⚡ ตรวจสอบ"}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Audit Table for REVIEWER_AUDITOR */}
                {activeTab === "audits" && user.role === "REVIEWER_AUDITOR" && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-800">🔍 รอนัด & รอตรวจประเมิน</h3>
                            <Link href="/staff/calendar" className="text-emerald-600 text-sm hover:underline">
                                📅 ดูปฏิทิน →
                            </Link>
                        </div>
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Job ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ผู้ยื่น</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">พืช</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">นัดหมาย/รอ</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pendingAudits.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">{item.id}</td>
                                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">{item.applicantName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.plantType}</td>
                                        <td className="px-6 py-4">{getAuditStatusBadge(item.status)}</td>
                                        <td className="px-6 py-4 text-sm text-purple-600 font-medium">{item.waitTime}</td>
                                        <td className="px-6 py-4">
                                            {item.status === "WAITING_RESULT" ? (
                                                <Link
                                                    href={`/staff/audits/${item.id}`}
                                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition-colors"
                                                >
                                                    📝 บันทึกผล
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/staff/applications/${item.id}`}
                                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-300 transition-colors"
                                                >
                                                    👁️ ดูข้อมูล
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Quick Links for Admin */}
                {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <Link href="/admin/users" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all">
                            <div className="text-3xl mb-2">👥</div>
                            <h3 className="font-semibold">จัดการบัญชี</h3>
                            <p className="text-sm text-slate-500">สร้าง/แก้ไขเจ้าหน้าที่</p>
                        </Link>
                        <Link href="/admin/kpi" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all">
                            <div className="text-3xl mb-2">📊</div>
                            <h3 className="font-semibold">KPI Dashboard</h3>
                            <p className="text-sm text-slate-500">ดูสถิติและรายงาน</p>
                        </Link>
                        <Link href="/staff/accounting" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all">
                            <div className="text-3xl mb-2">💰</div>
                            <h3 className="font-semibold">ระบบบัญชี</h3>
                            <p className="text-sm text-slate-500">จัดการใบแจ้งหนี้/ชำระเงิน</p>
                        </Link>
                        <Link href="/admin/settings" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all">
                            <div className="text-3xl mb-2">⚙️</div>
                            <h3 className="font-semibold">ตั้งค่าระบบ</h3>
                            <p className="text-sm text-slate-500">ปรับ Flow/Config</p>
                        </Link>
                    </div>
                )}

                {/* Quick Actions for ACCOUNTANT */}
                {user.role === "ACCOUNTANT" && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">💰 ระบบบัญชีและการเงิน</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/staff/accounting" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                                <div className="text-3xl mb-2">📋</div>
                                <h3 className="font-semibold text-lg">ใบแจ้งหนี้</h3>
                                <p className="text-emerald-100 text-sm">จัดการใบแจ้งหนี้ทั้งหมด</p>
                            </Link>
                            <Link href="/staff/accounting?tab=pending" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all border-2 border-amber-200">
                                <div className="text-3xl mb-2">⏳</div>
                                <h3 className="font-semibold text-amber-700">รอชำระ</h3>
                                <p className="text-sm text-slate-500">ตรวจสอบรายการค้างชำระ</p>
                            </Link>
                            <Link href="/staff/analytics" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all">
                                <div className="text-3xl mb-2">📊</div>
                                <h3 className="font-semibold">รายงาน</h3>
                                <p className="text-sm text-slate-500">สรุปรายได้และสถิติ</p>
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

