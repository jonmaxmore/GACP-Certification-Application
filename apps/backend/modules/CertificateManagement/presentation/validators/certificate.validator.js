/**
 * Certificate Input Validators
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Validate HTTP request data before passing to application layer
 * Uses: Express-validator middleware for validation
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware for generating certificate
 */
const validateGenerateCertificate = [
  body('applicationId')
    .notEmpty()
    .withMessage('Application ID is required')
    .isMongoId()
    .withMessage('Application ID must be a valid MongoDB ID'),

  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ID'),

  body('farmId')
    .notEmpty()
    .withMessage('Farm ID is required')
    .isMongoId()
    .withMessage('Farm ID must be a valid MongoDB ID'),

  body('certificateType')
    .optional()
    .isIn(['GACP', 'GAP', 'ORGANIC'])
    .withMessage('Certificate type must be GACP, GAP, or ORGANIC'),

  body('validityPeriod')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Validity period must be between 1 and 60 months'),

  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
];

/**
 * Validation middleware for certificate ID parameter
 */
const validateCertificateId = [
  param('id')
    .notEmpty()
    .withMessage('Certificate ID is required')
    .isMongoId()
    .withMessage('Certificate ID must be a valid MongoDB ID'),
];

/**
 * Validation middleware for certificate number parameter
 */
const validateCertificateNumber = [
  param('number')
    .notEmpty()
    .withMessage('Certificate number is required')
    .matches(/^GACP-\d{4}-\d{4}-\d{4}$/)
    .withMessage('Certificate number must be in format GACP-YYYY-MMDD-NNNN'),
];

/**
 * Validation middleware for revoking certificate
 */
const validateRevokeCertificate = [
  ...validateCertificateId,
  body('reason')
    .notEmpty()
    .withMessage('Revocation reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),

  body('revokedBy')
    .notEmpty()
    .withMessage('Revoked by is required')
    .isMongoId()
    .withMessage('Revoked by must be a valid user ID'),
];

/**
 * Validation middleware for renewing certificate
 */
const validateRenewCertificate = [
  ...validateCertificateId,
  body('newValidityPeriod')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('New validity period must be between 1 and 60 months'),

  body('renewedBy')
    .notEmpty()
    .withMessage('Renewed by is required')
    .isMongoId()
    .withMessage('Renewed by must be a valid user ID'),
];

/**
 * Validation middleware for listing certificates with filters
 */
const validateListCertificates = [
  query('userId').optional().isMongoId().withMessage('User ID must be a valid MongoDB ID'),

  query('farmId').optional().isMongoId().withMessage('Farm ID must be a valid MongoDB ID'),

  query('status')
    .optional()
    .isIn(['ACTIVE', 'EXPIRED', 'REVOKED', 'PENDING'])
    .withMessage('Status must be ACTIVE, EXPIRED, REVOKED, or PENDING'),

  query('certificateType')
    .optional()
    .isIn(['GACP', 'GAP', 'ORGANIC'])
    .withMessage('Certificate type must be GACP, GAP, or ORGANIC'),

  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'issuedDate', 'expiryDate', 'certificateNumber'])
    .withMessage('Invalid sort field'),

  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
];

/**
 * Validation middleware for bulk generation
 */
const validateBulkGenerate = [
  body('certificates')
    .isArray({ min: 1, max: 50 })
    .withMessage('Certificates must be an array with 1 to 50 items'),

  body('certificates.*.applicationId')
    .notEmpty()
    .withMessage('Each certificate must have an application ID')
    .isMongoId()
    .withMessage('Application ID must be a valid MongoDB ID'),

  body('certificates.*.userId')
    .notEmpty()
    .withMessage('Each certificate must have a user ID')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ID'),

  body('certificates.*.farmId')
    .notEmpty()
    .withMessage('Each certificate must have a farm ID')
    .isMongoId()
    .withMessage('Farm ID must be a valid MongoDB ID'),
];

/**
 * Middleware to check validation results
 * Should be used after validation rules
 */
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors.array().map(err => ({
        field: err.param || err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

module.exports = {
  validateGenerateCertificate,
  validateCertificateId,
  validateCertificateNumber,
  validateRevokeCertificate,
  validateRenewCertificate,
  validateListCertificates,
  validateBulkGenerate,
  checkValidationResult,
};
