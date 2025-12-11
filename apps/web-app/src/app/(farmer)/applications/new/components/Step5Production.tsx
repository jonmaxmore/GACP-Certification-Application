"use client";

import { useState, useEffect } from 'react';
import { ProductionData, SourceType, PropagationType, PlantPartType } from '../hooks/useWizardState';

const colors = { primary: "#0D9488", primaryLight: "#0D948815", textDark: "#1E293B", textGray: "#64748B", border: "#E2E8F0" };

// Plant parts options
const PLANT_PARTS: { id: PlantPartType; label: string; desc: string }[] = [
    { id: 'SEED', label: 'เมล็ด', desc: 'Seeds' },
    { id: 'STEM', label: 'ก้าน/ลำต้น', desc: 'Stems' },
    { id: 'FLOWER', label: 'ช่อดอก', desc: 'Flowers' },
    { id: 'CUTTING', label: 'กิ่งชำ/ต้นพันธุ์', desc: 'Cuttings' },
    { id: 'LEAF', label: 'ใบ', desc: 'Leaves' },
    { id: 'ROOT', label: 'ราก/หัว', desc: 'Roots' },
    { id: 'OTHER', label: 'อื่นๆ', desc: '' },
];

const PROPAGATION_TYPES: { id: PropagationType; label: string; desc: string }[] = [
    { id: 'SEED', label: 'เมล็ด', desc: 'ปลูกจากเมล็ดพันธุ์' },
    { id: 'CUTTING', label: 'ปักชำ', desc: 'ปักชำจากต้นแม่' },
    { id: 'TISSUE', label: 'เพาะเลี้ยงเนื้อเยื่อ', desc: 'Tissue Culture' },
    { id: 'OTHER', label: 'อื่นๆ', desc: 'เช่น การแบ่งหัว' },
];

const SOURCE_TYPES: { id: SourceType; label: string }[] = [
    { id: 'SELF', label: 'ปลูกเอง' },
    { id: 'BUY', label: 'ซื้อจากแหล่งอื่น' },
    { id: 'IMPORT', label: 'นำเข้า' },
];

interface Props {
    data: ProductionData | null;
    isHighControl: boolean;
    onChange: (data: ProductionData) => void;
}

export default function Step5Production({ data, isHighControl, onChange }: Props) {
    const [form, setForm] = useState<ProductionData>({
        plantParts: data?.plantParts || [],
        plantPartsOther: data?.plantPartsOther || '',
        propagationType: data?.propagationType || 'SEED',
        varietyName: data?.varietyName || '',
        seedSource: data?.seedSource || '',
        varietySource: data?.varietySource || '',
        treeCount: data?.treeCount || undefined,
        areaSizeRai: data?.areaSizeRai || undefined,
        quantityWithUnit: data?.quantityWithUnit || '',
        harvestCycles: data?.harvestCycles || 1,
        estimatedYield: data?.estimatedYield || 0,
        sourceType: data?.sourceType || 'SELF',
        sourceDetail: data?.sourceDetail || '',
        hasGAPCert: data?.hasGAPCert || false,
        hasOrganicCert: data?.hasOrganicCert || false,
    });

    useEffect(() => {
        onChange(form);
    }, [form, onChange]);

    const updateField = <K extends keyof ProductionData>(field: K, value: ProductionData[K]) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const togglePlantPart = (partId: PlantPartType) => {
        setForm(prev => {
            const current = prev.plantParts;
            const exists = current.includes(partId);
            return {
                ...prev,
                plantParts: exists ? current.filter(p => p !== partId) : [...current, partId]
            };
        });
    };

    return (
        <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: colors.textDark, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: colors.primary }}>🌱</span>
                ข้อมูลการผลิต
            </h2>
            <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "24px" }}>กรอกข้อมูลเกี่ยวกับวิธีขยายพันธุ์ สายพันธุ์ และแหล่งที่มา</p>

            {/* Plant Parts (Multi-select) - NEW! */}
            <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: colors.textDark, display: "block", marginBottom: "12px" }}>
                    ส่วนที่ใช้ * (เลือกได้มากกว่า 1)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                    {PLANT_PARTS.map(part => (
                        <label key={part.id} style={{
                            display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px",
                            border: form.plantParts.includes(part.id) ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                            borderRadius: "8px", cursor: "pointer",
                            backgroundColor: form.plantParts.includes(part.id) ? colors.primaryLight : "#FFF"
                        }}>
                            <input
                                type="checkbox"
                                checked={form.plantParts.includes(part.id)}
                                onChange={() => togglePlantPart(part.id)}
                                style={{ width: "16px", height: "16px", accentColor: colors.primary }}
                            />
                            <span style={{ fontSize: "13px", fontWeight: 500, color: colors.textDark }}>{part.label}</span>
                        </label>
                    ))}
                </div>
                {form.plantParts.includes('OTHER') && (
                    <input
                        type="text"
                        value={form.plantPartsOther}
                        onChange={(e) => updateField('plantPartsOther', e.target.value)}
                        placeholder="โปรดระบุส่วนที่ใช้อื่นๆ"
                        style={{ width: "100%", marginTop: "10px", padding: "12px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }}
                    />
                )}
            </div>

            {/* Propagation Type */}
            <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: colors.textDark, display: "block", marginBottom: "12px" }}>
                    วิธีขยายพันธุ์ / แหล่งที่มาของต้นพันธุ์ *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {PROPAGATION_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => updateField('propagationType', type.id)}
                            style={{
                                padding: "14px 12px", borderRadius: "10px", textAlign: "left", cursor: "pointer",
                                border: form.propagationType === type.id ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                                backgroundColor: form.propagationType === type.id ? colors.primaryLight : "#FFF",
                            }}
                        >
                            <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textDark }}>{type.label}</div>
                            <div style={{ fontSize: "11px", color: colors.textGray, marginTop: "2px" }}>{type.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Variety and Source */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>ชื่อสายพันธุ์ *</label>
                    <input type="text" value={form.varietyName} onChange={(e) => updateField('varietyName', e.target.value)} placeholder="เช่น พันธุ์พื้นเมือง" style={{ width: "100%", padding: "12px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }} />
                </div>
                <div>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>แหล่งที่มาของสายพันธุ์ (บริษัท) *</label>
                    <input type="text" value={form.varietySource} onChange={(e) => updateField('varietySource', e.target.value)} placeholder="เช่น สถาบันวิจัยฯ, บริษัท xxx" style={{ width: "100%", padding: "12px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }} />
                </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>
                    {form.propagationType === 'SEED' ? 'แหล่งที่มาของเมล็ดพันธุ์ *' : 'แหล่งที่มาของต้นพันธุ์/กิ่งพันธุ์ *'}
                </label>
                <textarea value={form.seedSource} onChange={(e) => updateField('seedSource', e.target.value)} placeholder="เช่น ซื้อจากร้าน xxx, ได้รับแจกจากกรม xxx, นำเข้าจากประเทศ xxx ใบอนุญาตเลขที่ xxx" rows={2} style={{ width: "100%", padding: "12px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px", resize: "none" }} />
            </div>

            {/* Quantity Section */}
            <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: colors.textDark, marginBottom: "16px" }}>📊 ข้อมูลปริมาณ</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {/* Quantity with unit (NEW!) */}
                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 500, color: colors.textGray, display: "block", marginBottom: "6px" }}>ปริมาณ (ระบุหน่วย) *</label>
                        <input type="text" value={form.quantityWithUnit} onChange={(e) => updateField('quantityWithUnit', e.target.value)} placeholder="เช่น 100 ต้น หรือ 500 กก./ปี" style={{ width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }} />
                    </div>

                    {/* Tree Count for HIGH_CONTROL */}
                    {isHighControl && (
                        <div>
                            <label style={{ fontSize: "13px", fontWeight: 500, color: colors.textGray, display: "block", marginBottom: "6px" }}>จำนวนต้น</label>
                            <input type="number" value={form.treeCount || ''} onChange={(e) => updateField('treeCount', parseInt(e.target.value) || undefined)} placeholder="100" style={{ width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }} />
                        </div>
                    )}

                    {/* Area Size for GENERAL */}
                    {!isHighControl && (
                        <div>
                            <label style={{ fontSize: "13px", fontWeight: 500, color: colors.textGray, display: "block", marginBottom: "6px" }}>ขนาดพื้นที่ (ไร่)</label>
                            <input type="number" step="0.01" value={form.areaSizeRai || ''} onChange={(e) => updateField('areaSizeRai', parseFloat(e.target.value) || undefined)} placeholder="5.5" style={{ width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }} />
                        </div>
                    )}

                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 500, color: colors.textGray, display: "block", marginBottom: "6px" }}>รอบเก็บเกี่ยว (ครั้ง/ปี)</label>
                        <input type="number" value={form.harvestCycles} onChange={(e) => updateField('harvestCycles', parseInt(e.target.value) || 1)} min={1} max={12} style={{ width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }} />
                    </div>

                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 500, color: colors.textGray, display: "block", marginBottom: "6px" }}>ผลผลิตโดยประมาณ (กก./ปี)</label>
                        <input type="number" value={form.estimatedYield || ''} onChange={(e) => updateField('estimatedYield', parseFloat(e.target.value) || 0)} placeholder="500" style={{ width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }} />
                    </div>
                </div>
            </div>

            {/* Production Source */}
            <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "12px" }}>แหล่งที่มาของผลผลิต *</label>
                <div style={{ display: "flex", gap: "12px" }}>
                    {SOURCE_TYPES.map(type => (
                        <button key={type.id} onClick={() => updateField('sourceType', type.id)} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: form.sourceType === type.id ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`, backgroundColor: form.sourceType === type.id ? colors.primaryLight : "#FFF", fontSize: "14px", fontWeight: 500, color: colors.textDark, cursor: "pointer" }}>
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {form.sourceType !== 'SELF' && (
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>รายละเอียดแหล่งที่มาผลผลิต *</label>
                    <textarea value={form.sourceDetail} onChange={(e) => updateField('sourceDetail', e.target.value)} placeholder={form.sourceType === 'BUY' ? "ซื้อจากฟาร์ม xxx เลขใบอนุญาต xxx" : "นำเข้าจาก xxx ใบอนุญาตนำเข้าเลขที่ xxx"} rows={2} style={{ width: "100%", padding: "12px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px", resize: "none" }} />
                </div>
            )}

            {/* Certifications */}
            <div style={{ padding: "16px", backgroundColor: "#F0FDF4", borderRadius: "12px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: colors.textDark, marginBottom: "12px" }}>📋 ใบรับรอง (ถ้ามี)</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                        <input type="checkbox" checked={form.hasGAPCert} onChange={(e) => updateField('hasGAPCert', e.target.checked)} style={{ width: "18px", height: "18px", accentColor: colors.primary }} />
                        <span style={{ fontSize: "14px", color: colors.textDark }}>มีใบรับรอง GAP</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                        <input type="checkbox" checked={form.hasOrganicCert} onChange={(e) => updateField('hasOrganicCert', e.target.checked)} style={{ width: "18px", height: "18px", accentColor: colors.primary }} />
                        <span style={{ fontSize: "14px", color: colors.textDark }}>มีใบรับรอง Organic</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
