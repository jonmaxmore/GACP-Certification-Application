"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, ProductionData, PLANTS } from '../hooks/useWizardStore';

const PLANT_PARTS = [
    { id: 'SEED', label: 'เมล็ด', icon: '🌰' },
    { id: 'STEM', label: 'ลำต้น', icon: '🌿' },
    { id: 'FLOWER', label: 'ช่อดอก', icon: '🌸' },
    { id: 'LEAF', label: 'ใบ', icon: '🍃' },
    { id: 'ROOT', label: 'ราก/หัว', icon: '🥕' },
    { id: 'OTHER', label: 'อื่นๆ', icon: '📦' },
];

const PROPAGATION_TYPES = [
    { id: 'SEED', label: 'เมล็ด', icon: '🌱' },
    { id: 'CUTTING', label: 'ปักชำ', icon: '✂️' },
    { id: 'TISSUE', label: 'เพาะเนื้อเยื่อ', icon: '🧫' },
];

const SOURCE_TYPES = [
    { id: 'SELF', label: 'ปลูกเอง', icon: '🏠', desc: 'เราปลูกเองในแหล่งผลิตนี้' },
];

export default function Step6Production() {
    const router = useRouter();
    const { state, setProductionData, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [form, setForm] = useState<ProductionData>({
        plantParts: [], propagationType: 'SEED', varietyName: '', seedSource: '', varietySource: '',
        quantityWithUnit: '', harvestCycles: 1, estimatedYield: 0,
        sourceType: 'SELF', sourceDetail: '', hasGAPCert: false, hasOrganicCert: false,
    });

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.productionData) setForm(state.productionData);
    }, [state.productionData]);

    useEffect(() => {
        if (isLoaded && !state.siteData) router.replace('/applications/new/step-0');
    }, [isLoaded, state.siteData, router]);

    const handleChange = (field: keyof ProductionData, value: unknown) => {
        const updated = { ...form, [field]: value };
        setForm(updated);
        setProductionData(updated);
    };

    const togglePart = (partId: string) => {
        const current = form.plantParts || [];
        const updated = current.includes(partId) ? current.filter(p => p !== partId) : [...current, partId];
        handleChange('plantParts', updated);
    };

    // Validation check
    const isValid = (form.plantParts?.length || 0) > 0;

    const handleNext = () => {
        if (!isNavigating && isValid) {
            setIsNavigating(true);
            setProductionData(form);
            router.push('/applications/new/step-7');
        }
    };
    const handleBack = () => {
        setIsNavigating(true);
        router.push('/applications/new/step-5');
    };

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>กำลังโหลด...</div>;

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 12px', borderRadius: '8px',
        border: `1px solid ${isDark ? '#374151' : '#D1D5DB'}`,
        background: isDark ? '#1F2937' : '#FFFFFF',
        color: isDark ? '#F9FAFB' : '#111827', fontSize: '14px', outline: 'none',
        boxSizing: 'border-box', fontFamily: "'Kanit', sans-serif",
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '12px', fontWeight: 500,
        color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '4px',
    };

    const sectionStyle: React.CSSProperties = {
        background: isDark ? '#374151' : '#F9FAFB',
        borderRadius: '12px', padding: '14px', marginBottom: '14px',
    };

    return (
        <div style={{ fontFamily: "'Kanit', sans-serif" }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                    width: '48px', height: '48px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px', boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)',
                }}>
                    <span style={{ fontSize: '20px' }}>🌱</span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', margin: 0 }}>
                    ข้อมูลการผลิต
                </h2>
            </div>

            {/* Plant Parts */}
            <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>ส่วนที่ใช้ (เลือกได้หลายรายการ) *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {PLANT_PARTS.map(part => (
                        <button key={part.id} onClick={() => togglePart(part.id)} style={{
                            padding: '8px 6px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                            border: (form.plantParts || []).includes(part.id) ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            background: (form.plantParts || []).includes(part.id) ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : 'transparent',
                        }}>
                            <div style={{ fontSize: '16px' }}>{part.icon}</div>
                            <div style={{ fontSize: '10px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827', marginTop: '2px' }}>{part.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Propagation Type */}
            <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>วิธีขยายพันธุ์ *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {PROPAGATION_TYPES.map(type => (
                        <button key={type.id} onClick={() => handleChange('propagationType', type.id)} style={{
                            padding: '10px 6px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                            border: form.propagationType === type.id ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            background: form.propagationType === type.id ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : 'transparent',
                        }}>
                            <div style={{ fontSize: '18px' }}>{type.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827', marginTop: '4px' }}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Variety Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                    <label style={labelStyle}>ชื่อสายพันธุ์ *</label>
                    <input type="text" value={form.varietyName || ''} onChange={e => handleChange('varietyName', e.target.value)} placeholder="พันธุ์พื้นเมือง" style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>แหล่งที่มาสายพันธุ์ *</label>
                    <input type="text" value={form.varietySource || ''} onChange={e => handleChange('varietySource', e.target.value)} placeholder="สถาบันวิจัย" style={inputStyle} />
                </div>
            </div>

            {/* Quantity Section */}
            <div style={sectionStyle}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '10px' }}>
                    📊 ปริมาณการผลิต
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>ปริมาณ (ระบุหน่วย) *</label>
                        <input type="text" value={form.quantityWithUnit || ''} onChange={e => handleChange('quantityWithUnit', e.target.value)} placeholder="100 ต้น" style={{ ...inputStyle, padding: '8px 10px', fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>รอบเก็บเกี่ยว (ครั้ง/ปี)</label>
                        <input type="number" value={form.harvestCycles || 1} onChange={e => handleChange('harvestCycles', parseInt(e.target.value) || 1)} min="1" max="12" style={{ ...inputStyle, padding: '8px 10px', fontSize: '13px' }} />
                    </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                    <label style={{ ...labelStyle, fontSize: '11px' }}>ผลผลิตโดยประมาณ (กก./ปี)</label>
                    <input type="number" value={form.estimatedYield || ''} onChange={e => handleChange('estimatedYield', parseFloat(e.target.value) || 0)} placeholder="500" style={{ ...inputStyle, padding: '8px 10px', fontSize: '13px' }} />
                </div>
            </div>

            {/* Source Type */}
            <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>แหล่งที่มาของผลผลิต *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {SOURCE_TYPES.map(type => (
                        <button key={type.id} onClick={() => handleChange('sourceType', type.id)} style={{
                            padding: '10px 6px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                            border: form.sourceType === type.id ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            background: form.sourceType === type.id ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : 'transparent',
                        }}>
                            <div style={{ fontSize: '16px' }}>{type.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827', marginTop: '2px' }}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Certifications */}
            <div style={{ background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#059669', marginBottom: '10px' }}>
                    📋 ใบรับรอง (ถ้ามี)
                </span>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.hasGAPCert || false} onChange={e => handleChange('hasGAPCert', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#10B981' }} />
                        <span style={{ fontSize: '13px', color: isDark ? '#F9FAFB' : '#111827' }}>มี GAP</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.hasOrganicCert || false} onChange={e => handleChange('hasOrganicCert', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#10B981' }} />
                        <span style={{ fontSize: '13px', color: isDark ? '#F9FAFB' : '#111827' }}>มี Organic</span>
                    </label>
                </div>
            </div>

            {!isValid && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginBottom: '12px', textAlign: 'center' }}>
                    ⚠️ กรุณาเลือกส่วนของพืชอย่างน้อย 1 รายการ
                </p>
            )}
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
                <button onClick={handleNext} disabled={isNavigating || !isValid} style={{
                    flex: 2, padding: '12px', borderRadius: '10px', border: 'none',
                    background: (isNavigating || !isValid) ? '#9CA3AF' : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: 'white', fontSize: '14px', fontWeight: 600, cursor: (isNavigating || !isValid) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    boxShadow: (isNavigating || !isValid) ? 'none' : '0 4px 16px rgba(16, 185, 129, 0.35)',
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
