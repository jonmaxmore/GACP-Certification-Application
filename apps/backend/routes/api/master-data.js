const express = require('express');
const router = express.Router();
const masterDataController = require('../../controllers/masterDataController');

// GET /api/master-data
router.get('/', masterDataController.getMasterData);

module.exports = router;
