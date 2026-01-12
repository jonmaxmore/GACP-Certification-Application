"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PLANTS } from '../hooks/useWizardStore';

const SITE_TYPE_LABELS: Record<string, string> = { OUTDOOR: 'กลางแจ้ง', INDOOR: 'โรงเรือนระบบปิด', GREENHOUSE: 'โรงเรือนทั่วไป' };
const FEE_PER_SITE_TYPE = 5000;

interface PaymentData { applicantName: string; siteTypesCount: number; installment1Fee: number; invoiceId: string; paymentDate: string; plantId: string; siteTypes: string[]; }

export default function SuccessPage() {
    const [isDark, setIsDark] = useState(false);
    const [appId, setAppId] = useState('');
    const [showConfetti, setShowConfetti] = useState(true);
    const [showReceipt, setShowReceipt] = useState(false);
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        setAppId(localStorage.getItem('last_application_id') || `GACP-${Date.now().toString(36).toUpperCase()}`);
        const savedData = localStorage.getItem('last_payment_data');
        if (savedData) setPaymentData(JSON.parse(savedData));
        setTimeout(() => setShowConfetti(false), 3000);
    }, []);

    useEffect(() => { if (countdown > 0) { const t = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(t); } }, [countdown]);

    const plant = paymentData?.plantId ? PLANTS.find(p => p.id === paymentData.plantId) : null;
    const totalFee = paymentData?.installment1Fee || FEE_PER_SITE_TYPE;
    const applicantName = paymentData?.applicantName || '-';
    const siteTypes = paymentData?.siteTypes || ['OUTDOOR'];
    const paymentDate = paymentData?.paymentDate ? new Date(paymentData.paymentDate) : new Date();

    const handlePrint = () => window.print();

    return (
        <div className={`min-h-screen p-6 font-sans ${isDark ? 'bg-slate-900' : 'bg-gradient-to-b from-primary-50 to-surface-100'}`}>
            {/* Confetti */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {[...Array(40)].map((_, i) => (
                        <div key={i} className="absolute animate-[confetti_2s_ease-out_forwards]" style={{ width: `${8 + Math.random() * 8}px`, height: `${8 + Math.random() * 8}px`, background: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444'][i % 6], borderRadius: i % 3 === 0 ? '50%' : '2px', left: `${Math.random() * 100}%`, top: '-20px', animationDelay: `${Math.random() * 0.8}s` }} />
                    ))}
                </div>
            )}

            {/* Success Header */}
            <div className="text-center mb-6">
                <div className="w-[90px] h-[90px] bg-gradient-to-br from-primary-700 via-primary-600 to-primary-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/40 animate-[scaleIn_0.5s_ease-out]">
                    <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12" /></svg>
                </div>
                <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-surface-100' : 'text-primary-800'}`}>ยื่นคำขอสำเร็จ!</h1>
                <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-primary-600'}`}>ชำระเงินเรียบร้อยแล้ว</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary-600 shadow-sm ${isDark ? 'bg-slate-700' : 'bg-white'}`}>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>หมายเลขคำขอ:</span>
                    <strong className="text-sm text-primary-600 tracking-wide">{appId}</strong>
                </div>
            </div>

            {/* Application Summary */}
            <div className={`rounded-2xl p-5 mb-4 max-w-md mx-auto shadow-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>สรุปข้อมูลคำขอ</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[{ label: 'ผู้ยื่นคำขอ', value: applicantName }, { label: 'ประเภทพืช', value: `${plant?.icon} ${plant?.name || 'กัญชา'}` }, { label: 'ลักษณะพื้นที่', value: siteTypes.map(t => SITE_TYPE_LABELS[t] || t).join(', ') }, { label: 'วันที่ชำระเงิน', value: paymentDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) }].map((item, i) => (
                        <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-surface-100'}`}>
                            <div className={`text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</div>
                            <div className={`text-sm font-medium ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>{item.value}</div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-2 items-center p-3 bg-primary-50 border border-primary-600 rounded-lg mt-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M20 6L9 17L4 12" /></svg>
                    <span className="text-sm font-semibold text-primary-800">ชำระเงินงวดที่ 1 เรียบร้อยแล้ว</span>
                    <span className="text-base font-bold text-primary-600">฿{totalFee.toLocaleString()}</span>
                </div>
            </div>

            {/* Email Notification */}
            <div className={`rounded-xl px-4 py-3 mb-4 max-w-md mx-auto flex items-start gap-3 border ${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <div>
                    <p className={`text-sm font-medium mb-0.5 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>อีเมลยืนยันถูกส่งไปแล้ว</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>กรุณาตรวจสอบอีเมลของท่านสำหรับใบเสร็จและรายละเอียดคำขอ</p>
                </div>
            </div>

            {/* Receipt Toggle */}
            <div className="text-center mb-4">
                <button onClick={() => setShowReceipt(!showReceipt)} className={`px-6 py-3 rounded-lg border-2 border-primary-600 text-sm font-semibold inline-flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all ${showReceipt ? 'bg-primary-600 text-white' : 'bg-white text-primary-600'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    {showReceipt ? 'ซ่อนใบเสร็จ' : 'ดูใบเสร็จรับเงิน'}
                </button>
            </div>

            {/* Official Receipt */}
            {showReceipt && (
                <div id="official-receipt" className="bg-white text-slate-900 p-7 max-w-lg mx-auto mb-6 border-2 border-primary-600 rounded-xl shadow-xl font-sans print:border-0 print:shadow-none">
                    {/* Header */}
                    <div className="text-center border-b-[3px] border-primary-600 pb-5 mb-5">
                        <div className="flex justify-center items-center gap-3 mb-3">
                            <img src="/images/logo-dtam.png" alt="DTAM" className="w-12 h-12 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <div><div className="text-base font-bold text-primary-800">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div><div className="text-[11px] text-slate-500">Department of Thai Traditional and Alternative Medicine</div></div>
                        </div>
                        <h2 className="text-xl font-bold text-primary-600 my-2">ใบเสร็จรับเงิน</h2>
                        <div className="text-xs text-slate-500">เลขที่ใบเสร็จ: <strong className="text-slate-900">{appId}-REC</strong></div>
                    </div>

                    {/* Applicant Info */}
                    <table className="w-full text-sm mb-5">
                        <tbody>
                            {[{ label: 'วันที่ชำระเงิน', value: paymentDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) }, { label: 'ผู้ชำระเงิน', value: applicantName }, { label: 'เลขที่คำขอ', value: appId, highlight: true }, { label: 'ประเภทพืช', value: `${plant?.icon} ${plant?.name || 'กัญชา'}` }].map((row, i) => (
                                <tr key={i} className="border-b border-surface-200"><td className="py-2.5 text-slate-500 w-[35%]">{row.label}</td><td className={`py-2.5 font-medium ${row.highlight ? 'text-primary-600 font-semibold' : ''}`}>{row.value}</td></tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Fee Breakdown */}
                    <div className="bg-surface-100 rounded-lg p-4 mb-5">
                        <div className="text-xs font-semibold text-slate-700 mb-3">รายการค่าธรรมเนียม (งวดที่ 1)</div>
                        <table className="w-full text-sm">
                            <thead><tr className="border-b-2 border-surface-200"><th className="text-left py-2.5 text-slate-500">รายการ</th><th className="text-center py-2.5 text-slate-500 w-[60px]">จำนวน</th><th className="text-right py-2.5 text-slate-500 w-[100px]">ราคา</th></tr></thead>
                            <tbody>
                                {siteTypes.map((type, i) => (<tr key={i} className="border-b border-surface-200"><td className="py-3">ค่าตรวจเอกสาร ({SITE_TYPE_LABELS[type] || type})</td><td className="text-center py-3">1</td><td className="text-right py-3">฿{FEE_PER_SITE_TYPE.toLocaleString()}</td></tr>))}
                            </tbody>
                            <tfoot><tr><td colSpan={2} className="py-3.5 font-bold text-sm">รวมทั้งสิ้น</td><td className="text-right py-3.5 font-bold text-lg text-primary-600">฿{totalFee.toLocaleString()}</td></tr></tfoot>
                        </table>
                    </div>

                    {/* Success Badge */}
                    <div className="flex justify-center gap-2 items-center p-3.5 bg-primary-50 border-2 border-primary-600 rounded-lg mb-5">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M20 6L9 17L4 12" /></svg>
                        <span className="text-base font-bold text-primary-800">ชำระเงินเรียบร้อยแล้ว</span>
                    </div>

                    {/* Signature */}
                    <div className="grid grid-cols-2 gap-6 pt-5 border-t-2 border-dashed border-surface-200">
                        {[{ title: 'ลงชื่อ ผู้รับเงิน' }, { title: 'วันที่' }].map((sig, i) => (<div key={i} className="text-center"><div className="h-12 border-b border-slate-600 mb-1.5"></div><div className="text-[11px] text-slate-500">{sig.title}</div></div>))}
                    </div>

                    {/* Print Button */}
                    <div className="text-center mt-5">
                        <button onClick={handlePrint} className="px-7 py-3 rounded-lg border-2 border-primary-600 bg-white text-primary-600 text-sm font-semibold inline-flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                            พิมพ์ใบเสร็จ / ดาวน์โหลด PDF
                        </button>
                    </div>
                </div>
            )}

            {/* Next Steps */}
            <div className={`rounded-2xl p-5 mb-4 max-w-md mx-auto shadow-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ขั้นตอนถัดไป</h3>
                {[{ text: 'ยื่นคำขอและชำระเงินงวดที่ 1 สำเร็จ', done: true, active: true }, { text: 'รอตรวจสอบเอกสาร (ใช้เวลา 3-5 วันทำการ)', done: false, active: true }, { text: 'นัดหมายและตรวจประเมินสถานที่', done: false, active: false }, { text: 'ชำระเงินงวดที่ 2 (หลังผ่านการประเมิน)', done: false, active: false }, { text: 'รับใบรับรองมาตรฐาน GACP', done: false, active: false }].map((step, i) => (
                    <div key={i} className={`flex items-center gap-3.5 py-2.5 ml-3 pl-4 border-l-[3px] ${step.done ? 'border-primary-600' : step.active ? 'border-secondary-500' : isDark ? 'border-slate-600' : 'border-surface-200'} ${!step.done && !step.active ? 'opacity-60' : ''}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center ${step.done ? 'bg-primary-600 text-white' : step.active ? 'bg-secondary-100 text-secondary-600' : isDark ? 'bg-slate-700 text-slate-500' : 'bg-surface-200 text-slate-400'}`}>
                            {step.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg>}
                            {!step.done && <span className="text-[10px]">{i + 1}</span>}
                        </span>
                        <span className={`text-sm ${step.done ? 'text-primary-600' : step.active ? 'text-secondary-600 font-semibold' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>{step.text}</span>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 max-w-md mx-auto">
                <Link href="/tracking" className="py-4 px-6 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 text-white text-base font-semibold text-center flex items-center justify-center gap-2.5 shadow-xl shadow-primary-500/40">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    ติดตามสถานะคำขอ
                </Link>
                <Link href="/farmer/dashboard" className={`py-4 px-6 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2.5 border-2 ${isDark ? 'bg-slate-700 border-slate-600 text-surface-100' : 'bg-white border-surface-200 text-slate-700'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    กลับหน้าหลัก {countdown > 0 && <span className="text-xs text-slate-400">(อัตโนมัติใน {countdown} วินาที)</span>}
                </Link>
            </div>

            {/* Feedback */}
            <div className="text-center mt-6">
                <a href="#feedback" className={`text-sm underline flex items-center justify-center gap-1.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                    แสดงความคิดเห็นเกี่ยวกับบริการ
                </a>
            </div>

            {/* Styles */}
            <style jsx global>{`
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
                @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
                @media print { body * { visibility: hidden; } #official-receipt, #official-receipt * { visibility: visible; } #official-receipt { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; } }
            `}</style>
        </div>
    );
}
