/**
 * Renewal Routes
 * API endpoints for application renewal process
 */

const express = require('express');
const router = express.Router();
const RenewalController = require('../controllers/RenewalController');
const { authenticateFarmer } = require('../middleware/AuthMiddleware');

/**
 * @route   GET /api/v2/applications/:id/renewal-data
 * @desc    Get pre-fill data for renewal application
 * @access  Protected (Farmer)
 */
router.get(
    '/:id/renewal-data',
    authenticateFarmer,
    RenewalController.getRenewalData.bind(RenewalController)
);

/**
 * @route   POST /api/v2/applications/renewal
 * @desc    Submit renewal application
 * @access  Protected (Farmer)
 */
router.post(
    '/renewal',
    authenticateFarmer,
    RenewalController.submitRenewal.bind(RenewalController)
);

module.exports = router;
