"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api-client";

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
            const result = await api.get<{ data: PaymentRecord[] }>("/v2/payments/my");
            if (result.success && result.data?.data) setPayments(result.data.data);
            else setPayments([]);
        } catch { setPayments([]); }
        finally { setLoading(false); }
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };
    const formatAmount = (n: number) => new Intl.NumberFormat('th-TH').format(n);

    if (!mounted) return null;

    const navItems = [
        { href: "/dashboard", icon: "🏠", label: "หน้าหลัก" },
        { href: "/applications", icon: "📄", label: "คำขอ" },
        { href: "/tracking", icon: "🧭", label: "ติดตาม" },
        { href: "/payments", icon: "💳", label: "การเงิน", active: true },
        { href: "/profile", icon: "👤", label: "โปรไฟล์" },
    ];

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

    return (
        <div className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-gradient-to-br from-stone-50 via-emerald-50/30 to-stone-100 text-slate-900'}`}>
            {/* Decorative Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-200/40'}`} />
                <div className={`absolute top-1/2 -left-40 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-amber-900/10' : 'bg-amber-100/40'}`} />
            </div>

            {/* Sidebar - Glassmorphism */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-[76px] flex-col items-center py-6 border-r z-50 backdrop-blur-xl ${isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/70 border-slate-200/50'}`}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl font-bold text-white mb-8 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300">G</div>
                <nav className="flex-1 flex flex-col gap-2 w-full px-2">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className={`group flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 relative ${item.active
                            ? (isDark ? 'bg-emerald-500/20 shadow-lg shadow-emerald-500/10' : 'bg-emerald-50 shadow-md shadow-emerald-500/10')
                            : 'hover:bg-slate-100/80 dark:hover:bg-slate-700/50'}`}>
                            {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-r-full" />}
                            <span className={`text-xl transition-transform duration-300 ${item.active ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                            <span className={`text-[10px] font-semibold tracking-wide ${item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-col gap-3">
                    <button onClick={toggleTheme} className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${isDark ? 'bg-emerald-500/20 hover:bg-emerald-500/30' : 'bg-emerald-50 hover:bg-emerald-100'}`}>{isDark ? '☀️' : '🌙'}</button>
                    <button onClick={handleLogout} className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-all duration-300">🚪</button>
                </div>
            </aside>

            {/* Mobile Nav - Glassmorphism */}
            <nav className={`lg:hidden fixed bottom-0 inset-x-0 h-20 flex justify-around items-center z-50 border-t backdrop-blur-xl ${isDark ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white/80 border-slate-200/50'}`}>
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 ${item.active ? (isDark ? 'bg-emerald-500/20' : 'bg-emerald-50') : ''}`}>
                        <span className={`text-xl ${item.active ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
                        <span className={`text-[10px] font-semibold ${item.active ? 'text-emerald-500' : 'text-slate-500'}`}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Main Content */}
            <main className="lg:ml-[76px] p-6 lg:p-10 pb-28 lg:pb-10 max-w-6xl relative z-10">
                {/* Header with Glass Card */}
                <header className={`mb-10 p-6 rounded-3xl backdrop-blur-sm ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">ประวัติการชำระเงิน</h1>
                    <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ใบเสนอราคา, ใบแจ้งหนี้, และใบเสร็จรับเงิน</p>
                </header>

                {/* Stats with Gradient Icons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[{ icon: "✅", label: "ยอดรับเข้าทั้งหมด", value: `${formatAmount(totalReceipts)} ฿`, gradient: "from-emerald-500 to-green-500" },
                    { icon: "💳", label: "รอชำระ", value: `${formatAmount(pendingInvoices)} ฿`, gradient: "from-amber-500 to-orange-500" },
                    { icon: "🧾", label: "จำนวนใบเสร็จ", value: receiptCount, gradient: "from-blue-500 to-indigo-500" }
                    ].map((stat, i) => (
                        <div key={i} className={`p-5 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/60 border-slate-200/50'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</span>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-lg shadow-lg`}>{stat.icon}</div>
                            </div>
                            <div className="text-3xl font-bold">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs - Premium Pills */}
                <div className="flex gap-3 mb-6">
                    {[{ key: "ALL", label: "ทั้งหมด", icon: "📋" }, { key: "PENDING", label: "รอชำระ", icon: "⏳" }, { key: "PAID", label: "ชำระแล้ว", icon: "✅" }].map(tab => (
                        <button key={tab.key} onClick={() => setFilter(tab.key as "ALL" | "PENDING" | "PAID")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${filter === tab.key
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                : (isDark ? 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:border-emerald-500/30' : 'bg-white/60 border border-slate-200/50 text-slate-600 hover:border-emerald-300')}`}>
                            <span>{tab.icon}</span>
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${filter === tab.key ? 'bg-white/20' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>{counts[tab.key as keyof typeof counts]}</span>
                        </button>
                    ))}
                </div>

                {/* Payment List - Glass Card */}
                <div className={`rounded-3xl overflow-hidden backdrop-blur-sm shadow-lg ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/60 border border-slate-200/50'}`}>
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
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getColorCls(typeCfg.color, true)}`}>📄</div>
                                                <div>
                                                    <p className="font-medium">{p.documentNumber}</p>
                                                    <p className="text-xs text-slate-500">{p.createdAt}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            {p.applicationId ? (
                                                <Link href={`/tracking?appId=${p.applicationId}`} className={`px-3 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    📋 {p.applicationId.substring(0, 8)}...
                                                </Link>
                                            ) : <span className="text-slate-500">-</span>}
                                        </td>
                                        <td className="p-4 hidden sm:table-cell"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getColorCls(typeCfg.color, true)} ${getColorCls(typeCfg.color)}`}>{typeCfg.label}</span></td>
                                        <td className="p-4 text-right font-semibold">{formatAmount(p.amount)} ฿</td>
                                        <td className="p-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getColorCls(statusCfg.color, true)} ${getColorCls(statusCfg.color)}`}>{statusCfg.label}</span></td>
                                        <td className="p-4">
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={() => setViewDoc(p)} className={`px-3 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>👁️ ดู</button>
                                                {p.type === "INVOICE" && p.status === "PENDING" && (
                                                    <button onClick={() => setPayQR(p)} className="px-3 py-2 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-500 text-white text-xs font-semibold">💳 ชำระ</button>
                                                )}
                                                <button className={`px-3 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>📥 PDF</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-500">📄<p className="mt-3">ไม่พบรายการ</p></td></tr>
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
                            <button onClick={() => window.print()} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium">📥 ดาวน์โหลด PDF</button>
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
                            <button className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-semibold">📤 อัปโหลดหลักฐานการชำระ</button>
                            <button onClick={() => setPayQR(null)} className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-500 font-medium">ยกเลิก</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
