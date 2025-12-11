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

const FEE_PER_SITE_TYPE = 5000;

export default function Step1Purpose() {
    const router = useRouter();
    const { state, setCertificationPurpose, setSiteTypes, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [purpose, setPurpose] = useState<CertificationPurpose | null>(null);
    const [siteTypes, setLocalSiteTypes] = useState<SiteType[]>([]);

    const plant = PLANTS.find(p => p.id === state.plantId);
    const isHighControl = plant?.group === 'HIGH_CONTROL';
    const needsLicense = purpose === 'COMMERCIAL' || purpose === 'EXPORT';
    const totalFee = siteTypes.length * FEE_PER_SITE_TYPE;

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.certificationPurpose) setPurpose(state.certificationPurpose);
        if (state.siteTypes?.length) setLocalSiteTypes(state.siteTypes);
    }, [state.certificationPurpose, state.siteTypes]);

    useEffect(() => {
        if (isLoaded && !state.plantId) router.replace('/applications/new/step-0');
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

    const canProceed = purpose && siteTypes.length > 0;
    const handleNext = () => canProceed && router.push('/applications/new/step-2');
    const handleBack = () => router.push('/applications/new/step-0');

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

            {/* License Upload Warning */}
            {needsLicense && (
                <div style={{ background: isDark ? 'rgba(245,158,11,0.15)' : '#FFFBEB', border: '1px solid #F59E0B', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#B45309', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        ⚠️ กรุณาเตรียมใบอนุญาตประกอบกิจการ (จะอัปโหลดใน step เอกสาร)
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>ค่าธรรมเนียมงวด 1 (ตรวจเอกสาร)</div>
                            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                                {FEE_PER_SITE_TYPE.toLocaleString()} บาท × {siteTypes.length} ลักษณะพื้นที่
                            </div>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700 }}>
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
                    ถัดไป
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg>
                </button>
            </div>
        </div>
    );
}
