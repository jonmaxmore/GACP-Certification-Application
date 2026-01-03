/**
 * Safe DTO Types for Data Access Layer
 * These types only expose necessary fields to prevent data leakage
 */

// Safe user DTO - no password, tokens, or internal IDs
export interface SafeUserDTO {
    id: string;
    uuid: string;
    name: string;
    role: string;
    department?: string;
}

// Safe farmer DTO
export interface SafeFarmerDTO {
    id: string;
    uuid: string;
    firstName: string;
    lastName: string;
    phone: string;
    accountType: string;
}

// Safe application DTO
export interface SafeApplicationDTO {
    id: string;
    uuid: string;
    status: string;
    plantType: string;
    serviceType: string;
    createdAt: Date;
    updatedAt: Date;
}

// Session type for auth checks
export interface SessionData {
    userId: string;
    userType: 'FARMER' | 'DTAM_STAFF';
    role?: string;
    expiresAt: Date;
}
