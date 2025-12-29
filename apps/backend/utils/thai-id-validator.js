/**
 * Thai ID Card Validation Utility
 * ตรวจสอบความถูกต้องของเลขบัตรประชาชนไทย 13 หลัก
 *
 * Based on Apple Engineering Standards:
 * - Reusable component with validation built-in
 * - Clear error messages in Thai
 * - Secure by design (no storage of raw ID)
 *
 * Algorithm: วิธีการตรวจสอบตามมาตรฐานกระทรวงมหาดไทย
 * Sum = Σ(digit[i] × (13 - i)) for i = 0 to 11
 * CheckDigit = (11 - (Sum mod 11)) mod 10
 *
 * @version 1.0.0
 * @author GACP Engineering Team
 */

/**
 * Validate Thai National ID (13 digits)
 * @param {string} id - Thai ID number (13 digits)
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateThaiId(id) {
    const errors = [];

    // Remove any formatting characters
    const cleanId = String(id).replace(/[\s-]/g, '');

    // Check length
    if (cleanId.length !== 13) {
        errors.push('เลขบัตรประชาชนต้องมี 13 หลัก');
        return { valid: false, errors };
    }

    // Check if all digits
    if (!/^\d{13}$/.test(cleanId)) {
        errors.push('เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น');
        return { valid: false, errors };
    }

    // Check first digit (cannot be 0 or 9)
    const firstDigit = cleanId[0];
    if (firstDigit === '0') {
        errors.push('หลักแรกไม่สามารถเป็น 0 ได้');
        return { valid: false, errors };
    }
    if (firstDigit === '9') {
        errors.push('หลักแรกไม่สามารถเป็น 9 ได้ (สำหรับบุคคลต่างด้าว)');
        return { valid: false, errors };
    }

    // Calculate checksum
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanId[i], 10) * (13 - i);
    }

    const checkDigit = (11 - (sum % 11)) % 10;
    const lastDigit = parseInt(cleanId[12], 10);

    if (checkDigit !== lastDigit) {
        errors.push('เลขบัตรประชาชนไม่ถูกต้อง (ตรวจสอบตัวเลขอีกครั้ง)');
        return { valid: false, errors };
    }

    return { valid: true, errors: [] };
}

/**
 * Format Thai ID for display (with dashes)
 * @param {string} id - Raw 13-digit Thai ID
 * @returns {string} Formatted ID: X-XXXX-XXXXX-XX-X
 */
function formatThaiId(id) {
    const cleanId = String(id).replace(/[\s-]/g, '');
    if (cleanId.length !== 13) {
        return id;
    }
    return `${cleanId[0]}-${cleanId.slice(1, 5)}-${cleanId.slice(5, 10)}-${cleanId.slice(10, 12)}-${cleanId[12]}`;
}

/**
 * Mask Thai ID for privacy (show only last 4 digits)
 * @param {string} id - Raw 13-digit Thai ID
 * @returns {string} Masked ID: X-XXXX-XXXXX-**-*
 */
function maskThaiId(id) {
    const cleanId = String(id).replace(/[\s-]/g, '');
    if (cleanId.length !== 13) {
        return '***';
    }
    return `${cleanId[0]}-****-*****-**-${cleanId[12]}`;
}

/**
 * Extract province code from Thai ID
 * First 2 digits indicate province of registration
 * @param {string} id - Raw 13-digit Thai ID
 * @returns {string|null} Province code or null if invalid
 */
function getProvinceCode(id) {
    const cleanId = String(id).replace(/[\s-]/g, '');
    if (cleanId.length !== 13) {
        return null;
    }
    return cleanId.slice(0, 2);
}

/**
 * Thai Province codes mapping (sample - first 10 provinces)
 */
const PROVINCE_CODES = {
    '10': 'กรุงเทพมหานคร',
    '11': 'สมุทรปราการ',
    '12': 'นนทบุรี',
    '13': 'ปทุมธานี',
    '14': 'พระนครศรีอยุธยา',
    '15': 'อ่างทอง',
    '16': 'ลพบุรี',
    '17': 'สิงห์บุรี',
    '18': 'ชัยนาท',
    '19': 'สระบุรี',
    // ... Add remaining provinces
};

/**
 * Get province name from Thai ID
 * @param {string} id - Raw 13-digit Thai ID
 * @returns {string|null} Province name or null
 */
function getProvinceName(id) {
    const code = getProvinceCode(id);
    return code ? PROVINCE_CODES[code] || 'ไม่ทราบจังหวัด' : null;
}

/**
 * Express middleware for Thai ID validation
 * @param {string} fieldName - Request body field containing Thai ID
 */
function thaiIdValidationMiddleware(fieldName = 'idCard') {
    return (req, res, next) => {
        const id = req.body[fieldName];

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'กรุณากรอกเลขบัตรประชาชน',
                field: fieldName
            });
        }

        const result = validateThaiId(id);

        if (!result.valid) {
            return res.status(400).json({
                success: false,
                errors: result.errors,
                field: fieldName
            });
        }

        // Attach validated ID to request
        req.validatedThaiId = id.replace(/[\s-]/g, '');
        next();
    };
}

module.exports = {
    validateThaiId,
    formatThaiId,
    maskThaiId,
    getProvinceCode,
    getProvinceName,
    thaiIdValidationMiddleware,
    PROVINCE_CODES
};
