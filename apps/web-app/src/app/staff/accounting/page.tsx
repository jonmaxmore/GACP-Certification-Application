"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api-client";

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
    invoiceCount: {
        total: number;
        pending: number;
        paid: number;
        overdue: number;
    };
}

interface StaffUser {
    id: string;
    firstName?: string;
    lastName?: string;
    role: string;
}

export default function AccountingDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<StaffUser | null>(null);
    const [summary, setSummary] = useState<PaymentSummary | null>(null);
    const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "paid" | "overdue">("all");
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch payment summary from API
            const summaryResult = await api.get<{ data: PaymentSummary }>(`/v2/payments/summary?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            if (summaryResult.success && summaryResult.data?.data) {
                setSummary(summaryResult.data.data);
            } else {
                setSummary({
                    totalRevenue: 0,
                    pendingAmount: 0,
                    overdueAmount: 0,
                    monthlyRevenue: 0,
                    invoiceCount: { total: 0, pending: 0, paid: 0, overdue: 0 },
                });
            }

            // Fetch invoices from API
            const invoicesResult = await api.get<{ data: { invoices: InvoiceItem[] } }>(`/v2/invoices?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            if (invoicesResult.success && invoicesResult.data?.data?.invoices) {
                setInvoices(invoicesResult.data.data.invoices);
            } else {
                setInvoices([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setSummary(null);
            setInvoices([]);
        } finally {
            setIsLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        const userData = localStorage.getItem("staff_user");

        if (!token || !userData) {
            router.push("/staff/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Check if user has accounting permission (case-insensitive)
            const allowedRoles = ["ACCOUNTANT", "ADMIN", "SUPER_ADMIN"];
            if (!allowedRoles.includes(parsedUser.role.toUpperCase())) {
                router.push("/staff/dashboard");
                return;
            }
        } catch {
            router.push("/staff/login");
        }

        fetchData();
    }, [router, fetchData]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: "bg-amber-100 text-amber-700",
            PAID: "bg-green-100 text-green-700",
            OVERDUE: "bg-red-100 text-red-700",
            CANCELLED: "bg-slate-100 text-slate-700",
        };
        const labels: Record<string, string> = {
            PENDING: "รอชำระ",
            PAID: "ชำระแล้ว",
            OVERDUE: "เกินกำหนด",
            CANCELLED: "ยกเลิก",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const filteredInvoices = invoices.filter(inv => {
        if (activeTab === "all") return true;
        if (activeTab === "pending") return inv.status === "PENDING";
        if (activeTab === "paid") return inv.status === "PAID";
        if (activeTab === "overdue") return inv.status === "OVERDUE";
        return true;
    });

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin text-4xl">⏳</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/staff/dashboard" className="text-emerald-200 hover:text-white">
                            ← กลับ
                        </Link>
                        <div className="h-6 w-px bg-emerald-500" />
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">💰</span>
                            <div>
                                <h1 className="text-xl font-bold">ระบบบัญชีและการเงิน</h1>
                                <p className="text-emerald-200 text-sm">ACCOUNTANT Dashboard</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-emerald-200 text-sm">
                            {user.firstName} {user.lastName}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">รายได้รวม</p>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {formatCurrency(summary.totalRevenue)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">
                                    💵
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                {summary.invoiceCount.paid} ใบเสร็จ
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">รอชำระ</p>
                                    <p className="text-2xl font-bold text-amber-600">
                                        {formatCurrency(summary.pendingAmount)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
                                    ⏳
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                {summary.invoiceCount.pending} รายการ
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">เกินกำหนด</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {formatCurrency(summary.overdueAmount)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
                                    ⚠️
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                {summary.invoiceCount.overdue} รายการ
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">รายได้เดือนนี้</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(summary.monthlyRevenue)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                                    📊
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                ธ.ค. 2567
                            </p>
                        </div>
                    </div>
                )}

                {/* Invoice Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Tabs */}
                    <div className="px-6 py-4 border-b flex items-center justify-between">
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
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                            📥 ส่งออก Excel
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        เลขที่ใบแจ้งหนี้
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        ผู้ประกอบการ
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        จำนวนเงิน
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        สถานะ
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        กำหนดชำระ
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        การดำเนินการ
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredInvoices.map(invoice => (
                                    <tr key={invoice._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <p className="font-mono text-sm font-semibold text-slate-900">
                                                {invoice.invoiceNumber}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {invoice.applicationNumber}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-900">{invoice.farmerName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {formatCurrency(invoice.amount)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(invoice.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">
                                                {formatDate(invoice.dueDate)}
                                            </p>
                                            {invoice.paidAt && (
                                                <p className="text-xs text-green-600">
                                                    ชำระ: {formatDate(invoice.paidAt)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                                                    👁️ ดู
                                                </button>
                                                {invoice.status === "PENDING" && (
                                                    <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                                                        ✅ ยืนยันชำระ
                                                    </button>
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
            </main>
        </div>
    );
}

