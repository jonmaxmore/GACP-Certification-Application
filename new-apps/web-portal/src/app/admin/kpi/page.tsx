"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface KPIData {
    totalApplications: number;
    pendingReview: number;
    pendingAudit: number;
    approved: number;
    rejected: number;
    conversionRate: number;
    avgReviewTime: number;
    avgAuditTime: number;
    slaBreach: number;
    rejectionRate: number;
    penaltyTriggered: number;
    revenuePhase1: number;
    revenuePhase2: number;
    todayStats: {
        reviewed: number;
        audited: number;
        approved: number;
    };
}

interface StaffPerformance {
    name: string;
    role: string;
    reviewed: number;
    audited: number;
    avgTime: string;
}

export default function KPIDashboardPage() {
    const router = useRouter();
    const [kpi, setKpi] = useState<KPIData | null>(null);
    const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today");

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        const userData = localStorage.getItem("staff_user");

        if (!token || !userData) {
            router.push("/staff/login");
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (!["ADMIN", "SUPER_ADMIN"].includes(parsedUser.role)) {
            router.push("/staff/dashboard");
            return;
        }

        // Load initial data
        loadKPIData();

        // Auto-refresh every 5 minutes
        const interval = setInterval(() => {
            loadKPIData();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [router, timeRange]);

    const loadKPIData = () => {
        // Mock KPI data
        setKpi({
            totalApplications: 156,
            pendingReview: 12,
            pendingAudit: 8,
            approved: 98,
            rejected: 15,
            conversionRate: 72.5,
            avgReviewTime: 4.2,
            avgAuditTime: 2.5,
            slaBreach: 3,
            rejectionRate: 42,
            penaltyTriggered: 5,
            revenuePhase1: 780000,
            revenuePhase2: 2450000,
            todayStats: {
                reviewed: 15,
                audited: 4,
                approved: 3,
            },
        });

        setStaffPerformance([
            { name: "สมชาย รักงาน", role: "REVIEWER_AUDITOR", reviewed: 45, audited: 12, avgTime: "3.2 ชม." },
            { name: "สมหญิง ใจเย็น", role: "SCHEDULER", reviewed: 0, audited: 0, avgTime: "-" },
            { name: "วิชัย ทำดี", role: "REVIEWER_AUDITOR", reviewed: 38, audited: 8, avgTime: "4.1 ชม." },
        ]);

        setLastUpdate(new Date());
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(amount);
    };

    if (!kpi) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">⏳</div></div>;
    }

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-slate-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/staff/dashboard" className="text-slate-400 hover:text-white">← กลับ</Link>
                        <div className="h-6 w-px bg-slate-600" />
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📊</span>
                            <h1 className="font-bold">KPI Dashboard</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-slate-400">อัพเดทล่าสุด: {lastUpdate.toLocaleTimeString("th-TH")}</span>
                        </div>
                        <button
                            onClick={loadKPIData}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                        >
                            🔄 รีเฟรช
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Time Range Selector */}
                <div className="flex gap-2 mb-6">
                    {[
                        { value: "today", label: "วันนี้" },
                        { value: "week", label: "สัปดาห์นี้" },
                        { value: "month", label: "เดือนนี้" },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setTimeRange(option.value as typeof timeRange)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${timeRange === option.value
                                    ? "bg-slate-800 text-white"
                                    : "bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* Business Volume */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-5 shadow">
                        <p className="text-3xl font-bold text-slate-800">{kpi.totalApplications}</p>
                        <p className="text-sm text-slate-500">คำขอทั้งหมด</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                        <p className="text-3xl font-bold text-amber-600">{kpi.pendingReview}</p>
                        <p className="text-sm text-amber-700">รอตรวจเอกสาร</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                        <p className="text-3xl font-bold text-blue-600">{kpi.pendingAudit}</p>
                        <p className="text-sm text-blue-700">รอตรวจประเมิน</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                        <p className="text-3xl font-bold text-green-600">{kpi.approved}</p>
                        <p className="text-sm text-green-700">อนุมัติแล้ว</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                        <p className="text-3xl font-bold text-red-600">{kpi.rejected}</p>
                        <p className="text-sm text-red-700">ไม่ผ่าน</p>
                    </div>
                </div>

                {/* Efficiency & Quality */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Operational Efficiency */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="font-semibold mb-4">⚡ ประสิทธิภาพการทำงาน</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-2xl font-bold">{kpi.avgReviewTime} <span className="text-sm font-normal">ชม.</span></p>
                                <p className="text-sm text-slate-500">เวลาเฉลี่ยตรวจเอกสาร</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-2xl font-bold">{kpi.avgAuditTime} <span className="text-sm font-normal">วัน</span></p>
                                <p className="text-sm text-slate-500">เวลาเฉลี่ยตรวจประเมิน</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-2xl font-bold text-emerald-600">{kpi.conversionRate}%</p>
                                <p className="text-sm text-slate-500">Conversion Rate</p>
                            </div>
                            <div className={`p-4 rounded-xl ${kpi.slaBreach > 0 ? "bg-red-50" : "bg-green-50"}`}>
                                <p className={`text-2xl font-bold ${kpi.slaBreach > 0 ? "text-red-600" : "text-green-600"}`}>
                                    {kpi.slaBreach}
                                </p>
                                <p className="text-sm text-slate-500">SLA Breach</p>
                            </div>
                        </div>
                    </div>

                    {/* Quality Control */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="font-semibold mb-4">🎯 Quality Control</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-slate-600">Rejection Rate</span>
                                    <span className="text-sm font-semibold">{kpi.rejectionRate}%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${kpi.rejectionRate > 50 ? "bg-red-500" : "bg-amber-500"}`}
                                        style={{ width: `${kpi.rejectionRate}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">อัตราการส่งคืนแก้ไข (เป้า: &lt;40%)</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-slate-600">Penalty Triggered</p>
                                    <p className="text-xs text-slate-400">คนที่โดนปรับเงินรอบที่ 3</p>
                                </div>
                                <p className="text-2xl font-bold text-red-600">{kpi.penaltyTriggered}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue & Staff Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Revenue */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white">
                        <h3 className="font-semibold mb-4">💰 รายได้</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm opacity-80">ค่าธรรมเนียมงวด 1 (5,000)</p>
                                <p className="text-2xl font-bold">{formatCurrency(kpi.revenuePhase1)}</p>
                            </div>
                            <div>
                                <p className="text-sm opacity-80">ค่าธรรมเนียมงวด 2 (25,000)</p>
                                <p className="text-2xl font-bold">{formatCurrency(kpi.revenuePhase2)}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-sm opacity-80">รายได้รวม</p>
                            <p className="text-3xl font-bold">{formatCurrency(kpi.revenuePhase1 + kpi.revenuePhase2)}</p>
                        </div>
                        <Link href="/admin/revenue" className="block mt-4 text-center py-2 bg-white/20 rounded-lg hover:bg-white/30">
                            ดูรายละเอียด →
                        </Link>
                    </div>

                    {/* Staff Performance */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="font-semibold mb-4">👥 ผลงานเจ้าหน้าที่</h3>
                        <div className="space-y-3">
                            {staffPerformance.map((staff, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">👤</div>
                                    <div className="flex-1">
                                        <p className="font-medium">{staff.name}</p>
                                        <p className="text-xs text-slate-500">{staff.role === "REVIEWER_AUDITOR" ? "📋 ผู้ตรวจ" : "📅 จัดคิว"}</p>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p>ตรวจเอกสาร: <span className="font-semibold">{staff.reviewed}</span></p>
                                        <p>ตรวจประเมิน: <span className="font-semibold">{staff.audited}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Today Stats */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">📈 สถิติวันนี้ (Real-time)</h3>
                        <span className="text-sm text-slate-500 flex items-center gap-2">
                            <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
                            อัพเดททุก 5 นาที
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-blue-50 rounded-xl">
                            <p className="text-4xl font-bold text-blue-600">{kpi.todayStats.reviewed}</p>
                            <p className="text-slate-600 mt-1">ตรวจเอกสารวันนี้</p>
                        </div>
                        <div className="text-center p-6 bg-purple-50 rounded-xl">
                            <p className="text-4xl font-bold text-purple-600">{kpi.todayStats.audited}</p>
                            <p className="text-slate-600 mt-1">ตรวจประเมินวันนี้</p>
                        </div>
                        <div className="text-center p-6 bg-green-50 rounded-xl">
                            <p className="text-4xl font-bold text-green-600">{kpi.todayStats.approved}</p>
                            <p className="text-slate-600 mt-1">อนุมัติวันนี้</p>
                        </div>
                    </div>
                </div>

                {/* Export Buttons */}
                <div className="mt-6 flex justify-end gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-2">
                        📄 Export PDF
                    </button>
                    <button className="px-6 py-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-2">
                        📊 Export Excel
                    </button>
                </div>
            </main>
        </div>
    );
}
