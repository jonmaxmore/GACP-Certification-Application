/**
 * Shared TypeScript Types
 * ใช้ร่วมกันระหว่าง Web และ API
 */

// User Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    accountType: AccountType;
    createdAt: Date;
    updatedAt: Date;
}

export type UserRole =
    | 'FARMER'
    | 'REVIEWER_AUDITOR'
    | 'SCHEDULER'
    | 'ACCOUNTANT'
    | 'ADMIN'
    | 'SUPER_ADMIN';

export type AccountType =
    | 'INDIVIDUAL'
    | 'JURISTIC'
    | 'COMMUNITY_ENTERPRISE'
    | 'STAFF';

// Application Types
export interface Application {
    id: string;
    userId: string;
    plantType: PlantType;
    status: ApplicationStatus;
    submissionCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export type PlantType =
    | 'cannabis'
    | 'kratom'
    | 'turmeric'
    | 'ginger'
    | 'black_galingale'
    | 'plai';

export type ApplicationStatus =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'REVISION_REQUIRED'
    | 'APPROVED'
    | 'REJECTED';

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    pagination?: Pagination;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default {
    // Export types as namespace
};
