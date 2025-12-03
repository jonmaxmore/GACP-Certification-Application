/**
 * Auth Validator
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Input validation for farmer authentication endpoints
 * - Validate request data
 * - Sanitize inputs
 * - Return validation errors
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
 * Validate farmer registration
 */
const validateRegister = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),

  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),

  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),

  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[0-9]{9,15}$/)
    .withMessage('Phone number must be between 9 and 15 digits and may start with +'),

  body('idCard')
    .notEmpty()
    .withMessage('ID card number is required')
    .matches(/^[0-9]{13}$/)
    .withMessage('ID card number must be 13 digits'),

  body('farmName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Farm name must not exceed 200 characters'),

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

  validate,
];

/**
 * Validate farmer login
 */
const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail()
    .toLowerCase(),

  body('password').notEmpty().withMessage('Password is required'),

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
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),

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
    .matches(/^\+?[0-9]{9,15}$/)
    .withMessage('Phone number must be between 9 and 15 digits and may start with +'),

  body('farmName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Farm name must not exceed 200 characters'),

  body('farmSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Farm size must be a positive number'),

  body('farmingExperience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Farming experience must be a positive integer'),

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
