"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, CertificationPurpose, SiteType, PLANTS } from '../hooks/useWizardStore';

const PURPOSES = [
    { id: 'RESEARCH' as CertificationPurpose, label: 'วิจัย/ศึกษา', icon: '🔬', desc: 'เพื่อใช้ประโยชน์ในการศึกษาวิจัย' },
    { id: 'COMMERCIAL' as CertificationPurpose, label: 'พาณิชย์', icon: '💼', desc: 'จำหน่ายหรือแปรรูปเพื่อการค้า' },
    { id: 'EXPORT' as CertificationPurpose, label: 'ส่งออก', icon: '🌍', desc: 'ส่งออกสมุนไพรทางการค้า' },
];

const SITE_TYPES = [
    { id: 'OUTDOOR' as SiteType, label: 'กลางแจ้ง', icon: '☀️', desc: 'Outdoor' },
    { id: 'INDOOR' as SiteType, label: 'โรงเรือนระบบปิด', icon: '🏭', desc: 'Indoor' },
    { id: 'GREENHOUSE' as SiteType, label: 'โรงเรือนทั่วไป', icon: '🌿', desc: 'Greenhouse' },
];

// Fee configuration: (5,000 + 25,000) × number of areas = 30,000 × areas
const FEE_CONFIG = {
    docReviewPerArea: 5000,     // ค่าตรวจเอกสารต่อพื้นที่
    inspectionPerArea: 25000,   // ค่าตรวจประเมินแปลงต่อพื้นที่
    totalPerArea: 30000,        // รวมต่อพื้นที่
};

export default function Step1Purpose() {
    const router = useRouter();
    const { state, setCertificationPurpose, setSiteTypes, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [purpose, setPurpose] = useState<CertificationPurpose | null>(null);
    const [siteTypes, setLocalSiteTypes] = useState<SiteType[]>([]);
    const [isNavigating, setIsNavigating] = useState(false);

    const plant = PLANTS.find(p => p.id === state.plantId);
    const isHighControl = plant?.group === 'HIGH_CONTROL';
    const needsLicense = purpose === 'COMMERCIAL' || purpose === 'EXPORT';

    // Calculate fee: 30,000 × number of areas
    const totalFee = FEE_CONFIG.totalPerArea * siteTypes.length;

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.certificationPurpose) setPurpose(state.certificationPurpose);
        if (state.siteTypes?.length) setLocalSiteTypes(state.siteTypes);
    }, [state.certificationPurpose, state.siteTypes]);

    useEffect(() => {
        // Only redirect if fully loaded AND no plant selected after a longer delay
        // This prevents race condition when state is being loaded from localStorage
        if (isLoaded) {
            const timer = setTimeout(() => {
                // Re-check state from localStorage directly to avoid stale state
                const saved = localStorage.getItem('gacp_wizard_state');
                const savedState = saved ? JSON.parse(saved) : null;

                if (!state.plantId && !savedState?.plantId) {
                    router.replace('/applications/new/step-0');
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, state.plantId, router]);

    const handlePurposeSelect = (p: CertificationPurpose) => {
        setPurpose(p);
        setCertificationPurpose(p);
    };

    const toggleSiteType = (type: SiteType) => {
        const newTypes = siteTypes.includes(type)
            ? siteTypes.filter(t => t !== type)
            : [...siteTypes, type];
        setLocalSiteTypes(newTypes);
        setSiteTypes(newTypes);
    };

    const canProceed = purpose && siteTypes.length > 0 && !isNavigating;
    const handleNext = () => {
        if (canProceed) {
            setIsNavigating(true);
            router.push('/applications/new/step-2');
        }
    };
    const handleBack = () => {
        setIsNavigating(true);
        router.push('/applications/new/step-0');
    };

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>กำลังโหลด...</div>;

    return (
        <div style={{ fontFamily: "'Kanit', sans-serif" }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                    width: '48px', height: '48px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                }}>
                    <span style={{ fontSize: '20px' }}>🎯</span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', margin: 0 }}>
                    วัตถุประสงค์และลักษณะพื้นที่
                </h2>
                {plant && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', borderRadius: '16px', marginTop: '8px' }}>
                        <span>{plant.icon}</span>
                        <span style={{ fontSize: '12px', color: '#059669', fontWeight: 500 }}>{plant.name}</span>
                    </div>
                )}
            </div>

            {/* Purpose Selection */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '10px' }}>
                    วัตถุประสงค์ในการขอใบรับรอง *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {PURPOSES.map(p => (
                        <button key={p.id} onClick={() => handlePurposeSelect(p.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                            borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                            border: purpose === p.id ? '2px solid #3B82F6' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            background: purpose === p.id ? (isDark ? 'rgba(59,130,246,0.15)' : '#EFF6FF') : 'transparent',
                        }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isDark ? '#374151' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                                {p.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827' }}>{p.label}</div>
                                <div style={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280' }}>{p.desc}</div>
                            </div>
                            {purpose === p.id && (
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>✓</div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* License Upload Warning - specific requirements based on purpose */}
            {(purpose === 'COMMERCIAL' || purpose === 'EXPORT') && (
                <div style={{
                    background: isDark ? 'rgba(245,158,11,0.15)' : '#FFFBEB',
                    border: '1px solid #F59E0B',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '16px'
                }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#B45309', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0' }}>
                        ⚠️ เอกสารใบอนุญาตที่ต้องเตรียม:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: isDark ? '#D97706' : '#92400E' }}>
                        {isHighControl && (
                            <li style={{ marginBottom: '4px' }}>
                                <strong>บท.11</strong> - ใบอนุญาตปลูก (บังคับสำหรับพืชควบคุม)
                            </li>
                        )}
                        {purpose === 'COMMERCIAL' && (
                            <li style={{ marginBottom: '4px' }}>
                                <strong>บท.13</strong> - ใบอนุญาตแปรรูปผลิตภัณฑ์ (บังคับ ✓)
                            </li>
                        )}
                        {purpose === 'EXPORT' && (
                            <>
                                <li style={{ marginBottom: '4px' }}>
                                    <strong>บท.13</strong> - ใบอนุญาตแปรรูปผลิตภัณฑ์ (ถ้ามีการแปรรูป)
                                </li>
                                <li style={{ marginBottom: '4px' }}>
                                    <strong>บท.16</strong> - ใบอนุญาตส่งออก (บังคับ ✓)
                                </li>
                            </>
                        )}
                    </ul>
                    <p style={{ fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280', margin: '8px 0 0 0', fontStyle: 'italic' }}>
                        📌 อัปโหลดเอกสารในขั้นตอนถัดไป - หากไม่มีใบอนุญาต กรุณาติดต่อกรมการแพทย์แผนไทยฯ
                    </p>
                </div>
            )}

            {/* Site Type Selection */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '10px' }}>
                    ลักษณะพื้นที่ * (เลือกได้หลายรายการ)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {SITE_TYPES.map(type => {
                        const isSelected = siteTypes.includes(type.id);
                        return (
                            <button key={type.id} onClick={() => toggleSiteType(type.id)} style={{
                                padding: '14px 8px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                border: isSelected ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                                background: isSelected ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : 'transparent',
                            }}>
                                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{type.icon}</div>
                                <div style={{ fontSize: '12px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827' }}>{type.label}</div>
                                <div style={{ fontSize: '10px', color: isDark ? '#9CA3AF' : '#6B7280' }}>{type.desc}</div>
                                {isSelected && (
                                    <div style={{ marginTop: '4px', fontSize: '10px', color: '#10B981', fontWeight: 600 }}>✓ เลือก</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Fee Display */}
            {siteTypes.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    borderRadius: '12px', padding: '16px', marginBottom: '20px', color: 'white',
                }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                        💰 ประมาณการค่าธรรมเนียมและใบรับรอง
                    </div>

                    {/* Per-area breakdown */}
                    {siteTypes.map((type, idx) => {
                        const areaLabel = SITE_TYPES.find(s => s.id === type)?.label || type;
                        return (
                            <div key={type} style={{
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '10px 12px',
                                marginBottom: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 500 }}>
                                        📜 ใบรับรอง #{idx + 1}: {areaLabel}
                                    </div>
                                    <div style={{ fontSize: '10px', opacity: 0.8 }}>
                                        ตรวจเอกสาร 5,000 + ตรวจแปลง 25,000
                                    </div>
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 600 }}>
                                    ฿30,000
                                </div>
                            </div>
                        );
                    })}

                    {/* Total */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid rgba(255,255,255,0.3)',
                        paddingTop: '12px',
                        marginTop: '8px'
                    }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>
                                รวมทั้งสิ้น ({siteTypes.length} ใบรับรอง)
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.8 }}>
                                ชำระเงินรวมครั้งเดียว
                            </div>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 700 }}>
                            ฿{totalFee.toLocaleString()}
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleBack} style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                    background: isDark ? '#374151' : 'white',
                    color: isDark ? '#F9FAFB' : '#374151',
                    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    ย้อนกลับ
                </button>
                <button onClick={handleNext} disabled={!canProceed} style={{
                    flex: 2, padding: '12px', borderRadius: '10px', border: 'none',
                    background: canProceed ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : (isDark ? '#4B5563' : '#E5E7EB'),
                    color: canProceed ? 'white' : (isDark ? '#9CA3AF' : '#9CA3AF'),
                    fontSize: '14px', fontWeight: 600, cursor: canProceed ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    boxShadow: canProceed ? '0 4px 16px rgba(16, 185, 129, 0.35)' : 'none',
                }}>
                    {isNavigating ? (
                        <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> กำลังโหลด...</>
                    ) : (
                        <>ถัดไป <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg></>
                    )}
                </button>
            </div>
        </div>
    );
}
