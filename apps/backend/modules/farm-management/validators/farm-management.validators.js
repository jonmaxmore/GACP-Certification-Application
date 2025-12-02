/**
 * 🌱 Farm Management Validators
 * Input validation for farm management operations
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware to check for errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validate create cultivation cycle request
 */
const validateCreateCycle = [
  body('cropType')
    .isIn(['cannabis', 'hemp', 'medicinal_cannabis'])
    .withMessage('Crop type must be cannabis, hemp, or medicinal_cannabis'),

  body('variety')
    .notEmpty()
    .withMessage('Variety is required')
    .isString()
    .withMessage('Variety must be a string'),

  body('plantingDate')
    .notEmpty()
    .withMessage('Planting date is required')
    .isISO8601()
    .withMessage('Planting date must be valid ISO date'),

  body('area.value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Area value must be positive number'),

  body('area.unit')
    .optional()
    .isIn(['sqm', 'rai', 'hectare'])
    .withMessage('Area unit must be sqm, rai, or hectare'),

  body('plantCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Plant count must be positive integer'),

  validate,
];

/**
 * Validate record activity request
 */
const validateRecordActivity = [
  body('type')
    .isIn(['watering', 'fertilizing', 'pruning', 'pest_control', 'inspection', 'other'])
    .withMessage('Activity type must be valid'),

  body('description')
    .notEmpty()
    .withMessage('Activity description is required')
    .isString()
    .withMessage('Description must be a string'),

  body('date')
    .notEmpty()
    .withMessage('Activity date is required')
    .isISO8601()
    .withMessage('Date must be valid ISO date'),

  body('sopCompliance').optional().isBoolean().withMessage('SOP compliance must be boolean'),

  body('notes').optional().isString().withMessage('Notes must be a string'),

  validate,
];

/**
 * Validate compliance check request
 */
const validateComplianceCheck = [
  body('checkType')
    .isIn(['routine', 'spot_check', 'certification', 'follow_up'])
    .withMessage('Check type must be valid'),

  body('checkDate')
    .notEmpty()
    .withMessage('Check date is required')
    .isISO8601()
    .withMessage('Check date must be valid ISO date'),

  body('findings').optional().isArray().withMessage('Findings must be an array'),

  body('findings.*.category').notEmpty().withMessage('Finding category is required'),

  body('findings.*.severity')
    .isIn(['minor', 'major', 'critical'])
    .withMessage('Severity must be minor, major, or critical'),

  body('overallCompliance')
    .isIn(['compliant', 'non_compliant', 'partially_compliant'])
    .withMessage('Overall compliance must be valid'),

  validate,
];

/**
 * Validate record harvest request
 */
const validateRecordHarvest = [
  body('totalYield')
    .notEmpty()
    .withMessage('Total yield is required')
    .isFloat({ min: 0 })
    .withMessage('Total yield must be positive number'),

  body('yieldUnit')
    .optional()
    .isIn(['kg', 'ton', 'gram'])
    .withMessage('Yield unit must be kg, ton, or gram'),

  body('date').optional().isISO8601().withMessage('Harvest date must be valid ISO date'),

  body('qualityGrade')
    .optional()
    .isIn(['A', 'B', 'C', 'D'])
    .withMessage('Quality grade must be A, B, C, or D'),

  validate,
];

/**
 * Validate quality test request
 */
const validateQualityTest = [
  body('testType')
    .notEmpty()
    .withMessage('Test type is required')
    .isString()
    .withMessage('Test type must be a string'),

  body('testDate')
    .notEmpty()
    .withMessage('Test date is required')
    .isISO8601()
    .withMessage('Test date must be valid ISO date'),

  body('results')
    .notEmpty()
    .withMessage('Test results are required')
    .isObject()
    .withMessage('Results must be an object'),

  validate,
];

/**
 * Validate cycle ID parameter
 */
const validateCycleId = [
  param('id')
    .notEmpty()
    .withMessage('Cycle ID is required')
    .isString()
    .withMessage('Cycle ID must be a string'),

  validate,
];

/**
 * Validate query filters
 */
const validateFilters = [
  query('status')
    .optional()
    .isIn(['planning', 'active', 'harvesting', 'completed', 'cancelled'])
    .withMessage('Status must be valid'),

  query('phase')
    .optional()
    .isIn(['germination', 'vegetative', 'flowering', 'harvest', 'post-harvest'])
    .withMessage('Phase must be valid'),

  validate,
];

module.exports = {
  validateCreateCycle,
  validateRecordActivity,
  validateComplianceCheck,
  validateRecordHarvest,
  validateQualityTest,
  validateCycleId,
  validateFilters,
};
