"use client";

import { Certificate, Theme, Icons, RENEWAL_FEE } from './types';

interface QuotationStepProps {
    certificate: Certificate | null;
    renewalId: string | null;
    t: Theme;
    onBack: () => void;
    onProceed: () => void;
}

/**
 * Quotation Step - ใบเสนอราคา
 * 🍎 Apple Single Responsibility: Only handles quotation display
 */
export function QuotationStep({ certificate, renewalId, t, onBack, onProceed }: QuotationStepProps) {
    const quoteNumber = `QT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const currentDate = new Date();
    const validUntil = new Date(currentDate);
    validUntil.setDate(validUntil.getDate() + 30);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: t.bg, fontFamily: "'Kanit', sans-serif", padding: '24px' }}>
            <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                <button onClick={onBack} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '10px', border: `1px solid ${t.border}`,
                    background: 'transparent', color: t.textSecondary, cursor: 'pointer', marginBottom: '24px'
                }}>
                    {Icons.back(t.textMuted)} ย้อนกลับ
                </button>

                <h1 style={{ fontSize: '22px', fontWeight: 600, color: t.text, marginBottom: '20px' }}>ใบเสนอราคา / Quotation</h1>

                {/* Official Quotation Document */}
                <div style={{
                    background: '#FFFFFF', color: '#111827',
                    padding: '40px',
                    border: '1px solid #D1D5DB', borderRadius: '4px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '24px',
                    fontFamily: "'Sarabun', 'Kanit', sans-serif"
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #1E3A5F' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E3A5F', marginBottom: '2px' }}>
                                กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                            </div>
                            <div style={{ fontSize: '11px', color: '#374151', marginBottom: '2px' }}>
                                Department of Thai Traditional and Alternative Medicine
                            </div>
                            <div style={{ fontSize: '10px', color: '#6B7280' }}>
                                กระทรวงสาธารณสุข | Ministry of Public Health
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '160px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
                                color: '#fff', padding: '6px 14px', fontSize: '13px', fontWeight: 600,
                                marginBottom: '8px', borderRadius: '4px'
                            }}>ใบเสนอราคา</div>
                            <div style={{ fontSize: '11px', color: '#374151' }}>เลขที่: <strong>{quoteNumber}</strong></div>
                            <div style={{ fontSize: '10px', color: '#6B7280' }}>วันที่: {currentDate.toLocaleDateString('th-TH')}</div>
                        </div>
                    </div>

                    {/* Recipient */}
                    <div style={{ marginBottom: '20px', padding: '12px', background: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                        <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>เรียน / To:</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{certificate?.siteName || 'ผู้ประกอบการ'}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>ใบรับรอง: {certificate?.certificateNumber || '-'}</div>
                    </div>

                    {/* Fee Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
                        <thead>
                            <tr style={{ background: '#1E3A5F', color: '#FFFFFF' }}>
                                <th style={{ padding: '10px 8px', textAlign: 'center', border: '1px solid #1E3A5F', width: '50px' }}>ลำดับ</th>
                                <th style={{ padding: '10px 8px', textAlign: 'left', border: '1px solid #1E3A5F' }}>รายการ</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right', border: '1px solid #1E3A5F', width: '100px' }}>จำนวนเงิน (บาท)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'center' }}>1</td>
                                <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB' }}>ค่าบริการต่ออายุใบรับรองมาตรฐาน GACP</td>
                                <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'right' }}>{RENEWAL_FEE.toLocaleString()}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#F3F4F6' }}>
                                <td colSpan={2} style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'right', fontWeight: 600 }}>รวมทั้งสิ้น</td>
                                <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'right', fontWeight: 700, fontSize: '14px', color: '#1E3A5F' }}>{RENEWAL_FEE.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td colSpan={3} style={{ padding: '8px', border: '1px solid #E5E7EB', textAlign: 'center', fontStyle: 'italic', fontSize: '11px', color: '#374151' }}>
                                    (สามหมื่นบาทถ้วน)
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Validity */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ flex: 1, padding: '10px', background: '#FEF3C7', borderRadius: '6px', border: '1px solid #F59E0B' }}>
                            <div style={{ fontSize: '10px', color: '#92400E', marginBottom: '2px' }}>ใบเสนอราคานี้มีอายุถึง</div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#B45309' }}>
                                {validUntil.toLocaleDateString('th-TH')}
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: '10px', background: '#DBEAFE', borderRadius: '6px', border: '1px solid #3B82F6' }}>
                            <div style={{ fontSize: '10px', color: '#1E40AF', marginBottom: '2px' }}>ชำระเงินภายใน</div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1D4ED8' }}>7 วัน หลังจากยืนยัน</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => window.print()} style={{
                        flex: 1, padding: '14px', borderRadius: '12px',
                        border: `2px solid ${t.accent}`, background: 'transparent',
                        color: t.accent, fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                    }}>
                        🖨️ พิมพ์ใบเสนอราคา
                    </button>
                    <button onClick={onProceed} style={{
                        flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                        background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`,
                        color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                    }}>
                        ยืนยันและออกใบวางบิล →
                    </button>
                </div>
            </div>
        </div>
    );
}
