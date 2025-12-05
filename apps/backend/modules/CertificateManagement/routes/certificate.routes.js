/**
 * Certificate Routes
 *
 * API endpoints for certificate management
 */

const express = require('express');
const router = express.Router();

/**
 * Initialize routes with controller and middleware
 */
function initializeRoutes(controller, authMiddleware) {
  // Middleware to check if service is initialized
  const checkInitialized = (req, res, next) => {
    if (!controller.service.initialized) {
      return res.status(503).json({
        success: false,
        message: 'Certificate service is not initialized yet',
      });
    }
    next();
  };

  // Apply initialization check to all routes
  router.use(checkInitialized);

  /**
   * @route   GET /api/certificates/stats
   * @desc    Get certificate statistics
   * @access  Private (Admin/Staff)
   */
  router.get('/stats', authMiddleware, (req, res) => controller.getCertificateStats(req, res));

  /**
   * @route   GET /api/certificates/expiring
   * @desc    Get expiring certificates
   * @access  Private (Admin/Staff)
   */
  router.get('/expiring', authMiddleware, (req, res) =>
    controller.getExpiringCertificates(req, res),
  );

  /**
   * @route   GET /api/certificates/verify/:certificateNumber
   * @desc    Verify certificate (public)
   * @access  Public
   */
  router.get('/verify/:certificateNumber', (req, res) => controller.verifyCertificate(req, res));

  /**
   * @route   GET /api/certificates/number/:certificateNumber
   * @desc    Get certificate by number
   * @access  Private
   */
  router.get('/number/:certificateNumber', authMiddleware, (req, res) =>
    controller.getCertificateByNumber(req, res),
  );

  /**
   * @route   GET /api/certificates/user/:userId
   * @desc    Get certificates by user
   * @access  Private
   */
  router.get('/user/:userId', authMiddleware, (req, res) =>
    controller.getCertificatesByUser(req, res),
  );

  /**
   * @route   GET /api/certificates/:id
   * @desc    Get certificate by ID
   * @access  Private
   */
  router.get('/:id', authMiddleware, (req, res) => controller.getCertificateById(req, res));

  /**
   * @route   GET /api/certificates
   * @desc    Get all certificates with pagination
   * @access  Private (Admin/Staff)
   */
  router.get('/', authMiddleware, (req, res) => controller.getAllCertificates(req, res));

  /**
   * @route   POST /api/certificates
   * @desc    Create new certificate
   * @access  Private (Admin/Staff)
   */
  router.post('/', authMiddleware, (req, res) => controller.createCertificate(req, res));

  /**
   * @route   POST /api/certificates/:id/renew
   * @desc    Renew certificate
   * @access  Private (Admin/Staff)
   */
  router.post('/:id/renew', authMiddleware, (req, res) => controller.renewCertificate(req, res));

  /**
   * @route   POST /api/certificates/:id/revoke
   * @desc    Revoke certificate
   * @access  Private (Admin only)
   */
  router.post('/:id/revoke', authMiddleware, (req, res) => controller.revokeCertificate(req, res));

  /**
   * @route   GET /api/certificates/:id/download
   * @desc    Download certificate PDF
   * @access  Public (with certificate number)
   */
  router.get('/:id/download', (req, res) => controller.downloadCertificate(req, res));

  /**
   * @route   PUT /api/certificates/:id/pdf
   * @desc    Update certificate PDF info
   * @access  Private (System/Admin)
   */
  router.put('/:id/pdf', authMiddleware, (req, res) => controller.updatePDFInfo(req, res));

  return router;
}

module.exports = initializeRoutes;
