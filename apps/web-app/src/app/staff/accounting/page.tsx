"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api-client";
import StaffLayout from "../components/StaffLayout";

interface InvoiceItem {
    _id: string;
    invoiceNumber: string;
    applicationNumber: string;
    farmerName: string;
    amount: number;
    status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
    dueDate: string;
    paidAt?: string;
    createdAt: string;
}

interface PaymentSummary {
    totalRevenue: number;
    pendingAmount: number;
    overdueAmount: number;
    monthlyRevenue: number;
    invoiceCount: { total: number; pending: number; paid: number; overdue: number };
}

export default function AccountingDashboard() {
    const router = useRouter();
    const [summary, setSummary] = useState<PaymentSummary | null>(null);
    const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "paid" | "overdue">("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [summaryRes, invoicesRes] = await Promise.all([
                api.get<{ data: PaymentSummary }>('/v2/invoices/summary'),
                api.get<{ data: { invoices: InvoiceItem[] } }>('/v2/invoices')
            ]);
            if (summaryRes.success && summaryRes.data?.data) setSummary(summaryRes.data.data);
            else setSummary({ totalRevenue: 0, pendingAmount: 0, overdueAmount: 0, monthlyRevenue: 0, invoiceCount: { total: 0, pending: 0, paid: 0, overdue: 0 } });
            if (invoicesRes.success && invoicesRes.data?.data?.invoices) setInvoices(invoicesRes.data.data.invoices);
            else setInvoices([]);
        } catch { setSummary(null); setInvoices([]); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        const token = localStorage.getItem("staff_token");
        const userData = localStorage.getItem("staff_user");
        if (!token || !userData) { router.push("/staff/login"); return; }
        try {
            const user = JSON.parse(userData);
            if (!["ACCOUNTANT", "ADMIN", "SUPER_ADMIN", "accountant", "admin"].includes(user.role)) {
                router.push("/staff/dashboard"); return;
            }
            fetchData();
        } catch { router.push("/staff/login"); }
    }, [router, fetchData]);

    const formatCurrency = (amt: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amt);
    const formatDate = (d: string) => new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });

    const getStatusBadge = (status: string) => {
        const config: Record<string, { color: string; label: string }> = {
            PENDING: { color: "bg-secondary-100 text-secondary-700", label: "รอชำระ" },
            PAID: { color: "bg-primary-100 text-primary-700", label: "ชำระแล้ว" },
            OVERDUE: { color: "bg-red-100 text-red-700", label: "เกินกำหนด" },
            CANCELLED: { color: "bg-slate-100 text-slate-700", label: "ยกเลิก" },
        };
        const c = config[status] || { color: "bg-gray-100", label: status };
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.color}`}>{c.label}</span>;
    };

    const filteredInvoices = invoices.filter(inv => activeTab === "all" || inv.status === activeTab.toUpperCase());

    if (isLoading) {
        return (
            <StaffLayout title="💰 ระบบบัญชี" subtitle="กำลังโหลด...">
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
            </StaffLayout>
        );
    }

    return (
        <StaffLayout title="💰 ระบบบัญชีและการเงิน" subtitle="Accountant Dashboard">
            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "รายได้รวม", value: formatCurrency(summary.totalRevenue), icon: "💵", color: "primary", sub: `${summary.invoiceCount.paid} ใบเสร็จ` },
                        { label: "รอชำระ", value: formatCurrency(summary.pendingAmount), icon: "⏳", color: "secondary", sub: `${summary.invoiceCount.pending} รายการ` },
                        { label: "เกินกำหนด", value: formatCurrency(summary.overdueAmount), icon: "⚠️", color: "red", sub: `${summary.invoiceCount.overdue} รายการ` },
                        { label: "รายได้เดือนนี้", value: formatCurrency(summary.monthlyRevenue), icon: "📊", color: "blue", sub: "ม.ค. 2569" },
                    ].map((card, i) => (
                        <div key={i} className={`p-5 rounded-2xl shadow-card ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">{card.label}</p>
                                    <p className={`text-2xl font-bold ${card.color === 'primary' ? 'text-primary-600'
                                            : card.color === 'secondary' ? 'text-secondary-600'
                                                : card.color === 'red' ? 'text-red-600'
                                                    : 'text-blue-600'
                                        }`}>{card.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${card.color === 'primary' ? 'bg-primary-100'
                                        : card.color === 'secondary' ? 'bg-secondary-100'
                                            : card.color === 'red' ? 'bg-red-100'
                                                : 'bg-blue-100'
                                    }`}>{card.icon}</div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">{card.sub}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Invoice Table */}
            <div className={`rounded-2xl shadow-card overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <div className={`px-6 py-4 border-b flex items-center justify-between flex-wrap gap-4 ${isDark ? 'border-slate-700' : 'border-surface-200'}`}>
                    <div className="flex gap-2">
                        {[
                            { key: "all", label: "ทั้งหมด", count: invoices.length },
                            { key: "pending", label: "รอชำระ", count: invoices.filter(i => i.status === "PENDING").length },
                            { key: "paid", label: "ชำระแล้ว", count: invoices.filter(i => i.status === "PAID").length },
                            { key: "overdue", label: "เกินกำหนด", count: invoices.filter(i => i.status === "OVERDUE").length },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? "bg-primary-600 text-white" : `${isDark ? 'bg-slate-700 text-slate-300' : 'bg-surface-100 text-slate-600'} hover:bg-slate-200`
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">📥 ส่งออก Excel</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={isDark ? 'bg-slate-700' : 'bg-surface-100'}>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">เลขที่ใบแจ้งหนี้</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ผู้ประกอบการ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">จำนวนเงิน</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">กำหนดชำระ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-surface-200'}`}>
                            {filteredInvoices.map(inv => (
                                <tr key={inv._id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-surface-50'} transition-colors`}>
                                    <td className="px-6 py-4">
                                        <p className="font-mono text-sm font-semibold">{inv.invoiceNumber}</p>
                                        <p className="text-xs text-slate-400">{inv.applicationNumber}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{inv.farmerName}</td>
                                    <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(inv.amount)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm">{formatDate(inv.dueDate)}</p>
                                        {inv.paidAt && <p className="text-xs text-primary-600">ชำระ: {formatDate(inv.paidAt)}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button className={`px-3 py-1 text-xs rounded-lg ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-surface-100 text-slate-700'}`}>👁️ ดู</button>
                                            {inv.status === "PENDING" && (
                                                <button className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200">✅ ยืนยันชำระ</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredInvoices.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <p className="text-5xl mb-4">📋</p>
                        <p>ไม่พบรายการ</p>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}
