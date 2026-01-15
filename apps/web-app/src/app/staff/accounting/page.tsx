"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient as api } from "@/lib/api";
import StaffLayout from "../components/StaffLayout";
import { IconDocument, IconCreditCard, IconCheckCircle, IconClock } from "@/components/ui/icons";

// Additional icons
const IconDollar = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

const IconWarning = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const IconDownload = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const IconEye = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

interface InvoiceItem {
    _id: string;
    invoiceNumber: string;
    applicationNumber: string;
    farmerName: string;
    amount: number;
    status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | "payment_verification_pending";
    dueDate: string;
    paidAt?: string;
    createdAt: string;
    notes?: string;
    id: string;
    items?: any;
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

    // Modal State
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [summaryRes, invoicesRes] = await Promise.all([
                api.get<{ data: PaymentSummary }>('/api/invoices/summary'),
                api.get<{ data: { invoices: InvoiceItem[] } }>('/api/invoices')
            ]);
            if (summaryRes.success && summaryRes.data?.data) setSummary(summaryRes.data.data);
            else setSummary({ totalRevenue: 0, pendingAmount: 0, overdueAmount: 0, monthlyRevenue: 0, invoiceCount: { total: 0, pending: 0, paid: 0, overdue: 0 } });

            if (invoicesRes.success && invoicesRes.data?.data?.invoices) {
                const mappedInvoices = invoicesRes.data.data.invoices.map((inv: any) => ({
                    ...inv,
                    items: inv.items ? (typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items) : [],
                }));
                setInvoices(mappedInvoices);
            }
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
            PENDING: { color: "bg-amber-100 text-amber-700", label: "รอชำระ" },
            PAID: { color: "bg-emerald-100 text-emerald-700", label: "ชำระแล้ว" },
            OVERDUE: { color: "bg-red-100 text-red-700", label: "เกินกำหนด" },
            CANCELLED: { color: "bg-slate-100 text-slate-700", label: "ยกเลิก" },
            payment_verification_pending: { color: "bg-blue-100 text-blue-700", label: "รอตรวจสอบ" }
        };
        const c = config[status] || { color: "bg-gray-100", label: status };
        return <span className={`px-3 py-1 rounded-lg text-xs font-medium ${c.color}`}>{c.label}</span>;
    };

    // Extract slip filename from notes
    const getSlipUrl = (notes?: string) => {
        if (!notes) return null;
        const match = notes.match(/\[Slip Uploaded: (.*?)\]/);
        if (match && match[1]) {
            // BACKEND_URL needs to be accessible. 
            // We can hardcode specific dev/prod logic or just use relative if proxy was set up (it isn't for /uploads).
            // Using direct port 5000 for now or relying on Next.js env.
            // A robust way: use the API base and strip '/api'
            return `http://localhost:5000/uploads/${match[1]}`;
        }
        return null;
    };

    const handleVerifyPayment = async () => {
        if (!selectedInvoice) return;
        if (!confirm("ยืนยันการชำระเงินใช่หรือไม่?")) return;

        setIsVerifying(true);
        try {
            const res = await api.post(`/api/invoices/${selectedInvoice.id}/pay`, { transactionId: 'MANUAL_VERIFY' });
            if (res.success) {
                alert("บันทึกการชำระเงินเรียบร้อยแล้ว");
                setSelectedInvoice(null);
                fetchData();
            } else {
                alert("เกิดข้อผิดพลาด: " + res.error);
            }
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setIsVerifying(false);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        if (activeTab === "all") return true;
        if (activeTab === "pending") return inv.status === "PENDING" || inv.status === "payment_verification_pending";
        return inv.status === (activeTab.toUpperCase() as any);
    });

    const stats = [
        { label: "รายได้รวม", value: summary ? formatCurrency(summary.totalRevenue) : "฿0", Icon: IconDollar, bgColor: "bg-emerald-500", sub: `${summary?.invoiceCount.paid || 0} ใบเสร็จ` },
        { label: "รอชำระ", value: summary ? formatCurrency(summary.pendingAmount) : "฿0", Icon: IconClock, bgColor: "bg-amber-500", sub: `${summary?.invoiceCount.pending || 0} รายการ` },
        { label: "เกินกำหนด", value: summary ? formatCurrency(summary.overdueAmount) : "฿0", Icon: IconWarning, bgColor: "bg-red-500", sub: `${summary?.invoiceCount.overdue || 0} รายการ` },
        { label: "รายได้เดือนนี้", value: summary ? formatCurrency(summary.monthlyRevenue) : "฿0", Icon: IconCreditCard, bgColor: "bg-blue-500", sub: "ม.ค. 2569" },
    ];

    if (isLoading && invoices.length === 0) {
        return (
            <StaffLayout title="ระบบบัญชี" subtitle="กำลังโหลด...">
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                </div>
            </StaffLayout>
        );
    }

    return (
        <StaffLayout title="ระบบบัญชีและการเงิน" subtitle="Accountant Dashboard">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className={`p-4 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</span>
                            <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                <stat.Icon size={16} className="text-white" />
                            </div>
                        </div>
                        <p className="text-xl font-semibold">{stat.value}</p>
                        <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Invoice Table */}
            <div className={`rounded-xl overflow-hidden border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                <div className={`px-6 py-4 border-b flex items-center justify-between flex-wrap gap-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex gap-2">
                        {[
                            { key: "all", label: "ทั้งหมด", count: invoices.length },
                            { key: "pending", label: "รอชำระ", count: invoices.filter(i => i.status === "PENDING" || i.status === "payment_verification_pending").length },
                            { key: "paid", label: "ชำระแล้ว", count: invoices.filter(i => i.status === "PAID").length },
                            { key: "overdue", label: "เกินกำหนด", count: invoices.filter(i => i.status === "OVERDUE").length },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key ? "bg-emerald-600 text-white" : `${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} hover:bg-slate-200`
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700">
                        <IconDownload size={16} /> ส่งออก Excel
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={isDark ? 'bg-slate-700' : 'bg-slate-50'}>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">เลขที่ใบแจ้งหนี้</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ผู้ประกอบการ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">จำนวนเงิน</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">กำหนดชำระ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            {filteredInvoices.map(inv => (
                                <tr key={inv.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                                    <td className="px-6 py-4">
                                        <p className="font-mono text-sm font-semibold">{inv.invoiceNumber}</p>
                                        <p className="text-xs text-slate-400">{inv.applicationNumber}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{inv.farmerName}</td>
                                    <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(inv.amount)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm">{formatDate(inv.dueDate)}</p>
                                        {inv.paidAt && <p className="text-xs text-emerald-600">ชำระ: {formatDate(inv.paidAt)}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedInvoice(inv)}
                                                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                                <IconEye size={12} /> ดู
                                            </button>
                                            {inv.status === "payment_verification_pending" && (
                                                <button
                                                    onClick={() => { setSelectedInvoice(inv); }}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                                                    <IconCheckCircle size={12} /> ตรวจสอบ
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
                        <IconDocument size={32} className="mx-auto mb-3" />
                        <p>ไม่พบรายการ</p>
                    </div>
                )}
            </div>

            {/* Payment Verification Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-inherit z-10">
                            <div>
                                <h3 className="text-lg font-bold">รายละเอียดการชำระเงิน</h3>
                                <p className="text-sm text-slate-500">Invoice: {selectedInvoice.invoiceNumber}</p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-slate-100 rounded-full">
                                ✕
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Invoice Info */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-emerald-600 border-b pb-2">ข้อมูลใบแจ้งหนี้</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-slate-500">จำนวนเงิน:</div>
                                    <div className="font-bold text-lg">{formatCurrency(selectedInvoice.amount)}</div>

                                    <div className="text-slate-500">วันที่ออกเอกสาร:</div>
                                    <div>{formatDate(selectedInvoice.createdAt)}</div>

                                    <div className="text-slate-500">กำหนดชำระ:</div>
                                    <div>{formatDate(selectedInvoice.dueDate)}</div>

                                    <div className="text-slate-500">เกษตรกร:</div>
                                    <div>{selectedInvoice.farmerName}</div>

                                    <div className="text-slate-500">เลขที่ใบสมัคร:</div>
                                    <div>{selectedInvoice.applicationNumber}</div>

                                    <div className="text-slate-500">สถานะปัจจุบัน:</div>
                                    <div>{getStatusBadge(selectedInvoice.status)}</div>
                                </div>

                                {(selectedInvoice.status === "PENDING" || selectedInvoice.status === "payment_verification_pending") && (
                                    <div className="pt-4 mt-4 border-t">
                                        <button
                                            onClick={handleVerifyPayment}
                                            disabled={isVerifying}
                                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex justify-center items-center gap-2">
                                            {isVerifying ? 'กำลังบันทึก...' :
                                                <><IconCheckCircle /> ยืนยันการได้รับเงินถูกต้อง</>
                                            }
                                        </button>
                                        <p className="text-xs text-center text-slate-400 mt-2">
                                            การกระทำนี้จะเปลี่ยนสถานะเป็น "ชำระแล้ว" และออกใบเสร็จรับเงินทันที
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Slip Image */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-center">
                                <h4 className="font-semibold text-slate-700 mb-4 w-full">หลักฐานการชำระเงิน</h4>
                                {getSlipUrl(selectedInvoice.notes) ? (
                                    <a href={getSlipUrl(selectedInvoice.notes)!} target="_blank" rel="noopener noreferrer" className="block w-full">
                                        <img
                                            src={getSlipUrl(selectedInvoice.notes)!}
                                            alt="Payment Slip"
                                            className="w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-zoom-in"
                                        />
                                        <p className="text-center text-xs text-blue-500 mt-2">คลิกเพื่อดูรูปขยาย</p>
                                    </a>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 w-full bg-slate-100 rounded-lg border-dashed border-2 border-slate-300">
                                        <IconDocument size={48} className="mb-2 opacity-50" />
                                        <p>ไม่พบหลักฐานการชำระเงิน</p>
                                        <p className="text-xs">หรือยังไม่ได้อัปโหลด</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </StaffLayout>
    );
}
