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
                <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-surface-100' : 'text-primary-800'}`}>🎉 ยื่นคำขอสำเร็จ!</h1>
                <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-primary-600'}`}>ชำระเงินเรียบร้อยแล้ว</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary-600 shadow-sm ${isDark ? 'bg-slate-700' : 'bg-white'}`}>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>หมายเลขคำขอ:</span>
                    <strong className="text-sm text-primary-600 tracking-wide">{appId}</strong>
                </div>
            </div>

            {/* Application Summary */}
            <div className={`rounded-2xl p-5 mb-4 max-w-md mx-auto shadow-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>📋 สรุปข้อมูลคำขอ</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[{ label: 'ผู้ยื่นคำขอ', value: applicantName }, { label: 'ประเภทพืช', value: `${plant?.icon} ${plant?.name || 'กัญชา'}` }, { label: 'ลักษณะพื้นที่', value: siteTypes.map(t => SITE_TYPE_LABELS[t] || t).join(', ') }, { label: 'วันที่ชำระเงิน', value: paymentDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) }].map((item, i) => (
                        <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-surface-100'}`}>
                            <div className={`text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</div>
                            <div className={`text-sm font-medium ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>{item.value}</div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-2 items-center p-3 bg-primary-50 border border-primary-600 rounded-lg mt-4">
                    <span className="text-xl">✅</span>
                    <span className="text-sm font-semibold text-primary-800">ชำระเงินงวดที่ 1 เรียบร้อยแล้ว</span>
                    <span className="text-base font-bold text-primary-600">฿{totalFee.toLocaleString()}</span>
                </div>
            </div>

            {/* Email Notification */}
            <div className={`rounded-xl px-4 py-3 mb-4 max-w-md mx-auto flex items-start gap-3 border ${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                <span className="text-xl">📧</span>
                <div>
                    <p className={`text-sm font-medium mb-0.5 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>อีเมลยืนยันถูกส่งไปแล้ว</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>กรุณาตรวจสอบอีเมลของท่านสำหรับใบเสร็จและรายละเอียดคำขอ</p>
                </div>
            </div>

            {/* Receipt Toggle */}
            <div className="text-center mb-4">
                <button onClick={() => setShowReceipt(!showReceipt)} className={`px-6 py-3 rounded-lg border-2 border-primary-600 text-sm font-semibold inline-flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all ${showReceipt ? 'bg-primary-600 text-white' : 'bg-white text-primary-600'}`}>
                    📄 {showReceipt ? 'ซ่อนใบเสร็จ' : 'ดูใบเสร็จรับเงิน'}
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
                        <span className="text-2xl">✅</span>
                        <span className="text-base font-bold text-primary-800">ชำระเงินเรียบร้อยแล้ว</span>
                    </div>

                    {/* Signature */}
                    <div className="grid grid-cols-2 gap-6 pt-5 border-t-2 border-dashed border-surface-200">
                        {[{ title: 'ลงชื่อ ผู้รับเงิน' }, { title: 'วันที่' }].map((sig, i) => (<div key={i} className="text-center"><div className="h-12 border-b border-slate-600 mb-1.5"></div><div className="text-[11px] text-slate-500">{sig.title}</div></div>))}
                    </div>

                    {/* Print Button */}
                    <div className="text-center mt-5">
                        <button onClick={handlePrint} className="px-7 py-3 rounded-lg border-2 border-primary-600 bg-white text-primary-600 text-sm font-semibold inline-flex items-center gap-2">🖨️ พิมพ์ใบเสร็จ / ดาวน์โหลด PDF</button>
                    </div>
                </div>
            )}

            {/* Next Steps */}
            <div className={`rounded-2xl p-5 mb-4 max-w-md mx-auto shadow-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>🚀 ขั้นตอนถัดไป</h3>
                {[{ icon: '✅', text: 'ยื่นคำขอและชำระเงินงวดที่ 1 สำเร็จ', done: true, active: true }, { icon: '📋', text: 'รอตรวจสอบเอกสาร (ใช้เวลา 3-5 วันทำการ)', done: false, active: true }, { icon: '📅', text: 'นัดหมายและตรวจประเมินสถานที่', done: false, active: false }, { icon: '💳', text: 'ชำระเงินงวดที่ 2 (หลังผ่านการประเมิน)', done: false, active: false }, { icon: '🏆', text: 'รับใบรับรองมาตรฐาน GACP', done: false, active: false }].map((step, i) => (
                    <div key={i} className={`flex items-center gap-3.5 py-2.5 ml-3 pl-4 border-l-[3px] ${step.done ? 'border-primary-600' : step.active ? 'border-secondary-500' : isDark ? 'border-slate-600' : 'border-surface-200'} ${!step.done && !step.active ? 'opacity-60' : ''}`}>
                        <span className="text-lg">{step.icon}</span>
                        <span className={`text-sm ${step.done ? 'text-primary-600' : step.active ? 'text-secondary-600 font-semibold' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>{step.text}</span>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 max-w-md mx-auto">
                <Link href="/tracking" className="py-4 px-6 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 text-white text-base font-semibold text-center flex items-center justify-center gap-2.5 shadow-xl shadow-primary-500/40">📍 ติดตามสถานะคำขอ</Link>
                <Link href="/dashboard" className={`py-4 px-6 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2.5 border-2 ${isDark ? 'bg-slate-700 border-slate-600 text-surface-100' : 'bg-white border-surface-200 text-slate-700'}`}>
                    🏠 กลับหน้าหลัก {countdown > 0 && <span className="text-xs text-slate-400">(อัตโนมัติใน {countdown} วินาที)</span>}
                </Link>
            </div>

            {/* Feedback */}
            <div className="text-center mt-6">
                <a href="#feedback" className={`text-sm underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>💬 แสดงความคิดเห็นเกี่ยวกับบริการ</a>
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
