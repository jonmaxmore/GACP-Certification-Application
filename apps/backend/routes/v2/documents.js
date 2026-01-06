/**
 * Document Analysis Routes (V2 Wrapper)
 * Wraps legacy DocumentAnalysisController (Mongoose)
 * Base path: /api/v2/documents
 */

const express = require('express');
const router = express.Router();
const controller = require('../../controllers/DocumentAnalysisController'); // Renamed to PascalCase
const { authenticateFarmer } = require('../../middleware/auth-middleware');

/**
 * GET /plants
 * Get all available plants
 */
router.get('/plants', controller.getAvailablePlants);

/**
 * GET /requirements/:plantId
 * Get base document requirements for a plant type
 */
router.get('/requirements/:plantId', controller.getPlantRequirements);

/**
 * POST /analyze
 * Analyze required documents based on application data
 */
router.post('/analyze', authenticateFarmer, controller.analyzeDocuments);

/**
 * POST /validate
 * Validate that all required documents have been uploaded
 */
router.post('/validate', authenticateFarmer, controller.validateDocuments);

module.exports = router;
