"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, PLANTS } from '../hooks/useWizardStore';

const GACP_STANDARDS = [
    { id: 1, title: "การจัดการพื้นที่ปลูก", desc: "สถานที่ตั้ง ขนาดพื้นที่ และการจัดวางผัง", icon: "🏞️" },
    { id: 2, title: "การปลูกและดูแลรักษา", desc: "การเตรียมดิน การให้น้ำ และการดูแลพืช", icon: "🌱" },
    { id: 3, title: "การเก็บเกี่ยวและแปรรูป", desc: "วิธีการเก็บเกี่ยว การตาก และการแปรรูป", icon: "🌾" },
    { id: 4, title: "การควบคุมคุณภาพ", desc: "การตรวจสอบและรับรองคุณภาพผลผลิต", icon: "✅" },
    { id: 5, title: "การจัดเก็บและขนส่ง", desc: "สภาพการจัดเก็บและการขนส่งที่เหมาะสม", icon: "📦" },
    { id: 6, title: "การบันทึกข้อมูล", desc: "ระบบเอกสารและการตรวจสอบย้อนกลับ", icon: "📋" },
];

export default function Step1Standards() {
    const router = useRouter();
    const { state, acknowledgeStandards, isLoaded } = useWizardStore();
    const [acknowledged, setAcknowledged] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.acknowledgedStandards) {
            setAcknowledged(true);
        }
    }, [state.acknowledgedStandards]);

    useEffect(() => {
        if (isLoaded && !state.plantId) {
            router.replace('/applications/new/step-0');
        }
    }, [isLoaded, state.plantId, router]);

    const handleAcknowledge = () => {
        setAcknowledged(true);
        acknowledgeStandards();
    };

    const handleNext = () => {
        if (acknowledged) {
            router.push('/applications/new/step-2');
        }
    };

    const handleBack = () => {
        router.push('/applications/new/step-0');
    };

    const selectedPlant = PLANTS.find(p => p.id === state.plantId);

    if (!isLoaded) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                กำลังโหลด...
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    width: '56px', height: '56px',
                    background: isDark
                        ? 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'
                        : 'linear-gradient(135deg, #FBBF24 0%, #FCD34D 100%)',
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
                }}>
                    <span style={{ fontSize: '24px' }}>📋</span>
                </div>
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: isDark ? '#F9FAFB' : '#111827',
                    marginBottom: '6px',
                }}>
                    มาตรฐาน GACP
                </h2>
                <p style={{
                    fontSize: '14px',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                }}>
                    ทำความเข้าใจมาตรฐานการผลิตพืชสมุนไพร
                </p>
            </div>

            {/* Selected Plant Badge */}
            {selectedPlant && (
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                    borderRadius: '20px',
                    marginBottom: '20px',
                }}>
                    <span>{selectedPlant.icon}</span>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#059669',
                    }}>
                        {selectedPlant.name}
                    </span>
                </div>
            )}

            {/* Standards List */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '24px',
            }}>
                {GACP_STANDARDS.map((std, index) => (
                    <div key={std.id} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        padding: '14px 16px',
                        background: isDark ? '#374151' : '#F9FAFB',
                        borderRadius: '14px',
                        animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                    }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            background: isDark ? '#4B5563' : 'white',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '20px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                        }}>
                            {std.icon}
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: isDark ? '#F9FAFB' : '#111827',
                                marginBottom: '4px',
                            }}>
                                {std.title}
                            </h3>
                            <p style={{
                                fontSize: '13px',
                                color: isDark ? '#9CA3AF' : '#6B7280',
                                lineHeight: 1.5,
                            }}>
                                {std.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Acknowledge Checkbox */}
            <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '16px',
                background: acknowledged
                    ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5')
                    : (isDark ? '#374151' : '#F9FAFB'),
                borderRadius: '14px',
                cursor: 'pointer',
                marginBottom: '24px',
                border: acknowledged ? '2px solid #10B981' : `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                transition: 'all 0.2s ease',
            }}>
                <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={handleAcknowledge}
                    style={{
                        width: '22px',
                        height: '22px',
                        accentColor: '#10B981',
                        marginTop: '2px',
                    }}
                />
                <div>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: isDark ? '#F9FAFB' : '#111827',
                    }}>
                        ข้าพเจ้ารับทราบมาตรฐาน GACP
                    </span>
                    <p style={{
                        fontSize: '13px',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        marginTop: '4px',
                    }}>
                        และพร้อมปฏิบัติตามข้อกำหนดทั้งหมด
                    </p>
                </div>
            </label>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={handleBack}
                    style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '12px',
                        border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                        background: isDark ? '#374151' : 'white',
                        color: isDark ? '#F9FAFB' : '#374151',
                        fontSize: '15px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18L9 12L15 6" />
                    </svg>
                    ย้อนกลับ
                </button>
                <button
                    onClick={handleNext}
                    disabled={!acknowledged}
                    style={{
                        flex: 2,
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: acknowledged
                            ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                            : (isDark ? '#4B5563' : '#E5E7EB'),
                        color: acknowledged ? 'white' : (isDark ? '#9CA3AF' : '#9CA3AF'),
                        fontSize: '15px',
                        fontWeight: 600,
                        cursor: acknowledged ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: acknowledged ? '0 4px 20px rgba(16, 185, 129, 0.4)' : 'none',
                    }}
                >
                    ถัดไป
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18L15 12L9 6" />
                    </svg>
                </button>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
