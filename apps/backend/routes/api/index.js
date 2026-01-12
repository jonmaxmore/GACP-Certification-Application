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
const authFarmerRouter = require('./auth-farmer');
const authDtamRouter = require('./auth-dtam');
const mfaRouter = require('./mfa');
const publicRouter = require('./public');
const consentRouter = require('./consent');
const documentsRouter = require('./documents');

const plantingCyclesRouter = require('./planting-cycles');
const lotsRouter = require('./lots');
const traceRouter = require('./trace');
const criteriaRouter = require('./criteria');
const farmsRouter = require('./farms');
const dashboardRouter = require('./dashboard');

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
router.use('/reports', require('./reports'));

router.use('/certificates', certificatesRouter);
router.use('/payments', paymentsRouter);
router.use('/quotes', quotesRouter);
router.use('/accounting', accountingRouter);
router.use('/auth-farmer', authFarmerRouter);
router.use('/auth-dtam', authDtamRouter);
router.use('/mfa', mfaRouter);
router.use('/public', publicRouter);
router.use('/consent', consentRouter);
router.use('/documents', documentsRouter);
router.use('/planting-cycles', plantingCyclesRouter);
router.use('/lots', lotsRouter);
router.use('/trace', traceRouter);

router.use('/identity', require('./identity')); // eKYC Identity Verification
router.use('/standards', require('./standards'));
router.use('/farms', farmsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/master-data', require('./master-data'));
router.use('/webhooks', require('./webhooks'));
router.use('/admin', require('./admin')); // Admin CMS Routes

// Health check with version info
router.use('/', require('./plots')); // Mount Plots/Farm Sub-resources at root of API

const prismaDatabase = require('../../services/prisma-database');

router.get('/health', async (req, res) => {
  console.log('[API] Health Check Requested');
  const dbHealth = await prismaDatabase.healthCheck();
  console.log('[API] Health Check Result:', dbHealth);
  const overallSuccess = dbHealth.status === 'connected';

  res.status(overallSuccess ? 200 : 503).json({
    success: overallSuccess,
    version: '2.0.0',
    database: 'postgresql',
    dbStatus: dbHealth,
    message: overallSuccess ? 'V2 API is running' : 'System Unhealthy',
  });
});

// Version info endpoint
router.get('/version', (req, res) => {
  res.json({
    success: true,
    version: '2.0.0',
    minClientVersion: '1.0.0',
    features: ['notifications', 'tickets', 'kyc', 'config', 'plants', 'harvest-batches', 'validation'],
  });
});

module.exports = router;

