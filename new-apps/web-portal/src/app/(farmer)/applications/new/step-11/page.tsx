"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, PLANTS } from '../hooks/useWizardStore';
import api from '@/services/apiClient';

const FEE_PER_SITE_TYPE = 5000;

export default function Step11Payment() {
    const router = useRouter();
    const { state, resetWizard, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'QR' | 'CARD'>('QR');
    const [isNavigating, setIsNavigating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentStep, setPaymentStep] = useState<'idle' | 'confirming' | 'paying' | 'completing'>('idle');

    useEffect(() => { setIsDark(localStorage.getItem("theme") === "dark"); }, []);
    useEffect(() => {
        // Don't redirect if we're navigating to success page
        if (isLoaded && !state.siteData && !isNavigating) {
            router.replace('/applications/new/step-0');
        }
    }, [isLoaded, state.siteData, router, isNavigating]);

    const siteTypesCount = state.siteTypes?.length || 1;
    const installment1Fee = FEE_PER_SITE_TYPE * siteTypesCount;
    const invoiceId = `GI-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    const docDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

    const applicantName = state.applicantData?.applicantType === 'INDIVIDUAL'
        ? `${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}`
        : state.applicantData?.applicantType === 'COMMUNITY'
            ? state.applicantData?.communityName || ''
            : state.applicantData?.companyName || '';

    const handlePayment = async () => {
        setProcessing(true);
        setIsNavigating(true);
        setError(null);

        try {
            const appId = state.applicationId;

            if (!appId) {
                setError('ไม่พบรหัสคำขอ กรุณาย้อนกลับไปตรวจสอบข้อมูล');
                setProcessing(false);
                setIsNavigating(false);
                return;
            }

            // Step 1: Confirm review (unlock payment)
            setPaymentStep('confirming');
            const confirmResult = await api.post(`/v2/applications/${appId}/confirm-review`, {});

            if (!confirmResult.success) {
                console.log('Confirm review result:', confirmResult);
                // Continue even if confirm fails (might already be confirmed)
            }

            // Step 2: Demo payment simulation
            setPaymentStep('paying');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment processing

            // Step 3: Update status to SUBMITTED (demo mode - bypass actual payment)
            setPaymentStep('completing');
            const statusResult = await api.post(`/v2/applications/${appId}/status`, {
                status: 'SUBMITTED',
                notes: 'Demo payment completed',
            });

            // Even if status update fails, continue to success page
            // because in production this would be handled by webhook
            console.log('Status update result:', statusResult);

            resetWizard();
            router.replace('/applications/new/success');

        } catch (err) {
            console.error('Payment error:', err);
            setError('เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง');
            setProcessing(false);
            setIsNavigating(false);
            setPaymentStep('idle');
        }
    };

    const handleBack = () => router.push('/applications/new/step-10');

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>กำลังโหลด...</div>;

    return (
        <div style={{ fontFamily: "'Kanit', sans-serif" }}>
            {/* Official Header Card */}
            <div style={{
                background: 'white', borderRadius: '12px', padding: '20px',
                marginBottom: '16px', border: '1px solid #E5E7EB',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
                {/* Header with Logo */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #1E3A5F' }}>
                    <img src="/images/dtam-logo.png" alt="DTAM" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E3A5F' }}>กองกัญชาทางการแพทย์</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E3A5F' }}>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ background: '#10B981', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>ชำระเงิน</div>
                        <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>งวดที่ 1</div>
                    </div>
                </div>

                {/* Recipient Info */}
                <div style={{ fontSize: '12px', marginBottom: '12px', color: '#374151' }}>
                    <div><strong>ผู้รับบริการ:</strong> {applicantName}</div>
                    <div><strong>เลขที่ใบวางบิล:</strong> {invoiceId}</div>
                    <div><strong>วันที่:</strong> {docDate}</div>
                </div>

                {/* Fee Summary */}
                <div style={{ background: '#ECFDF5', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                        <span style={{ color: '#374151' }}>ค่าตรวจสอบและประเมินคำขอเบื้องต้น</span>
                        <span style={{ fontWeight: 600, color: '#111827' }}>฿{installment1Fee.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6B7280', marginBottom: '8px' }}>
                        <span>จำนวน {siteTypesCount} ลักษณะพื้นที่ × ฿5,000</span>
                    </div>
                    <div style={{ borderTop: '1px solid #D1FAE5', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#065F46' }}>ยอดชำระงวดที่ 1</span>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>฿{installment1Fee.toLocaleString()}</span>
                    </div>
                </div>

                {/* Thai text amount */}
                <div style={{ fontSize: '11px', color: '#1E40AF', textAlign: 'center', marginBottom: '8px' }}>
                    ({installment1Fee === 5000 ? 'ห้าพันบาทถ้วน' : installment1Fee === 10000 ? 'หนึ่งหมื่นบาทถ้วน' : 'หนึ่งหมื่นห้าพันบาทถ้วน'})
                </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '10px' }}>
                    เลือกช่องทางชำระเงิน
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {(['QR', 'CARD'] as const).map(method => (
                        <button key={method} onClick={() => setPaymentMethod(method)} style={{
                            padding: '16px', borderRadius: '12px',
                            border: `2px solid ${paymentMethod === method ? '#10B981' : (isDark ? '#4B5563' : '#E5E7EB')}`,
                            background: paymentMethod === method ? (isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5') : (isDark ? '#374151' : 'white'),
                            cursor: 'pointer', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{method === 'QR' ? '📱' : '💳'}</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827' }}>
                                {method === 'QR' ? 'QR PromptPay' : 'บัตรเครดิต/เดบิต'}
                            </div>
                            <div style={{ fontSize: '10px', color: '#6B7280' }}>
                                {method === 'QR' ? 'สะดวก รวดเร็ว' : 'Visa / MasterCard'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* QR Code */}
            {paymentMethod === 'QR' && (
                <div style={{
                    background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px',
                    textAlign: 'center', border: '1px solid #E5E7EB',
                }}>
                    <div style={{ fontSize: '12px', color: '#374151', marginBottom: '12px', fontWeight: 600 }}>
                        สแกน QR Code เพื่อชำระเงิน
                    </div>
                    <div style={{
                        width: '180px', height: '180px', background: '#F9FAFB', borderRadius: '12px',
                        margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px dashed #D1D5DB',
                    }}>
                        <div style={{ textAlign: 'center', color: '#6B7280' }}>
                            <div style={{ fontSize: '48px', marginBottom: '4px' }}>📲</div>
                            <div style={{ fontSize: '11px' }}>QR Code</div>
                            <div style={{ fontSize: '10px' }}>สำหรับชำระเงิน</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#374151', background: '#FEF3C7', padding: '10px', borderRadius: '6px' }}>
                        <strong>โอนเข้าบัญชี:</strong><br />
                        ชื่อบัญชี: เงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร<br />
                        ธ.กรุงไทย เลขที่ <strong>4750134376</strong>
                    </div>
                </div>
            )}

            {/* Card Form */}
            {paymentMethod === 'CARD' && (
                <div style={{
                    background: isDark ? '#374151' : 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px',
                    border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                }}>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280', display: 'block', marginBottom: '4px' }}>หมายเลขบัตร</label>
                        <input type="text" placeholder="0000 0000 0000 0000" style={{
                            width: '100%', padding: '12px', borderRadius: '8px',
                            border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                            background: isDark ? '#1F2937' : '#F9FAFB', color: isDark ? '#F9FAFB' : '#111827',
                            fontSize: '14px', boxSizing: 'border-box',
                        }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280', display: 'block', marginBottom: '4px' }}>วันหมดอายุ</label>
                            <input type="text" placeholder="MM/YY" style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                                background: isDark ? '#1F2937' : '#F9FAFB', color: isDark ? '#F9FAFB' : '#111827',
                                fontSize: '14px', boxSizing: 'border-box',
                            }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280', display: 'block', marginBottom: '4px' }}>CVV</label>
                            <input type="text" placeholder="123" style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                                background: isDark ? '#1F2937' : '#F9FAFB', color: isDark ? '#F9FAFB' : '#111827',
                                fontSize: '14px', boxSizing: 'border-box',
                            }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Security Notice */}
            <div style={{
                fontSize: '10px', color: '#6B7280', textAlign: 'center', marginBottom: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
                🔒 การชำระเงินปลอดภัยด้วยระบบเข้ารหัส SSL
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleBack} disabled={processing} style={{
                    flex: 1, padding: '14px', borderRadius: '12px',
                    border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                    background: isDark ? '#374151' : 'white', color: isDark ? '#F9FAFB' : '#374151',
                    fontSize: '14px', fontWeight: 500, cursor: 'pointer', opacity: processing ? 0.5 : 1,
                }}>ย้อนกลับ</button>
                <button onClick={handlePayment} disabled={processing} style={{
                    flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
                    background: processing ? '#9CA3AF' : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: 'white', fontSize: '14px', fontWeight: 600, cursor: processing ? 'wait' : 'pointer',
                    boxShadow: processing ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.4)',
                }}>
                    {processing ? '⏳ กำลังดำเนินการ...' : `✓ ยืนยันชำระเงิน ฿${installment1Fee.toLocaleString()}`}
                </button>
            </div>
        </div>
    );
}
