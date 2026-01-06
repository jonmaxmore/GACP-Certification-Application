/**
 * V2 Documents Route
 * Maps V2 endpoints to DocumentAnalysisController (Prisma Refactored)
 */

const express = require('express');
const router = express.Router();
const DocumentAnalysisController = require('../../controllers/DocumentAnalysisController');
const authModule = require('../../middleware/auth-middleware');

// Public/Protected endpoints
router.get('/requirements/:plantId', DocumentAnalysisController.getPlantRequirements);
router.post('/analyze', DocumentAnalysisController.analyzeDocuments);
router.post('/validate', DocumentAnalysisController.validateDocuments);
router.get('/plants', DocumentAnalysisController.getAvailablePlants);

module.exports = router;
