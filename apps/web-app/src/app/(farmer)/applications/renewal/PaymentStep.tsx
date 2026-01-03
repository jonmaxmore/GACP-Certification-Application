"use client";

import { Theme, Icons, RENEWAL_FEE } from './types';

interface PaymentStepProps {
    renewalId: string | null;
    t: Theme;
    onBack: () => void;
    onConfirm: () => void;
}

/**
 * Payment Step - QR Code Payment
 * 🍎 Apple Single Responsibility: Only handles payment
 */
export function PaymentStep({ renewalId, t, onBack, onConfirm }: PaymentStepProps) {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: t.bg, fontFamily: "'Kanit', sans-serif", padding: '24px' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <button onClick={onBack} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '10px', border: `1px solid ${t.border}`,
                    background: 'transparent', color: t.textSecondary, cursor: 'pointer', marginBottom: '24px'
                }}>
                    {Icons.back(t.textMuted)} ย้อนกลับ
                </button>

                <h1 style={{ fontSize: '24px', fontWeight: 600, color: t.text, marginBottom: '8px' }}>ชำระเงินค่าต่อสัญญา</h1>
                <p style={{ color: t.textMuted, marginBottom: '24px' }}>สแกน QR Code เพื่อชำระเงิน</p>

                {/* QR Payment Card */}
                <div style={{
                    background: t.bgCard, borderRadius: '20px', padding: '28px',
                    border: `1px solid ${t.border}`, textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '20px' }}>
                        <span style={{
                            display: 'inline-block', padding: '8px 20px',
                            backgroundColor: '#00427A', borderRadius: '8px',
                            color: '#FFF', fontSize: '14px', fontWeight: 600,
                        }}>
                            พร้อมเพย์ | PromptPay
                        </span>
                    </div>

                    {/* QR Code */}
                    <div style={{
                        width: '220px', height: '220px', margin: '0 auto 20px',
                        backgroundColor: '#FFF', border: '2px solid #00427A',
                        borderRadius: '12px', padding: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <img
                            src={`https://promptpay.io/0994566289/${RENEWAL_FEE}.png`}
                            alt="PromptPay QR"
                            style={{ width: '200px', height: '200px' }}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROMPTPAY:${RENEWAL_FEE}`;
                            }}
                        />
                    </div>

                    {/* Amount */}
                    <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '12px', marginBottom: '20px' }}>
                        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>จำนวนเงินที่ต้องชำระ</p>
                        <p style={{ fontSize: '32px', fontWeight: 700, color: '#10B981', margin: 0 }}>
                            ฿{RENEWAL_FEE.toLocaleString()}
                        </p>
                    </div>

                    {/* Receiver Info */}
                    <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px', fontSize: '13px', color: '#374151', marginBottom: '24px' }}>
                        <p style={{ margin: '0 0 4px' }}><strong>ผู้รับเงิน:</strong> กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
                        <p style={{ margin: 0 }}><strong>หมายเลขเคส:</strong> {renewalId}</p>
                    </div>

                    <button onClick={onConfirm} style={{
                        width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                        background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                        color: '#FFF', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                    }}>
                        ยืนยันการชำระเงิน
                    </button>
                </div>
            </div>
        </div>
    );
}
