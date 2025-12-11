"use client";

import { useState } from 'react';

// Design tokens matching dashboard
const colors = {
    primary: "#16A34A",
    primaryLight: "#22C55E",
    primaryBg: "rgba(22, 163, 74, 0.08)",
    text: "#1A1A1A",
    textSecondary: "#5A5A5A",
    textMuted: "#8A8A8A",
    border: "rgba(0, 0, 0, 0.08)",
    surface: "#FFFFFF",
    surfaceBg: "#F8FAF9",
    warning: "#F59E0B",
    warningBg: "rgba(245, 158, 11, 0.1)",
    success: "#10B981",
    successBg: "rgba(16, 185, 129, 0.1)",
};

// SVG Icons (monochrome line-art)
const Icons = {
    file: (color: string) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    ),
    check: (color: string) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    qr: (color: string) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" />
            <rect x="18" y="14" width="3" height="3" /><rect x="14" y="18" width="3" height="3" /><rect x="18" y="18" width="3" height="3" />
        </svg>
    ),
    download: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    ),
    bank: (color: string) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
};

// Payment flow stages
type Stage = 'QUOTATION' | 'INVOICE' | 'PAYMENT' | 'SUCCESS';

interface Props {
    onPaymentComplete: () => void;
    isProcessing: boolean;
    applicantName?: string;
}

// Mock data for Quotation
const QUOTATION_DATA = {
    number: `G-01${new Date().toISOString().slice(2, 4)}${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
    date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }),
    items: [
        { description: "ค่าธรรมเนียมตรวจสอบเอกสาร (งวด 1)", amount: 5000 },
        { description: "ค่าตรวจสอบสถานที่ผลิต (งวด 2)", amount: 25000 },
    ],
    total: 30000,
};

const BANK_INFO = {
    name: "เงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร",
    bank: "ธนาคารกรุงไทย",
    branch: "สาขามหาวิทยาลัยธรรมศาสตร์ รังสิต",
    account: "4750134376",
    taxId: "0994000036540",
};

export default function Step9Payment({ onPaymentComplete, isProcessing, applicantName = "ผู้ยื่นคำขอ" }: Props) {
    const [stage, setStage] = useState<Stage>('QUOTATION');
    const [acceptedQuotation, setAcceptedQuotation] = useState(false);

    const FEE_PHASE1 = 5000;

    const handleAcceptQuotation = () => {
        setAcceptedQuotation(true);
        setStage('INVOICE');
    };

    const handlePaymentComplete = () => {
        setStage('SUCCESS');
    };

    return (
        <div style={{ fontFamily: "'Kanit', sans-serif" }}>

            {/* Progress Steps */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
                {['ใบเสนอราคา', 'ใบแจ้งหนี้', 'ชำระเงิน', 'สำเร็จ'].map((label, i) => {
                    const stageIndex = ['QUOTATION', 'INVOICE', 'PAYMENT', 'SUCCESS'].indexOf(stage);
                    const isDone = i < stageIndex;
                    const isCurrent = i === stageIndex;
                    return (
                        <div key={i} style={{ flex: 1, textAlign: "center" }}>
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "50%", margin: "0 auto 6px",
                                backgroundColor: isDone ? colors.primary : isCurrent ? colors.primaryBg : colors.surfaceBg,
                                border: isCurrent ? `2px solid ${colors.primary}` : "none",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "12px", fontWeight: 600,
                                color: isDone ? "#FFF" : isCurrent ? colors.primary : colors.textMuted,
                            }}>
                                {isDone ? "✓" : i + 1}
                            </div>
                            <span style={{ fontSize: "11px", color: isCurrent ? colors.primary : colors.textMuted }}>{label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Stage 1: Quotation Preview */}
            {stage === 'QUOTATION' && (
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                        {Icons.file(colors.primary)}
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 600, color: colors.text, margin: 0 }}>ใบเสนอราคา</h2>
                            <p style={{ fontSize: "13px", color: colors.textMuted, margin: 0 }}>กรุณาตรวจสอบรายละเอียดและยอมรับใบเสนอราคา</p>
                        </div>
                    </div>

                    {/* Quotation Card */}
                    <div style={{ border: `1px solid ${colors.border}`, borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
                        {/* Header */}
                        <div style={{ padding: "20px", backgroundColor: colors.surfaceBg, borderBottom: `1px solid ${colors.border}` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <p style={{ fontSize: "12px", color: colors.textMuted, margin: "0 0 4px" }}>เลขที่ใบเสนอราคา</p>
                                    <p style={{ fontSize: "16px", fontWeight: 600, color: colors.text, margin: 0 }}>{QUOTATION_DATA.number}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: "12px", color: colors.textMuted, margin: "0 0 4px" }}>วันที่</p>
                                    <p style={{ fontSize: "14px", color: colors.text, margin: 0 }}>{QUOTATION_DATA.date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div style={{ padding: "20px" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                                        <th style={{ textAlign: "left", padding: "12px 0", color: colors.textMuted, fontWeight: 500 }}>รายการ</th>
                                        <th style={{ textAlign: "right", padding: "12px 0", color: colors.textMuted, fontWeight: 500 }}>จำนวนเงิน</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {QUOTATION_DATA.items.map((item, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                            <td style={{ padding: "14px 0", color: colors.text }}>{item.description}</td>
                                            <td style={{ padding: "14px 0", textAlign: "right", color: colors.text, fontWeight: 500 }}>
                                                {item.amount.toLocaleString()} บาท
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td style={{ padding: "16px 0", fontSize: "16px", fontWeight: 600, color: colors.text }}>รวมทั้งสิ้น</td>
                                        <td style={{ padding: "16px 0", textAlign: "right", fontSize: "20px", fontWeight: 700, color: colors.primary }}>
                                            {QUOTATION_DATA.total.toLocaleString()} บาท
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Bank Info */}
                        <div style={{ padding: "16px 20px", backgroundColor: colors.warningBg, borderTop: `1px solid ${colors.border}` }}>
                            <p style={{ fontSize: "12px", color: colors.warning, fontWeight: 600, margin: "0 0 8px" }}>ข้อมูลสำหรับชำระเงิน</p>
                            <p style={{ fontSize: "13px", color: colors.text, margin: "0 0 4px" }}>
                                <strong>ชื่อบัญชี:</strong> {BANK_INFO.name}
                            </p>
                            <p style={{ fontSize: "13px", color: colors.text, margin: "0 0 4px" }}>
                                <strong>ธนาคาร:</strong> {BANK_INFO.bank} {BANK_INFO.branch}
                            </p>
                            <p style={{ fontSize: "13px", color: colors.text, margin: 0 }}>
                                <strong>เลขบัญชี:</strong> {BANK_INFO.account}
                            </p>
                        </div>
                    </div>

                    {/* Download & Accept */}
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            onClick={() => window.print()}
                            style={{
                                flex: 1, padding: "14px", borderRadius: "12px",
                                border: `1px solid ${colors.border}`, backgroundColor: colors.surface,
                                color: colors.text, fontSize: "14px", fontWeight: 500, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            }}
                        >
                            {Icons.download(colors.textMuted)}
                            ดาวน์โหลด PDF
                        </button>
                        <button
                            onClick={handleAcceptQuotation}
                            style={{
                                flex: 2, padding: "14px", borderRadius: "12px",
                                border: "none", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                                color: "#FFF", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            }}
                        >
                            {Icons.check("#FFF")}
                            ยอมรับใบเสนอราคา
                        </button>
                    </div>
                </div>
            )}

            {/* Stage 2: Invoice with QR */}
            {stage === 'INVOICE' && (
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                        {Icons.bank(colors.primary)}
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 600, color: colors.text, margin: 0 }}>ใบแจ้งหนี้ - งวดที่ 1</h2>
                            <p style={{ fontSize: "13px", color: colors.textMuted, margin: 0 }}>ค่าธรรมเนียมตรวจสอบเอกสาร</p>
                        </div>
                    </div>

                    {/* Invoice Card */}
                    <div style={{ border: `1px solid ${colors.border}`, borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
                        <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${colors.border}` }}>
                            <div>
                                <p style={{ fontSize: "12px", color: colors.textMuted, margin: "0 0 4px" }}>เลขที่ใบแจ้งหนี้</p>
                                <p style={{ fontSize: "16px", fontWeight: 600, color: colors.text, margin: 0 }}>GI-01{new Date().toISOString().slice(2, 4)}{String(Math.floor(Math.random() * 100000)).padStart(5, '0')}</p>
                            </div>
                            <div style={{
                                padding: "8px 16px", borderRadius: "100px",
                                backgroundColor: colors.warningBg, color: colors.warning,
                                fontSize: "12px", fontWeight: 600,
                            }}>
                                รอชำระ
                            </div>
                        </div>

                        <div style={{ padding: "24px", textAlign: "center" }}>
                            <p style={{ fontSize: "14px", color: colors.textMuted, marginBottom: "8px" }}>จำนวนเงินที่ต้องชำระ</p>
                            <p style={{ fontSize: "36px", fontWeight: 700, color: colors.primary, margin: "0 0 20px" }}>
                                {FEE_PHASE1.toLocaleString()} บาท
                            </p>

                            {/* QR Code Placeholder */}
                            <div style={{
                                width: "180px", height: "180px", margin: "0 auto 16px",
                                backgroundColor: colors.surfaceBg, borderRadius: "16px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                border: `1px solid ${colors.border}`,
                            }}>
                                <div style={{ textAlign: "center" }}>
                                    {Icons.qr(colors.textMuted)}
                                    <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "8px" }}>PromptPay QR</p>
                                </div>
                            </div>

                            <p style={{ fontSize: "13px", color: colors.textMuted }}>
                                สแกน QR Code เพื่อชำระผ่าน Mobile Banking
                            </p>
                        </div>

                        {/* Bank Details */}
                        <div style={{ padding: "16px 20px", backgroundColor: colors.surfaceBg, fontSize: "13px" }}>
                            <p style={{ margin: "0 0 8px", fontWeight: 600, color: colors.text }}>หรือโอนเงินผ่านบัญชีธนาคาร</p>
                            <div style={{ display: "grid", gap: "4px", color: colors.textSecondary }}>
                                <p style={{ margin: 0 }}><strong>ชื่อบัญชี:</strong> {BANK_INFO.name}</p>
                                <p style={{ margin: 0 }}><strong>{BANK_INFO.bank}:</strong> {BANK_INFO.account}</p>
                            </div>
                        </div>
                    </div>

                    {/* Confirm Payment */}
                    <button
                        onClick={handlePaymentComplete}
                        style={{
                            width: "100%", padding: "16px", borderRadius: "12px",
                            border: "none", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                            color: "#FFF", fontSize: "15px", fontWeight: 600, cursor: "pointer",
                        }}
                    >
                        ฉันชำระเงินแล้ว (จำลอง)
                    </button>
                    <p style={{ textAlign: "center", fontSize: "12px", color: colors.textMuted, marginTop: "12px" }}>
                        * ระบบจะตรวจสอบการชำระเงินอัตโนมัติภายใน 5 นาที
                    </p>
                </div>
            )}

            {/* Stage 3: Success */}
            {stage === 'SUCCESS' && (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{
                        width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 20px",
                        backgroundColor: colors.successBg, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        {Icons.check(colors.success)}
                    </div>
                    <h2 style={{ fontSize: "22px", fontWeight: 600, color: colors.success, marginBottom: "8px" }}>ชำระเงินสำเร็จ!</h2>
                    <p style={{ fontSize: "14px", color: colors.textSecondary, marginBottom: "8px" }}>
                        ค่าธรรมเนียมงวด 1: <strong>{FEE_PHASE1.toLocaleString()} บาท</strong>
                    </p>
                    <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "32px" }}>
                        หมายเลขอ้างอิง: REC-{new Date().toISOString().slice(2, 10).replace(/-/g, '')}{String(Math.floor(Math.random() * 10000)).padStart(4, '0')}
                    </p>

                    <button
                        onClick={onPaymentComplete}
                        disabled={isProcessing}
                        style={{
                            width: "100%", padding: "16px", borderRadius: "12px",
                            border: "none",
                            backgroundColor: isProcessing ? colors.textMuted : colors.primary,
                            color: "#FFF", fontSize: "15px", fontWeight: 600,
                            cursor: isProcessing ? "not-allowed" : "pointer",
                        }}
                    >
                        {isProcessing ? "กำลังส่งคำขอ..." : "ส่งคำขอเพื่อตรวจสอบเอกสาร"}
                    </button>
                </div>
            )}

            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
            `}</style>
        </div>
    );
}
