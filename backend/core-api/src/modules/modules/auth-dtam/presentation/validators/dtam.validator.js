/**
 * DTAM Staff Validator
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Input validation for DTAM staff authentication endpoints
 */

const { body, validationResult } = require('express-validator');

/**
 * Validation middleware to check for errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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
 * Validate DTAM staff creation
 */
const validateCreateStaff = [
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

  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Employee ID must be between 1 and 50 characters'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['ADMIN', 'MANAGER', 'REVIEWER', 'AUDITOR'])
    .withMessage('Role must be ADMIN, MANAGER, REVIEWER, or AUDITOR'),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Department must not exceed 200 characters'),

  body('position')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Position must not exceed 200 characters'),

  body('phoneNumber')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),

  body('permissions').optional().isArray().withMessage('Permissions must be an array'),

  validate,
];

/**
 * Validate DTAM staff login
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
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Department must not exceed 200 characters'),

  body('position')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Position must not exceed 200 characters'),

  validate,
];

/**
 * Validate role update
 */
const validateUpdateRole = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['ADMIN', 'MANAGER', 'REVIEWER', 'AUDITOR'])
    .withMessage('Role must be ADMIN, MANAGER, REVIEWER, or AUDITOR'),

  body('permissions').optional().isArray().withMessage('Permissions must be an array'),

  validate,
];

module.exports = {
  validateCreateStaff,
  validateLogin,
  validateRequestPasswordReset,
  validateResetPassword,
  validateUpdateProfile,
  validateUpdateRole,
};
