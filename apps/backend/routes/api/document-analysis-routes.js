/**
 * Document Analysis Routes
 * API endpoints for document requirement analysis
 * 
 * Routes:
 * - GET  /api/v2/documents/plants              - List all available plants
 * - GET  /api/v2/documents/requirements/:plantId - Get base requirements for a plant
 * - POST /api/v2/documents/analyze             - Analyze documents based on app data
 * - POST /api/v2/documents/validate            - Validate uploaded documents
 */

const express = require('express');
const router = express.Router();
const controller = require('../../controllers/DocumentAnalysisController');

// Optional auth middleware - some routes are public
const { authenticate } = require('../../middleware/auth-middleware');

/**
 * @route   GET /api/v2/documents/plants
 * @desc    Get all available plants
 * @access  Public
 */
router.get('/plants', controller.getAvailablePlants);

/**
 * @route   GET /api/v2/documents/requirements/:plantId
 * @desc    Get base document requirements for a plant type
 * @access  Public
 * @query   requestType - NEW, RENEW, or AMEND (default: NEW)
 */
router.get('/requirements/:plantId', controller.getPlantRequirements);

/**
 * @route   POST /api/v2/documents/analyze
 * @desc    Analyze required documents based on application data
 * @access  Protected
 * @body    { plantId, requestType, applicationData }
 */
router.post('/analyze', authenticate, controller.analyzeDocuments);

/**
 * @route   POST /api/v2/documents/validate
 * @desc    Validate that all required documents have been uploaded
 * @access  Protected
 * @body    { plantId, requestType, applicationData, uploadedDocs }
 */
router.post('/validate', authenticate, controller.validateDocuments);

module.exports = router;

