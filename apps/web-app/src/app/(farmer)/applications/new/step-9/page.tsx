"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, PLANTS } from '../hooks/useWizardStore';

const FEE_TABLE = {
    NEW: { HIGH_CONTROL: 5000, GENERAL: 2500 },
    RENEWAL: { HIGH_CONTROL: 3000, GENERAL: 1500 },
    MODIFY: { HIGH_CONTROL: 1000, GENERAL: 500 },
    REPLACEMENT: { HIGH_CONTROL: 500, GENERAL: 500 },
};

export default function Step9Payment() {
    const router = useRouter();
    const { state, resetWizard, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
    }, []);

    useEffect(() => {
        if (isLoaded && !state.siteData) router.replace('/applications/new/step-0');
    }, [isLoaded, state.siteData, router]);

    const plant = PLANTS.find(p => p.id === state.plantId);
    const plantGroup = plant?.group || 'GENERAL';
    const serviceType = state.serviceType || 'NEW';
    const fee = FEE_TABLE[serviceType]?.[plantGroup] || 2500;

    const handleSubmit = async () => {
        setProcessing(true);
        // Simulate payment & submission
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate application ID
        const appId = `GACP-${Date.now().toString(36).toUpperCase()}`;
        localStorage.setItem('last_application_id', appId);

        resetWizard();
        router.push('/applications/new/success');
    };

    const handleBack = () => router.push('/applications/new/step-8');

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>กำลังโหลด...</div>;

    return (
        <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    width: '56px', height: '56px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                    borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
                }}>
                    <span style={{ fontSize: '24px' }}>💳</span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '6px' }}>ชำระค่าธรรมเนียม</h2>
            </div>

            {/* Fee Summary */}
            <div style={{ background: isDark ? '#374151' : '#F9FAFB', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}` }}>
                    <span style={{ fontSize: '14px', color: isDark ? '#9CA3AF' : '#6B7280' }}>พืชสมุนไพร</span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827' }}>{plant?.icon} {plant?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}` }}>
                    <span style={{ fontSize: '14px', color: isDark ? '#9CA3AF' : '#6B7280' }}>ประเภทบริการ</span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827' }}>{serviceType === 'NEW' ? 'ขอรับรองใหม่' : serviceType === 'RENEWAL' ? 'ต่ออายุ' : serviceType === 'MODIFY' ? 'แก้ไขข้อมูล' : 'ทดแทน'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: isDark ? '#9CA3AF' : '#6B7280' }}>ค่าธรรมเนียม</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>฿{fee.toLocaleString()}</span>
                </div>
            </div>

            {/* QR Code Payment */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', display: 'inline-block', marginBottom: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                    {/* Placeholder QR */}
                    <div style={{ width: '180px', height: '180px', background: '#F3F4F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="#374151">
                            <rect x="10" y="10" width="25" height="25" />
                            <rect x="65" y="10" width="25" height="25" />
                            <rect x="10" y="65" width="25" height="25" />
                            <rect x="40" y="40" width="20" height="20" />
                            <rect x="65" y="65" width="25" height="25" />
                        </svg>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '12px' }}>สแกน QR Code เพื่อชำระเงินผ่าน PromptPay</p>
                </div>
            </div>

            {/* Payment Info */}
            <div style={{ background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: isDark ? '#93C5FD' : '#1D4ED8', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span>ℹ️</span>
                    <span>หลังชำระเงินแล้ว ระบบจะตรวจสอบและยืนยันอัตโนมัติภายใน 5 นาที</span>
                </p>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleBack} disabled={processing} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`, background: isDark ? '#374151' : 'white', color: isDark ? '#F9FAFB' : '#374151', fontSize: '15px', fontWeight: 500, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    ย้อนกลับ
                </button>
                <button onClick={handleSubmit} disabled={processing} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: processing ? '#9CA3AF' : 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', color: 'white', fontSize: '15px', fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: processing ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.4)' }}>
                    {processing ? (
                        <>
                            <span style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                            กำลังดำเนินการ...
                        </>
                    ) : (
                        <>✅ ยืนยันการชำระเงิน</>
                    )}
                </button>
            </div>

            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
