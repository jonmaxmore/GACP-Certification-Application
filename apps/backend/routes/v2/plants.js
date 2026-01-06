/**
 * Plant Routes (V2 Wrapper)
 * Wraps legacy PlantController (Mongoose)
 * Base path: /api/v2/plants
 */

const express = require('express');
const router = express.Router();
const plantController = require('../../controllers/PlantController'); // Renamed to PascalCase
const { authenticateFarmer } = require('../../middleware/auth-middleware');

// ===================== PUBLIC ROUTES (No Auth Required) =====================

/**
 * GET /summary
 * Get summary of all plants for dropdown selection
 */
router.get('/summary', plantController.getPlantsSummary);

/**
 * GET /
 * Get all active plants
 * Query params: group (HIGH_CONTROL, GENERAL)
 */
router.get('/', plantController.getAllPlants);

/**
 * GET /:plantId
 * Get single plant by ID
 */
router.get('/:plantId', plantController.getPlantById);

// ===================== PROTECTED ROUTES (Auth Required) =====================

/**
 * GET /:plantId/documents
 * Get document requirements for a plant
 * Query params: requestType (NEW, RENEW, AMEND)
 */
router.get('/:plantId/documents', authenticateFarmer, plantController.getPlantDocuments);

/**
 * GET /:plantId/production-inputs
 * Get production input fields for a plant
 */
router.get('/:plantId/production-inputs', authenticateFarmer, plantController.getPlantProductionInputs);

module.exports = router;
