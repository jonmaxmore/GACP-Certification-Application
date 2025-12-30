"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PLANTS } from '../hooks/useWizardStore';

const SITE_TYPE_LABELS: Record<string, string> = {
    OUTDOOR: 'กลางแจ้ง',
    INDOOR: 'โรงเรือนระบบปิด',
    GREENHOUSE: 'โรงเรือนทั่วไป',
};

const FEE_PER_SITE_TYPE = 5000;

interface PaymentData {
    applicantName: string;
    siteTypesCount: number;
    installment1Fee: number;
    invoiceId: string;
    paymentDate: string;
    plantId: string;
    siteTypes: string[];
}

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
        if (savedData) {
            setPaymentData(JSON.parse(savedData));
        }

        setTimeout(() => setShowConfetti(false), 3000);
    }, []);

    // Auto redirect countdown
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const plant = paymentData?.plantId ? PLANTS.find(p => p.id === paymentData.plantId) : null;
    const siteTypesCount = paymentData?.siteTypesCount || 1;
    const totalFee = paymentData?.installment1Fee || FEE_PER_SITE_TYPE;
    const applicantName = paymentData?.applicantName || '-';
    const siteTypes = paymentData?.siteTypes || ['OUTDOOR'];
    const paymentDate = paymentData?.paymentDate ? new Date(paymentData.paymentDate) : new Date();

    const handlePrint = () => window.print();

    return (
        <div style={{
            minHeight: '100vh',
            background: isDark ? '#0A0F1C' : 'linear-gradient(180deg, #ECFDF5 0%, #F9FAFB 100%)',
            fontFamily: "'Kanit', sans-serif",
            padding: '24px',
        }}>
            {/* Confetti Animation */}
            {showConfetti && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
                    {[...Array(40)].map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute', width: `${8 + Math.random() * 8}px`, height: `${8 + Math.random() * 8}px`,
                            background: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444'][i % 6],
                            borderRadius: i % 3 === 0 ? '50%' : '2px', left: `${Math.random() * 100}%`, top: '-20px',
                            animation: `confetti ${2 + Math.random()}s ease-out forwards`,
                            animationDelay: `${Math.random() * 0.8}s`,
                        }} />
                    ))}
                </div>
            )}

            {/* ========== SUCCESS HEADER ========== */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    width: '90px', height: '90px',
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
                    animation: 'scaleIn 0.5s ease-out',
                }}>
                    <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17L4 12" />
                    </svg>
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: isDark ? '#F9FAFB' : '#065F46', marginBottom: '8px' }}>
                    🎉 ยื่นคำขอสำเร็จ!
                </h1>
                <p style={{ fontSize: '15px', color: isDark ? '#9CA3AF' : '#047857', marginBottom: '4px' }}>
                    ชำระเงินเรียบร้อยแล้ว
                </p>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', background: isDark ? '#374151' : 'white',
                    borderRadius: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '2px solid #10B981',
                }}>
                    <span style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>หมายเลขคำขอ:</span>
                    <strong style={{ fontSize: '15px', color: '#059669', letterSpacing: '0.5px' }}>{appId}</strong>
                </div>
            </div>

            {/* ========== APPLICATION SUMMARY CARD ========== */}
            <div style={{
                background: isDark ? '#1F2937' : 'white',
                borderRadius: '16px', padding: '20px',
                marginBottom: '16px', maxWidth: '450px', margin: '0 auto 16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
            }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📋 สรุปข้อมูลคำขอ
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '12px', background: isDark ? '#374151' : '#F9FAFB', borderRadius: '10px' }}>
                        <div style={{ fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '4px' }}>ผู้ยื่นคำขอ</div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827' }}>{applicantName}</div>
                    </div>
                    <div style={{ padding: '12px', background: isDark ? '#374151' : '#F9FAFB', borderRadius: '10px' }}>
                        <div style={{ fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '4px' }}>ประเภทพืช</div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827' }}>{plant?.icon} {plant?.name || 'กัญชา'}</div>
                    </div>
                    <div style={{ padding: '12px', background: isDark ? '#374151' : '#F9FAFB', borderRadius: '10px' }}>
                        <div style={{ fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '4px' }}>ลักษณะพื้นที่</div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827' }}>
                            {siteTypes.map(t => SITE_TYPE_LABELS[t] || t).join(', ')}
                        </div>
                    </div>
                    <div style={{ padding: '12px', background: isDark ? '#374151' : '#F9FAFB', borderRadius: '10px' }}>
                        <div style={{ fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '4px' }}>วันที่ชำระเงิน</div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827' }}>
                            {paymentDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </div>
                {/* Payment Status Badge */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center',
                    padding: '12px', background: '#ECFDF5', borderRadius: '10px', marginTop: '16px',
                    border: '1px solid #10B981',
                }}>
                    <span style={{ fontSize: '20px' }}>✅</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#065F46' }}>ชำระเงินงวดที่ 1 เรียบร้อยแล้ว</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#059669' }}>฿{totalFee.toLocaleString()}</span>
                </div>
            </div>

            {/* ========== EMAIL NOTIFICATION ========== */}
            <div style={{
                background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                borderRadius: '12px', padding: '14px 16px', maxWidth: '450px', margin: '0 auto 16px',
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
            }}>
                <span style={{ fontSize: '20px' }}>📧</span>
                <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: isDark ? '#93C5FD' : '#1D4ED8', marginBottom: '2px' }}>
                        อีเมลยืนยันถูกส่งไปแล้ว
                    </p>
                    <p style={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                        กรุณาตรวจสอบอีเมลของท่านสำหรับใบเสร็จและรายละเอียดคำขอ
                    </p>
                </div>
            </div>

            {/* ========== RECEIPT TOGGLE ========== */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <button onClick={() => setShowReceipt(!showReceipt)} style={{
                    padding: '12px 24px', borderRadius: '10px', border: '2px solid #10B981',
                    background: showReceipt ? '#10B981' : 'white', color: showReceipt ? 'white' : '#10B981',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                    transition: 'all 0.2s ease',
                }}>
                    📄 {showReceipt ? 'ซ่อนใบเสร็จ' : 'ดูใบเสร็จรับเงิน'}
                </button>
            </div>

            {/* ========== OFFICIAL RECEIPT ========== */}
            {showReceipt && (
                <div id="official-receipt" style={{
                    background: 'white', color: '#111827', padding: '28px', maxWidth: '550px', margin: '0 auto 24px',
                    border: '2px solid #059669', borderRadius: '12px', fontFamily: "'Kanit', sans-serif",
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}>
                    {/* Receipt Header with Logo */}
                    <div style={{ textAlign: 'center', borderBottom: '3px solid #059669', paddingBottom: '20px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <img src="/images/logo-dtam.png" alt="DTAM" style={{ width: '50px', height: '50px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#065F46' }}>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                                <div style={{ fontSize: '11px', color: '#6B7280' }}>Department of Thai Traditional and Alternative Medicine</div>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#059669', margin: '8px 0 4px 0' }}>ใบเสร็จรับเงิน</h2>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>เลขที่ใบเสร็จ: <strong style={{ color: '#111827' }}>{appId}-REC</strong></div>
                    </div>

                    {/* Applicant Info */}
                    <table style={{ width: '100%', fontSize: '13px', marginBottom: '20px', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <td style={{ padding: '10px 0', color: '#6B7280', width: '35%' }}>วันที่ชำระเงิน</td>
                                <td style={{ padding: '10px 0', fontWeight: 500 }}>{paymentDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <td style={{ padding: '10px 0', color: '#6B7280' }}>ผู้ชำระเงิน</td>
                                <td style={{ padding: '10px 0', fontWeight: 500 }}>{applicantName}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <td style={{ padding: '10px 0', color: '#6B7280' }}>เลขที่คำขอ</td>
                                <td style={{ padding: '10px 0', fontWeight: 600, color: '#059669' }}>{appId}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '10px 0', color: '#6B7280' }}>ประเภทพืช</td>
                                <td style={{ padding: '10px 0', fontWeight: 500 }}>{plant?.icon} {plant?.name || 'กัญชา'}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Fee Breakdown */}
                    <div style={{ background: '#F9FAFB', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>รายการค่าธรรมเนียม (งวดที่ 1)</div>
                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                                    <th style={{ textAlign: 'left', padding: '10px 0', color: '#6B7280' }}>รายการ</th>
                                    <th style={{ textAlign: 'center', padding: '10px 0', color: '#6B7280', width: '60px' }}>จำนวน</th>
                                    <th style={{ textAlign: 'right', padding: '10px 0', color: '#6B7280', width: '100px' }}>ราคา</th>
                                </tr>
                            </thead>
                            <tbody>
                                {siteTypes.map((type, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                        <td style={{ padding: '12px 0' }}>ค่าตรวจเอกสาร ({SITE_TYPE_LABELS[type] || type})</td>
                                        <td style={{ textAlign: 'center', padding: '12px 0' }}>1</td>
                                        <td style={{ textAlign: 'right', padding: '12px 0' }}>฿{FEE_PER_SITE_TYPE.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2} style={{ padding: '14px 0', fontWeight: 700, fontSize: '14px' }}>รวมทั้งสิ้น</td>
                                    <td style={{ textAlign: 'right', padding: '14px 0', fontWeight: 700, fontSize: '18px', color: '#059669' }}>
                                        ฿{totalFee.toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Payment Success Badge */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', padding: '14px', background: '#ECFDF5', borderRadius: '10px', marginBottom: '20px', border: '2px solid #10B981' }}>
                        <span style={{ fontSize: '24px' }}>✅</span>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#065F46' }}>ชำระเงินเรียบร้อยแล้ว</span>
                    </div>

                    {/* Signature Area */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', paddingTop: '20px', borderTop: '2px dashed #E5E7EB' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ height: '50px', borderBottom: '1px solid #374151', marginBottom: '6px' }}></div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>ลงชื่อ ผู้รับเงิน</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ height: '50px', borderBottom: '1px solid #374151', marginBottom: '6px' }}></div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>วันที่</div>
                        </div>
                    </div>

                    {/* Print Button */}
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button onClick={handlePrint} style={{
                            padding: '12px 28px', borderRadius: '10px', border: '2px solid #059669',
                            background: 'white', color: '#059669', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                        }}>
                            🖨️ พิมพ์ใบเสร็จ / ดาวน์โหลด PDF
                        </button>
                    </div>
                </div>
            )}

            {/* ========== NEXT STEPS TIMELINE ========== */}
            <div style={{
                background: isDark ? '#1F2937' : 'white', borderRadius: '16px', padding: '20px',
                marginBottom: '16px', maxWidth: '450px', margin: '0 auto 16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
            }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🚀 ขั้นตอนถัดไป
                </h3>
                {[
                    { icon: '✅', text: 'ยื่นคำขอและชำระเงินงวดที่ 1 สำเร็จ', active: true, done: true },
                    { icon: '📋', text: 'รอตรวจสอบเอกสาร (ใช้เวลา 3-5 วันทำการ)', active: true, done: false },
                    { icon: '📅', text: 'นัดหมายและตรวจประเมินสถานที่', active: false, done: false },
                    { icon: '💳', text: 'ชำระเงินงวดที่ 2 (หลังผ่านการประเมิน)', active: false, done: false },
                    { icon: '🏆', text: 'รับใบรับรองมาตรฐาน GACP', active: false, done: false },
                ].map((step, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0',
                        borderLeft: `3px solid ${step.done ? '#10B981' : step.active ? '#F59E0B' : (isDark ? '#4B5563' : '#E5E7EB')}`,
                        marginLeft: '12px', paddingLeft: '18px',
                        opacity: step.done || step.active ? 1 : 0.6,
                    }}>
                        <span style={{ fontSize: '18px' }}>{step.icon}</span>
                        <span style={{
                            fontSize: '13px',
                            color: step.done ? '#10B981' : step.active ? '#D97706' : (isDark ? '#9CA3AF' : '#6B7280'),
                            fontWeight: step.active ? 600 : 400,
                        }}>{step.text}</span>
                    </div>
                ))}
            </div>

            {/* ========== ACTION BUTTONS ========== */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '450px', margin: '0 auto' }}>
                <Link href="/tracking" style={{
                    padding: '16px 24px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: 'white', fontSize: '16px', fontWeight: 600, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: '0 6px 24px rgba(16, 185, 129, 0.4)',
                }}>
                    📍 ติดตามสถานะคำขอ
                </Link>
                <Link href="/dashboard" style={{
                    padding: '16px 24px', borderRadius: '14px',
                    background: isDark ? '#374151' : 'white',
                    color: isDark ? '#F9FAFB' : '#374151', fontSize: '15px', fontWeight: 500, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    border: `2px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                }}>
                    🏠 กลับหน้าหลัก
                    {countdown > 0 && (
                        <span style={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#9CA3AF' }}>
                            (อัตโนมัติใน {countdown} วินาที)
                        </span>
                    )}
                </Link>
            </div>

            {/* ========== FEEDBACK LINK ========== */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <a href="#feedback" style={{ fontSize: '13px', color: isDark ? '#60A5FA' : '#3B82F6', textDecoration: 'underline' }}>
                    💬 แสดงความคิดเห็นเกี่ยวกับบริการ
                </a>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
                @keyframes confetti { 
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; } 
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } 
                }
                @keyframes floatMascot {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @media print {
                    body * { visibility: hidden; }
                    #official-receipt, #official-receipt * { visibility: visible; }
                    #official-receipt { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
                }
            `}</style>
        </div>
    );
}

