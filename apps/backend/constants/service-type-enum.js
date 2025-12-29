/**
 * GACP Service Types Enum
 * ประเภทบริการ GACP ตามระเบียบกรมการแพทย์แผนไทยฯ
 */

const SERVICE_TYPES = {
    NEW_APPLICATION: 'new_application',      // ยื่นขอใบรับรองใหม่
    RENEWAL: 'renewal',                      // ต่ออายุใบรับรอง
    REPLACEMENT: 'replacement',              // ขอใบรับรองแทน
    AMENDMENT: 'amendment'                   // แก้ไขข้อมูล
};

const SERVICE_TYPE_LABELS = {
    new_application: 'ยื่นขอใบรับรองใหม่',
    renewal: 'ต่ออายุใบรับรอง',
    replacement: 'ขอใบรับรองแทน (สูญหาย/ถูกทำลาย)',
    amendment: 'แก้ไขข้อมูลในใบรับรอง'
};

/**
 * Fixed fees for auto-quote services
 * Services without fixed fee require team review
 */
const FIXED_FEES = {
    new_application: {
        docReview: 5000,      // ค่าตรวจเอกสาร SOP
        fieldInspection: 30000, // ค่าตรวจแปลง
        total: 35000
    },
    renewal: {
        fieldInspection: 30000,
        total: 30000
    },
    replacement: null,  // Team decides
    amendment: null     // Team decides
};

/**
 * Which form parts to show for each service type
 * Based on DTAM form กทล.1
 */
const FORM_REQUIREMENTS = {
    new_application: {
        part1: true,  // ข้อมูลผู้ขอรับรอง
        part2: true,  // ข้อมูลแหล่งผลิต
        part3: true,  // ข้อมูลการผลิต
        part4: true,  // เอกสารแนบ
        requiresSOP: true,
        requiresFieldMap: true
    },
    renewal: {
        part1: false, // ไม่ต้องกรอก
        part2: false, // ไม่ต้องกรอก
        part3: true,  // กรอก
        part4: true,  // กรอก
        requiresSOP: false,
        requiresOperationReport: true,  // รายงานผลดำเนินงาน
        requiresOldCertificate: true    // ใบรับรองเดิม
    },
    replacement: {
        part1: false,
        part2: false,
        part3: false,
        part4: true,
        requiresPoliceReport: true,     // ใบแจ้งความ (กรณีสูญหาย)
        requiresDamagedCertificate: true // ใบรับรองที่เสียหาย (กรณีถูกทำลาย)
    },
    amendment: {
        part1: 'prefill',  // ดึงข้อมูลเดิม แก้ไขได้
        part2: 'prefill',  // ดึงข้อมูลเดิม แก้ไขได้
        part3: 'prefill',  // ดึงข้อมูลเดิม แก้ไขได้
        part4: true,
        requiresChangeDescription: true // อธิบายการเปลี่ยนแปลง
    }
};

/**
 * Application statuses
 */
const APPLICATION_STATUS = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    PENDING_TEAM_REVIEW: 'pending_team_review',   // รอทีมงานประเมิน
    QUOTE_SENT: 'quote_sent',                     // ส่งใบเสนอราคาแล้ว
    AWAITING_PAYMENT: 'awaiting_payment',         // รอชำระเงิน
    PAYMENT_RECEIVED: 'payment_received',         // ชำระเงินแล้ว
    UNDER_INSPECTION: 'under_inspection',         // อยู่ระหว่างตรวจประเมิน
    PENDING_CORRECTION: 'pending_correction',     // รอแก้ไข
    APPROVED: 'approved',                         // อนุมัติ
    REJECTED: 'rejected',                         // ไม่อนุมัติ
    CANCELLED: 'cancelled'                        // ยกเลิก
};

/**
 * Certificate validity period in years
 */
const CERTIFICATE_VALIDITY_YEARS = 3;

/**
 * Check if service type requires team review for pricing
 */
const requiresTeamReview = (serviceType) => {
    return FIXED_FEES[serviceType] === null;
};

/**
 * Get fee for service type (null if requires team review)
 */
const getFeeForServiceType = (serviceType) => {
    return FIXED_FEES[serviceType];
};

module.exports = {
    SERVICE_TYPES,
    SERVICE_TYPE_LABELS,
    FIXED_FEES,
    FORM_REQUIREMENTS,
    APPLICATION_STATUS,
    CERTIFICATE_VALIDITY_YEARS,
    requiresTeamReview,
    getFeeForServiceType
};
