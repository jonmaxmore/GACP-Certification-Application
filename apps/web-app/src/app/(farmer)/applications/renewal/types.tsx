/**
 * Renewal Flow - Shared Types
 * 🍎 Apple Single Responsibility: Types in separate file
 */

export interface Certificate {
    _id: string;
    certificateNumber: string;
    applicationId: string;
    siteName: string;
    plantType: string;
    expiryDate: string;
    status: string;
}

export interface Theme {
    bg: string;
    bgCard: string;
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentLight: string;
    accentBg: string;
    iconBg: string;
    iconColor: string;
}

export const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
        accent: "#16A34A", accentLight: "#22C55E", accentBg: "rgba(22, 163, 74, 0.08)",
        iconBg: "#E5F9E7", iconColor: "#16A34A",
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
        accent: "#10B981", accentLight: "#34D399", accentBg: "rgba(16, 185, 129, 0.15)",
        iconBg: "rgba(16, 185, 129, 0.15)", iconColor: "#34D399",
    }
};

export const RENEWAL_FEE = 30000;

export const REQUIRED_DOCS = [
    { id: 'license_renewal', name: 'หนังสืออนุญาตประกอบกิจการ (ต่ออายุ)', required: true },
    { id: 'annual_report', name: 'รายงานผลผลิตประจำปี', required: true },
    { id: 'inspection_report', name: 'รายงานการตรวจสอบคุณภาพ', required: true },
    { id: 'tax_certificate', name: 'หนังสือรับรองการเสียภาษี', required: false },
];

export const Icons = {
    back: (c: string) => <svg width="20" height = "20" viewBox="0 0 24 24" fill="none" stroke={ c } strokeWidth="1.5" > <path d="M19 12H5M12 19l-7-7 7-7" /></svg >,
    upload: (c: string) => <svg width="24" height = "24" viewBox="0 0 24 24" fill="none" stroke={ c } strokeWidth="1.5" > <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" / > <line x1="12" y1 = "3" x2="12" y2="15" /> </svg>,
    check: (c: string) => <svg width="20" height = "20" viewBox="0 0 24 24" fill="none" stroke={ c } strokeWidth="2.5" > <polyline points="20 6 9 17 4 12" /></svg >,
    file: (c: string) => <svg width="24" height = "24" viewBox="0 0 24 24" fill="none" stroke={ c } strokeWidth="1.5" > <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" / > </svg>,
};

export type RenewalStep = 'upload' | 'quotation' | 'invoice' | 'payment' | 'success';
