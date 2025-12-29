/**
 * V2 API Router
 * Main router for V2 endpoints (Closed-loop Ecosystem)
 */

const express = require('express');
const router = express.Router();
const apiVersionMiddleware = require('../../middleware/api-version-middleware');
const { getVersionInfo } = require('../../middleware/api-version-middleware');

// Apply API version middleware to all V2 routes
router.use(apiVersionMiddleware);

// Import V2 route modules
const notificationsRouter = require('./notifications');
const ticketsRouter = require('./tickets');
const kycRouter = require('./kyc');
const applicationsRouter = require('../api/application-routes');
const establishmentsRouter = require('../../modules/Establishment');

// Mount V2 routes
router.use('/notifications', notificationsRouter);
router.use('/tickets', ticketsRouter);
router.use('/kyc', kycRouter);
router.use('/applications', applicationsRouter);
router.use('/establishments', establishmentsRouter);
router.use('/payments', require('../api/payment-routes'));
router.use('/officer', require('../api/officer-routes'));
router.use('/auth', require('../api/auth-farmer-routes')); // Added for V2 Consistency
router.use('/plants', require('../api/plant-routes')); // Plant Master API
router.use('/documents', require('../api/document-analysis-routes')); // Document Analysis API
router.use('/files', require('./documents')); // File Storage API - Upload/Download
router.use('/pricing', require('./pricing')); // Pricing API - One Brain Many Faces
router.use('/access', require('./access')); // Access Control API - One Brain Many Faces
router.use('/reports', require('./reports')); // Reports API - Government Analytics
router.use('/metrics', require('./metrics')); // Prometheus Metrics
router.use('/audit', require('./audit')); // Audit Logging API
router.use('/certificates', require('../api/certificate-routes')); // Certificate API for Farmers
router.use('/quotes', require('../api/quote-routes')); // Quote API - Team sends quotes to farmers
router.use('/invoices', require('../api/invoice-routes')); // Invoice API - Payment tracking
router.use('/licenses', require('./licenses')); // License API - บท.11/13/16 verification
router.use('/batch', require('./batch')); // Batch Submission - Multi-area auto-split
router.use('/staff', require('../api/staff-routes')); // Staff Management API - Admin/Super Admin
router.use('/auth-staff', require('../../modules/AuthDtam/routes/dtam-auth')); // Staff Authentication API
router.use('/field-audits', require('../api/field-audit-routes')); // Field Audit API - Inspection/Assessment
router.use('/public', require('../api/public-verification-routes')); // Public Certificate Verification (no auth)

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


