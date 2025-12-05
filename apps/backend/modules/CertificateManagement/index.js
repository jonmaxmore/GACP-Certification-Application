/**
 * Certificate Management Module
 *
 * Main entry point for certificate management functionality
 */

const logger = require('../../shared/logger/logger');
const CertificateService = require('./services/certificate.service');
const CertificateController = require('./controllers/certificate.controller');
const initializeRoutes = require('./routes/certificate.routes');

/**
 * Initialize Certificate Management Module
 *
 * @param {Object} db - MongoDB database instance
 * @param {Function} authMiddleware - Authentication middleware
 * @returns {Object} - Module components (router, service, controller)
 */
async function initializeCertificateManagement(db, authMiddleware) {
  try {
    logger.info('Initializing Certificate Management module...');

    // Validate dependencies
    if (!db) {
      throw new Error('Database instance is required');
    }

    if (!authMiddleware) {
      throw new Error('Authentication middleware is required');
    }

    // Initialize service
    const certificateService = new CertificateService(db);
    await certificateService.initialize();
    logger.info('✓ Certificate service initialized');

    // Initialize controller
    const certificateController = new CertificateController(certificateService);
    logger.info('✓ Certificate controller initialized');

    // Initialize routes
    const router = initializeRoutes(certificateController, authMiddleware);
    logger.info('✓ Certificate routes initialized');

    logger.info('✓ Certificate Management module ready');

    return {
      router,
      service: certificateService,
      controller: certificateController,
    };
  } catch (error) {
    logger.error('Failed to initialize Certificate Management module:', error);
    throw error;
  }
}

/**
 * Get module information
 */
function getModuleInfo() {
  return {
    name: 'certificate-management',
    version: '1.0.0',
    description: 'Certificate generation, verification, renewal, and revocation',
    endpoints: [
      'POST /api/certificates - Create certificate',
      'GET /api/certificates - List all certificates',
      'GET /api/certificates/:id - Get certificate by ID',
      'GET /api/certificates/number/:certificateNumber - Get by number',
      'GET /api/certificates/user/:userId - Get user certificates',
      'GET /api/certificates/verify/:certificateNumber - Verify (public)',
      'GET /api/certificates/:id/download - Download PDF (public)',
      'POST /api/certificates/:id/renew - Renew certificate',
      'POST /api/certificates/:id/revoke - Revoke certificate',
      'PUT /api/certificates/:id/pdf - Update PDF info',
      'GET /api/certificates/stats - Get statistics',
      'GET /api/certificates/expiring - Get expiring certificates',
    ],
    features: [
      'Certificate generation with auto-incrementing numbers (GACP-YYYY-NNNN)',
      'Cryptographic verification codes',
      'QR code generation for public verification',
      'Certificate lifecycle management (active, expired, revoked, renewed)',
      '3-year validity with configurable duration',
      '90-day renewal window before expiry',
      'Revocation with reason tracking',
      'PDF generation and download',
      'Public verification endpoint',
      'Certificate statistics and reporting',
      'Expiring certificate alerts',
    ],
    dependencies: ['MongoDB database', 'Authentication middleware'],
  };
}

module.exports = {
  initializeCertificateManagement,
  getModuleInfo,
};
