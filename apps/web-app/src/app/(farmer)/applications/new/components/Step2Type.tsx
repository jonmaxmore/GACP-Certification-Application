"use client";

import { ServiceType } from '../hooks/useWizardState';

const colors = { primary: "#0D9488", primaryLight: "#0D948815", textDark: "#1E293B", textGray: "#64748B", border: "#E2E8F0" };

const SERVICE_TYPES: { id: ServiceType; label: string; desc: string; icon: string }[] = [
    { id: 'NEW', label: 'ยื่นคำขอรายใหม่', desc: 'สำหรับผู้ที่ยังไม่เคยได้รับการรับรอง GACP', icon: '🆕' },
    { id: 'RENEWAL', label: 'ต่ออายุใบรับรอง', desc: 'สำหรับผู้ที่มีใบรับรองเดิมและต้องการต่ออายุ', icon: '🔄' },
    { id: 'REPLACEMENT', label: 'ขอใบแทน', desc: 'กรณีใบรับรองสูญหายหรือชำรุด', icon: '📋' },
];

interface Props {
    selected: ServiceType | null;
    onSelect: (type: ServiceType) => void;
}

export default function Step2Type({ selected, onSelect }: Props) {
    return (
        <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: colors.textDark, marginBottom: "8px" }}>ประเภทคำขอ</h2>
            <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "24px" }}>เลือกประเภทคำขอที่ต้องการดำเนินการ</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {SERVICE_TYPES.map((type) => {
                    const isSelected = selected === type.id;
                    return (
                        <button
                            key={type.id}
                            onClick={() => onSelect(type.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                padding: "20px",
                                borderRadius: "12px",
                                border: isSelected ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                                backgroundColor: isSelected ? colors.primaryLight : "#FFF",
                                cursor: "pointer",
                                textAlign: "left",
                            }}
                        >
                            <div style={{ width: "56px", height: "56px", borderRadius: "12px", backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                                {type.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "16px", fontWeight: 600, color: colors.textDark }}>{type.label}</div>
                                <div style={{ fontSize: "13px", color: colors.textGray, marginTop: "4px" }}>{type.desc}</div>
                            </div>
                            {isSelected && (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={colors.primary}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                            )}
                        </button>
                    );
                })}
            </div>

            {selected === 'REPLACEMENT' && (
                <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#FEF3C7", borderRadius: "12px", borderLeft: "4px solid #F59E0B" }}>
                    <p style={{ fontSize: "13px", color: "#92400E" }}>
                        📋 การขอใบแทนจะข้ามขั้นตอนกรอกข้อมูลบางส่วนและไปยังการอัปโหลดเอกสารโดยตรง
                    </p>
                </div>
            )}
        </div>
    );
}
