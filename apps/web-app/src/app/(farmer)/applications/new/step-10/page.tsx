"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, PLANTS } from '../hooks/useWizardStore';

const FEE_PER_SITE_TYPE = 5000;

const SITE_TYPE_LABELS: Record<string, string> = {
    OUTDOOR: 'กลางแจ้ง',
    INDOOR: 'โรงเรือนระบบปิด',
    GREENHOUSE: 'โรงเรือนทั่วไป',
};

export default function Step10Payment() {
    const router = useRouter();
    const { state, resetWizard, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'QR' | 'CARD'>('QR');

    const plant = PLANTS.find(p => p.id === state.plantId);
    const siteTypesCount = state.siteTypes?.length || 1;
    const totalFee = FEE_PER_SITE_TYPE * siteTypesCount;

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
    }, []);

    useEffect(() => {
        if (isLoaded && !state.siteData?.siteName) {
            router.replace('/applications/new/step-0');
        }
    }, [isLoaded, state.siteData, router]);

    const handlePayment = async () => {
        setIsPaying(true);
        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 2500));
        resetWizard();
        router.push('/applications/new/success');
    };

    const handleBack = () => router.push('/applications/new/step-9');

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>กำลังโหลด...</div>;

    return (
        <div style={{ fontFamily: "'Kanit', sans-serif" }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                    width: '56px', height: '56px',
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                }}>
                    <span style={{ fontSize: '24px' }}>💳</span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', margin: 0, marginBottom: '4px' }}>
                    ชำระค่าธรรมเนียมงวด 1
                </h2>
                <p style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    ค่าตรวจสอบเอกสาร
                </p>
            </div>

            {/* Fee Summary */}
            <div style={{
                background: isDark ? '#374151' : '#F9FAFB',
                borderRadius: '14px', padding: '16px', marginBottom: '20px',
            }}>
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>พืช</span>
                        <span style={{ fontSize: '13px', color: isDark ? '#F9FAFB' : '#111827' }}>{plant?.icon} {plant?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>ลักษณะพื้นที่</span>
                        <span style={{ fontSize: '13px', color: isDark ? '#F9FAFB' : '#111827' }}>
                            {state.siteTypes?.map(t => SITE_TYPE_LABELS[t]).join(', ') || '-'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>ค่าธรรมเนียม/ประเภท</span>
                        <span style={{ fontSize: '13px', color: isDark ? '#F9FAFB' : '#111827' }}>{FEE_PER_SITE_TYPE.toLocaleString()} บาท</span>
                    </div>
                </div>
                <div style={{ borderTop: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`, paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827' }}>ยอดชำระทั้งหมด</span>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>฿{totalFee.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: isDark ? '#D1D5DB' : '#374151', marginBottom: '10px' }}>
                    เลือกวิธีชำระเงิน
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button onClick={() => setPaymentMethod('QR')} style={{
                        padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                        border: paymentMethod === 'QR' ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                        background: paymentMethod === 'QR' ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : 'transparent',
                    }}>
                        <div style={{ fontSize: '28px', marginBottom: '4px' }}>📱</div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827' }}>QR PromptPay</div>
                    </button>
                    <button onClick={() => setPaymentMethod('CARD')} style={{
                        padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                        border: paymentMethod === 'CARD' ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                        background: paymentMethod === 'CARD' ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : 'transparent',
                    }}>
                        <div style={{ fontSize: '28px', marginBottom: '4px' }}>💳</div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827' }}>บัตรเครดิต</div>
                    </button>
                </div>
            </div>

            {/* QR Code Placeholder */}
            {paymentMethod === 'QR' && (
                <div style={{
                    background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '20px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                    <div style={{
                        width: '160px', height: '160px', background: '#F3F4F6',
                        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '12px', border: '2px dashed #D1D5DB',
                    }}>
                        <span style={{ fontSize: '40px' }}>📱</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center' }}>
                        สแกน QR Code เพื่อชำระเงิน<br />ผ่าน Mobile Banking
                    </p>
                </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleBack} disabled={isPaying} style={{
                    flex: 1, padding: '14px', borderRadius: '12px',
                    border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                    background: isDark ? '#374151' : 'white',
                    color: isDark ? '#F9FAFB' : '#374151',
                    fontSize: '14px', fontWeight: 500, cursor: isPaying ? 'not-allowed' : 'pointer',
                    opacity: isPaying ? 0.5 : 1,
                }}>
                    ย้อนกลับ
                </button>
                <button onClick={handlePayment} disabled={isPaying} style={{
                    flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
                    background: isPaying
                        ? '#9CA3AF'
                        : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: 'white',
                    fontSize: '15px', fontWeight: 600, cursor: isPaying ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: isPaying ? 'none' : '0 4px 16px rgba(16, 185, 129, 0.35)',
                }}>
                    {isPaying ? (
                        <>
                            <div style={{
                                width: '18px', height: '18px', border: '2px solid white',
                                borderTopColor: 'transparent', borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                            }} />
                            กำลังดำเนินการ...
                        </>
                    ) : (
                        <>ยืนยันการชำระเงิน ฿{totalFee.toLocaleString()}</>
                    )}
                </button>
            </div>

            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
