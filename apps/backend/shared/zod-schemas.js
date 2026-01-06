/**
 * Zod Validation Schemas
 * 
 * Type-safe schema validation for API endpoints
 * Prevents injection attacks and ensures data integrity
 * 
 * Usage:
 *   const { loginSchema } = require('../shared/zod-schemas');
 *   const result = loginSchema.safeParse(req.body);
 *   if (!result.success) return res.status(400).json({ error: result.error });
 */

const { z } = require('zod');

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

/**
 * Thai National ID (13 digits with checksum validation)
 */
const thaiIdSchema = z.string()
    .length(13, 'เลขบัตรประชาชนต้องมี 13 หลัก')
    .regex(/^\d+$/, 'เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น')
    .refine((id) => {
        // Checksum validation
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(id[i]) * (13 - i);
        }
        const remainder = sum % 11;
        const checkDigit = remainder < 2 ? remainder : 11 - remainder;
        return checkDigit === parseInt(id[12]);
    }, 'เลขบัตรประชาชนไม่ถูกต้อง');

/**
 * Tax ID (13 digits)
 */
const taxIdSchema = z.string()
    .length(13, 'เลขทะเบียนนิติบุคคลต้องมี 13 หลัก')
    .regex(/^\d+$/, 'เลขทะเบียนนิติบุคคลต้องเป็นตัวเลขเท่านั้น');

/**
 * Community Registration Number
 */
const communityRegNoSchema = z.string()
    .min(8, 'เลขทะเบียนวิสาหกิจชุมชนต้องมีอย่างน้อย 8 ตัวอักษร')
    .max(20, 'เลขทะเบียนวิสาหกิจชุมชนต้องไม่เกิน 20 ตัวอักษร');

/**
 * Password (min 8, must have upper, lower, number)
 */
const passwordSchema = z.string()
    .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    .max(100, 'รหัสผ่านต้องไม่เกิน 100 ตัวอักษร')
    .regex(/[A-Z]/, 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว')
    .regex(/[a-z]/, 'รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว')
    .regex(/[0-9]/, 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว');

/**
 * Simple password (for login - just min length)
 */
const loginPasswordSchema = z.string()
    .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    .max(100, 'รหัสผ่านต้องไม่เกิน 100 ตัวอักษร');

/**
 * Email
 */
const emailSchema = z.string()
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .max(255, 'อีเมลยาวเกินไป');

/**
 * Thai Phone (10 digits starting with 0)
 */
const phoneSchema = z.string()
    .length(10, 'เบอร์โทรศัพท์ต้องมี 10 หลัก')
    .regex(/^0\d{9}$/, 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง');

// =============================================================================
// AUTH SCHEMAS
// =============================================================================

/**
 * Account type enum
 */
const accountTypeEnum = z.enum(['INDIVIDUAL', 'JURISTIC', 'COMMUNITY_ENTERPRISE']);

/**
 * Farmer Login Schema
 */
const farmerLoginSchema = z.object({
    accountType: accountTypeEnum.default('INDIVIDUAL'),
    identifier: z.string()
        .min(8, 'กรุณากรอกเลขประจำตัวให้ครบถ้วน')
        .max(20, 'เลขประจำตัวยาวเกินไป')
        .transform(val => val.replace(/[-\s]/g, '')), // Remove dashes and spaces
    password: loginPasswordSchema,
}).strict();

/**
 * DTAM Staff Login Schema
 */
const staffLoginSchema = z.object({
    username: z.string()
        .min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
        .max(50, 'ชื่อผู้ใช้ยาวเกินไป')
        .regex(/^[a-zA-Z0-9._-]+$/, 'ชื่อผู้ใช้มีอักขระที่ไม่อนุญาต'),
    password: loginPasswordSchema,
    userType: z.literal('DTAM_STAFF').optional(),
}).strict();

/**
 * Farmer Registration Schema
 */
const farmerRegistrationSchema = z.object({
    accountType: accountTypeEnum,

    // Conditional fields based on account type
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    idCard: thaiIdSchema.optional(),
    laserCode: z.string().length(12).optional(),

    companyName: z.string().max(200).optional(),
    taxId: taxIdSchema.optional(),
    representativeName: z.string().max(200).optional(),

    communityName: z.string().max(200).optional(),
    communityRegistrationNo: communityRegNoSchema.optional(),

    email: emailSchema.optional(),
    phoneNumber: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),

    address: z.string().max(500).optional(),
    province: z.string().max(100).optional(),
    district: z.string().max(100).optional(),
    subdistrict: z.string().max(100).optional(),
    zipCode: z.string().length(5).optional(),

    termsAccepted: z.boolean().refine(val => val === true, 'กรุณายอมรับเงื่อนไขการใช้งาน'),
    privacyAccepted: z.boolean().refine(val => val === true, 'กรุณายอมรับนโยบายความเป็นส่วนตัว'),
}).strict()
    .refine(data => data.password === data.confirmPassword, {
        message: 'รหัสผ่านไม่ตรงกัน',
        path: ['confirmPassword'],
    });

/**
 * Password Reset Request Schema
 */
const passwordResetRequestSchema = z.object({
    email: emailSchema,
}).strict();

/**
 * Password Reset Schema
 */
const passwordResetSchema = z.object({
    token: z.string().min(1, 'Token ไม่ถูกต้อง'),
    password: passwordSchema,
    confirmPassword: z.string(),
}).strict()
    .refine(data => data.password === data.confirmPassword, {
        message: 'รหัสผ่านไม่ตรงกัน',
        path: ['confirmPassword'],
    });

// =============================================================================
// VALIDATION MIDDLEWARE
// =============================================================================

/**
 * Create validation middleware from Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return res.status(400).json({
                success: false,
                error: 'ข้อมูลไม่ถูกต้อง',
                details: errors,
            });
        }

        // Replace req.body with validated data (includes transforms)
        req.body = result.data;
        next();
    };
};

/**
 * Validate query parameters
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            const errors = result.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return res.status(400).json({
                success: false,
                error: 'Query parameters ไม่ถูกต้อง',
                details: errors,
            });
        }

        req.query = result.data;
        next();
    };
};

/**
 * Validate URL parameters
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.params);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'URL parameters ไม่ถูกต้อง',
            });
        }

        req.params = result.data;
        next();
    };
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    // Common schemas
    thaiIdSchema,
    taxIdSchema,
    communityRegNoSchema,
    passwordSchema,
    loginPasswordSchema,
    emailSchema,
    phoneSchema,
    accountTypeEnum,

    // Auth schemas
    farmerLoginSchema,
    staffLoginSchema,
    farmerRegistrationSchema,
    passwordResetRequestSchema,
    passwordResetSchema,

    // Validation middleware
    validateBody,
    validateQuery,
    validateParams,

    // Re-export Zod for custom schemas
    z,
};
