/**
 * V2 API Router
 * Main router for V2 endpoints (Closed-loop Ecosystem)
 */

const express = require('express');
const router = express.Router();
const apiVersionMiddleware = require('../../middleware/ApiVersionMiddleware');
const { getVersionInfo } = require('../../middleware/ApiVersionMiddleware');

// Apply API version middleware to all V2 routes
router.use(apiVersionMiddleware);

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
router.use('/files', require('./documents')); // File Storage API - Upload/Download
router.use('/pricing', require('./pricing')); // Pricing API - One Brain Many Faces
router.use('/access', require('./access')); // Access Control API - One Brain Many Faces
router.use('/reports', require('./reports')); // Reports API - Government Analytics
router.use('/metrics', require('./metrics')); // Prometheus Metrics
router.use('/audit', require('./audit')); // Audit Logging API

// Health check with version info
router.get('/health', (req, res) => {
  res.json({
    success: true,
    ...getVersionInfo(),
    message: 'V2 API is running',
  });
});

// Version info endpoint
router.get('/version', (req, res) => {
  res.json({
    success: true,
    ...getVersionInfo(),
    headers: {
      'X-API-Version': 'Current API version',
      'X-Min-Client-Version': 'Minimum supported client version',
      'X-Deprecated': 'If endpoint is deprecated',
      'X-Upgrade-Required': 'If client needs to update',
    },
  });
});

module.exports = router;

