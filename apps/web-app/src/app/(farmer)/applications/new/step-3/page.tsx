"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';

const PDPA_SECTIONS = [
    {
        title: "วัตถุประสงค์ในการเก็บข้อมูล",
        items: [
            "เพื่อพิจารณาคำขอรับรองมาตรฐาน GACP",
            "เพื่อติดต่อสื่อสารและแจ้งผลการดำเนินงาน",
            "เพื่อจัดทำทะเบียนผู้ได้รับใบรับรอง",
        ]
    },
    {
        title: "ข้อมูลส่วนบุคคลที่เก็บรวบรวม",
        items: [
            "ชื่อ-นามสกุล, เลขบัตรประชาชน",
            "ที่อยู่, เบอร์โทร, อีเมล",
            "พิกัด GPS และภาพถ่ายสถานที่",
        ]
    },
    {
        title: "การเก็บรักษาและความปลอดภัย",
        items: [
            "ข้อมูลจะถูกเก็บรักษาอย่างปลอดภัย",
            "เฉพาะเจ้าหน้าที่ที่เกี่ยวข้องเท่านั้นที่เข้าถึงได้",
            "ไม่เปิดเผยต่อบุคคลภายนอกโดยไม่ได้รับอนุญาต",
        ]
    },
];

export default function Step3PDPA() {
    const router = useRouter();
    const { state, consentPDPA, isLoaded } = useWizardStore();
    const [consented, setConsented] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.consentedPDPA) {
            setConsented(true);
        }
    }, [state.consentedPDPA]);

    useEffect(() => {
        if (isLoaded && !state.serviceType) {
            router.replace('/applications/new/step-0');
        }
    }, [isLoaded, state.serviceType, router]);

    const handleConsent = () => {
        setConsented(true);
        consentPDPA();
    };

    const handleNext = () => {
        if (consented && !isNavigating) {
            setIsNavigating(true);
            router.push('/applications/new/step-4');
        }
    };

    const handleBack = () => {
        setIsNavigating(true);
        router.push('/applications/new/step-2');
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
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    width: '56px', height: '56px',
                    background: isDark
                        ? 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)'
                        : 'linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)',
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                }}>
                    <span style={{ fontSize: '24px' }}>🔐</span>
                </div>
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: isDark ? '#F9FAFB' : '#111827',
                    marginBottom: '6px',
                }}>
                    ยินยอมข้อมูลส่วนบุคคล
                </h2>
                <p style={{
                    fontSize: '14px',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                }}>
                    ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
                </p>
            </div>

            {/* PDPA Content */}
            <div style={{
                background: isDark ? '#374151' : '#F9FAFB',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                maxHeight: '300px',
                overflowY: 'auto',
            }}>
                {PDPA_SECTIONS.map((section, sIndex) => (
                    <div key={sIndex} style={{ marginBottom: sIndex < PDPA_SECTIONS.length - 1 ? '20px' : 0 }}>
                        <h3 style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: isDark ? '#F9FAFB' : '#111827',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <span style={{
                                width: '24px',
                                height: '24px',
                                background: isDark ? '#4B5563' : '#E5E7EB',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: isDark ? '#D1D5DB' : '#6B7280',
                            }}>
                                {sIndex + 1}
                            </span>
                            {section.title}
                        </h3>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            marginLeft: '32px',
                        }}>
                            {section.items.map((item, iIndex) => (
                                <li key={iIndex} style={{
                                    fontSize: '13px',
                                    color: isDark ? '#9CA3AF' : '#6B7280',
                                    marginBottom: '6px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                }}>
                                    <span style={{ color: '#10B981', marginTop: '2px' }}>•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Rights Info */}
            <div style={{
                background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
            }}>
                <span style={{ fontSize: '20px' }}>ℹ️</span>
                <div>
                    <p style={{
                        fontSize: '13px',
                        color: isDark ? '#93C5FD' : '#1D4ED8',
                        fontWeight: 500,
                        marginBottom: '4px',
                    }}>
                        สิทธิของท่าน
                    </p>
                    <p style={{
                        fontSize: '12px',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        lineHeight: 1.5,
                    }}>
                        ท่านมีสิทธิขอเข้าถึง แก้ไข ลบ หรือระงับการใช้ข้อมูลส่วนบุคคลของท่านได้ตลอดเวลา
                    </p>
                </div>
            </div>

            {/* Consent Checkbox */}
            <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '16px',
                background: consented
                    ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5')
                    : (isDark ? '#374151' : '#F9FAFB'),
                borderRadius: '14px',
                cursor: 'pointer',
                marginBottom: '24px',
                border: consented ? '2px solid #10B981' : `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                transition: 'all 0.2s ease',
            }}>
                <input
                    type="checkbox"
                    checked={consented}
                    onChange={handleConsent}
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
                        ข้าพเจ้ายินยอมให้เก็บรวบรวมและใช้ข้อมูลส่วนบุคคล
                    </span>
                    <p style={{
                        fontSize: '13px',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        marginTop: '4px',
                    }}>
                        เพื่อประกอบการพิจารณาคำขอรับรองมาตรฐาน GACP
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
                    disabled={!consented || isNavigating}
                    style={{
                        flex: 2,
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: consented && !isNavigating
                            ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                            : (isDark ? '#4B5563' : '#E5E7EB'),
                        color: consented && !isNavigating ? 'white' : (isDark ? '#9CA3AF' : '#9CA3AF'),
                        fontSize: '15px',
                        fontWeight: 600,
                        cursor: consented && !isNavigating ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: consented && !isNavigating ? '0 4px 20px rgba(16, 185, 129, 0.4)' : 'none',
                    }}
                >
                    {isNavigating ? (
                        <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> กำลังโหลด...</>
                    ) : (
                        <>ถัดไป <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg></>
                    )}
                </button>
            </div>
        </div>
    );
}

