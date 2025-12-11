"use client";

import { useState, useEffect } from 'react';
import { ApplicantData, ApplicantType } from '../hooks/useWizardState';

const colors = { primary: "#0D9488", primaryLight: "#0D948815", textDark: "#1E293B", textGray: "#64748B", border: "#E2E8F0" };

const APPLICANT_TYPES: { id: ApplicantType; label: string }[] = [
    { id: 'INDIVIDUAL', label: 'บุคคลธรรมดา' },
    { id: 'JURISTIC', label: 'นิติบุคคล' },
    { id: 'COMMUNITY', label: 'วิสาหกิจชุมชน' },
];

interface Props {
    data: ApplicantData | null;
    isHighControl: boolean;
    onChange: (data: ApplicantData) => void;
}

export default function Step4Applicant({ data, isHighControl, onChange }: Props) {
    const [form, setForm] = useState<ApplicantData>({
        applicantType: data?.applicantType || 'INDIVIDUAL',
        fullName: data?.fullName || '',
        idCard: data?.idCard || '',
        address: data?.address || '',
        phone: data?.phone || '',
        email: data?.email || '',
        lineId: data?.lineId || '',
        purpose: data?.purpose || 'RESEARCH',  // NEW: Purpose field
        responsibleName: data?.responsibleName || '',
        qualification: data?.qualification || '',
        plantingStatus: data?.plantingStatus || 'NOTIFY',
        licenseNumber: data?.licenseNumber || '',
        licenseType: data?.licenseType || 'BHT11',
    });

    useEffect(() => {
        onChange(form);
    }, [form, onChange]);

    const updateField = (field: keyof ApplicantData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const isJuristic = form.applicantType !== 'INDIVIDUAL';

    return (
        <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: colors.textDark, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: colors.primary }}>👤</span>
                ข้อมูลผู้ยื่นคำขอ
            </h2>
            <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "24px" }}>กรอกข้อมูลผู้ยื่นคำขอให้ครบถ้วน ** กรุณาตรวจสอบความถูกต้อง</p>

            {/* Applicant Type */}
            <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "8px" }}>ประเภทผู้ยื่น *</label>
                <div style={{ display: "flex", gap: "12px" }}>
                    {APPLICANT_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => updateField('applicantType', type.id)}
                            style={{ flex: 1, padding: "12px", borderRadius: "8px", border: form.applicantType === type.id ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`, backgroundColor: form.applicantType === type.id ? colors.primaryLight : "#FFF", fontSize: "14px", fontWeight: 500, color: colors.textDark, cursor: "pointer" }}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>{isJuristic ? "ชื่อบริษัท/องค์กร *" : "ชื่อเจ้าของแปลงปลูก *"}</label>
                    <input type="text" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder={isJuristic ? "บริษัท สมุนไพรไทย จำกัด" : "นายสมชาย ใจดี"} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px" }} />
                </div>

                <div>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>{isJuristic ? "เลขทะเบียนนิติบุคคล *" : "เลขที่บัตรประจำตัวประชาชน *"}</label>
                    <input type="text" value={form.idCard} onChange={(e) => updateField('idCard', e.target.value)} maxLength={13} placeholder="0000000000000" style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px" }} />
                </div>

                <div>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>โทรศัพท์มือถือ *</label>
                    <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="08X-XXX-XXXX" style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px" }} />
                </div>

                {/* NEW: Email */}
                <div>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>อีเมล *</label>
                    <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="example@email.com" style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px" }} />
                </div>

                {/* NEW: Line ID */}
                <div>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>Line ID *</label>
                    <input type="text" value={form.lineId} onChange={(e) => updateField('lineId', e.target.value)} placeholder="@lineid หรือ 08XXXXXXXX" style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px" }} />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>ที่อยู่ *</label>
                    <textarea value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="123 หมู่ 4 ต.xxx อ.xxx จ.xxx 12345" rows={2} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px", resize: "none" }} />
                </div>

                {/* Purpose/Objective - moved from Step3Certification */}
                <div style={{ gridColumn: "span 2", marginTop: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "10px" }}>วัตถุประสงค์การขอใบรับรอง *</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "8px", border: `1px solid ${colors.border}`, cursor: "pointer", backgroundColor: form.purpose === 'RESEARCH' ? colors.primaryLight : "#FFF" }}>
                            <input type="radio" name="purpose" checked={form.purpose === 'RESEARCH'} onChange={() => updateField('purpose', 'RESEARCH')} style={{ width: "16px", height: "16px", accentColor: colors.primary }} />
                            <span style={{ fontSize: "14px", color: colors.textDark }}>เพื่อใช้ประโยชน์ในการศึกษาวิจัย</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "8px", border: `1px solid ${colors.border}`, cursor: "pointer", backgroundColor: form.purpose === 'COMMERCIAL' ? colors.primaryLight : "#FFF" }}>
                            <input type="radio" name="purpose" checked={form.purpose === 'COMMERCIAL'} onChange={() => updateField('purpose', 'COMMERCIAL')} style={{ width: "16px", height: "16px", accentColor: colors.primary }} />
                            <span style={{ fontSize: "14px", color: colors.textDark }}>เพื่อการพาณิชย์ในการจำหน่ายหรือแปรรูป</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "8px", border: `1px solid ${colors.border}`, cursor: "pointer", backgroundColor: form.purpose === 'EXPORT' ? colors.primaryLight : "#FFF" }}>
                            <input type="radio" name="purpose" checked={form.purpose === 'EXPORT'} onChange={() => updateField('purpose', 'EXPORT')} style={{ width: "16px", height: "16px", accentColor: colors.primary }} />
                            <span style={{ fontSize: "14px", color: colors.textDark }}>เพื่อการพาณิชย์ในการส่งออก</span>
                        </label>
                    </div>
                </div>

                {isJuristic && (
                    <>
                        <div>
                            <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>ชื่อผู้รับผิดชอบ *</label>
                            <input type="text" value={form.responsibleName} onChange={(e) => updateField('responsibleName', e.target.value)} placeholder="นายสมชาย ใจดี" style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>คุณวุฒิ</label>
                            <input type="text" value={form.qualification} onChange={(e) => updateField('qualification', e.target.value)} placeholder="ปริญญาตรี เภสัชศาสตร์" style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px" }} />
                        </div>
                    </>
                )}
            </div>

            {/* HIGH_CONTROL License Info */}
            {isHighControl && (
                <div style={{ marginTop: "24px", padding: "20px", backgroundColor: "#FEF2F2", borderRadius: "12px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#991B1B", marginBottom: "16px" }}>🔒 ข้อมูลใบอนุญาต (สมุนไพรควบคุม)</h3>

                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "8px" }}>สถานะใบอนุญาต *</label>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => updateField('plantingStatus', 'NOTIFY')} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: form.plantingStatus === 'NOTIFY' ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`, backgroundColor: form.plantingStatus === 'NOTIFY' ? colors.primaryLight : "#FFF", fontSize: "14px", cursor: "pointer" }}>จดแจ้ง</button>
                            <button onClick={() => updateField('plantingStatus', 'LICENSED')} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: form.plantingStatus === 'LICENSED' ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`, backgroundColor: form.plantingStatus === 'LICENSED' ? colors.primaryLight : "#FFF", fontSize: "14px", cursor: "pointer" }}>มีใบอนุญาต</button>
                        </div>
                    </div>

                    {form.plantingStatus === 'LICENSED' && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>ประเภทใบอนุญาต *</label>
                                <select value={form.licenseType} onChange={(e) => updateField('licenseType', e.target.value)} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px" }}>
                                    <option value="BHT11">BhT 11 - ปลูก</option>
                                    <option value="BHT13">BhT 13 - ขาย</option>
                                    <option value="BHT16">BhT 16 - แปรรูป</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>เลขที่ใบอนุญาต *</label>
                                <input type="text" value={form.licenseNumber} onChange={(e) => updateField('licenseNumber', e.target.value)} placeholder="กท 1/2565" style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px" }} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
