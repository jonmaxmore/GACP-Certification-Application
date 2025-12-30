/**
 * 🍎 Apple-Standard Role-Based Access Control (RBAC)
 * 
 * Centralized role management and permission checking
 * DRI Ownership: Single source of truth for all authorization logic
 * 
 * Usage:
 * import { hasPermission, isStaff, requireRole } from '@/lib/roleUtils';
 */

// =============================================================================
// ROLE DEFINITIONS
// =============================================================================

export const ROLES = {
    // Farmers (External Users)
    FARMER: 'FARMER',

    // Staff Roles (Internal Users)
    REVIEWER_AUDITOR: 'REVIEWER_AUDITOR',
    SCHEDULER: 'SCHEDULER',
    ACCOUNTANT: 'ACCOUNTANT',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Staff roles for access control
export const STAFF_ROLES: Role[] = [
    ROLES.REVIEWER_AUDITOR,
    ROLES.SCHEDULER,
    ROLES.ACCOUNTANT,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
];

// Admin roles (can manage other staff)
export const ADMIN_ROLES: Role[] = [
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
];

// =============================================================================
// PERMISSION DEFINITIONS
// =============================================================================

export const PERMISSIONS = {
    // Application Management
    VIEW_APPLICATIONS: 'view_applications',
    REVIEW_APPLICATIONS: 'review_applications',
    APPROVE_APPLICATIONS: 'approve_applications',

    // Scheduling
    VIEW_CALENDAR: 'view_calendar',
    MANAGE_CALENDAR: 'manage_calendar',
    SCHEDULE_AUDITS: 'schedule_audits',

    // Finance
    VIEW_INVOICES: 'view_invoices',
    CREATE_INVOICES: 'create_invoices',
    CONFIRM_PAYMENTS: 'confirm_payments',

    // Certificates
    VIEW_CERTIFICATES: 'view_certificates',
    ISSUE_CERTIFICATES: 'issue_certificates',

    // Reports (ภ.ท. 27-29)
    VIEW_REPORTS: 'view_reports',
    EXPORT_REPORTS: 'export_reports',

    // User Management
    VIEW_USERS: 'view_users',
    MANAGE_USERS: 'manage_users',
    MANAGE_STAFF: 'manage_staff',

    // System
    VIEW_AUDIT_LOGS: 'view_audit_logs',
    SYSTEM_SETTINGS: 'system_settings',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// =============================================================================
// ROLE-PERMISSION MAPPING
// =============================================================================

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [ROLES.FARMER]: [
        PERMISSIONS.VIEW_APPLICATIONS,
        PERMISSIONS.VIEW_INVOICES,
        PERMISSIONS.VIEW_CERTIFICATES,
    ],

    [ROLES.REVIEWER_AUDITOR]: [
        PERMISSIONS.VIEW_APPLICATIONS,
        PERMISSIONS.REVIEW_APPLICATIONS,
        PERMISSIONS.VIEW_CALENDAR,
        PERMISSIONS.VIEW_CERTIFICATES,
        PERMISSIONS.VIEW_REPORTS,
    ],

    [ROLES.SCHEDULER]: [
        PERMISSIONS.VIEW_APPLICATIONS,
        PERMISSIONS.VIEW_CALENDAR,
        PERMISSIONS.MANAGE_CALENDAR,
        PERMISSIONS.SCHEDULE_AUDITS,
    ],

    [ROLES.ACCOUNTANT]: [
        PERMISSIONS.VIEW_APPLICATIONS,
        PERMISSIONS.VIEW_INVOICES,
        PERMISSIONS.CREATE_INVOICES,
        PERMISSIONS.CONFIRM_PAYMENTS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
    ],

    [ROLES.ADMIN]: [
        ...Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.SYSTEM_SETTINGS),
    ],

    [ROLES.SUPER_ADMIN]: [
        ...Object.values(PERMISSIONS),
    ],
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a role is a staff role
 */
export function isStaff(role: string): boolean {
    return STAFF_ROLES.includes(role as Role);
}

/**
 * Check if a role is an admin role
 */
export function isAdmin(role: string): boolean {
    return ADMIN_ROLES.includes(role as Role);
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[role as Role];
    if (!rolePermissions) return false;
    return rolePermissions.includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: string): Permission[] {
    return ROLE_PERMISSIONS[role as Role] || [];
}

/**
 * Check if role1 can manage role2 (hierarchy check)
 */
export function canManageRole(managerRole: string, targetRole: string): boolean {
    const hierarchy: Record<Role, number> = {
        [ROLES.FARMER]: 0,
        [ROLES.REVIEWER_AUDITOR]: 1,
        [ROLES.SCHEDULER]: 1,
        [ROLES.ACCOUNTANT]: 1,
        [ROLES.ADMIN]: 2,
        [ROLES.SUPER_ADMIN]: 3,
    };

    const managerLevel = hierarchy[managerRole as Role] ?? -1;
    const targetLevel = hierarchy[targetRole as Role] ?? -1;

    return managerLevel > targetLevel;
}

/**
 * Get Thai display name for role
 */
export function getRoleDisplayName(role: string): string {
    const names: Record<Role, string> = {
        [ROLES.FARMER]: 'เกษตรกร',
        [ROLES.REVIEWER_AUDITOR]: 'ผู้ตรวจสอบ',
        [ROLES.SCHEDULER]: 'ผู้จัดตารางนัดหมาย',
        [ROLES.ACCOUNTANT]: 'เจ้าหน้าที่การเงิน',
        [ROLES.ADMIN]: 'ผู้ดูแลระบบ',
        [ROLES.SUPER_ADMIN]: 'ผู้ดูแลระบบสูงสุด',
    };
    return names[role as Role] || role;
}

// =============================================================================
// ROUTE PROTECTION HELPERS
// =============================================================================

/**
 * Protected routes configuration for middleware
 */
export const PROTECTED_ROUTES = {
    // Staff-only routes
    staff: [
        '/staff',
        '/staff/dashboard',
        '/staff/applications',
        '/staff/calendar',
        '/staff/accounting',
        '/staff/analytics',
    ],

    // Admin-only routes
    admin: [
        '/staff/dashboard/admin',
        '/admin',
    ],

    // Farmer-only routes
    farmer: [
        '/dashboard',
        '/applications',
        '/certificates',
        '/payments',
        '/profile',
        '/establishments',
    ],

    // Public routes (no auth required)
    public: [
        '/',
        '/login',
        '/register',
        '/forgot-password',
        '/staff/login',
    ],
} as const;

/**
 * Check if a path requires authentication
 */
export function requiresAuth(path: string): boolean {
    return !PROTECTED_ROUTES.public.some(route =>
        path === route || path.startsWith(route + '/')
    );
}

/**
 * Check if a path is staff-only
 */
export function requiresStaff(path: string): boolean {
    return PROTECTED_ROUTES.staff.some(route =>
        path === route || path.startsWith(route + '/')
    );
}

/**
 * Check if a path is admin-only
 */
export function requiresAdmin(path: string): boolean {
    return PROTECTED_ROUTES.admin.some(route =>
        path === route || path.startsWith(route + '/')
    );
}

export default {
    ROLES,
    PERMISSIONS,
    isStaff,
    isAdmin,
    hasPermission,
    getPermissions,
    canManageRole,
    getRoleDisplayName,
    requiresAuth,
    requiresStaff,
    requiresAdmin,
    PROTECTED_ROUTES,
};
