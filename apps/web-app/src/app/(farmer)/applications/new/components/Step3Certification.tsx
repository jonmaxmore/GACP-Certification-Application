"use client";

import { useState, useEffect } from 'react';
import { CertificationData, CertificationType, PurposeType, AreaType, RESOURCE_LINKS } from '../hooks/useWizardState';

const colors = { primary: "#0D9488", primaryLight: "#0D948815", textDark: "#1E293B", textGray: "#64748B", border: "#E2E8F0", warning: "#F59E0B" };

// Icons
const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

const CERTIFICATION_TYPES: { id: CertificationType; label: string; desc: string }[] = [
    { id: 'PRODUCTION', label: 'การผลิต (ปลูก) เก็บเกี่ยวที่ดี', desc: 'GACP สำหรับการปลูกและเก็บเกี่ยว' },
    { id: 'PROCESSING', label: 'การแปรรูป (รวมถึงแปรรูปเบื้องต้น)', desc: 'รวมถึงการทริม, ตัดแต่ง, อบแห้ง' },
];

const PURPOSE_TYPES: { id: PurposeType; label: string }[] = [
    { id: 'RESEARCH', label: 'เพื่อใช้ประโยชน์ในการศึกษาวิจัย' },
    { id: 'COMMERCIAL_DOMESTIC', label: 'เพื่อการพาณิชย์ในการจำหน่ายหรือแปรรูปสมุนไพรควบคุมเพื่อการค้า' },
    { id: 'COMMERCIAL_EXPORT', label: 'เพื่อการพาณิชย์ในการส่งออกสมุนไพรควบคุมทางการค้า' },
    { id: 'OTHER', label: 'อื่นๆ (โปรดระบุ)' },
];

const AREA_TYPES: { id: AreaType; label: string; desc: string }[] = [
    { id: 'OUTDOOR', label: 'กลางแจ้ง (Outdoor)', desc: 'ปลูกในพื้นที่โล่งแจ้ง' },
    { id: 'INDOOR', label: 'อาคารหรือโรงเรือนระบบปิด (Indoor)', desc: 'ควบคุมสภาพแวดล้อมเต็มรูปแบบ' },
    { id: 'GREENHOUSE', label: 'โรงเรือนทั่วไป (Greenhouse)', desc: 'โรงเรือนที่ไม่ใช่ระบบปิด' },
    { id: 'OTHER', label: 'อื่นๆ (โปรดระบุ)', desc: '' },
];

interface Props {
    data: CertificationData | null;
    onChange: (data: CertificationData) => void;
}

export default function Step3Certification({ data, onChange }: Props) {
    const [form, setForm] = useState<CertificationData>({
        certificationTypes: data?.certificationTypes || [],
        purpose: data?.purpose || 'RESEARCH',
        purposeOther: data?.purposeOther || '',
        areaType: data?.areaType || 'OUTDOOR',
        areaTypeOther: data?.areaTypeOther || '',
    });

    useEffect(() => {
        onChange(form);
    }, [form, onChange]);

    const toggleCertType = (typeId: CertificationType) => {
        setForm(prev => {
            const current = prev.certificationTypes;
            const exists = current.includes(typeId);
            return {
                ...prev,
                certificationTypes: exists
                    ? current.filter(t => t !== typeId)
                    : [...current, typeId]
            };
        });
    };

    const isCommercial = form.purpose === 'COMMERCIAL_DOMESTIC' || form.purpose === 'COMMERCIAL_EXPORT';

    return (
        <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: colors.textDark, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: colors.primary }}>📋</span>
                ประเภทของการรับรอง
            </h2>
            <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "24px" }}>
                เลือกประเภทการรับรองและวัตถุประสงค์ในการขอใบรับรอง
            </p>

            {/* Certification Type (Checkbox) */}
            <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: colors.textDark, display: "block", marginBottom: "12px" }}>
                    ประเภทของการรับรอง * (เลือกได้มากกว่า 1)
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {CERTIFICATION_TYPES.map(type => (
                        <label key={type.id} style={{
                            display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px",
                            border: form.certificationTypes.includes(type.id) ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                            borderRadius: "12px", cursor: "pointer",
                            backgroundColor: form.certificationTypes.includes(type.id) ? colors.primaryLight : "#FFF"
                        }}>
                            <input
                                type="checkbox"
                                checked={form.certificationTypes.includes(type.id)}
                                onChange={() => toggleCertType(type.id)}
                                style={{ width: "20px", height: "20px", marginTop: "2px", accentColor: colors.primary }}
                            />
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textDark }}>{type.label}</div>
                                <div style={{ fontSize: "12px", color: colors.textGray, marginTop: "2px" }}>{type.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", color: colors.primary, display: "flex", alignItems: "center", gap: "6px" }}>
                    <InfoIcon /> หากมีกิจกรรมการทริม หมายถึงมีการแปรรูปเบื้องต้น
                </div>
            </div>

            {/* Purpose (Radio) */}
            <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: colors.textDark, display: "block", marginBottom: "12px" }}>
                    วัตถุประสงค์ในการขอใบรับรอง *
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {PURPOSE_TYPES.map(type => (
                        <label key={type.id} style={{
                            display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                            border: form.purpose === type.id ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                            borderRadius: "10px", cursor: "pointer",
                            backgroundColor: form.purpose === type.id ? colors.primaryLight : "#FFF"
                        }}>
                            <input
                                type="radio"
                                name="purpose"
                                checked={form.purpose === type.id}
                                onChange={() => setForm(prev => ({ ...prev, purpose: type.id }))}
                                style={{ width: "18px", height: "18px", accentColor: colors.primary }}
                            />
                            <span style={{ fontSize: "14px", color: colors.textDark }}>{type.label}</span>
                        </label>
                    ))}
                </div>
                {form.purpose === 'OTHER' && (
                    <input
                        type="text"
                        value={form.purposeOther}
                        onChange={(e) => setForm(prev => ({ ...prev, purposeOther: e.target.value }))}
                        placeholder="โปรดระบุวัตถุประสงค์"
                        style={{ width: "100%", marginTop: "10px", padding: "12px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }}
                    />
                )}
            </div>

            {/* Commercial Warning */}
            {isCommercial && (
                <div style={{ padding: "14px 16px", backgroundColor: "#FEF3C7", borderRadius: "10px", marginBottom: "20px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <span style={{ color: colors.warning, fontSize: "20px" }}>⚠️</span>
                    <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#92400E" }}>กรณีเพื่อการพาณิชย์</div>
                        <div style={{ fontSize: "13px", color: "#B45309", marginTop: "4px" }}>
                            กรุณาเตรียมไฟล์ใบอนุญาตพาณิชย์เพื่อแนบใน Step อัปโหลดเอกสาร
                        </div>
                    </div>
                </div>
            )}

            {/* Area Type (Radio with images) */}
            <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: colors.textDark, display: "block", marginBottom: "12px" }}>
                    ลักษณะพื้นที่ปลูก *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {AREA_TYPES.map(type => (
                        <label key={type.id} style={{
                            display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 12px",
                            border: form.areaType === type.id ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                            borderRadius: "12px", cursor: "pointer", textAlign: "center",
                            backgroundColor: form.areaType === type.id ? colors.primaryLight : "#FFF"
                        }}>
                            <input
                                type="radio"
                                name="areaType"
                                checked={form.areaType === type.id}
                                onChange={() => setForm(prev => ({ ...prev, areaType: type.id }))}
                                style={{ marginBottom: "8px", width: "18px", height: "18px", accentColor: colors.primary }}
                            />
                            <span style={{ fontSize: "13px", fontWeight: 600, color: colors.textDark }}>{type.label}</span>
                            {type.desc && <span style={{ fontSize: "11px", color: colors.textGray, marginTop: "4px" }}>{type.desc}</span>}
                        </label>
                    ))}
                </div>
                {form.areaType === 'OTHER' && (
                    <input
                        type="text"
                        value={form.areaTypeOther}
                        onChange={(e) => setForm(prev => ({ ...prev, areaTypeOther: e.target.value }))}
                        placeholder="โปรดระบุลักษณะพื้นที่"
                        style={{ width: "100%", marginTop: "10px", padding: "12px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }}
                    />
                )}
            </div>

            {/* Resource Links */}
            <div style={{ padding: "14px 16px", backgroundColor: "#F0FDF4", borderRadius: "10px", border: `1px solid ${colors.primary}` }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textDark, marginBottom: "10px" }}>📚 แหล่งข้อมูลสำหรับเตรียมเอกสาร</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <a href={RESOURCE_LINKS.formDownload} target="_blank" rel="noopener noreferrer" style={{
                        display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: colors.primary, textDecoration: "none"
                    }}>
                        <ExternalLinkIcon /> ดาวน์โหลดแบบฟอร์มยื่นคำขอ (Google Drive)
                    </a>
                    <a href={RESOURCE_LINKS.sopVideoGuide} target="_blank" rel="noopener noreferrer" style={{
                        display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: colors.primary, textDecoration: "none"
                    }}>
                        <ExternalLinkIcon /> วิดีโอตัวอย่างการจัดทำ SOP (YouTube)
                    </a>
                </div>
            </div>
        </div>
    );
}
