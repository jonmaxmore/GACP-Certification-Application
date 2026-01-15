/**
 * Applications Configuration Routes
 * Provides journey configuration based on purpose and cultivation method
 * 
 * @author กรมการแพทย์แผนไทยและการแพทย์ทางเลือก (DTAM)
 */

const express = require('express');
const router = express.Router();
const JourneyController = require('../../controllers/JourneyController');

// Application configuration by journey
// GET /api/applications/config/:purpose/:method
router.get('/config/:purpose/:method', JourneyController.getJourneyConfig);

module.exports = router;
