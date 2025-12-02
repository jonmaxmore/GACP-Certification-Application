/**
 * compliance.routes.js
 * Routes for GACP Mandatory Reporting
 */

const express = require('express');
const router = express.Router();
const ComplianceController = require('../controllers/ComplianceController');
const { authenticateToken } = require('../../../../shared/auth');

// Submit Report (Farmer)
router.post('/', authenticateToken, ComplianceController.submitReport);

// Get My Reports (Farmer)
router.get('/', authenticateToken, ComplianceController.getMyReports);

// Acknowledge Report (Officer)
router.post('/:id/acknowledge', authenticateToken, ComplianceController.acknowledgeReport);

module.exports = router;
