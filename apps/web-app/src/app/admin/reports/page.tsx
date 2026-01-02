"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ReportStats {
    applications: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        byStatus: Record<string, number>;
    };
    revenue: {
        total: number;
        monthly: number;
        pending: number;
    };
    todayActivity: {
        reviewed: number;
        scheduled: number;
        approved: number;
    };
}

export default function AdminReportsPage() {
    const router = useRouter();
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<"week" | "month" | "year">("month");

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        const userData = localStorage.getItem("staff_user");

        if (!token || !userData) {
            router.push("/staff/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            const role = parsedUser.role?.toUpperCase() || '';
            if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
                router.push("/staff/dashboard");
                return;
            }
        } catch {
            router.push("/staff/login");
            return;
        }

        fetchReportData(token);
    }, [router, dateRange]);

    const fetchReportData = async (token: string) => {
        setIsLoading(true);
        try {
            // Fetch stats
            const statsRes = await fetch('/api/applications/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Fetch invoices
            const invoicesRes = await fetch('/api/v2/invoices/summary', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let appStats = { total: 0, pending: 0, approved: 0, todayChecked: 0 };
            let invoiceStats = { totalRevenue: 0, pendingAmount: 0, monthlyRevenue: 0 };

            if (statsRes.ok) {
                const result = await statsRes.json();
                if (result.success && result.data) {
                    appStats = result.data;
                }
            }

            if (invoicesRes.ok) {
                const result = await invoicesRes.json();
                if (result.success && result.data) {
                    invoiceStats = result.data;
                }
            }

            setStats({
                applications: {
                    total: appStats.total,
                    pending: appStats.pending,
                    approved: appStats.approved,
                    rejected: 0,
                    byStatus: {}
                },
                revenue: {
                    total: invoiceStats.totalRevenue,
                    monthly: invoiceStats.monthlyRevenue,
                    pending: invoiceStats.pendingAmount
                },
                todayActivity: {
                    reviewed: appStats.todayChecked || 0,
                    scheduled: 0,
                    approved: 0
                }
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !stats) {
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
                    <div className="flex items-center gap-4">
                        <Link href="/staff/dashboard" className="text-slate-400 hover:text-white">
                            ← กลับ
                        </Link>
                        <div className="h-6 w-px bg-slate-600" />
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📊</span>
                            <div>
                                <h1 className="font-bold">รายงานสรุป</h1>
                                <p className="text-xs text-slate-400">Admin Reports</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {(["week", "month", "year"] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm transition-colors ${dateRange === range
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                            >
                                {range === "week" ? "สัปดาห์" : range === "month" ? "เดือน" : "ปี"}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">📋</div>
                            <div>
                                <p className="text-3xl font-bold text-slate-800">{stats.applications.total}</p>
                                <p className="text-sm text-slate-500">คำขอทั้งหมด</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">⏳</div>
                            <div>
                                <p className="text-3xl font-bold text-amber-600">{stats.applications.pending}</p>
                                <p className="text-sm text-slate-500">รอดำเนินการ</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">✅</div>
                            <div>
                                <p className="text-3xl font-bold text-green-600">{stats.applications.approved}</p>
                                <p className="text-sm text-slate-500">อนุมัติแล้ว</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">💰</div>
                            <div>
                                <p className="text-3xl font-bold text-purple-600">
                                    {stats.revenue.total.toLocaleString('th-TH')}
                                </p>
                                <p className="text-sm text-slate-500">รายได้รวม (฿)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">💵 สรุปรายได้</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                                <span className="text-slate-600">รายได้รับแล้ว</span>
                                <span className="font-bold text-green-600 text-xl">
                                    ฿{stats.revenue.total.toLocaleString('th-TH')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl">
                                <span className="text-slate-600">รอชำระ</span>
                                <span className="font-bold text-amber-600 text-xl">
                                    ฿{stats.revenue.pending.toLocaleString('th-TH')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                                <span className="text-slate-600">รายได้เดือนนี้</span>
                                <span className="font-bold text-blue-600 text-xl">
                                    ฿{stats.revenue.monthly.toLocaleString('th-TH')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">📈 กิจกรรมวันนี้</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                                <span className="text-slate-600">ตรวจสอบเอกสาร</span>
                                <span className="font-bold text-blue-600 text-xl">
                                    {stats.todayActivity.reviewed}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                                <span className="text-slate-600">นัดตรวจประเมิน</span>
                                <span className="font-bold text-purple-600 text-xl">
                                    {stats.todayActivity.scheduled}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                                <span className="text-slate-600">อนุมัติแล้ว</span>
                                <span className="font-bold text-green-600 text-xl">
                                    {stats.todayActivity.approved}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">🔗 เมนูลัด</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/staff/applications"
                            className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-center">
                            <span className="text-2xl">📋</span>
                            <p className="font-medium mt-2">คำขอทั้งหมด</p>
                        </Link>
                        <Link href="/staff/calendar"
                            className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-center">
                            <span className="text-2xl">📅</span>
                            <p className="font-medium mt-2">ปฏิทิน</p>
                        </Link>
                        <Link href="/staff/accounting"
                            className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-center">
                            <span className="text-2xl">💰</span>
                            <p className="font-medium mt-2">การเงิน</p>
                        </Link>
                        <Link href="/admin/users"
                            className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-center">
                            <span className="text-2xl">👥</span>
                            <p className="font-medium mt-2">จัดการผู้ใช้</p>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
