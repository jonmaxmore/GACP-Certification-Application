"use client";

import Link from 'next/link';

// Government official colors
const colors = {
    primary: "#0D9488",    // Teal - DTAM
    secondary: "#1E40AF",  // Navy Blue
    success: "#059669",    // Emerald
    textDark: "#1E293B",
    textGray: "#64748B",
    border: "#E2E8F0",
    bgLight: "#F8FAFC",
    successBg: "#F0FDF4",
    infoBg: "#EFF6FF"
};

// Generate case number
const generateCaseNumber = () => {
    const year = new Date().getFullYear() + 543; // Buddhist Era
    const random = Math.floor(10000 + Math.random() * 90000);
    return `GACP-${year}-${random}`;
};

// Format date Thai style
const formatThaiDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleDateString('th-TH', { month: 'long' });
    const year = now.getFullYear() + 543;
    const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    return `${day} ${month} ${year} เวลา ${time} น.`;
};

// SVG Icons
const CheckCircleIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill={colors.successBg} stroke={colors.success} strokeWidth="1.5" />
        <path d="M8 12l3 3 5-6" stroke={colors.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const HomeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

interface Props {
    applicantName?: string;
    plantName?: string;
    applicationId?: string;  // Backend-generated ID
    onGoHome?: () => void;
}

export default function SubmissionSuccess({ applicantName = "ผู้ยื่นคำขอ", plantName = "กัญชา", applicationId }: Props) {
    // Use backend ID if available, otherwise generate mock
    const caseNumber = applicationId || generateCaseNumber();
    const submitDate = formatThaiDate();

    return (
        <div style={{ textAlign: "center", padding: "8px 0" }}>
            {/* Success Icon */}
            <div style={{ marginBottom: "16px" }}>
                <CheckCircleIcon />
            </div>

            {/* Header */}
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: colors.success, marginBottom: "8px", letterSpacing: "-0.5px" }}>
                ยื่นคำขอสำเร็จ
            </h2>
            <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
                ขอขอบคุณที่ยื่นคำขอรับรองมาตรฐาน GACP<br />
                คำขอของท่านถูกบันทึกเข้าสู่ระบบเรียบร้อยแล้ว
            </p>

            {/* Case Information */}
            <div style={{
                padding: "20px",
                backgroundColor: colors.successBg,
                borderRadius: "12px",
                marginBottom: "20px",
                border: `1px solid ${colors.success}30`,
                textAlign: "left"
            }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: colors.success, marginBottom: "14px", textAlign: "center" }}>
                    📋 ข้อมูลคำขอ
                </h3>
                <div style={{ display: "grid", gap: "10px", fontSize: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#FFF", borderRadius: "8px" }}>
                        <span style={{ color: colors.textGray }}>หมายเลขคำขอ</span>
                        <span style={{ fontWeight: 700, color: colors.secondary, fontFamily: "monospace", fontSize: "15px" }}>{caseNumber}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#FFF", borderRadius: "8px" }}>
                        <span style={{ color: colors.textGray }}>วันที่ยื่น</span>
                        <span style={{ fontWeight: 500, color: colors.textDark }}>{submitDate}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#FFF", borderRadius: "8px" }}>
                        <span style={{ color: colors.textGray }}>ผู้ยื่น</span>
                        <span style={{ fontWeight: 500, color: colors.textDark }}>{applicantName}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#FFF", borderRadius: "8px" }}>
                        <span style={{ color: colors.textGray }}>พืชสมุนไพร</span>
                        <span style={{ fontWeight: 500, color: colors.textDark }}>🌿 {plantName}</span>
                    </div>
                </div>
            </div>

            {/* Next Steps */}
            <div style={{
                padding: "16px",
                backgroundColor: colors.infoBg,
                borderRadius: "12px",
                marginBottom: "20px",
                textAlign: "left",
                border: "1px solid #BFDBFE"
            }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: colors.secondary, marginBottom: "12px" }}>
                    📌 ขั้นตอนถัดไป
                </h3>
                <ol style={{ paddingLeft: "20px", margin: 0, fontSize: "13px", color: colors.secondary, lineHeight: 2 }}>
                    <li><strong>รอเจ้าหน้าที่ตรวจสอบเอกสาร</strong> (3-5 วันทำการ)</li>
                    <li>ชำระค่าธรรมเนียมงวดที่ 2 (25,000 บาท)</li>
                    <li>นัดวันตรวจประเมินสถานที่</li>
                    <li>รอผลพิจารณา (~120 วัน)</li>
                </ol>
            </div>

            {/* Contact Info */}
            <div style={{
                padding: "14px",
                backgroundColor: colors.bgLight,
                borderRadius: "10px",
                marginBottom: "24px",
                border: `1px solid ${colors.border}`
            }}>
                <h4 style={{ fontSize: "13px", fontWeight: 600, color: colors.textDark, marginBottom: "8px" }}>
                    📞 ติดต่อสอบถาม
                </h4>
                <p style={{ fontSize: "12px", color: colors.textGray, margin: 0, lineHeight: 1.6 }}>
                    กรมการแพทย์แผนไทยและการแพทย์ทางเลือก<br />
                    โทร: 02-590-2600 | Email: gacp@dtam.moph.go.th
                </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
                <Link
                    href="/applications"
                    style={{
                        flex: 1,
                        padding: "14px",
                        backgroundColor: colors.primary,
                        color: "#FFF",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "15px",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                    }}
                >
                    <HomeIcon />
                    กลับหน้าหลัก
                </Link>
                <button
                    onClick={() => window.print()}
                    style={{
                        flex: 1,
                        padding: "14px",
                        backgroundColor: "#FFF",
                        color: colors.textDark,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "10px",
                        fontSize: "15px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                    }}
                >
                    <DownloadIcon />
                    พิมพ์/บันทึก
                </button>
            </div>

            {/* Footer Note */}
            <p style={{ marginTop: "20px", fontSize: "11px", color: colors.textGray, lineHeight: 1.5 }}>
                กรุณาเก็บหมายเลขคำขอไว้เป็นหลักฐานอ้างอิง<br />
                ท่านสามารถติดตามสถานะได้ที่เมนู "คำขอของฉัน"
            </p>
        </div>
    );
}
