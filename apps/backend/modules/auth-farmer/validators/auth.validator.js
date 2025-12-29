/**
 * Auth Validator (Multi-Account Type Support)
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Input validation for farmer authentication endpoints
 * Supports: INDIVIDUAL (Thai ID), JURISTIC (Tax ID), COMMUNITY_ENTERPRISE
 */

const { body, validationResult } = require('express-validator');

/**
 * Validation middleware to check for errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation Errors:', JSON.stringify(errors.array(), null, 2));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }
  next();
};

/**
 * Validate farmer/company/community registration
 * Flexible validation based on accountType
 */
const validateRegister = [
  // Account type (optional, defaults to INDIVIDUAL)
  body('accountType')
    .optional()
    .isIn(['INDIVIDUAL', 'JURISTIC', 'COMMUNITY_ENTERPRISE'])
    .withMessage('Account type must be INDIVIDUAL, JURISTIC, or COMMUNITY_ENTERPRISE'),

  // Password (required for all)
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),

  // Phone number (required for all)
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{9,15}$/)
    .withMessage('Phone number must be 9-15 digits'),

  // Email (optional for all account types)
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail()
    .toLowerCase(),

  // Identifier (can be Thai ID, Tax ID, or CE No.)
  body('identifier')
    .optional()
    .trim(),

  // INDIVIDUAL fields
  body('idCard')
    .optional()
    .matches(/^[0-9]{13}$/)
    .withMessage('Thai ID must be 13 digits'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be 1-100 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be 1-100 characters'),

  body('laserCode')
    .optional()
    .trim(),

  // JURISTIC fields
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Company name must be 1-200 characters'),

  body('taxId')
    .optional()
    .matches(/^[0-9]{13}$/)
    .withMessage('Tax ID must be 13 digits'),

  body('representativeName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Representative name must not exceed 200 characters'),

  body('representativePosition')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Representative position must not exceed 100 characters'),

  // COMMUNITY_ENTERPRISE fields
  body('communityName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Community name must be 1-200 characters'),

  body('communityRegistrationNo')
    .optional()
    .trim(),

  // Address fields (optional for all)
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),

  body('province')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Province must not exceed 100 characters'),

  body('district')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('District must not exceed 100 characters'),

  body('subDistrict')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Sub-district must not exceed 100 characters'),

  body('postalCode')
    .optional()
    .matches(/^[0-9]{5}$/)
    .withMessage('Postal code must be 5 digits'),

  body('zipCode')
    .optional()
    .matches(/^[0-9]{5}$/)
    .withMessage('Zip code must be 5 digits'),

  validate,
];

/**
 * Validate login (supports multi-account types)
 */
const validateLogin = [
  // Account type (optional, for account lookup)
  body('accountType')
    .optional()
    .isIn(['INDIVIDUAL', 'JURISTIC', 'COMMUNITY_ENTERPRISE', 'STAFF'])
    .withMessage('Invalid account type'),

  // Identifier (can be Thai ID, Tax ID, CE No., or Email)
  body('identifier')
    .optional()
    .trim(),

  // Legacy: email (optional)
  body('email')
    .optional()
    .trim(),

  // Legacy: idCard (optional)
  body('idCard')
    .optional()
    .trim(),

  // Password (required)
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validate,
];

/**
 * Validate password reset request
 */
const validateRequestPasswordReset = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail()
    .toLowerCase(),

  validate,
];

/**
 * Validate password reset
 */
const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),

  validate,
];

/**
 * Validate profile update
 */
const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),

  body('phoneNumber')
    .optional()
    .matches(/^[0-9]{9,15}$/)
    .withMessage('Phone number must be 9-15 digits'),

  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name must not exceed 200 characters'),

  body('communityName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Community name must not exceed 200 characters'),

  body('province')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Province must not exceed 100 characters'),

  body('district')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('District must not exceed 100 characters'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),

  validate,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateRequestPasswordReset,
  validateResetPassword,
  validateUpdateProfile,
};
