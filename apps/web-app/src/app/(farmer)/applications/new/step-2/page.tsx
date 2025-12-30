"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, ServiceType } from '../hooks/useWizardStore';

const SERVICE_TYPES = [
    {
        id: 'NEW' as ServiceType,
        title: 'ขอรับรองใหม่',
        desc: 'สำหรับผู้ที่ยังไม่เคยได้รับใบรับรอง GACP',
        icon: '🆕',
        color: '#10B981',
        bgLight: '#ECFDF5',
        bgDark: 'rgba(16, 185, 129, 0.15)',
    },
    {
        id: 'RENEWAL' as ServiceType,
        title: 'ต่ออายุใบรับรอง',
        desc: 'สำหรับใบรับรองที่จะหมดอายุภายใน 90 วัน',
        icon: '🔄',
        color: '#F59E0B',
        bgLight: '#FFFBEB',
        bgDark: 'rgba(245, 158, 11, 0.15)',
    },
    {
        id: 'MODIFY' as ServiceType,
        title: 'แก้ไขข้อมูล',
        desc: 'เปลี่ยนแปลงข้อมูลในใบรับรองที่มีอยู่',
        icon: '✏️',
        color: '#3B82F6',
        bgLight: '#EFF6FF',
        bgDark: 'rgba(59, 130, 246, 0.15)',
    },
    {
        id: 'REPLACEMENT' as ServiceType,
        title: 'ขอใบรับรองทดแทน',
        desc: 'กรณีใบรับรองสูญหายหรือชำรุด',
        icon: '📄',
        color: '#8B5CF6',
        bgLight: '#F5F3FF',
        bgDark: 'rgba(139, 92, 246, 0.15)',
    },
];

export default function Step2Service() {
    const router = useRouter();
    const { state, setServiceType, isLoaded } = useWizardStore();
    const [selected, setSelected] = useState<ServiceType | null>(null);
    const [isDark, setIsDark] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.serviceType) {
            setSelected(state.serviceType);
        }
    }, [state.serviceType]);

    useEffect(() => {
        if (isLoaded && !state.certificationPurpose) {
            router.replace('/applications/new/step-0');
        }
    }, [isLoaded, state.certificationPurpose, router]);

    const handleSelect = (type: ServiceType) => {
        setSelected(type);
        setServiceType(type);
    };

    const handleNext = () => {
        if (selected && !isNavigating) {
            setIsNavigating(true);
            router.push('/applications/new/step-3');
        }
    };

    const handleBack = () => {
        setIsNavigating(true);
        router.push('/applications/new/step-1');
    };

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
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                    width: '56px', height: '56px',
                    background: isDark
                        ? 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'
                        : 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)',
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                }}>
                    <span style={{ fontSize: '24px' }}>🔖</span>
                </div>
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: isDark ? '#F9FAFB' : '#111827',
                    marginBottom: '6px',
                }}>
                    เลือกประเภทบริการ
                </h2>
                <p style={{
                    fontSize: '14px',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                }}>
                    เลือกบริการที่ต้องการดำเนินการ
                </p>
            </div>

            {/* Service Type Cards */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '28px',
            }}>
                {SERVICE_TYPES.map((type, index) => (
                    <button
                        key={type.id}
                        onClick={() => handleSelect(type.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '18px',
                            borderRadius: '16px',
                            border: selected === type.id
                                ? `2px solid ${type.color}`
                                : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            background: selected === type.id
                                ? (isDark ? type.bgDark : type.bgLight)
                                : (isDark ? '#1F2937' : 'white'),
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                            boxShadow: selected === type.id
                                ? `0 4px 20px ${type.color}30`
                                : '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                    >
                        <div style={{
                            width: '52px',
                            height: '52px',
                            background: isDark ? '#374151' : '#F3F4F6',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '26px',
                            flexShrink: 0,
                        }}>
                            {type.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                color: isDark ? '#F9FAFB' : '#111827',
                                marginBottom: '4px',
                            }}>
                                {type.title}
                            </h3>
                            <p style={{
                                fontSize: '13px',
                                color: isDark ? '#9CA3AF' : '#6B7280',
                                lineHeight: 1.5,
                            }}>
                                {type.desc}
                            </p>
                        </div>
                        {selected === type.id && (
                            <div style={{
                                width: '28px',
                                height: '28px',
                                background: type.color,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                flexShrink: 0,
                            }}>
                                ✓
                            </div>
                        )}
                    </button>
                ))}
            </div>

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
                    disabled={!selected || isNavigating}
                    style={{
                        flex: 2,
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: selected && !isNavigating
                            ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                            : (isDark ? '#4B5563' : '#E5E7EB'),
                        color: selected && !isNavigating ? 'white' : (isDark ? '#9CA3AF' : '#9CA3AF'),
                        fontSize: '15px',
                        fontWeight: 600,
                        cursor: selected && !isNavigating ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: selected && !isNavigating ? '0 4px 20px rgba(16, 185, 129, 0.4)' : 'none',
                    }}
                >
                    {isNavigating ? (
                        <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> กำลังโหลด...</>
                    ) : (
                        <>ถัดไป <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg></>
                    )}
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

