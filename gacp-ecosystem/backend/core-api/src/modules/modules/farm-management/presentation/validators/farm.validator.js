/**
 * Farm Validators (Presentation Layer)
 *
 * Input validation for farm management endpoints
 * Uses express-validator
 */

const { body, validationResult } = require('express-validator');

const Farm = require('../../domain/entities/Farm');

/**
 * Validate middleware - checks validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validate farm registration
 */
const validateRegisterFarm = [
  body('farmName')
    .trim()
    .notEmpty()
    .withMessage('Farm name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Farm name must be 3-200 characters'),

  body('farmType')
    .notEmpty()
    .withMessage('Farm type is required')
    .isIn(Object.values(Farm.FARM_TYPE))
    .withMessage('Invalid farm type'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be 10-500 characters'),

  body('subDistrict').trim().notEmpty().withMessage('Sub-district is required'),

  body('district').trim().notEmpty().withMessage('District is required'),

  body('province').trim().notEmpty().withMessage('Province is required'),

  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required')
    .matches(/^\d{5}$/)
    .withMessage('Postal code must be 5 digits'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('totalArea')
    .notEmpty()
    .withMessage('Total area is required')
    .isFloat({ min: 0.01 })
    .withMessage('Total area must be greater than 0'),

  body('cultivationArea')
    .notEmpty()
    .withMessage('Cultivation area is required')
    .isFloat({ min: 0.01 })
    .withMessage('Cultivation area must be greater than 0')
    .custom((value, { req }) => {
      if (parseFloat(value) > parseFloat(req.body.totalArea)) {
        throw new Error('Cultivation area cannot exceed total area');
      }
      return true;
    }),

  body('areaUnit')
    .optional()
    .isIn(['rai', 'ngan', 'wa', 'sqm', 'hectare'])
    .withMessage('Invalid area unit'),

  body('cultivationMethod').trim().notEmpty().withMessage('Cultivation method is required'),

  body('irrigationType')
    .optional()
    .isIn(Object.values(Farm.IRRIGATION_TYPE))
    .withMessage('Invalid irrigation type'),

  body('soilType').optional().trim(),

  body('waterSource').optional().trim(),

  validate,
];

/**
 * Validate farm update
 */
const validateUpdateFarm = [
  body('farmName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Farm name must be 3-200 characters'),

  body('farmType').optional().isIn(Object.values(Farm.FARM_TYPE)).withMessage('Invalid farm type'),

  body('address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be 10-500 characters'),

  body('subDistrict').optional().trim(),

  body('district').optional().trim(),

  body('province').optional().trim(),

  body('postalCode')
    .optional()
    .trim()
    .matches(/^\d{5}$/)
    .withMessage('Postal code must be 5 digits'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('totalArea')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Total area must be greater than 0'),

  body('cultivationArea')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Cultivation area must be greater than 0'),

  body('areaUnit')
    .optional()
    .isIn(['rai', 'ngan', 'wa', 'sqm', 'hectare'])
    .withMessage('Invalid area unit'),

  body('cultivationMethod').optional().trim(),

  body('irrigationType')
    .optional()
    .isIn(Object.values(Farm.IRRIGATION_TYPE))
    .withMessage('Invalid irrigation type'),

  body('soilType').optional().trim(),

  body('waterSource').optional().trim(),

  validate,
];

/**
 * Validate farm approval
 */
const validateApproveFarm = [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  validate,
];

/**
 * Validate farm rejection
 */
const validateRejectFarm = [
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Rejection reason must be 10-1000 characters'),

  validate,
];

module.exports = {
  validateRegisterFarm,
  validateUpdateFarm,
  validateApproveFarm,
  validateRejectFarm,
};
