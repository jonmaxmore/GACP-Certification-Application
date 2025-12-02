const express = require('express');
const { createLogger } = require('../shared/logger');
const logger = createLogger('compliance');
const StandardsController = require('../controllers/StandardsController');
const ParametersController = require('../controllers/ParametersController');
const ComparisonController = require('../controllers/ComparisonController');
const { authenticateToken, requireAdmin } = require('../middleware/auth-middleware');

/**
 * GACP Quality Compliance Comparator - API Routes
 * Routes for the compliance comparison system
 */

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * @route GET /api/compliance/public/standards
 * @desc Get all public standards with filtering
 * @access Public
 */
router.get('/public/standards', StandardsController.getAllStandards);

/**
 * @route GET /api/compliance/public/standards/search
 * @desc Search standards with autocomplete
 * @access Public
 */
router.get('/public/standards/search', StandardsController.searchStandards);

/**
 * @route GET /api/compliance/public/standards/region/:region
 * @desc Get standards by region
 * @access Public
 */
router.get('/public/standards/region/:region', StandardsController.getStandardsByRegion);

/**
 * @route GET /api/compliance/public/standards/:id
 * @desc Get standard details by ID
 * @access Public
 */
router.get('/public/standards/:id', StandardsController.getStandardById);

/**
 * @route GET /api/compliance/public/parameters
 * @desc Get all public parameters with filtering
 * @access Public
 */
router.get('/public/parameters', ParametersController.getAllParameters);

/**
 * @route GET /api/compliance/public/parameters/search
 * @desc Search parameters with autocomplete
 * @access Public
 */
router.get('/public/parameters/search', ParametersController.searchParameters);

/**
 * @route GET /api/compliance/public/parameters/categories
 * @desc Get parameter categories and counts
 * @access Public
 */
router.get('/public/parameters/categories', ParametersController.getParameterCategories);

/**
 * @route GET /api/compliance/public/parameters/category/:category
 * @desc Get parameters by category
 * @access Public
 */
router.get('/public/parameters/category/:category', ParametersController.getParametersByCategory);

/**
 * @route GET /api/compliance/public/parameters/risk/:riskLevel
 * @desc Get parameters by risk level
 * @access Public
 */
router.get('/public/parameters/risk/:riskLevel', ParametersController.getParametersByRiskLevel);

/**
 * @route GET /api/compliance/public/parameters/:id
 * @desc Get parameter details by ID
 * @access Public
 */
router.get('/public/parameters/:id', ParametersController.getParameterById);

/**
 * @route POST /api/compliance/public/compare
 * @desc Compare multiple standards (public access)
 * @access Public
 */
router.post('/public/compare', ComparisonController.compareStandards);

/**
 * @route GET /api/compliance/public/compare/parameters
 * @desc Get available parameters for comparison
 * @access Public
 */
router.get('/public/compare/parameters', ComparisonController.getAvailableParameters);

/**
 * @route GET /api/compliance/public/summary
 * @desc Get public standards summary
 * @access Public
 */
router.get('/public/summary', StandardsController.getStandardsSummary);

// ============================================================================
// AUTHENTICATED ROUTES (Requires valid JWT token)
// ============================================================================

/**
 * @route GET /api/compliance/standards
 * @desc Get all standards (authenticated users get more details)
 * @access Private
 */
router.get('/standards', authenticateToken, StandardsController.getAllStandards);

/**
 * @route GET /api/compliance/standards/:id
 * @desc Get standard details by ID (authenticated)
 * @access Private
 */
router.get('/standards/:id', authenticateToken, StandardsController.getStandardById);

/**
 * @route GET /api/compliance/parameters
 * @desc Get all parameters (authenticated users get more details)
 * @access Private
 */
router.get('/parameters', authenticateToken, ParametersController.getAllParameters);

/**
 * @route GET /api/compliance/parameters/:id
 * @desc Get parameter details by ID (authenticated)
 * @access Private
 */
router.get('/parameters/:id', authenticateToken, ParametersController.getParameterById);

/**
 * @route POST /api/compliance/parameters/:id/validate
 * @desc Validate parameter value
 * @access Private
 */
router.post(
  '/parameters/:id/validate',
  authenticateToken,
  ParametersController.validateParameterValue,
);

/**
 * @route POST /api/compliance/compare
 * @desc Compare multiple standards (authenticated - more detailed results)
 * @access Private
 */
router.post('/compare', authenticateToken, ComparisonController.compareStandards);

/**
 * @route GET /api/compliance/compare/statistics
 * @desc Get comparison statistics
 * @access Private
 */
router.get('/compare/statistics', authenticateToken, ComparisonController.getComparisonStatistics);

// ============================================================================
// ADMIN ROUTES (Requires admin privileges)
// ============================================================================

/**
 * @route POST /api/compliance/admin/standards
 * @desc Create new standard
 * @access Admin
 */
router.post(
  '/admin/standards',
  authenticateToken,
  requireAdmin,
  StandardsController.createStandard,
);

/**
 * @route PUT /api/compliance/admin/standards/:id
 * @desc Update standard
 * @access Admin
 */
router.put(
  '/admin/standards/:id',
  authenticateToken,
  requireAdmin,
  StandardsController.updateStandard,
);

/**
 * @route DELETE /api/compliance/admin/standards/:id
 * @desc Delete standard
 * @access Admin
 */
router.delete(
  '/admin/standards/:id',
  authenticateToken,
  requireAdmin,
  StandardsController.deleteStandard,
);

/**
 * @route POST /api/compliance/admin/parameters
 * @desc Create new parameter
 * @access Admin
 */
router.post(
  '/admin/parameters',
  authenticateToken,
  requireAdmin,
  ParametersController.createParameter,
);

/**
 * @route PUT /api/compliance/admin/parameters/:id
 * @desc Update parameter
 * @access Admin
 */
router.put(
  '/admin/parameters/:id',
  authenticateToken,
  requireAdmin,
  ParametersController.updateParameter,
);

/**
 * @route DELETE /api/compliance/admin/parameters/:id
 * @desc Delete parameter
 * @access Admin
 */
router.delete(
  '/admin/parameters/:id',
  authenticateToken,
  requireAdmin,
  ParametersController.deleteParameter,
);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// Handle 404 for compliance routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Compliance API endpoint not found',
      details: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// Handle errors in compliance routes
router.use((error, req, res, _next) => {
  logger.error('Compliance API Error:', error);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error in compliance API',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    },
  });
});

module.exports = router;
