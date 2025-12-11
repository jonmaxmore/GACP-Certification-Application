"use client";

import { useState } from 'react';

// Official government theme
const colors = {
    primary: "#0D9488",   // Teal 
    success: "#059669",   // Emerald - more formal green
    textDark: "#1E293B",
    textGray: "#64748B",
    border: "#E2E8F0",
    blue: "#1E40AF",
    blueBg: "#EFF6FF"
};

// Professional SVG Icons
const CheckCircleIcon = () => (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
        <circle cx="12" cy="12" r="11" stroke={colors.success} fill="#F0FDF4" />
        <path d="M8 12l3 3 5-6" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const CheckmarkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

interface Props {
    applicationId?: string;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export default function Step10Submit({ applicationId, onSubmit, isSubmitting }: Props) {
    const [confirmed, setConfirmed] = useState(false);

    return (
        <div style={{ textAlign: "center" }}>
            {/* Success Icon */}
            <div style={{ marginBottom: "16px" }}>
                <CheckCircleIcon />
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: colors.textDark, marginBottom: "6px", letterSpacing: "-0.5px" }}>
                พร้อมยื่นคำขอแล้ว!
            </h2>
            <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "28px" }}>
                ข้อมูลและเอกสารครบถ้วน กรุณายืนยันเพื่อส่งคำขอ
            </p>

            {/* Summary Box */}
            <div style={{ padding: "20px", backgroundColor: "#F8FAFC", borderRadius: "12px", marginBottom: "20px", textAlign: "left", border: `1px solid ${colors.border}` }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: colors.textDark, marginBottom: "14px" }}>สรุปการดำเนินการ</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <CheckmarkIcon />
                        <span style={{ color: colors.textDark }}>กรอกข้อมูลผู้ยื่นคำขอครบถ้วน</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <CheckmarkIcon />
                        <span style={{ color: colors.textDark }}>กรอกข้อมูลสถานที่และความปลอดภัยครบถ้วน</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <CheckmarkIcon />
                        <span style={{ color: colors.textDark }}>อัปโหลดเอกสารประกอบครบถ้วน</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <CheckmarkIcon />
                        <span style={{ color: colors.textDark }}>ชำระค่าธรรมเนียมงวดที่ 1 แล้ว (5,000 บาท)</span>
                    </div>
                </div>
            </div>

            {/* Next Steps Info */}
            <div style={{ padding: "16px", backgroundColor: colors.blueBg, borderRadius: "10px", marginBottom: "20px", textAlign: "left", border: "1px solid #BFDBFE" }}>
                <h4 style={{ fontSize: "13px", fontWeight: 600, color: colors.blue, marginBottom: "10px" }}>ขั้นตอนถัดไป</h4>
                <ol style={{ paddingLeft: "20px", fontSize: "13px", color: "#1E40AF", lineHeight: 1.8, margin: 0 }}>
                    <li>เจ้าหน้าที่ตรวจสอบเอกสารเบื้องต้น (3-5 วันทำการ)</li>
                    <li>ชำระค่าธรรมเนียมครั้งที่ 2</li>
                    <li>นัดวันตรวจสอบสถานที่</li>
                    <li>รับผลการรับรอง</li>
                </ol>
            </div>

            {/* Confirmation Checkbox */}
            <label style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "14px 16px",
                backgroundColor: confirmed ? "#F0FDF4" : "#FFF",
                border: `1px solid ${confirmed ? colors.success : colors.border}`,
                borderRadius: "10px",
                cursor: "pointer",
                marginBottom: "20px",
                textAlign: "left",
                transition: "all 0.2s"
            }}>
                <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: colors.success, marginTop: "2px", flexShrink: 0 }}
                />
                <div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: colors.textDark }}>
                        ข้าพเจ้ายืนยันว่าข้อมูลทั้งหมดถูกต้องและเป็นความจริง
                    </span>
                    <p style={{ fontSize: "12px", color: colors.textGray, marginTop: "3px" }}>
                        การให้ข้อมูลเท็จอาจมีโทษตามกฎหมาย
                    </p>
                </div>
            </label>

            {/* Submit Button - Official Style */}
            <button
                onClick={onSubmit}
                disabled={!confirmed || isSubmitting}
                style={{
                    width: "100%",
                    padding: "15px",
                    backgroundColor: (!confirmed || isSubmitting) ? "#94A3B8" : colors.success,
                    color: "#FFF",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: (!confirmed || isSubmitting) ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                    boxShadow: (!confirmed || isSubmitting) ? "none" : "0 2px 8px rgba(5,150,105,0.25)"
                }}
            >
                {isSubmitting ? (
                    <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                            <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                        กำลังส่งคำขอ...
                    </>
                ) : (
                    <>
                        <SendIcon />
                        ยืนยันส่งคำขอ
                    </>
                )}
            </button>

            {applicationId && (
                <p style={{ marginTop: "14px", fontSize: "12px", color: colors.textGray }}>
                    เลขที่คำขอ: {applicationId}
                </p>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
