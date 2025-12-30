/**
 * 🍎 Apple-Standard Validation Utilities
 * 
 * Centralized validation functions for Thai documents and business rules
 * Unit tested for accuracy (critical for DTAM compliance)
 * 
 * Usage:
 * import { validateThaiIdCard, validateLaserCode } from '@/utils/validation';
 */

// =============================================================================
// THAI ID CARD VALIDATION
// =============================================================================

/**
 * Validate Thai National ID Card (13 digits)
 * Uses checksum algorithm as per Thai ID card standard
 * 
 * Algorithm:
 * 1. First 12 digits × weights [13,12,11,10,9,8,7,6,5,4,3,2]
 * 2. Sum all products
 * 3. Mod 11, subtract from 11
 * 4. If result > 9, mod 10
 * 5. Compare with 13th digit (check digit)
 * 
 * @param idCard - 13-digit Thai ID card number
 * @returns Validation result with error message if invalid
 */
export function validateThaiIdCard(idCard: string): { valid: boolean; error?: string } {
    // Remove all non-digits
    const cleanId = idCard.replace(/\D/g, '');

    // Must be exactly 13 digits
    if (cleanId.length !== 13) {
        return { valid: false, error: 'เลขบัตรประชาชนต้องมี 13 หลัก' };
    }

    // Convert to array of numbers
    const digits = cleanId.split('').map(Number);

    // Cannot start with 0
    if (digits[0] === 0) {
        return { valid: false, error: 'เลขบัตรประชาชนไม่ถูกต้อง' };
    }

    // Calculate checksum
    const weights = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < 12; i++) {
        sum += digits[i] * weights[i];
    }

    let checkDigit = (11 - (sum % 11)) % 10;

    // Compare with last digit
    if (checkDigit !== digits[12]) {
        return { valid: false, error: 'เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ตรง)' };
    }

    return { valid: true };
}

/**
 * Format Thai ID card for display (X-XXXX-XXXXX-XX-X)
 */
export function formatThaiIdCard(idCard: string): string {
    const clean = idCard.replace(/\D/g, '');
    if (clean.length !== 13) return idCard;

    return `${clean[0]}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean[12]}`;
}

/**
 * Mask Thai ID card for privacy (X-XXXX-XXXXX-XX-X → X-XXXX-XXXXX-**-*)
 */
export function maskThaiIdCard(idCard: string): string {
    const clean = idCard.replace(/\D/g, '');
    if (clean.length !== 13) return idCard;

    return `${clean[0]}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-**-*`;
}

// =============================================================================
// LASER CODE VALIDATION
// =============================================================================

/**
 * Validate Thai ID Card Laser Code
 * Format: XX0-XXXXXXX-XX (12 characters with hyphens)
 * 
 * @param laserCode - Laser code from Thai ID card
 * @returns Validation result with error message if invalid
 */
export function validateLaserCode(laserCode: string): { valid: boolean; error?: string } {
    // Remove all non-alphanumeric
    const clean = laserCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Must be exactly 12 characters
    if (clean.length !== 12) {
        return { valid: false, error: 'รหัส Laser ต้องมี 12 ตัวอักษร' };
    }

    // Format: 2 letters + 1 digit + 7 digits + 2 digits
    const pattern = /^[A-Z]{2}[0-9]{10}$/;

    if (!pattern.test(clean)) {
        return { valid: false, error: 'รูปแบบรหัส Laser ไม่ถูกต้อง' };
    }

    return { valid: true };
}

/**
 * Format Laser Code for display (XX0-XXXXXXX-XX)
 */
export function formatLaserCode(laserCode: string): string {
    const clean = laserCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (clean.length !== 12) return laserCode;

    return `${clean.slice(0, 3)}-${clean.slice(3, 10)}-${clean.slice(10)}`;
}

// =============================================================================
// TAX ID VALIDATION
// =============================================================================

/**
 * Validate Thai Tax ID (13 digits for companies)
 * 
 * @param taxId - 13-digit Tax ID
 * @returns Validation result
 */
export function validateTaxId(taxId: string): { valid: boolean; error?: string } {
    const clean = taxId.replace(/\D/g, '');

    if (clean.length !== 13) {
        return { valid: false, error: 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก' };
    }

    // First digit should be 0 for companies
    if (clean[0] !== '0') {
        return { valid: false, error: 'เลขประจำตัวผู้เสียภาษีนิติบุคคลต้องขึ้นต้นด้วย 0' };
    }

    return { valid: true };
}

// =============================================================================
// PHONE NUMBER VALIDATION
// =============================================================================

/**
 * Validate Thai Phone Number
 * Accepts formats: 0XXXXXXXXX, 66XXXXXXXXX, +66XXXXXXXXX
 * 
 * @param phone - Phone number
 * @returns Validation result
 */
export function validateThaiPhone(phone: string): { valid: boolean; error?: string } {
    // Remove all non-digits except +
    let clean = phone.replace(/[^\d+]/g, '');

    // Convert international format to local
    if (clean.startsWith('+66')) {
        clean = '0' + clean.slice(3);
    } else if (clean.startsWith('66')) {
        clean = '0' + clean.slice(2);
    }

    // Must be 10 digits starting with 0
    if (!/^0[0-9]{9}$/.test(clean)) {
        return { valid: false, error: 'หมายเลขโทรศัพท์ไม่ถูกต้อง' };
    }

    // Check valid prefixes (mobile: 06, 08, 09 | landline: 02, 03, 04, 05, 07)
    const validPrefixes = ['02', '03', '04', '05', '06', '07', '08', '09'];
    const prefix = clean.slice(0, 2);

    if (!validPrefixes.includes(prefix)) {
        return { valid: false, error: 'หมายเลขโทรศัพท์ไม่ถูกต้อง' };
    }

    return { valid: true };
}

/**
 * Format Thai phone for display
 */
export function formatThaiPhone(phone: string): string {
    const clean = phone.replace(/[^\d]/g, '');

    // Mobile: 0XX-XXX-XXXX
    if (clean.length === 10 && /^0[6-9]/.test(clean)) {
        return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
    }

    // Landline: 0X-XXX-XXXX
    if (clean.length === 9 && /^0[2-5]/.test(clean)) {
        return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
    }

    return phone;
}

// =============================================================================
// EMAIL VALIDATION
// =============================================================================

/**
 * Validate email address
 * Uses RFC 5322 compliant regex
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!pattern.test(email)) {
        return { valid: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' };
    }

    return { valid: true };
}

// =============================================================================
// PASSWORD VALIDATION
// =============================================================================

/**
 * Validate password strength (DTAM security requirements)
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export function validatePassword(password: string): {
    valid: boolean;
    error?: string;
    strength: 'weak' | 'medium' | 'strong';
    requirements: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
        hasSpecial: boolean;
    };
} {
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const passedCount = Object.values(requirements).filter(Boolean).length;

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (passedCount >= 5) strength = 'strong';
    else if (passedCount >= 3) strength = 'medium';

    const allPassed = Object.values(requirements).every(Boolean);

    if (!allPassed) {
        const errors: string[] = [];
        if (!requirements.minLength) errors.push('อย่างน้อย 8 ตัวอักษร');
        if (!requirements.hasUppercase) errors.push('มีตัวพิมพ์ใหญ่');
        if (!requirements.hasLowercase) errors.push('มีตัวพิมพ์เล็ก');
        if (!requirements.hasNumber) errors.push('มีตัวเลข');
        if (!requirements.hasSpecial) errors.push('มีอักขระพิเศษ');

        return {
            valid: false,
            error: `รหัสผ่านต้อง: ${errors.join(', ')}`,
            strength,
            requirements,
        };
    }

    return { valid: true, strength, requirements };
}

// =============================================================================
// GENERAL UTILITIES
// =============================================================================

/**
 * Check if a string is empty or only whitespace
 */
export function isEmpty(value: string | null | undefined): boolean {
    return !value || value.trim().length === 0;
}

/**
 * Sanitize input for display (prevent XSS)
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

export default {
    validateThaiIdCard,
    formatThaiIdCard,
    maskThaiIdCard,
    validateLaserCode,
    formatLaserCode,
    validateTaxId,
    validateThaiPhone,
    formatThaiPhone,
    validateEmail,
    validatePassword,
    isEmpty,
    sanitizeInput,
};
