"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaymentService, PaymentRecord } from "@/lib/services/payment-service";
import { AuthService } from "@/lib/services/auth-service";
import { IconDocument, IconClock, IconCheckCircle } from "@/components/ui/icons";

// ... (Imports logic)

// PaymentRecord interface is now imported, remove local definition if matching or update
// The imported one has serviceType.
// Local one: interface PaymentRecord { ... } -> Remove

const TYPE_CONFIG = {
    QUOTATION: { label: "ใบเสนอราคา", color: "blue", desc: "เอกสารเสนอราคาค่าธรรมเนียม" },
    INVOICE: { label: "ใบแจ้งหนี้", color: "amber", desc: "เอกสารเรียกเก็บเงิน" },
    RECEIPT: { label: "ใบเสร็จรับเงิน", color: "emerald", desc: "หลักฐานการชำระเงิน" }
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PENDING_APPROVAL: { label: "รอการตรวจสอบ", color: "amber" },
    APPROVED: { label: "ชำระแล้ว", color: "emerald" },
    REJECTED: { label: "ถูกปฏิเสธ", color: "red" },
    PENDING: { label: "รอชำระเงิน", color: "amber" },
    DELIVERED: { label: "ออกเอกสารแล้ว", color: "blue" },
    ISSUED: { label: "ออกเอกสารแล้ว", color: "blue" },
    CANCELLED: { label: "ยกเลิก", color: "red" },
};

export default function PaymentsPage() {
    const router = useRouter();
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "PAID">("ALL");
    const [viewDoc, setViewDoc] = useState<PaymentRecord | null>(null);
    const [payQR, setPayQR] = useState<PaymentRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const user = AuthService.getUser();
        if (!user) {
            router.push("/login");
            return;
        }
        loadPayments();
    }, [router]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const data = await PaymentService.getMyPayments();
            setPayments(data);
        } catch { setPayments([]); }
        finally { setLoading(false); }
    };

    const handleKsherPay = async (invoiceId: string) => {
        if (!confirm("ต้องการชำระเงินผ่าน Ksher Gateway ใช่หรือไม่?")) return;
        setUploading(true); // Re-use uploading state for "Processing"
        try {
            const res = await PaymentService.payWithKsher(invoiceId);
            if (res.success && res.data?.payment_url) {
                // Redirect to Ksher (Mock) Payment Page
                window.location.href = res.data.payment_url;
            } else {
                alert('ไม่สามารถเริ่มรายการชำระเงินได้' + (res.error ? ': ' + res.error : ''));
                setUploading(false);
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
            setUploading(false);
        }
    };

    const formatAmount = (n: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(n);

    // Heuristic + ServiceType
    const getFeeName = (p: PaymentRecord) => {
        if (p.serviceType === 'APPLICATION_FEE') return "ค่าธรรมเนียมคำขอ (Fee 1)";
        if (p.serviceType === 'AUDIT_FEE') return "ค่าธรรมเนียมการตรวจประเมิน (Fee 2)";
        if (p.amount <= 5000) return "ค่าธรรมเนียมคำขอ (Fee 1)";
        return "ค่าธรรมเนียมการตรวจประเมิน (Fee 2)";
    };

    const filteredPayments = payments.filter(p => {
        if (filter === "ALL") return true;
        if (filter === "PENDING") return p.status === "PENDING";
        if (filter === "PAID") return p.status === "APPROVED" || p.type === "RECEIPT";
        return true;
    });

    const displayedPayments = payments.filter(p => {
        if (filter === "ALL") return true;
        if (filter === "PENDING") return p.status === "PENDING" || p.status === "PENDING_APPROVAL";
        if (filter === "PAID") return p.status === "APPROVED" || p.type === "RECEIPT" || p.status === "PAID"; // Added PAID
        return true;
    });

    const pendingAmount = payments.filter(p => (p.status === "PENDING" || p.status === "PENDING_APPROVAL")).reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments.filter(p => p.status === "APPROVED" || p.type === "RECEIPT" || p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);

    const stats = [
        { label: "ยอดที่ต้องชำระ (Pending)", value: formatAmount(pendingAmount), Icon: IconClock, color: "bg-amber-500" },
        { label: "ชำระแล้ว (Paid)", value: formatAmount(paidAmount), Icon: IconCheckCircle, color: "bg-emerald-500" },
    ];

    const getColorCls = (color: string, bg = false) => {
        const map: Record<string, { bg: string; text: string }> = {
            emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
            amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
            blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
            red: { bg: 'bg-red-100', text: 'text-red-600' },
            slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
        };
        return bg ? map[color]?.bg || 'bg-slate-100' : map[color]?.text || 'text-slate-600';
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[2rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('/images/thai-pattern-bg.png')] opacity-5 mix-blend-overlay"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black mb-2 tracking-tight">Financial Center</h1>
                        <p className="text-slate-400 font-medium">ระบบชำระค่าธรรมเนียมและประวัติธุรกรรม</p>
                    </div>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/10">
                        <IconPayment size={32} className="text-emerald-400" />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-[#006837]/20 transition-all">
                        <div>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                            <p className="text-4xl font-black text-slate-800 group-hover:text-[#006837] transition-colors">{stat.value}</p>
                        </div>
                        <div className={`w-16 h-16 rounded-2xl ${stat.color.replace('bg-', 'bg-')}/10 flex items-center justify-center text-${stat.color.replace('bg-', '')}`}>
                            <stat.Icon size={32} className={stat.color.replace('bg-', 'text-')} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex">
                {[
                    { key: "ALL", label: "รายการทั้งหมด" },
                    { key: "PENDING", label: "รอชำระเงิน" },
                    { key: "PAID", label: "ประวัติการชำระ" }
                ].map(tab => (
                    <button key={tab.key} onClick={() => setFilter(tab.key as any)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${filter === tab.key
                            ? 'bg-white text-[#006837] shadow-md'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Payment List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-24">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400 font-bold">กำลังโหลดธุรกรรม...</p>
                    </div>
                ) : displayedPayments.length > 0 ? (
                    displayedPayments.map(p => {
                        const typeCfg = TYPE_CONFIG[p.type];
                        const statusCfg = STATUS_LABELS[p.status] || { label: p.status, color: 'slate' };
                        const feeName = getFeeName(p);

                        return (
                            <div key={p.id} className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                {p.status === 'PENDING' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>}
                                {p.status === 'APPROVED' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>}

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 pl-4">
                                    <div className="flex items-start gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${getColorCls(typeCfg.color, true)}`}>
                                            <IconDocument size={24} className={getColorCls(typeCfg.color)} />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${getColorCls(typeCfg.color, true)} ${getColorCls(typeCfg.color)}`}>
                                                    {typeCfg.label}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${getColorCls(statusCfg.color, true)} ${getColorCls(statusCfg.color)}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-slate-800 text-lg group-hover:text-[#006837] transition-colors">{feeName}</h3>
                                            <p className="text-xs text-slate-400 font-mono mt-1">REF: {p.documentNumber} • {new Date(p.createdAt).toLocaleDateString('th-TH')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">AMOUNT</p>
                                            <p className="text-2xl font-black text-slate-800">{formatAmount(p.amount)}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => setViewDoc(p)} className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                                                <IconDocument size={20} />
                                            </button>
                                            {p.status === "PENDING" && (
                                                <button onClick={() => handleKsherPay(p.id)} disabled={uploading} className="bg-[#006837] text-white px-6 rounded-xl font-bold shadow-lg shadow-emerald-700/20 hover:bg-[#00502b] hover:-translate-y-1 transition-all flex items-center gap-2">
                                                    {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'ชำระเงิน'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                            <IconDocument size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">ไม่พบรายการธุรกรรม</h3>
                        <p className="text-slate-400 text-sm font-medium">รายการเรียกเก็บเงินและใบเสร็จของคุณจะปรากฏที่นี่</p>
                    </div>
                )}
            </div>

            {/* Modal - View Document (Premium) */}
            {viewDoc && (
                <div className="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setViewDoc(null)}>
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                            <h3 className="font-black text-xl text-slate-800 tracking-tight">{TYPE_CONFIG[viewDoc.type].label}</h3>
                            <button onClick={() => setViewDoc(null)} className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-300 font-bold">✕</button>
                        </div>
                        <div className="p-8 md:p-12 bg-slate-100 max-h-[70vh] overflow-auto">
                            <div className="bg-white shadow-xl p-8 min-h-[600px] relative mx-auto max-w-xl animate-fade-in print:shadow-none print:p-0">
                                {/* Letterhead */}
                                <div className="flex justify-between items-start mb-10 border-b pb-8">
                                    <div className="flex gap-4">
                                        <img src="/images/dtam-logo.png" className="w-20 h-20 opacity-90" alt="" />
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</h4>
                                            <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed mt-1">88/23 หมู่ 4 ถนนติวานนท์ ต.ตลาดขวัญ อ.เมือง จ.นนทบุรี 11000</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-block px-4 py-1.5 bg-slate-900 text-white text-xs font-black rounded mb-3 tracking-widest uppercase">
                                            {viewDoc.type}
                                        </div>
                                        <p className="font-mono text-slate-600 font-bold text-lg">{viewDoc.documentNumber}</p>
                                        <p className="text-xs text-slate-400 font-medium">DATE: {new Date(viewDoc.createdAt).toLocaleDateString('th-TH')}</p>
                                    </div>
                                </div>

                                {/* Bill To */}
                                <div className="mb-12">
                                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">BILL TO</h5>
                                    <div className="text-sm font-bold text-slate-800">ผู้ยื่นคำขอรับรองมาตรฐาน GACP</div>
                                    <div className="text-xs text-slate-500 mt-1">Ref App ID: {viewDoc.applicationId}</div>
                                </div>

                                {/* Line Items */}
                                <table className="w-full text-sm mb-12">
                                    <thead>
                                        <tr className="text-slate-400 border-b-2 border-slate-100">
                                            <th className="py-3 text-left w-16 font-black uppercase text-[10px] tracking-widest">No.</th>
                                            <th className="py-3 text-left font-black uppercase text-[10px] tracking-widest">Description</th>
                                            <th className="py-3 text-right font-black uppercase text-[10px] tracking-widest">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-slate-50 group">
                                            <td className="py-6 text-slate-400 font-medium">01</td>
                                            <td className="py-6">
                                                <div className="font-bold text-slate-800">{getFeeName(viewDoc)}</div>
                                            </td>
                                            <td className="py-6 text-right font-bold text-slate-800 text-lg">{formatAmount(viewDoc.amount)}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Total */}
                                <div className="flex justify-end mb-12">
                                    <div className="w-1/2">
                                        <div className="flex justify-between py-2 border-b border-slate-100">
                                            <span className="text-slate-500 font-medium">Subtotal</span>
                                            <span className="font-bold text-slate-800">{formatAmount(viewDoc.amount)}</span>
                                        </div>
                                        <div className="flex justify-between py-4">
                                            <span className="text-slate-900 font-black text-lg">Total</span>
                                            <span className="font-black text-emerald-600 text-2xl">{formatAmount(viewDoc.amount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Note */}
                                {viewDoc.type === "INVOICE" && (
                                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 text-xs text-amber-800 leading-relaxed flex gap-3">
                                        <IconWarning size={20} className="flex-shrink-0 text-amber-600" />
                                        <div>
                                            <strong className="block mb-1 font-bold text-amber-900">Payment Instruction</strong>
                                            Please verify the details before proceeding with payment via Ksher Gateway.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t bg-white flex justify-end gap-3 z-20 relative">
                            <button className="px-6 py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all" onClick={() => window.print()}>
                                Print
                            </button>
                            <button
                                onClick={() => PaymentService.downloadInvoicePdf(viewDoc.id, viewDoc.documentNumber)}
                                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2">
                                <IconDocument size={18} />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
