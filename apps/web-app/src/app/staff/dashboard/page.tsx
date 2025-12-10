"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface StaffUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
}

interface Application {
    id: string;
    applicantName: string;
    plantType: string;
    status: string;
    submittedAt: string;
}

export default function StaffDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<StaffUser | null>(null);
    const [pendingApplications, setPendingApplications] = useState<Application[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        const userData = localStorage.getItem("staff_user");

        if (!token || !userData) {
            router.push("/staff/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            if (!["DTAM_REVIEWER", "DTAM_INSPECTOR", "DTAM_ADMIN", "SUPER_ADMIN"].includes(parsedUser.role)) {
                router.push("/staff/login");
                return;
            }
            setUser(parsedUser);
        } catch {
            router.push("/staff/login");
        }

        // Mock pending applications
        setPendingApplications([
            { id: "APP-001", applicantName: "สมชาย ใจดี", plantType: "กัญชา", status: "PENDING_REVIEW", submittedAt: "2024-12-10" },
            { id: "APP-002", applicantName: "บริษัท สมุนไพรไทย จำกัด", plantType: "กระท่อม", status: "PENDING_REVIEW", submittedAt: "2024-12-09" },
            { id: "APP-003", applicantName: "วิสาหกิจชุมชนบ้านป่า", plantType: "ขมิ้นชัน", status: "PENDING_INSPECTION", submittedAt: "2024-12-08" },
        ]);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff_user");
        router.push("/staff/login");
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "DTAM_REVIEWER": return "ผู้ตรวจสอบเอกสาร";
            case "DTAM_INSPECTOR": return "ผู้ตรวจสอบพื้นที่";
            case "DTAM_ADMIN": return "ผู้ดูแลระบบ";
            case "SUPER_ADMIN": return "ผู้ดูแลระบบสูงสุด";
            default: return "เจ้าหน้าที่";
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING_REVIEW":
                return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">รอตรวจสอบ</span>;
            case "PENDING_INSPECTION":
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">รอตรวจพื้นที่</span>;
            case "APPROVED":
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">อนุมัติ</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin text-4xl">⏳</div>
            </div>
        );
    }

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
                            <p className="text-xs text-emerald-400">{getRoleLabel(user.role)}</p>
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
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="text-3xl mb-2">📥</div>
                        <p className="text-2xl font-bold text-slate-800">12</p>
                        <p className="text-sm text-slate-500">รอตรวจสอบ</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="text-3xl mb-2">🔍</div>
                        <p className="text-2xl font-bold text-slate-800">5</p>
                        <p className="text-sm text-slate-500">รอตรวจพื้นที่</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="text-3xl mb-2">✅</div>
                        <p className="text-2xl font-bold text-emerald-600">48</p>
                        <p className="text-sm text-slate-500">อนุมัติแล้ว</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="text-3xl mb-2">📊</div>
                        <p className="text-2xl font-bold text-slate-800">65</p>
                        <p className="text-sm text-slate-500">ทั้งหมด</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/staff/applications"
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-emerald-500 group"
                    >
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600">
                            ตรวจสอบคำขอ
                        </h3>
                        <p className="text-sm text-slate-500 mt-2">
                            ดูและตรวจสอบคำขอรับรองมาตรฐาน
                        </p>
                    </Link>

                    {user.role === "DTAM_INSPECTOR" && (
                        <Link
                            href="/staff/inspections"
                            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-emerald-500 group"
                        >
                            <div className="text-4xl mb-4">📍</div>
                            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600">
                                ตรวจสอบพื้นที่
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                จัดการการนัดตรวจสอบพื้นที่
                            </p>
                        </Link>
                    )}

                    {(user.role === "DTAM_ADMIN" || user.role === "SUPER_ADMIN") && (
                        <Link
                            href="/admin/users"
                            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-emerald-500 group"
                        >
                            <div className="text-4xl mb-4">👥</div>
                            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600">
                                จัดการผู้ใช้
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                เพิ่ม/แก้ไขบัญชีเจ้าหน้าที่
                            </p>
                        </Link>
                    )}

                    <Link
                        href="/staff/reports"
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-emerald-500 group"
                    >
                        <div className="text-4xl mb-4">📈</div>
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600">
                            รายงาน
                        </h3>
                        <p className="text-sm text-slate-500 mt-2">
                            ดูสถิติและรายงานประจำเดือน
                        </p>
                    </Link>
                </div>

                {/* Pending Applications Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-800">คำขอที่รอดำเนินการ</h3>
                        <Link href="/staff/applications" className="text-emerald-600 text-sm hover:underline">
                            ดูทั้งหมด →
                        </Link>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">รหัส</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ผู้ยื่นคำขอ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ประเภทพืช</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">วันที่ยื่น</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pendingApplications.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{app.id}</td>
                                    <td className="px-6 py-4 text-sm text-slate-800">{app.applicantName}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{app.plantType}</td>
                                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{app.submittedAt}</td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/staff/applications/${app.id}`}
                                            className="text-emerald-600 hover:underline text-sm"
                                        >
                                            ดูรายละเอียด
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
