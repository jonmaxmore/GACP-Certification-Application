/**
 * V2 API Router
 * Main router for V2 endpoints (Closed-loop Ecosystem)
 */

const express = require('express');
const router = express.Router();

// Import V2 route modules
const notificationsRouter = require('./notifications');
const ticketsRouter = require('./tickets');
const kycRouter = require('./kyc');
const applicationsRouter = require('../api/ApplicationRoutes');
const establishmentsRouter = require('../../modules/Establishment');

// Mount V2 routes
router.use('/notifications', notificationsRouter);
router.use('/tickets', ticketsRouter);
router.use('/kyc', kycRouter);
router.use('/applications', applicationsRouter);
router.use('/establishments', establishmentsRouter);
router.use('/payments', require('../api/PaymentRoutes'));
router.use('/officer', require('../api/OfficerRoutes'));
router.use('/auth', require('../api/AuthFarmerRoutes')); // Added for V2 Consistency
router.use('/plants', require('../api/PlantRoutes')); // Plant Master API
router.use('/documents', require('../api/DocumentAnalysisRoutes')); // Document Analysis API

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    version: '2.0.0',
    message: 'V2 API is running',
  });
});

module.exports = router;
