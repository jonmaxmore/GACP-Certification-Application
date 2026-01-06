/**
 * V2 API Router - Simplified for PostgreSQL
 * Main router for V2 endpoints (Closed-loop Ecosystem)
 */

const express = require('express');
const router = express.Router();
const logger = require('../../shared/logger');

// Import V2 route modules (Prisma-compatible)
const notificationsRouter = require('./notifications');
const ticketsRouter = require('./tickets');
const kycRouter = require('./kyc');
const configRouter = require('./config');
const plantsRouter = require('./plants');
const harvestBatchesRouter = require('./harvest-batches');
const validationRouter = require('./validation');
const auditRouter = require('./audit');
const applicationsRouter = require('./applications');
const invoicesRouter = require('./invoices');
const staffRouter = require('./staff');
const auditsRouter = require('./audits');
const certificatesRouter = require('./certificates');
const paymentsRouter = require('./payments');
const quotesRouter = require('./quotes');
const accountingRouter = require('./accounting');

// Mount V2 routes
router.use('/notifications', notificationsRouter);
router.use('/tickets', ticketsRouter);
router.use('/kyc', kycRouter);
router.use('/config', configRouter);
router.use('/plants', plantsRouter);
router.use('/harvest-batches', harvestBatchesRouter);
router.use('/validation', validationRouter);
router.use('/audit', auditRouter);
router.use('/applications', applicationsRouter);
router.use('/invoices', invoicesRouter);
router.use('/staff', staffRouter);
router.use('/audits', auditsRouter);
router.use('/certificates', certificatesRouter);
router.use('/payments', paymentsRouter);
router.use('/quotes', quotesRouter);
router.use('/accounting', accountingRouter);

// Health check with version info
router.get('/health', (req, res) => {
  res.json({
    success: true,
    version: '2.0.0',
    database: 'postgresql',
    message: 'V2 API is running'
  });
});

// Version info endpoint
router.get('/version', (req, res) => {
  res.json({
    success: true,
    version: '2.0.0',
    minClientVersion: '1.0.0',
    features: ['notifications', 'tickets', 'kyc', 'config', 'plants', 'harvest-batches', 'validation']
  });
});

module.exports = router;

