/**
 * Thai National ID Validator
 * 🍎 Apple Zero-Crash Production Standard
 * 
 * Validates 13-digit Thai National ID (Laser Code) using Checksum Algorithm:
 * CheckDigit = (11 - (Σ digit[i] × (13-i)) % 11) % 10
 * 
 * @author GACP Engineering Team
 * @version 1.0.0
 */

export interface ThaiIdValidationResult {
    isValid: boolean;
    formatted: string;
    error?: string;
    idType?: 'INDIVIDUAL' | 'JURISTIC' | 'COMMUNITY_ENTERPRISE';
}

/**
 * Validates Thai 13-digit National ID
 * @param id - The 13-digit ID string (with or without dashes)
 * @returns Validation result with formatted ID
 */
export function validateThaiId(id: string): ThaiIdValidationResult {
    // Remove all non-digit characters
    const cleanId = id.replace(/\D/g, '');

    // Check length
    if (cleanId.length !== 13) {
        return {
            isValid: false,
            formatted: id,
            error: 'เลขประจำตัวต้องมี 13 หลัก',
        };
    }

    // Calculate checksum using Apple-recommended formula
    // CheckDigit = (11 - (Σ digit[i] × (13-i)) % 11) % 10
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanId[i], 10) * (13 - i);
    }

    const calculatedCheckDigit = (11 - (sum % 11)) % 10;
    const actualCheckDigit = parseInt(cleanId[12], 10);

    if (calculatedCheckDigit !== actualCheckDigit) {
        return {
            isValid: false,
            formatted: formatThaiId(cleanId),
            error: 'เลขประจำตัวไม่ถูกต้อง (ผลรวมตรวจสอบไม่ตรง)',
        };
    }

    // Determine ID type based on first digit
    const firstDigit = cleanId[0];
    let idType: 'INDIVIDUAL' | 'JURISTIC' | 'COMMUNITY_ENTERPRISE' = 'INDIVIDUAL';

    if (firstDigit === '0') {
        idType = 'JURISTIC'; // Juristic person ID
    } else if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(firstDigit)) {
        idType = 'INDIVIDUAL'; // Thai National ID
    }

    return {
        isValid: true,
        formatted: formatThaiId(cleanId),
        idType,
    };
}

/**
 * Format Thai ID with dashes: X-XXXX-XXXXX-XX-X
 * @param id - Clean 13-digit ID
 * @returns Formatted ID string
 */
export function formatThaiId(id: string): string {
    const clean = id.replace(/\D/g, '');
    if (clean.length !== 13) return id;

    return `${clean[0]}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean[12]}`;
}

/**
 * Validates Juristic Person ID (13 digits starting with 0)
 * @param id - The juristic ID string
 * @returns Validation result
 */
export function validateJuristicId(id: string): ThaiIdValidationResult {
    const result = validateThaiId(id);

    if (result.isValid) {
        const clean = id.replace(/\D/g, '');
        if (clean[0] !== '0') {
            return {
                isValid: false,
                formatted: result.formatted,
                error: 'เลขทะเบียนนิติบุคคลต้องขึ้นต้นด้วย 0',
            };
        }
        result.idType = 'JURISTIC';
    }

    return result;
}

/**
 * Validates Community Enterprise ID (format: XXXX-XXXX-XXX)
 * @param id - The community enterprise ID string
 * @returns Validation result
 */
export function validateCommunityEnterpriseId(id: string): ThaiIdValidationResult {
    const clean = id.replace(/\D/g, '');

    // Community enterprise IDs are typically 11-13 digits
    if (clean.length < 11 || clean.length > 13) {
        return {
            isValid: false,
            formatted: id,
            error: 'เลขทะเบียนวิสาหกิจชุมชนไม่ถูกต้อง',
        };
    }

    // Format as XXXX-XXXX-XXX
    const formatted = clean.length >= 11
        ? `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`
        : id;

    return {
        isValid: true,
        formatted,
        idType: 'COMMUNITY_ENTERPRISE',
    };
}

/**
 * Unified ID validator based on account type
 * @param id - The ID string
 * @param accountType - Type of account
 * @returns Validation result
 */
export function validateIdByType(
    id: string,
    accountType: 'INDIVIDUAL' | 'JURISTIC' | 'COMMUNITY_ENTERPRISE'
): ThaiIdValidationResult {
    switch (accountType) {
        case 'INDIVIDUAL':
            return validateThaiId(id);
        case 'JURISTIC':
            return validateJuristicId(id);
        case 'COMMUNITY_ENTERPRISE':
            return validateCommunityEnterpriseId(id);
        default:
            return validateThaiId(id);
    }
}

// Default export for convenience
export default {
    validateThaiId,
    validateJuristicId,
    validateCommunityEnterpriseId,
    validateIdByType,
    formatThaiId,
};
