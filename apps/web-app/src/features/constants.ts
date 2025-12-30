/**
 * 🍎 Apple-Standard GACP Business Constants
 * 
 * Centralized source of truth for all business logic constants
 * Eliminates hardcoded values scattered across the codebase
 * 
 * Usage:
 * import { APPLICATION_STATUS, SERVICE_TYPES } from '@/features/constants';
 */

// =============================================================================
// APPLICATION STATUS
// =============================================================================

export const APPLICATION_STATUS = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    DOCUMENT_REQUIRED: 'document_required',
    PENDING_PAYMENT: 'pending_payment',
    PAYMENT_CONFIRMED: 'payment_confirmed',
    SCHEDULED: 'scheduled',
    AUDIT_IN_PROGRESS: 'audit_in_progress',
    PENDING_APPROVAL: 'pending_approval',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

// Thai display names for statuses
export const APPLICATION_STATUS_DISPLAY: Record<ApplicationStatus, string> = {
    [APPLICATION_STATUS.DRAFT]: 'แบบร่าง',
    [APPLICATION_STATUS.SUBMITTED]: 'ยื่นแล้ว',
    [APPLICATION_STATUS.UNDER_REVIEW]: 'อยู่ระหว่างตรวจสอบ',
    [APPLICATION_STATUS.DOCUMENT_REQUIRED]: 'ต้องการเอกสารเพิ่มเติม',
    [APPLICATION_STATUS.PENDING_PAYMENT]: 'รอชำระเงิน',
    [APPLICATION_STATUS.PAYMENT_CONFIRMED]: 'ชำระเงินแล้ว',
    [APPLICATION_STATUS.SCHEDULED]: 'นัดตรวจแล้ว',
    [APPLICATION_STATUS.AUDIT_IN_PROGRESS]: 'กำลังตรวจประเมิน',
    [APPLICATION_STATUS.PENDING_APPROVAL]: 'รอการอนุมัติ',
    [APPLICATION_STATUS.APPROVED]: 'อนุมัติแล้ว',
    [APPLICATION_STATUS.REJECTED]: 'ไม่อนุมัติ',
    [APPLICATION_STATUS.CANCELLED]: 'ยกเลิก',
    [APPLICATION_STATUS.EXPIRED]: 'หมดอายุ',
};

// =============================================================================
// SERVICE TYPES
// =============================================================================

export const SERVICE_TYPES = {
    NEW_APPLICATION: 'new',
    RENEWAL: 'renewal',
    AMENDMENT: 'amendment',
    REPLACEMENT: 'replacement',
} as const;

export type ServiceType = typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES];

export const SERVICE_TYPES_DISPLAY: Record<ServiceType, string> = {
    [SERVICE_TYPES.NEW_APPLICATION]: 'ขอรับรองใหม่',
    [SERVICE_TYPES.RENEWAL]: 'ต่ออายุใบรับรอง',
    [SERVICE_TYPES.AMENDMENT]: 'ขอแก้ไขข้อมูล',
    [SERVICE_TYPES.REPLACEMENT]: 'ขอใบรับรองแทน',
};

// =============================================================================
// ACCOUNT TYPES
// =============================================================================

export const ACCOUNT_TYPES = {
    INDIVIDUAL: 'INDIVIDUAL',
    JURISTIC: 'JURISTIC',
    COMMUNITY_ENTERPRISE: 'COMMUNITY_ENTERPRISE',
} as const;

export type AccountType = typeof ACCOUNT_TYPES[keyof typeof ACCOUNT_TYPES];

export const ACCOUNT_TYPES_DISPLAY: Record<AccountType, string> = {
    [ACCOUNT_TYPES.INDIVIDUAL]: 'บุคคลธรรมดา',
    [ACCOUNT_TYPES.JURISTIC]: 'นิติบุคคล',
    [ACCOUNT_TYPES.COMMUNITY_ENTERPRISE]: 'วิสาหกิจชุมชน',
};

// =============================================================================
// PAYMENT STATUS
// =============================================================================

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    AWAITING_CONFIRMATION: 'awaiting_confirmation',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected',
    REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_DISPLAY: Record<PaymentStatus, string> = {
    [PAYMENT_STATUS.PENDING]: 'รอชำระเงิน',
    [PAYMENT_STATUS.AWAITING_CONFIRMATION]: 'รอตรวจสอบ',
    [PAYMENT_STATUS.CONFIRMED]: 'ยืนยันแล้ว',
    [PAYMENT_STATUS.REJECTED]: 'ไม่ผ่าน',
    [PAYMENT_STATUS.REFUNDED]: 'คืนเงินแล้ว',
};

// =============================================================================
// DOCUMENT TYPES
// =============================================================================

export const DOCUMENT_TYPES = {
    // Personal Documents
    ID_CARD: 'id_card',
    HOUSE_REGISTRATION: 'house_registration',

    // Business Documents
    COMPANY_REGISTRATION: 'company_registration',
    TAX_ID: 'tax_id',
    POWER_OF_ATTORNEY: 'power_of_attorney',

    // Land Documents
    LAND_TITLE: 'land_title',
    LAND_RENTAL: 'land_rental',
    LAND_PERMISSION: 'land_permission',

    // Facility Documents
    SITE_MAP: 'site_map',
    PROCESS_FLOW: 'process_flow',
    STORAGE_PLAN: 'storage_plan',

    // Certificates
    PREVIOUS_CERTIFICATE: 'previous_certificate',
    TRAINING_CERTIFICATE: 'training_certificate',
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

// =============================================================================
// PLANT TYPES (GACP สมุนไพร 6 ชนิด)
// =============================================================================

export const PLANT_TYPES = {
    CANNABIS: 'cannabis',
    KRATOM: 'kratom',
    TURMERIC: 'turmeric',
    GINGER: 'ginger',
    BLACK_GALINGALE: 'black_galingale',
    PLAI: 'plai',
} as const;

export type PlantType = typeof PLANT_TYPES[keyof typeof PLANT_TYPES];

export const PLANT_TYPES_DISPLAY: Record<PlantType, { th: string; en: string }> = {
    [PLANT_TYPES.CANNABIS]: { th: 'กัญชา', en: 'Cannabis' },
    [PLANT_TYPES.KRATOM]: { th: 'กระท่อม', en: 'Kratom' },
    [PLANT_TYPES.TURMERIC]: { th: 'ขมิ้นชัน', en: 'Turmeric' },
    [PLANT_TYPES.GINGER]: { th: 'ขิง', en: 'Ginger' },
    [PLANT_TYPES.BLACK_GALINGALE]: { th: 'กระชายดำ', en: 'Black Galingale' },
    [PLANT_TYPES.PLAI]: { th: 'ไพล', en: 'Plai' },
};

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export const NOTIFICATION_TYPES = {
    APPLICATION_SUBMITTED: 'application_submitted',
    APPLICATION_STATUS_CHANGED: 'application_status_changed',
    DOCUMENT_REQUIRED: 'document_required',
    QUOTE_RECEIVED: 'quote_received',
    INVOICE_RECEIVED: 'invoice_received',
    PAYMENT_CONFIRMED: 'payment_confirmed',
    AUDIT_SCHEDULED: 'audit_scheduled',
    CERTIFICATE_ISSUED: 'certificate_issued',
    CERTIFICATE_EXPIRING: 'certificate_expiring',
    SYSTEM_ANNOUNCEMENT: 'system_announcement',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// =============================================================================
// BUSINESS RULES
// =============================================================================

export const BUSINESS_RULES = {
    // Legal retention period (DTAM regulations)
    RETENTION_YEARS: 5,

    // Certificate validity period
    CERTIFICATE_VALIDITY_YEARS: 2,

    // Renewal window (days before expiry)
    RENEWAL_WINDOW_DAYS: 90,

    // Password requirements
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBER: true,
    PASSWORD_REQUIRE_SPECIAL: true,

    // Session settings
    SESSION_TIMEOUT_MINUTES: 30,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,

    // File upload limits
    MAX_FILE_SIZE_MB: 10,
    ALLOWED_FILE_TYPES: ['pdf', 'jpg', 'jpeg', 'png'],
} as const;

// =============================================================================
// API FIELD MAPPINGS (snake_case ↔ camelCase)
// =============================================================================

export const FIELD_MAPPINGS = {
    // User fields
    id_card: 'idCard',
    laser_code: 'laserCode',
    first_name: 'firstName',
    last_name: 'lastName',
    phone_number: 'phoneNumber',
    account_type: 'accountType',

    // Application fields
    application_id: 'applicationId',
    service_type: 'serviceType',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    submitted_at: 'submittedAt',

    // Certificate fields
    certificate_number: 'certificateNumber',
    issue_date: 'issueDate',
    expiry_date: 'expiryDate',
} as const;
