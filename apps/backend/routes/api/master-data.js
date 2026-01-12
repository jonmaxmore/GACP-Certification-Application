const express = require('express');
const router = express.Router();
const masterDataController = require('../../controllers/masterDataController');

// GET /api/master-data - All master data in one response
router.get('/', masterDataController.getMasterData);

// Individual endpoints for granular API access
router.get('/fees', masterDataController.getFees);
router.get('/cultivation-methods', masterDataController.getCultivationMethods);
router.get('/purposes', masterDataController.getPurposes);
router.get('/qr-pricing', masterDataController.getQrPricing);

module.exports = router;
