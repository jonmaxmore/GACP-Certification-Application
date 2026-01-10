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
            const invoicesRes = await fetch('/api/invoices/summary', {
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
                <div className="w-10 h-10 border-3 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="font-sans">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">รายงานสรุป (Reports)</h1>
                    <p className="text-sm text-slate-500">รายงานภาพรวมระบบและสถิติการใช้งาน</p>
                </div>
                <div className="flex gap-2">
                    {(["week", "month", "year"] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${dateRange === range
                                ? "bg-emerald-600 text-white"
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            {range === "week" ? "สัปดาห์" : range === "month" ? "เดือน" : "ปี"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{stats.applications.total}</p>
                            <p className="text-sm text-slate-500">คำขอทั้งหมด</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
                        <div>
                            <p className="text-3xl font-bold text-amber-600">{stats.applications.pending}</p>
                            <p className="text-sm text-slate-500">รอดำเนินการ</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></div>
                        <div>
                            <p className="text-3xl font-bold text-green-600">{stats.applications.approved}</p>
                            <p className="text-sm text-slate-500">อนุมัติแล้ว</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                        <div>
                            <p className="text-3xl font-bold text-purple-600">
                                {stats.revenue.total.toLocaleString('th-TH')}
                            </p>
                            <p className="text-sm text-slate-500">รายได้รวม (฿)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue & Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800">สรุปรายได้</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-100">
                            <span className="text-slate-600">รายได้รับแล้ว</span>
                            <span className="font-bold text-green-600 text-xl">
                                ฿{stats.revenue.total.toLocaleString('th-TH')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <span className="text-slate-600">รอชำระ</span>
                            <span className="font-bold text-amber-600 text-xl">
                                ฿{stats.revenue.pending.toLocaleString('th-TH')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <span className="text-slate-600">รายได้เดือนนี้</span>
                            <span className="font-bold text-blue-600 text-xl">
                                ฿{stats.revenue.monthly.toLocaleString('th-TH')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800">กิจกรรมวันนี้</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <span className="text-slate-600">ตรวจสอบเอกสาร</span>
                            <span className="font-bold text-blue-600 text-xl">
                                {stats.todayActivity.reviewed}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <span className="text-slate-600">นัดตรวจประเมิน</span>
                            <span className="font-bold text-purple-600 text-xl">
                                {stats.todayActivity.scheduled}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-100">
                            <span className="text-slate-600">อนุมัติแล้ว</span>
                            <span className="font-bold text-green-600 text-xl">
                                {stats.todayActivity.approved}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links (Simplified for Admin Context) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">การเข้าถึงด่วน</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/staff/applications"
                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all text-center">
                        <p className="font-medium">ดูคำขอทั้งหมด</p>
                    </Link>
                    <Link href="/staff/calendar"
                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all text-center">
                        <p className="font-medium">ปฏิทินงาน</p>
                    </Link>
                    <Link href="/staff/accounting"
                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all text-center">
                        <p className="font-medium">ระบบการเงิน</p>
                    </Link>
                    <Link href="/admin/users"
                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all text-center">
                        <p className="font-medium">จัดการผู้ใช้</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
