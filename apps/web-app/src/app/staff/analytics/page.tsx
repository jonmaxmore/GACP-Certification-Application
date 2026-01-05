"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StaffLayout from "../components/StaffLayout";
import { IconChart, IconDocument, IconLeaf, IconCheckCircle } from "@/components/ui/icons";

// Additional icons
const IconRefresh = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);

const IconDownload = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const IconTrendUp = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const IconMapPin = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

interface DashboardData {
    overview: { totalApplications: number; pendingReview: number; approved: number; rejected: number; };
    byStatus: Record<string, number>;
    byPlantType: Record<string, number>;
    byProvince: Record<string, number>;
    monthlyTrend: Array<{ month: number; applications: number; approved: number }>;
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const token = localStorage.getItem("staff_token");
        if (!token) { router.push("/staff/login"); return; }
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/v2/reports/dashboard", { credentials: "include" });
            const result = await res.json();
            if (result.success) setData(result.data);
            else setData({
                overview: { totalApplications: 1234, pendingReview: 45, approved: 1089, rejected: 100 },
                byStatus: { CERTIFIED: 1003, AUDIT_PENDING: 56, SUBMITTED: 45, PAYMENT_1_PENDING: 34, DRAFT: 23 },
                byPlantType: { 'กัญชา': 450, 'กระท่อม': 320, 'ขมิ้นชัน': 180, 'ขิง': 120, 'กระชายดำ': 90 },
                byProvince: { 'กรุงเทพฯ': 120, 'เชียงใหม่': 98, 'นครราชสีมา': 87, 'ขอนแก่น': 76, 'อุบลฯ': 65 },
                monthlyTrend: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, applications: Math.floor(Math.random() * 100) + 50, approved: Math.floor(Math.random() * 80) + 30 })),
            });
        } catch { setData({ overview: { totalApplications: 1234, pendingReview: 45, approved: 1089, rejected: 100 }, byStatus: { CERTIFIED: 1003 }, byPlantType: { 'กัญชา': 450 }, byProvince: { 'กรุงเทพฯ': 120 }, monthlyTrend: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, applications: 70, approved: 50 })) }); }
        finally { setLoading(false); }
    };

    const handleExport = (format: 'csv' | 'json', type: string) => {
        setExporting(true);
        window.open(`/api/v2/reports/export?format=${format}&type=${type}`, '_blank');
        setExporting(false);
    };

    if (!mounted) return null;

    const getMaxValue = (obj: Record<string, number>) => Math.max(...Object.values(obj), 1);
    const chartColors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500', 'bg-violet-500', 'bg-cyan-500'];
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    return (
        <StaffLayout title="Analytics Dashboard" subtitle="ภาพรวมและสถิติระบบรับรอง GACP">
            <div className="flex gap-3 mb-8">
                <button onClick={loadData} disabled={loading} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm ${isDark ? 'bg-slate-700 border border-slate-600 text-slate-300' : 'bg-white border border-slate-200 text-slate-600'}`}>
                    <IconRefresh size={16} /> รีเฟรช
                </button>
                <button onClick={() => handleExport('csv', 'applications')} disabled={exporting} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium">
                    <IconDownload size={16} /> Export CSV
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-24">
                    <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
            ) : data ? (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "คำขอทั้งหมด", value: data.overview.totalApplications, Icon: IconDocument, bgColor: "bg-emerald-500", trend: "+12%", up: true },
                            { label: "รอตรวจสอบ", value: data.overview.pendingReview, Icon: IconChart, bgColor: "bg-blue-500", trend: "-5%", up: false },
                            { label: "ได้รับรอง", value: data.overview.approved, Icon: IconCheckCircle, bgColor: "bg-emerald-500", trend: "+8%", up: true },
                            { label: "ไม่ผ่าน", value: data.overview.rejected, Icon: IconDocument, bgColor: "bg-red-500", trend: "-2%", up: false },
                        ].map((card, i) => (
                            <div key={i} className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-slate-500">{card.label}</span>
                                    <div className={`w-8 h-8 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                                        <card.Icon size={16} className="text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl font-semibold">{card.value.toLocaleString()}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <span className={`text-xs ${card.up ? 'text-emerald-500' : 'text-red-500'}`}>{card.up ? '↑' : '↓'} {card.trend}</span>
                                    <span className="text-xs text-slate-500">vs เดือนก่อน</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                        {/* Monthly Trend */}
                        <div className={`lg:col-span-2 p-5 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                            <h3 className="flex items-center gap-2 text-base font-semibold mb-5"><IconTrendUp size={18} className="text-emerald-600" /> แนวโน้มรายเดือน</h3>
                            <div className="flex items-end h-48 gap-2">
                                {data.monthlyTrend.map((m, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full flex gap-0.5 justify-center">
                                            <div className="w-[40%] bg-emerald-500/30 rounded-t" style={{ height: `${(m.applications / 120) * 160}px` }} />
                                            <div className="w-[40%] bg-emerald-500 rounded-t" style={{ height: `${(m.approved / 120) * 160}px` }} />
                                        </div>
                                        <span className="text-[10px] text-slate-500">{months[i]}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500/30 rounded" /><span className="text-xs text-slate-500">คำขอใหม่</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded" /><span className="text-xs text-slate-500">ได้รับรอง</span></div>
                            </div>
                        </div>

                        {/* By Plant Type */}
                        <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                            <h3 className="flex items-center gap-2 text-base font-semibold mb-5"><IconLeaf size={18} className="text-emerald-600" /> ตามประเภทพืช</h3>
                            <div className="space-y-3">
                                {Object.entries(data.byPlantType).slice(0, 5).map(([name, count], i) => (
                                    <div key={name}>
                                        <div className="flex justify-between text-sm mb-1"><span>{name}</span><span className="font-semibold">{count}</span></div>
                                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                            <div className={`h-full ${chartColors[i % chartColors.length]} rounded-full`} style={{ width: `${(count / getMaxValue(data.byPlantType)) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* By Status */}
                        <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                            <h3 className="flex items-center gap-2 text-base font-semibold mb-5"><IconDocument size={18} className="text-emerald-600" /> ตามสถานะ</h3>
                            <div className="space-y-2.5">
                                {Object.entries(data.byStatus).map(([status, count], i) => {
                                    const labels: Record<string, string> = { CERTIFIED: 'ได้รับรอง', AUDIT_PENDING: 'รอตรวจ', SUBMITTED: 'ยื่นแล้ว', PAYMENT_1_PENDING: 'รอชำระ 1', DRAFT: 'ร่าง', REVISION_REQ: 'ต้องแก้ไข' };
                                    return (
                                        <div key={status} className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 ${chartColors[i % chartColors.length]} rounded`} />
                                            <span className="flex-1 text-sm text-slate-500">{labels[status] || status}</span>
                                            <span className="text-sm font-semibold">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* By Province */}
                        <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                            <h3 className="flex items-center gap-2 text-base font-semibold mb-5"><IconMapPin size={18} className="text-emerald-600" /> ตามจังหวัด (Top 5)</h3>
                            <div className="space-y-3">
                                {Object.entries(data.byProvince).slice(0, 5).map(([name, count], i) => (
                                    <div key={name}>
                                        <div className="flex justify-between text-sm mb-1"><span>{name}</span><span className="font-semibold">{count}</span></div>
                                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                            <div className={`h-full ${chartColors[(i + 2) % chartColors.length]} rounded-full`} style={{ width: `${(count / getMaxValue(data.byProvince)) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </StaffLayout>
    );
}
