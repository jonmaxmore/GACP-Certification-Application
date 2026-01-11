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
        <div className="p-6 lg:p-10 pb-24 lg:pb-10 max-w-5xl mx-auto font-[Kanit] animate-fadeIn">
            {/* Header */}
            <header className="mb-8 border-b pb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">การชำระค่าธรรมเนียม</h1>
                <p className="text-slate-500 mt-1">ติดตามสถานะและชำระค่าธรรมเนียมการรับรอง GACP</p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-lg shadow-black/5`}>
                            <stat.Icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6">
                {[
                    { key: "ALL", label: "รายการทั้งหมด" },
                    { key: "PENDING", label: "รอชำระเงิน" },
                    { key: "PAID", label: "ประวัติการชำระ" }
                ].map(tab => (
                    <button key={tab.key} onClick={() => setFilter(tab.key as any)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${filter === tab.key
                            ? 'bg-slate-800 text-white shadow-md'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Payment List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-500 text-sm">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : displayedPayments.length > 0 ? (
                    displayedPayments.map(p => {
                        const typeCfg = TYPE_CONFIG[p.type];
                        const statusCfg = STATUS_LABELS[p.status] || { label: p.status, color: 'slate' };
                        const feeName = getFeeName(p);

                        return (
                            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${getColorCls(typeCfg.color, true)}`}>
                                        <IconDocument size={20} className={getColorCls(typeCfg.color)} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getColorCls(typeCfg.color, true)} ${getColorCls(typeCfg.color)}`}>
                                                {typeCfg.label}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getColorCls(statusCfg.color, true)} ${getColorCls(statusCfg.color)}`}>
                                                {statusCfg.label}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">#{p.documentNumber}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg">{feeName}</h3>
                                        <p className="text-sm text-slate-500">สำหรับคำขอ: <Link href={`/tracking?appId=${p.applicationId}`} className="text-emerald-600 hover:underline font-mono ml-1">{p.applicationId?.substring(0, 8)}...</Link></p>
                                        <p className="text-xs text-slate-400 mt-1">วันที่: {new Date(p.createdAt).toLocaleDateString('th-TH')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 pl-16 md:pl-0">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 mb-0.5">จำนวนเงิน</p>
                                        <p className="text-lg font-bold text-slate-800">{formatAmount(p.amount)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setViewDoc(p)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium text-sm hover:bg-slate-200 transition-colors">
                                            ดูเอกสาร
                                        </button>
                                        {p.status === "PENDING" && (
                                            <button onClick={() => handleKsherPay(p.id)} disabled={uploading} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-medium text-sm shadow-lg shadow-purple-200 hover:bg-purple-700 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                                {uploading ? 'Processing...' : 'ชำระเงิน (Ksher)'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <IconDocument size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">ไม่พบรายการชำระเงิน</h3>
                        <p className="text-slate-500 text-sm">รายการเรียกเก็บเงินหรือใบเสร็จจะแสดงที่นี่</p>
                    </div>
                )}
            </div>

            {/* Modal - View Document */}
            {viewDoc && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewDoc(null)}>
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-5 border-b">
                            <h3 className="font-bold text-lg text-slate-800">{TYPE_CONFIG[viewDoc.type].label}</h3>
                            <button onClick={() => setViewDoc(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">✕</button>
                        </div>
                        <div className="p-8 bg-slate-50 max-h-[70vh] overflow-auto">
                            <div className="bg-white border border-slate-200 shadow-sm p-8 min-h-[500px] relative">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex gap-4">
                                        <img src="/images/dtam-logo.png" className="w-16 h-16 opacity-90" alt="" />
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">กรมการแพทย์แผนไทยฯ</h4>
                                            <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">88/23 หมู่ 4 ถนนติวานนท์ ต.ตลาดขวัญ อ.เมือง จ.นนทบุรี 11000</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded mb-2 tracking-wide uppercase">
                                            {viewDoc.type}
                                        </div>
                                        <p className="font-mono text-slate-600 font-medium">{viewDoc.documentNumber}</p>
                                        <p className="text-xs text-slate-400">{new Date(viewDoc.createdAt).toLocaleDateString('th-TH')}</p>
                                    </div>
                                </div>

                                <div className="border-t-2 border-slate-100 my-8"></div>

                                <table className="w-full text-sm mb-8">
                                    <thead>
                                        <tr className="text-slate-500 border-b border-slate-200">
                                            <th className="py-2 text-left w-12">#</th>
                                            <th className="py-2 text-left">รายการ</th>
                                            <th className="py-2 text-right">จำนวนเงิน</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-slate-50">
                                            <td className="py-4 text-slate-400">1</td>
                                            <td className="py-4 font-medium text-slate-700">{getFeeName(viewDoc)}</td>
                                            <td className="py-4 text-right font-medium">{formatAmount(viewDoc.amount)}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={2} className="pt-4 text-right text-slate-500">รวมทั้งสิ้น</td>
                                            <td className="pt-4 text-right font-bold text-lg text-slate-900">{formatAmount(viewDoc.amount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>

                                {viewDoc.type === "INVOICE" && (
                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-xs text-amber-800 leading-relaxed">
                                        <strong>⚠️ หมายเหตุการชำระเงิน:</strong><br />
                                        กรุณาคลิก "ชำระเงิน (Ksher)" เพื่อดำเนินการผ่านระบบออนไลน์
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-5 border-t bg-white flex justify-end gap-3">
                            <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50" onClick={() => window.print()}>
                                พิมพ์เอกสาร
                            </button>
                            <button
                                onClick={() => PaymentService.downloadInvoicePdf(viewDoc.id, viewDoc.documentNumber)}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800">
                                ดาวน์โหลด PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
