/**
 * TS Types - Shared TypeScript Interfaces
 */

export type UserRole = 'FARMER' | 'REVIEWER_AUDITOR' | 'SCHEDULER' | 'ACCOUNTANT' | 'ADMIN';
export type AccountType = 'INDIVIDUAL' | 'JURISTIC' | 'COMMUNITY_ENTERPRISE' | 'STAFF';

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    account_type: AccountType;
    created_at: Date;
}

export interface FarmPlot {
    id: string;
    user_id: string;
    plot_name: string;
    area_rai: number;
    plant_type: string;
    is_active: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}
