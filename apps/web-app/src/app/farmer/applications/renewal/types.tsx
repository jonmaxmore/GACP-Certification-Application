/**
 * Renewal Flow - Shared Types
 * Refactored to remove Theme interface (now using isDark + Tailwind classes)
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

export const RENEWAL_FEE = 30000;

export const REQUIRED_DOCS = [
    { id: 'license_renewal', name: 'หนังสืออนุญาตประกอบกิจการ (ต่ออายุ)', required: true },
    { id: 'annual_report', name: 'รายงานผลผลิตประจำปี', required: true },
    { id: 'inspection_report', name: 'รายงานการตรวจสอบคุณภาพ', required: true },
    { id: 'tax_certificate', name: 'หนังสือรับรองการเสียภาษี', required: false },
];

export type RenewalStep = 'upload' | 'quotation' | 'invoice' | 'payment' | 'success';
