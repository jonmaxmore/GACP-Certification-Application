"use client";

import { useState } from 'react';

const colors = { primary: "#0D9488", primaryLight: "#0D948815", textDark: "#1E293B", textGray: "#64748B", border: "#E2E8F0" };

const STANDARDS = [
    "มีการจัดการพื้นที่ปลูกอย่างเหมาะสม",
    "มีการควบคุมคุณภาพเมล็ดพันธุ์/ต้นพันธุ์",
    "มีการจัดการน้ำและวัสดุปลูกอย่างถูกต้อง",
    "มีการใช้ปุ๋ยและสารเคมีอย่างเหมาะสม",
    "มีการป้องกันกำจัดศัตรูพืชที่ถูกต้อง",
    "มีการเก็บเกี่ยวในเวลาที่เหมาะสม",
    "มีการจัดการหลังเก็บเกี่ยวที่ถูกต้อง",
    "มีการบรรจุและเก็บรักษาอย่างเหมาะสม",
    "มีการกำจัดของเสียอย่างถูกต้อง",
    "มีการรักษาความสะอาดและสุขอนามัย",
    "มีการบันทึกข้อมูลครบถ้วน",
    "มีการอบรมบุคลากรอย่างเหมาะสม",
    "มีมาตรการติดตามและประเมินผล",
    "มีการปรับปรุงพัฒนาอย่างต่อเนื่อง",
];

interface Props {
    accepted: boolean;
    onAccept: (accepted: boolean) => void;
}

export default function Step1Standards({ accepted, onAccept }: Props) {
    const [checked, setChecked] = useState<boolean[]>(new Array(14).fill(false));
    const allChecked = checked.every(Boolean);

    const toggleAll = () => {
        const newValue = !allChecked;
        setChecked(new Array(14).fill(newValue));
        onAccept(newValue);
    };

    const toggleItem = (index: number) => {
        const newChecked = [...checked];
        newChecked[index] = !newChecked[index];
        setChecked(newChecked);
        onAccept(newChecked.every(Boolean));
    };

    return (
        <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: colors.textDark, marginBottom: "8px" }}>มาตรฐาน GACP 14 ข้อ</h2>
            <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "16px" }}>กรุณายืนยันว่าคุณปฏิบัติตามมาตรฐานต่อไปนี้</p>

            <button
                onClick={toggleAll}
                style={{ marginBottom: "16px", padding: "10px 16px", backgroundColor: allChecked ? colors.primary : "#FFF", color: allChecked ? "#FFF" : colors.textDark, border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}
            >
                {allChecked ? "✓ ยอมรับทั้งหมดแล้ว" : "เลือกทั้งหมด"}
            </button>

            <div style={{ maxHeight: "400px", overflowY: "auto", border: `1px solid ${colors.border}`, borderRadius: "12px" }}>
                {STANDARDS.map((std, i) => (
                    <div
                        key={i}
                        onClick={() => toggleItem(i)}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderBottom: i < 13 ? `1px solid ${colors.border}` : "none", cursor: "pointer", backgroundColor: checked[i] ? colors.primaryLight : "#FFF" }}
                    >
                        <div style={{ width: "24px", height: "24px", borderRadius: "6px", border: `2px solid ${checked[i] ? colors.primary : colors.border}`, backgroundColor: checked[i] ? colors.primary : "#FFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {checked[i] && <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFF"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                        </div>
                        <span style={{ fontSize: "14px", color: colors.textDark }}>
                            <strong>{i + 1}.</strong> {std}
                        </span>
                    </div>
                ))}
            </div>

            {
                !allChecked && (
                    <p style={{ marginTop: "16px", fontSize: "13px", color: "#DC2626" }}>
                        ⚠️ กรุณายอมรับมาตรฐานทั้ง 14 ข้อเพื่อดำเนินการต่อ
                    </p>
                )
            }
        </div >
    );
}
