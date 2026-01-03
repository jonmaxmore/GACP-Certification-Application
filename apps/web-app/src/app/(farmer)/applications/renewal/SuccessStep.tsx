"use client";

import Link from 'next/link';
import { Certificate, Theme, RENEWAL_FEE } from './types';

interface SuccessStepProps {
    certificate: Certificate | null;
    renewalId: string | null;
    isDark: boolean;
    t: Theme;
}

/**
 * Success Step - Renewal Complete
 * 🍎 Apple Single Responsibility: Only handles success display
 */
export function SuccessStep({ certificate, renewalId, isDark, t }: SuccessStepProps) {
    return (
        <div style={{ minHeight: '100vh', background: isDark ? '#0A0F1C' : 'linear-gradient(180deg, #ECFDF5 0%, #F9FAFB 100%)', fontFamily: "'Kanit', sans-serif", padding: '24px' }}>
            {/* Confetti */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
                {[...Array(30)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute', width: `${8 + Math.random() * 8}px`, height: `${8 + Math.random() * 8}px`,
                        background: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'][i % 5],
                        borderRadius: i % 3 === 0 ? '50%' : '2px', left: `${Math.random() * 100}%`, top: '-20px',
                        animation: `confetti ${2 + Math.random()}s ease-out forwards`,
                        animationDelay: `${Math.random() * 0.8}s`,
                    }} />
                ))}
            </div>

            <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                {/* Success Icon */}
                <div style={{
                    width: '90px', height: '90px',
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
                    animation: 'scaleIn 0.5s ease-out',
                }}>
                    <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg>
                </div>

                <h1 style={{ fontSize: '26px', fontWeight: 700, color: isDark ? '#F9FAFB' : '#065F46', marginBottom: '8px' }}>
                    🎉 ต่อสัญญาสำเร็จ!
                </h1>
                <p style={{ fontSize: '15px', color: isDark ? '#9CA3AF' : '#047857', marginBottom: '20px' }}>
                    ขอบคุณสำหรับการต่ออายุใบรับรอง GACP
                </p>

                {/* Case Number */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', background: isDark ? '#374151' : 'white',
                    borderRadius: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '2px solid #10B981', marginBottom: '24px'
                }}>
                    <span style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>หมายเลขเคส:</span>
                    <strong style={{ fontSize: '16px', color: '#059669', letterSpacing: '0.5px' }}>{renewalId}</strong>
                </div>

                {/* Summary Card */}
                <div style={{
                    background: isDark ? '#1F2937' : 'white', borderRadius: '16px', padding: '24px',
                    maxWidth: '450px', margin: '0 auto 24px', textAlign: 'left',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`
                }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: t.text, marginBottom: '16px' }}>📋 สรุปการต่อสัญญา</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ padding: '12px', background: t.accentBg, borderRadius: '10px' }}>
                            <div style={{ fontSize: '12px', color: t.textMuted, marginBottom: '4px' }}>ใบรับรองเลขที่</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: t.accent }}>{certificate?.certificateNumber}</div>
                        </div>
                        <div style={{ padding: '12px', background: isDark ? '#374151' : '#F9FAFB', borderRadius: '10px' }}>
                            <div style={{ fontSize: '12px', color: t.textMuted, marginBottom: '4px' }}>สถานที่</div>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: t.text }}>{certificate?.siteName}</div>
                        </div>
                        <div style={{ padding: '12px', background: '#ECFDF5', borderRadius: '10px', border: '1px solid #10B981' }}>
                            <div style={{ fontSize: '12px', color: '#065F46', marginBottom: '4px' }}>จำนวนเงินที่ชำระ</div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>฿{RENEWAL_FEE.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '450px', margin: '0 auto' }}>
                    <Link href="/tracking" style={{
                        padding: '16px 24px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                        color: 'white', fontSize: '16px', fontWeight: 600, textDecoration: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    }}>
                        📍 ติดตามสถานะ
                    </Link>
                    <Link href="/dashboard" style={{
                        padding: '16px 24px', borderRadius: '14px',
                        background: isDark ? '#374151' : 'white',
                        color: t.text, fontSize: '15px', fontWeight: 500, textDecoration: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${t.border}`,
                    }}>
                        🏠 กลับหน้าหลัก
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
                @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
            `}</style>
        </div>
    );
}
