"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
    const router = useRouter();
    const [isDark, setIsDark] = useState(false);
    const [appId, setAppId] = useState('');
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        setAppId(localStorage.getItem('last_application_id') || `GACP-${Date.now().toString(36).toUpperCase()}`);

        // Hide confetti after 3 seconds
        setTimeout(() => setShowConfetti(false), 3000);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: isDark ? '#0A0F1C' : '#F9FAFB',
            fontFamily: "'Kanit', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Confetti Animation */}
            {showConfetti && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    overflow: 'hidden',
                }}>
                    {[...Array(30)].map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            background: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'][i % 5],
                            borderRadius: '50%',
                            left: `${Math.random() * 100}%`,
                            top: '-20px',
                            animation: `confetti ${1.5 + Math.random()}s ease-out forwards`,
                            animationDelay: `${Math.random() * 0.5}s`,
                        }} />
                    ))}
                </div>
            )}

            {/* Success Icon */}
            <div style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
                animation: 'scaleIn 0.5s ease-out',
            }}>
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <path d="M20 6L9 17L4 12" />
                </svg>
            </div>

            {/* Title */}
            <h1 style={{
                fontSize: '26px',
                fontWeight: 700,
                color: isDark ? '#F9FAFB' : '#111827',
                marginBottom: '12px',
            }}>
                🎉 ยื่นคำขอสำเร็จ!
            </h1>

            <p style={{
                fontSize: '15px',
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginBottom: '24px',
                maxWidth: '320px',
            }}>
                คำขอของคุณถูกบันทึกเรียบร้อยแล้ว กรุณารอการตรวจสอบจากเจ้าหน้าที่
            </p>

            {/* Application ID Card */}
            <div style={{
                background: isDark ? '#374151' : 'white',
                borderRadius: '16px',
                padding: '20px 28px',
                marginBottom: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}>
                <p style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '8px' }}>
                    หมายเลขคำขอ
                </p>
                <p style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#10B981',
                    letterSpacing: '1px',
                }}>
                    {appId}
                </p>
            </div>

            {/* Timeline */}
            <div style={{
                background: isDark ? '#374151' : 'white',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '28px',
                width: '100%',
                maxWidth: '340px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '16px', textAlign: 'left' }}>
                    📋 ขั้นตอนถัดไป
                </h3>
                {[
                    { icon: '✅', text: 'ยื่นคำขอสำเร็จ', active: true },
                    { icon: '⏳', text: 'รอตรวจสอบเอกสาร (3-5 วัน)', active: false },
                    { icon: '📅', text: 'นัดหมายตรวจประเมิน', active: false },
                    { icon: '🏆', text: 'รับใบรับรอง GACP', active: false },
                ].map((step, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 0',
                        borderLeft: `2px solid ${step.active ? '#10B981' : (isDark ? '#4B5563' : '#E5E7EB')}`,
                        marginLeft: '10px',
                        paddingLeft: '16px',
                    }}>
                        <span style={{ fontSize: '16px' }}>{step.icon}</span>
                        <span style={{
                            fontSize: '13px',
                            color: step.active ? '#10B981' : (isDark ? '#9CA3AF' : '#6B7280'),
                            fontWeight: step.active ? 600 : 400,
                        }}>
                            {step.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '340px' }}>
                <Link href="/tracking" style={{
                    padding: '14px 24px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                }}>
                    📍 ติดตามสถานะ
                </Link>
                <Link href="/dashboard" style={{
                    padding: '14px 24px',
                    borderRadius: '12px',
                    background: isDark ? '#374151' : 'white',
                    color: isDark ? '#F9FAFB' : '#374151',
                    fontSize: '15px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                }}>
                    🏠 กลับหน้าหลัก
                </Link>
            </div>

            <style jsx global>{`
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.5); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes confetti {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
