"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, ProductionData, PLANTS } from '../hooks/useWizardStore';

const PLANT_PARTS = [
    { id: 'SEED', label: 'เมล็ด', icon: '🌰' },
    { id: 'STEM', label: 'ก้าน/ลำต้น', icon: '🌿' },
    { id: 'FLOWER', label: 'ช่อดอก', icon: '🌸' },
    { id: 'LEAF', label: 'ใบ', icon: '🍃' },
    { id: 'ROOT', label: 'ราก/หัว', icon: '🥕' },
    { id: 'OTHER', label: 'อื่นๆ', icon: '📦' },
];

const PROPAGATION_TYPES = [
    { id: 'SEED', label: 'เมล็ด', icon: '🌱', desc: 'ปลูกจากเมล็ด' },
    { id: 'CUTTING', label: 'ปักชำ', icon: '✂️', desc: 'ปักชำจากต้นแม่' },
    { id: 'TISSUE', label: 'เพาะเลี้ยงเนื้อเยื่อ', icon: '🧫', desc: 'Tissue Culture' },
];

const SOURCE_TYPES = [
    { id: 'SELF', label: 'ปลูกเอง', icon: '🏠' },
    { id: 'BUY', label: 'ซื้อจากแหล่งอื่น', icon: '🛒' },
    { id: 'IMPORT', label: 'นำเข้า', icon: '🌍' },
];

export default function Step6Production() {
    const router = useRouter();
    const { state, setProductionData, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [form, setForm] = useState<ProductionData>({
        plantParts: [], propagationType: 'SEED', varietyName: '', seedSource: '', varietySource: '',
        quantityWithUnit: '', harvestCycles: 1, estimatedYield: 0,
        sourceType: 'SELF', sourceDetail: '', hasGAPCert: false, hasOrganicCert: false,
    });

    const isHighControl = PLANTS.find(p => p.id === state.plantId)?.group === 'HIGH_CONTROL';

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

    const handleNext = () => router.push('/applications/new/step-7');
    const handleBack = () => router.push('/applications/new/step-5');

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>กำลังโหลด...</div>;

    const inputStyle = {
        width: '100%', padding: '12px 14px', borderRadius: '10px',
        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
        background: isDark ? '#1F2937' : '#FFFFFF',
        color: isDark ? '#F9FAFB' : '#111827', fontSize: '14px', outline: 'none',
    };
    const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 500, color: isDark ? '#D1D5DB' : '#374151', marginBottom: '6px' };

    return (
        <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    width: '56px', height: '56px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                    borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
                }}>
                    <span style={{ fontSize: '24px' }}>🌱</span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '6px' }}>ข้อมูลการผลิต</h2>
            </div>

            {/* Plant Parts - Multi Select */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ ...labelStyle, marginBottom: '10px' }}>ส่วนที่ใช้ (เลือกได้หลายรายการ) *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {PLANT_PARTS.map(part => (
                        <button key={part.id} onClick={() => togglePart(part.id)} style={{
                            padding: '10px 8px', borderRadius: '10px', textAlign: 'center',
                            border: (form.plantParts || []).includes(part.id) ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            background: (form.plantParts || []).includes(part.id) ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : 'transparent',
                            cursor: 'pointer',
                        }}>
                            <div style={{ fontSize: '18px' }}>{part.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827', marginTop: '4px' }}>{part.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Propagation Type */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ ...labelStyle, marginBottom: '10px' }}>วิธีขยายพันธุ์ *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {PROPAGATION_TYPES.map(type => (
                        <button key={type.id} onClick={() => handleChange('propagationType', type.id)} style={{
                            flex: 1, padding: '12px 10px', borderRadius: '12px',
                            border: form.propagationType === type.id ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            background: form.propagationType === type.id ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : 'transparent',
                            cursor: 'pointer', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '20px' }}>{type.icon}</div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginTop: '6px' }}>{type.label}</div>
                            <div style={{ fontSize: '10px', color: isDark ? '#9CA3AF' : '#6B7280', marginTop: '2px' }}>{type.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Variety Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                    <label style={labelStyle}>ชื่อสายพันธุ์ *</label>
                    <input type="text" value={form.varietyName || ''} onChange={e => handleChange('varietyName', e.target.value)} placeholder="เช่น พันธุ์พื้นเมือง" style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>แหล่งที่มาสายพันธุ์ *</label>
                    <input type="text" value={form.varietySource || ''} onChange={e => handleChange('varietySource', e.target.value)} placeholder="เช่น สถาบันวิจัยฯ" style={inputStyle} />
                </div>
            </div>

            {/* Quantity Section */}
            <div style={{ background: isDark ? '#374151' : '#F9FAFB', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '12px' }}>📊 ปริมาณการผลิต</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>ปริมาณ (ระบุหน่วย) *</label>
                        <input type="text" value={form.quantityWithUnit || ''} onChange={e => handleChange('quantityWithUnit', e.target.value)} placeholder="100 ต้น หรือ 500 กก./ปี" style={{ ...inputStyle, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>รอบเก็บเกี่ยว (ครั้ง/ปี)</label>
                        <input type="number" value={form.harvestCycles || 1} onChange={e => handleChange('harvestCycles', parseInt(e.target.value) || 1)} min="1" max="12" style={{ ...inputStyle, fontSize: '13px' }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>ผลผลิตโดยประมาณ (กก./ปี)</label>
                        <input type="number" value={form.estimatedYield || ''} onChange={e => handleChange('estimatedYield', parseFloat(e.target.value) || 0)} placeholder="500" style={{ ...inputStyle, fontSize: '13px' }} />
                    </div>
                </div>
            </div>

            {/* Source Type */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ ...labelStyle, marginBottom: '10px' }}>แหล่งที่มาของผลผลิต *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {SOURCE_TYPES.map(type => (
                        <button key={type.id} onClick={() => handleChange('sourceType', type.id)} style={{
                            flex: 1, padding: '12px', borderRadius: '10px',
                            border: form.sourceType === type.id ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            background: form.sourceType === type.id ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : 'transparent',
                            cursor: 'pointer', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '18px' }}>{type.icon}</div>
                            <div style={{ fontSize: '12px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827', marginTop: '4px' }}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Certifications */}
            <div style={{ background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#059669', marginBottom: '12px' }}>📋 ใบรับรอง (ถ้ามี)</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.hasGAPCert || false} onChange={e => handleChange('hasGAPCert', e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#10B981' }} />
                        <span style={{ fontSize: '13px', color: isDark ? '#F9FAFB' : '#111827' }}>มี GAP</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.hasOrganicCert || false} onChange={e => handleChange('hasOrganicCert', e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#10B981' }} />
                        <span style={{ fontSize: '13px', color: isDark ? '#F9FAFB' : '#111827' }}>มี Organic</span>
                    </label>
                </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleBack} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`, background: isDark ? '#374151' : 'white', color: isDark ? '#F9FAFB' : '#374151', fontSize: '15px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    ย้อนกลับ
                </button>
                <button onClick={handleNext} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)' }}>
                    ถัดไป
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg>
                </button>
            </div>
        </div>
    );
}
