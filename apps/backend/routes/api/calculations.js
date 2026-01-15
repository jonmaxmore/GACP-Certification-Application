/**
 * Calculations Routes
 * Utility endpoints for plant count and fee calculations
 * 
 * @author กรมการแพทย์แผนไทยและการแพทย์ทางเลือก (DTAM)
 */

const express = require('express');
const router = express.Router();
const JourneyController = require('../../controllers/JourneyController');

// Calculate plant count based on area and layout
// POST /api/calculations/plant-count
router.post('/plant-count', JourneyController.calculatePlants);

module.exports = router;
