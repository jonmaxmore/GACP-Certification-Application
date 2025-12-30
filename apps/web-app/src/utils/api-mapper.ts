/**
 * 🍎 Apple-Standard API Mapper
 * 
 * Bidirectional mapping between snake_case (PostgreSQL/API) and camelCase (Frontend)
 * Ensures data consistency across Database ↔ Backend ↔ Frontend
 * 
 * Usage:
 * import { toApi, fromApi, mapFields } from '@/utils/api-mapper';
 * const apiData = toApi(frontendData);    // camelCase → snake_case
 * const frontendData = fromApi(apiData);  // snake_case → camelCase
 */

// =============================================================================
// CASE CONVERSION UTILITIES
// =============================================================================

/**
 * Convert camelCase to snake_case
 * Example: "firstName" → "first_name"
 */
export function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 * Example: "first_name" → "firstName"
 */
export function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// =============================================================================
// OBJECT MAPPERS
// =============================================================================

/**
 * Convert object keys from camelCase to snake_case (Frontend → API)
 * Deep conversion for nested objects and arrays
 */
export function toApi<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
    if (obj === null || obj === undefined) return obj as unknown as Record<string, unknown>;

    if (Array.isArray(obj)) {
        return obj.map(item =>
            typeof item === 'object' && item !== null
                ? toApi(item as Record<string, unknown>)
                : item
        ) as unknown as Record<string, unknown>;
    }

    if (typeof obj !== 'object') return obj as unknown as Record<string, unknown>;

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        const snakeKey = camelToSnake(key);

        if (value !== null && typeof value === 'object') {
            result[snakeKey] = toApi(value as Record<string, unknown>);
        } else {
            result[snakeKey] = value;
        }
    }

    return result;
}

/**
 * Convert object keys from snake_case to camelCase (API → Frontend)
 * Deep conversion for nested objects and arrays
 */
export function fromApi<T = Record<string, unknown>>(obj: Record<string, unknown>): T {
    if (obj === null || obj === undefined) return obj as unknown as T;

    if (Array.isArray(obj)) {
        return obj.map(item =>
            typeof item === 'object' && item !== null
                ? fromApi(item as Record<string, unknown>)
                : item
        ) as unknown as T;
    }

    if (typeof obj !== 'object') return obj as unknown as T;

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        const camelKey = snakeToCamel(key);

        if (value !== null && typeof value === 'object') {
            result[camelKey] = fromApi(value as Record<string, unknown>);
        } else {
            result[camelKey] = value;
        }
    }

    return result as T;
}

// =============================================================================
// FIELD MAPPING
// =============================================================================

/**
 * Explicit field mapping for known database columns
 * More reliable than automatic conversion for edge cases
 */
export const FIELD_MAP = {
    // API (snake_case) → Frontend (camelCase)
    toFrontend: {
        // User fields
        id_card: 'idCard',
        id_card_hash: 'idCardHash',
        laser_code: 'laserCode',
        first_name: 'firstName',
        last_name: 'lastName',
        phone_number: 'phoneNumber',
        account_type: 'accountType',
        tax_id: 'taxId',
        tax_id_hash: 'taxIdHash',
        company_name: 'companyName',
        community_name: 'communityName',
        community_registration_no: 'communityRegistrationNo',
        representative_name: 'representativeName',
        representative_position: 'representativePosition',

        // Timestamps
        created_at: 'createdAt',
        updated_at: 'updatedAt',
        deleted_at: 'deletedAt',
        submitted_at: 'submittedAt',
        approved_at: 'approvedAt',
        issued_at: 'issuedAt',
        expires_at: 'expiresAt',
        last_login_at: 'lastLoginAt',

        // Application fields
        application_id: 'applicationId',
        service_type: 'serviceType',
        application_status: 'applicationStatus',

        // Certificate fields
        certificate_number: 'certificateNumber',
        issue_date: 'issueDate',
        expiry_date: 'expiryDate',

        // Farm fields
        farm_id: 'farmId',
        farm_name: 'farmName',
        total_area: 'totalArea',

        // Document fields
        document_type: 'documentType',
        file_url: 'fileUrl',
        file_size: 'fileSize',
        uploaded_at: 'uploadedAt',

        // Audit fields
        created_by: 'createdBy',
        updated_by: 'updatedBy',
        deleted_by: 'deletedBy',
        created_by_ip: 'createdByIp',
        updated_by_ip: 'updatedByIp',

        // Flags
        is_deleted: 'isDeleted',
        is_locked: 'isLocked',
        is_email_verified: 'isEmailVerified',
    } as Record<string, string>,

    // Frontend (camelCase) → API (snake_case)
    toApi: {} as Record<string, string>,
};

// Build reverse mapping
for (const [snake, camel] of Object.entries(FIELD_MAP.toFrontend)) {
    FIELD_MAP.toApi[camel] = snake;
}

/**
 * Map a single field name using explicit mapping
 * Falls back to automatic conversion
 */
export function mapFieldName(field: string, direction: 'toApi' | 'toFrontend'): string {
    const mapping = direction === 'toApi' ? FIELD_MAP.toApi : FIELD_MAP.toFrontend;

    if (field in mapping) {
        return mapping[field];
    }

    // Fallback to automatic conversion
    return direction === 'toApi' ? camelToSnake(field) : snakeToCamel(field);
}

/**
 * Map object fields using explicit mapping
 */
export function mapFields<T extends Record<string, unknown>>(
    obj: T,
    direction: 'toApi' | 'toFrontend'
): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return obj as Record<string, unknown>;

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        const mappedKey = mapFieldName(key, direction);

        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            result[mappedKey] = mapFields(value as Record<string, unknown>, direction);
        } else if (Array.isArray(value)) {
            result[mappedKey] = value.map(item =>
                typeof item === 'object' && item !== null
                    ? mapFields(item as Record<string, unknown>, direction)
                    : item
            );
        } else {
            result[mappedKey] = value;
        }
    }

    return result;
}

// =============================================================================
// API RESPONSE HELPERS
// =============================================================================

/**
 * Parse API response and convert to frontend format
 */
export function parseApiResponse<T>(response: { data?: unknown; success?: boolean }): T | null {
    if (!response.success || !response.data) {
        return null;
    }

    return fromApi(response.data as Record<string, unknown>) as T;
}

/**
 * Prepare data for API request
 */
export function prepareApiRequest<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
    return toApi(data);
}

// =============================================================================
// DATE HANDLING
// =============================================================================

/**
 * Parse ISO date string to Date object
 */
export function parseDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Format Date to ISO string for API
 */
export function formatDateForApi(date: Date | null | undefined): string | null {
    if (!date) return null;
    return date.toISOString();
}

/**
 * Format date for Thai display (DD/MM/YYYY + พ.ศ.)
 */
export function formatThaiDate(date: Date | string | null | undefined): string {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear() + 543; // Convert to Buddhist Era

    return `${day}/${month}/${year}`;
}

export default {
    toApi,
    fromApi,
    mapFields,
    mapFieldName,
    camelToSnake,
    snakeToCamel,
    parseApiResponse,
    prepareApiRequest,
    parseDate,
    formatDateForApi,
    formatThaiDate,
    FIELD_MAP,
};
