/**
 * 🍎 Apple-Standard Database Types
 * 
 * TypeScript interfaces matching Prisma schema
 * Auto-generated from apps/backend/prisma/schema.prisma
 * 
 * IMPORTANT: Keep in sync with database schema changes!
 * Run: npx prisma generate && copy types
 */

// =============================================================================
// ENUMS
// =============================================================================

export type AccountType = 'INDIVIDUAL' | 'JURISTIC' | 'COMMUNITY_ENTERPRISE';

export type UserRole =
    | 'FARMER'
    | 'REVIEWER_AUDITOR'
    | 'SCHEDULER'
    | 'ACCOUNTANT'
    | 'ADMIN'
    | 'SUPER_ADMIN';

export type UserStatus =
    | 'PENDING_VERIFICATION'
    | 'ACTIVE'
    | 'SUSPENDED'
    | 'LOCKED'
    | 'INACTIVE';

export type ApplicationStatus =
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'document_required'
    | 'pending_payment'
    | 'payment_confirmed'
    | 'scheduled'
    | 'audit_in_progress'
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'expired';

export type ServiceType = 'new' | 'renewal' | 'amendment' | 'replacement';

export type PaymentStatus =
    | 'pending'
    | 'awaiting_confirmation'
    | 'confirmed'
    | 'rejected'
    | 'refunded';

export type NotificationType =
    | 'application_submitted'
    | 'application_status_changed'
    | 'document_required'
    | 'quote_received'
    | 'invoice_received'
    | 'payment_confirmed'
    | 'audit_scheduled'
    | 'certificate_issued'
    | 'certificate_expiring'
    | 'system_announcement';

export type AuditSeverity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

// =============================================================================
// USER MODEL
// =============================================================================

export interface User {
    id: string;
    uuid: string;
    createdAt: Date;
    updatedAt: Date;

    // Account Type
    accountType: AccountType;

    // Login Credentials
    email: string | null;
    password: string;

    // Individual Farmer Fields
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    idCard: string | null; // Encrypted
    idCardHash: string | null;
    laserCode: string | null; // Encrypted

    // Juristic Person Fields
    companyName: string | null;
    taxId: string | null;
    taxIdHash: string | null;
    representativeName: string | null;
    representativePosition: string | null;

    // Community Enterprise Fields
    communityName: string | null;
    communityRegistrationNo: string | null;
    communityRegistrationNoHash: string | null;

    // Role & Status
    role: UserRole;
    status: UserStatus;

    // Address
    address: string | null;
    province: string | null;
    district: string | null;
    subdistrict: string | null;
    zipCode: string | null;

    // Verification
    isEmailVerified: boolean;
    emailVerificationToken: string | null;
    emailVerificationExpiry: Date | null;
    passwordResetToken: string | null;
    passwordResetExpiry: Date | null;

    // Login History
    lastLoginAt: Date | null;
    loginAttempts: number;
    isLocked: boolean;
    lockedUntil: Date | null;

    // Audit Trail
    createdBy: string | null;
    updatedBy: string | null;
    createdByIp: string | null;
    updatedByIp: string | null;

    // Soft Delete
    isDeleted: boolean;
    deletedAt: Date | null;
    deletedBy: string | null;
    deleteReason: string | null;

    // Legal Retention
    retainUntil: Date;
    legalHold: boolean;
}

// =============================================================================
// APPLICATION MODEL
// =============================================================================

export interface Application {
    id: string;
    uuid: string;
    createdAt: Date;
    updatedAt: Date;

    // References
    applicationNumber: string;
    userId: string;
    farmId: string | null;

    // Application Type
    serviceType: ServiceType;
    previousCertificateId: string | null;

    // Status Tracking
    status: ApplicationStatus;
    submittedAt: Date | null;
    approvedAt: Date | null;
    rejectedAt: Date | null;

    // Review Process
    assignedReviewerId: string | null;
    reviewNotes: string | null;
    rejectionReason: string | null;

    // Plant Info
    plantSpeciesId: string | null;
    cultivationArea: number | null;

    // Audit
    createdBy: string | null;
    updatedBy: string | null;

    // Soft Delete
    isDeleted: boolean;
    deletedAt: Date | null;
}

// =============================================================================
// FARM MODEL
// =============================================================================

export interface Farm {
    id: string;
    uuid: string;
    createdAt: Date;
    updatedAt: Date;

    // Owner
    userId: string;

    // Farm Info
    farmName: string;
    farmAddress: string;
    province: string;
    district: string;
    subdistrict: string;
    zipCode: string | null;

    // Coordinates
    latitude: number | null;
    longitude: number | null;

    // Size
    totalArea: number;
    cultivatedArea: number;

    // Status
    isActive: boolean;

    // Audit
    createdBy: string | null;
    updatedBy: string | null;

    // Soft Delete
    isDeleted: boolean;
    deletedAt: Date | null;
}

// =============================================================================
// CERTIFICATE MODEL
// =============================================================================

export interface Certificate {
    id: string;
    uuid: string;
    createdAt: Date;
    updatedAt: Date;

    // References
    certificateNumber: string;
    applicationId: string;
    userId: string;
    farmId: string;

    // Validity
    issueDate: Date;
    expiryDate: Date;

    // Status
    isActive: boolean;
    revokedAt: Date | null;
    revokedReason: string | null;

    // Plant
    plantSpeciesId: string | null;

    // Audit
    issuedBy: string | null;

    // Soft Delete
    isDeleted: boolean;
    deletedAt: Date | null;
}

// =============================================================================
// INVOICE MODEL
// =============================================================================

export interface Invoice {
    id: string;
    uuid: string;
    createdAt: Date;
    updatedAt: Date;

    // References
    invoiceNumber: string;
    applicationId: string;
    userId: string;

    // Financial
    subtotal: number;
    tax: number;
    total: number;
    currency: string;

    // Payment
    paymentStatus: PaymentStatus;
    paidAt: Date | null;
    paymentMethod: string | null;
    paymentSlipUrl: string | null;
    confirmedBy: string | null;

    // Dates
    dueDate: Date;

    // Audit
    createdBy: string | null;

    // Soft Delete
    isDeleted: boolean;
    deletedAt: Date | null;
}

// =============================================================================
// NOTIFICATION MODEL
// =============================================================================

export interface Notification {
    id: string;
    uuid: string;
    createdAt: Date;

    // Recipient
    userId: string;

    // Content
    type: NotificationType;
    title: string;
    message: string;
    link: string | null;

    // Status
    isRead: boolean;
    readAt: Date | null;

    // Expiry
    expiresAt: Date | null;

    // Soft Delete
    isDeleted: boolean;
}

// =============================================================================
// DOCUMENT MODEL
// =============================================================================

export interface Document {
    id: string;
    uuid: string;
    createdAt: Date;
    updatedAt: Date;

    // References
    applicationId: string | null;
    userId: string;

    // File Info
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;

    // Verification
    isVerified: boolean;
    verifiedAt: Date | null;
    verifiedBy: string | null;

    // Status
    rejectionReason: string | null;

    // Audit
    uploadedBy: string;

    // Soft Delete
    isDeleted: boolean;
    deletedAt: Date | null;
}

// =============================================================================
// AUDIT LOG MODEL
// =============================================================================

export interface AuditLog {
    id: string;
    createdAt: Date;
    logId: string;
    sequenceNumber: number;

    // Classification
    category: string;
    action: string;
    severity: AuditSeverity;

    // Actor
    actorId: string;
    actorType: string;
    actorEmail: string | null;
    actorRole: string;

    // Resource
    resourceType: string;
    resourceId: string;

    // Context
    ipAddress: string;
    userAgent: string;

    // Data
    metadata: Record<string, unknown> | null;

    // Result
    result: string;
    errorCode: string | null;
    errorMessage: string | null;

    // Hash Chain
    previousHash: string;
    currentHash: string;
    hashAlgorithm: string;
}

// =============================================================================
// PLANT SPECIES MODEL
// =============================================================================

export interface PlantSpecies {
    id: string;
    uuid: string;
    createdAt: Date;
    updatedAt: Date;

    // Names
    thaiName: string;
    scientificName: string;
    commonName: string | null;

    // Category
    category: string;

    // Requirements
    requiresSpecialPermit: boolean;
    documentRequirements: string[] | null;

    // Status
    isActive: boolean;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// =============================================================================
// FORM INPUT TYPES (Frontend)
// =============================================================================

export interface RegistrationInput {
    accountType: AccountType;
    email?: string;
    password: string;
    confirmPassword: string;

    // Individual
    firstName?: string;
    lastName?: string;
    idCard?: string;
    laserCode?: string;
    phoneNumber?: string;

    // Juristic
    companyName?: string;
    taxId?: string;
    representativeName?: string;
    representativePosition?: string;

    // Community
    communityName?: string;
    communityRegistrationNo?: string;
}

export interface LoginInput {
    identifier: string; // email, idCard, or taxId
    password: string;
}

export interface ApplicationInput {
    serviceType: ServiceType;
    farmId?: string;
    plantSpeciesId?: string;
    cultivationArea?: number;
    previousCertificateId?: string;
}

export interface FarmInput {
    farmName: string;
    farmAddress: string;
    province: string;
    district: string;
    subdistrict: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
    totalArea: number;
    cultivatedArea: number;
}

export default {
    // Re-export for convenience
};
