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
const applicationsRouter = require('../api/GacpApplications');
const establishmentsRouter = require('../../modules/Establishment'); // Will create this next

// Mount V2 routes
router.use('/notifications', notificationsRouter);
router.use('/tickets', ticketsRouter);
router.use('/kyc', kycRouter);
router.use('/', applicationsRouter); // GacpApplications defines /applications internally
router.use('/establishments', establishmentsRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    version: '2.0.0',
    message: 'V2 API is running',
  });
});

module.exports = router;
