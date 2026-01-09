"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient as api } from "@/lib/api";
import {
    IconHome, IconDocument, IconCompass, IconCreditCard, IconUser,
    IconSun, IconMoon, IconLogout, IconCheckCircle, IconClock, IconReceipt, IconLeaf
} from "@/components/ui/icons";

interface PaymentRecord {
    id: string; type: "QUOTATION" | "INVOICE" | "RECEIPT"; documentNumber: string;
    applicationId: string; amount: number; status: string; createdAt: string; paidAt?: string;
}

const TYPE_CONFIG = { QUOTATION: { label: "ใบเสนอราคา", color: "blue" }, INVOICE: { label: "ใบแจ้งหนี้", color: "amber" }, RECEIPT: { label: "ใบเสร็จ", color: "emerald" } };
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PENDING_APPROVAL: { label: "รออนุมัติ", color: "amber" }, APPROVED: { label: "อนุมัติแล้ว", color: "emerald" },
    REJECTED: { label: "ไม่อนุมัติ", color: "red" }, PENDING: { label: "รอชำระ", color: "amber" },
    DELIVERED: { label: "วางบิลแล้ว", color: "emerald" }, ISSUED: { label: "ออกแล้ว", color: "emerald" }, CANCELLED: { label: "ยกเลิก", color: "red" },
};

const NAV_ITEMS = [
    { href: "/dashboard", Icon: IconHome, label: "หน้าหลัก" },
    { href: "/applications", Icon: IconDocument, label: "คำขอ" },
    { href: "/establishments", Icon: IconLeaf, label: "แปลงปลูก" },
    { href: "/tracking", Icon: IconCompass, label: "ติดตาม" },
    { href: "/payments", Icon: IconCreditCard, label: "การเงิน", active: true },
    { href: "/profile", Icon: IconUser, label: "โปรไฟล์" },
];

export default function PaymentsPage() {
    const [user, setUser] = useState<{ firstName?: string; lastName?: string } | null>(null);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "PAID">("ALL");
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [viewDoc, setViewDoc] = useState<PaymentRecord | null>(null);
    const [payQR, setPayQR] = useState<PaymentRecord | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) { window.location.href = "/login"; return; }
        try { setUser(JSON.parse(userData)); loadPayments(); } catch { window.location.href = "/login"; }
    }, []);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const result = await api.get<PaymentRecord[]>("/payments/my");
            if (result.success && result.data) {
                const data = Array.isArray(result.data) ? result.data : (result.data as any).data || [];
                setPayments(data);
            }
            else setPayments([]);
        } catch { setPayments([]); }
        finally { setLoading(false); }
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };
    const formatAmount = (n: number) => new Intl.NumberFormat('th-TH').format(n);

    if (!mounted) return null;

    const filteredPayments = payments.filter(p => {
        if (filter === "ALL") return true;
        if (filter === "PENDING") return p.type === "INVOICE" && p.status === "PENDING";
        if (filter === "PAID") return p.type === "RECEIPT";
        return true;
    });

    const counts = {
        ALL: payments.length,
        PENDING: payments.filter(p => p.type === "INVOICE" && p.status === "PENDING").length,
        PAID: payments.filter(p => p.type === "RECEIPT").length,
    };

    const totalReceipts = payments.filter(p => p.type === "RECEIPT").reduce((sum, p) => sum + p.amount, 0);
    const pendingInvoices = payments.filter(p => p.type === "INVOICE" && p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0);
    const receiptCount = payments.filter(p => p.type === "RECEIPT").length;

    const getColorCls = (color: string, bg = false) => {
        const map: Record<string, { bg: string; text: string }> = {
            emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
            amber: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
            blue: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
            red: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400' },
        };
        return bg ? map[color]?.bg || 'bg-slate-100' : map[color]?.text || 'text-slate-600';
    };

    const stats = [
        { label: "ยอดรับเข้าทั้งหมด", value: `${formatAmount(totalReceipts)} ฿`, Icon: IconCheckCircle, color: "bg-emerald-500" },
        { label: "รอชำระ", value: `${formatAmount(pendingInvoices)} ฿`, Icon: IconClock, color: "bg-amber-500" },
        { label: "จำนวนใบเสร็จ", value: receiptCount, Icon: IconReceipt, color: "bg-blue-500" },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-stone-50 text-slate-900'}`}>
            {/* Sidebar - iOS Style */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-6 border-r ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-lg font-semibold text-white mb-8">G</div>
                <nav className="flex-1 flex flex-col gap-1 w-full px-3">
                    {NAV_ITEMS.map(item => (
                        <Link key={item.href} href={item.href}
                            className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all relative ${item.active
                                ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                                }`}>
                            {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-emerald-500 rounded-r" />}
                            <item.Icon size={22} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-col gap-2">
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
                    </button>
                    <button onClick={handleLogout} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'}`}>
                        <IconLogout size={20} />
                    </button>
                </div>
            </aside>

            {/* Mobile Nav - iOS Tab Bar */}
            <nav className={`lg:hidden fixed bottom-0 inset-x-0 h-20 flex justify-around items-center border-t ${isDark ? 'bg-slate-900/95 border-slate-800 backdrop-blur-lg' : 'bg-white/95 border-slate-200 backdrop-blur-lg'}`}>
                {NAV_ITEMS.map(item => (
                    <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2 px-4 min-w-[64px] ${item.active ? 'text-emerald-500' : (isDark ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                        <item.Icon size={24} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Main Content */}
            <main className="lg:ml-20 p-6 lg:p-8 pb-28 lg:pb-8 max-w-5xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">ประวัติการชำระเงิน</h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ใบเสนอราคา, ใบแจ้งหนี้, และใบเสร็จรับเงิน</p>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className={`p-4 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</span>
                                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                                    <stat.Icon size={16} className="text-white" />
                                </div>
                            </div>
                            <div className="text-2xl font-semibold">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {[{ key: "ALL", label: "ทั้งหมด" }, { key: "PENDING", label: "รอชำระ" }, { key: "PAID", label: "ชำระแล้ว" }].map(tab => (
                        <button key={tab.key} onClick={() => setFilter(tab.key as "ALL" | "PENDING" | "PAID")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === tab.key
                                ? 'bg-emerald-600 text-white'
                                : (isDark ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-emerald-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300')}`}>
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-md text-xs ${filter === tab.key ? 'bg-white/20' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>{counts[tab.key as keyof typeof counts]}</span>
                        </button>
                    ))}
                </div>

                {/* Payment List */}
                <div className={`rounded-xl overflow-hidden border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                <th className="p-4 text-left text-xs text-slate-500 font-medium">เอกสาร</th>
                                <th className="p-4 text-left text-xs text-slate-500 font-medium hidden md:table-cell">หมายเลขเคส</th>
                                <th className="p-4 text-left text-xs text-slate-500 font-medium hidden sm:table-cell">ประเภท</th>
                                <th className="p-4 text-right text-xs text-slate-500 font-medium">จำนวนเงิน</th>
                                <th className="p-4 text-center text-xs text-slate-500 font-medium">สถานะ</th>
                                <th className="p-4 text-center text-xs text-slate-500 font-medium">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.length > 0 ? filteredPayments.map(p => {
                                const typeCfg = TYPE_CONFIG[p.type];
                                const statusCfg = STATUS_LABELS[p.status] || { label: p.status, color: 'slate' };
                                return (
                                    <tr key={p.id} className={`border-b last:border-b-0 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getColorCls(typeCfg.color, true)}`}>
                                                    <IconDocument size={18} className={getColorCls(typeCfg.color)} />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{p.documentNumber}</p>
                                                    <p className="text-xs text-slate-500">{p.createdAt}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            {p.applicationId ? (
                                                <Link href={`/tracking?appId=${p.applicationId}`} className={`px-3 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {p.applicationId.substring(0, 8)}...
                                                </Link>
                                            ) : <span className="text-slate-500">-</span>}
                                        </td>
                                        <td className="p-4 hidden sm:table-cell"><span className={`px-3 py-1 rounded-lg text-xs font-medium ${getColorCls(typeCfg.color, true)} ${getColorCls(typeCfg.color)}`}>{typeCfg.label}</span></td>
                                        <td className="p-4 text-right font-semibold">{formatAmount(p.amount)} ฿</td>
                                        <td className="p-4 text-center"><span className={`px-3 py-1 rounded-lg text-xs font-medium ${getColorCls(statusCfg.color, true)} ${getColorCls(statusCfg.color)}`}>{statusCfg.label}</span></td>
                                        <td className="p-4">
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={() => setViewDoc(p)} className={`px-3 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>ดู</button>
                                                {p.type === "INVOICE" && p.status === "PENDING" && (
                                                    <button onClick={() => setPayQR(p)} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700">ชำระ</button>
                                                )}
                                                <button className={`px-3 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>PDF</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={6} className="p-12 text-center">
                                    <IconDocument size={32} className="mx-auto text-slate-400 mb-3" />
                                    <p className="text-slate-500">ไม่พบรายการ</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Document Preview Modal */}
            {viewDoc && (
                <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-5" onClick={() => setViewDoc(null)}>
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-auto bg-white rounded-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white flex justify-between items-center p-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900">{TYPE_CONFIG[viewDoc.type].label} - {viewDoc.documentNumber}</h3>
                            <button onClick={() => setViewDoc(null)} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm">✕ ปิด</button>
                        </div>
                        <div className="p-5 bg-slate-100">
                            <div className="bg-white shadow-lg p-8 font-[Kanit] text-sm">
                                {/* Header */}
                                <div className="flex justify-between border-b-2 border-slate-900 pb-3 mb-4">
                                    <div className="flex gap-3">
                                        <img src="/images/dtam-logo.png" alt="DTAM" className="w-12 h-12" onError={e => (e.currentTarget.style.display = 'none')} />
                                        <div>
                                            <p className="font-bold">กองกัญชาทางการแพทย์</p>
                                            <p className="text-xs font-semibold">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
                                            <p className="text-[9px] text-slate-500">88/23 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมือง จังหวัดนนทบุรี 11000</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 text-white text-xs font-semibold rounded ${viewDoc.type === 'QUOTATION' ? 'bg-blue-500' : viewDoc.type === 'INVOICE' ? 'bg-amber-500' : 'bg-emerald-500'}`}>{TYPE_CONFIG[viewDoc.type].label}</span>
                                        <p className="text-xs mt-2">เลขที่: {viewDoc.documentNumber}</p>
                                        <p className="text-xs text-slate-500">วันที่: {viewDoc.createdAt}</p>
                                    </div>
                                </div>
                                {/* Fee Table */}
                                <table className="w-full border-collapse text-xs mb-4">
                                    <thead><tr className="bg-slate-700 text-white"><th className="border border-slate-600 p-2 w-[8%]">ลำดับที่</th><th className="border border-slate-600 p-2">รายการ</th><th className="border border-slate-600 p-2 w-[10%]">จำนวน</th><th className="border border-slate-600 p-2 w-[10%]">หน่วย</th><th className="border border-slate-600 p-2 w-[12%] text-right">ราคา/หน่วย</th><th className="border border-slate-600 p-2 w-[12%] text-right">จำนวนเงิน</th></tr></thead>
                                    <tbody>
                                        <tr><td className="border border-slate-200 p-2 text-center">1.</td><td className="border border-slate-200 p-2">ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น</td><td className="border border-slate-200 p-2 text-center">1</td><td className="border border-slate-200 p-2 text-center">ต่อคำขอ</td><td className="border border-slate-200 p-2 text-right">{formatAmount(viewDoc.amount)}.00</td><td className="border border-slate-200 p-2 text-right">{formatAmount(viewDoc.amount)}.00</td></tr>
                                    </tbody>
                                    <tfoot><tr className="bg-amber-50"><td colSpan={5} className="border border-slate-200 p-2 text-right font-semibold">จำนวนเงินทั้งสิ้น</td><td className="border border-slate-200 p-2 text-right font-bold">{formatAmount(viewDoc.amount)}.00</td></tr></tfoot>
                                </table>
                                {viewDoc.type === "INVOICE" && <div className="text-[10px] p-3 bg-amber-50 rounded mb-4"><strong>หมายเหตุ:</strong> กรุณาชำระเงินภายใน 3 วัน<br />โอนเข้าบัญชี: เงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร ธ.กรุงไทย 4750134376</div>}
                            </div>
                        </div>
                        <div className="flex gap-3 p-4 border-t border-slate-200">
                            <button onClick={() => window.print()} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium flex items-center justify-center gap-1.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                ดาวน์โหลด PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PromptPay QR Modal */}
            {payQR && (
                <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-5" onClick={() => setPayQR(null)}>
                    <div className="w-full max-w-md bg-white rounded-3xl" onClick={e => e.stopPropagation()}>
                        <div className="p-5 text-center border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900">ชำระเงินด้วย PromptPay QR</h3>
                            <p className="text-sm text-slate-500 mt-1">สแกน QR Code เพื่อชำระเงิน</p>
                        </div>
                        <div className="p-6 text-center">
                            <span className="inline-block px-5 py-2 bg-[#00427A] text-white rounded-lg text-sm font-semibold mb-4">พร้อมเพย์ | PromptPay</span>
                            <div className="w-52 h-52 mx-auto mb-4 bg-white border-2 border-[#00427A] rounded-xl p-2 flex items-center justify-center">
                                <img src={`https://promptpay.io/0994566289/${payQR.amount}.png`} alt="PromptPay QR" className="w-44 h-44" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PROMPTPAY:${payQR.amount}`; }} />
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                                <p className="text-sm text-slate-500 mb-1">จำนวนเงินที่ต้องชำระ</p>
                                <p className="text-3xl font-bold text-emerald-500">฿{formatAmount(payQR.amount)}</p>
                            </div>
                            <div className="bg-slate-100 rounded-lg p-3 text-sm text-slate-600">
                                <p><strong>ผู้รับเงิน:</strong> กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
                                <p><strong>เลขที่เอกสาร:</strong> {payQR.documentNumber}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 flex flex-col gap-3">
                            <button className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                อัปโหลดหลักฐานการชำระ
                            </button>
                            <button onClick={() => setPayQR(null)} className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-500 font-medium">ยกเลิก</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
