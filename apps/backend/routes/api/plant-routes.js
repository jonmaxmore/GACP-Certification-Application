/**
 * Plant Routes - API routes for plant data
 * Base path: /api/v2/plants
 */

const express = require('express');
const router = express.Router();
const plantController = require('../../controllers/PlantController');
const { authenticate } = require('../../middleware/auth-middleware');

// ===================== PUBLIC ROUTES (No Auth Required) =====================

/**
 * GET /api/v2/plants/summary
 * Get summary of all plants for dropdown selection
 */
router.get('/summary', plantController.getPlantsSummary);

/**
 * GET /api/v2/plants
 * Get all active plants
 * Query params: group (HIGH_CONTROL, GENERAL)
 */
router.get('/', plantController.getAllPlants);

/**
 * GET /api/v2/plants/:plantId
 * Get single plant by ID
 */
router.get('/:plantId', plantController.getPlantById);

// ===================== PROTECTED ROUTES (Auth Required) =====================

/**
 * GET /api/v2/plants/:plantId/documents
 * Get document requirements for a plant
 * Query params: requestType (NEW, RENEW, AMEND)
 */
router.get('/:plantId/documents', authenticate, plantController.getPlantDocuments);

/**
 * GET /api/v2/plants/:plantId/production-inputs
 * Get production input fields for a plant
 */
router.get('/:plantId/production-inputs', authenticate, plantController.getPlantProductionInputs);

module.exports = router;

