/**
 * Certificate Routes
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Define Express routes for certificate endpoints
 * - Maps HTTP methods and paths to controller methods
 * - Applies validation middleware
 * - Applies authentication/authorization middleware
 */

const express = require('express');
const router = express.Router();

// Validators
const {
  validateGenerateCertificate,
  validateCertificateId,
  validateCertificateNumber,
  validateRevokeCertificate,
  validateRenewCertificate,
  validateListCertificates,
  checkValidationResult,
} = require('../validators/certificate.validator');

/**
 * Setup routes with controller and middleware
 * @param {CertificateController} controller - Certificate controller instance
 * @param {Object} middleware - Authentication and authorization middleware
 * @returns {express.Router} Configured router
 */
function setupCertificateRoutes(controller, middleware = {}) {
  // Extract middleware functions
  const {
    authenticateFarmer = (req, res, next) => next(), // Default: no-op
    authenticateDTAM = (req, res, next) => next(),
    authorizeRoles = (..._roles) =>
      (req, res, next) =>
        next(),
  } = middleware;

  // ============================================
  // PUBLIC ROUTES (No authentication required)
  // ============================================

  /**
   * Verify certificate by certificate number (Public)
   * GET /api/public/certificates/verify/:number
   */
  router.get(
    '/public/verify/:number',
    validateCertificateNumber,
    checkValidationResult,
    (req, res) => controller.verifyCertificate(req, res),
  );

  // ============================================
  // AUTHENTICATED FARMER ROUTES
  // ============================================

  /**
   * List certificates (filtered by user)
   * GET /api/certificates
   */
  router.get('/', authenticateFarmer, validateListCertificates, checkValidationResult, (req, res) =>
    controller.listCertificates(req, res),
  );

  /**
   * Get certificate by ID
   * GET /api/certificates/:id
   */
  router.get('/:id', authenticateFarmer, validateCertificateId, checkValidationResult, (req, res) =>
    controller.getCertificateById(req, res),
  );

  /**
   * Download certificate PDF
   * GET /api/certificates/:id/pdf
   */
  router.get(
    '/:id/pdf',
    authenticateFarmer,
    validateCertificateId,
    checkValidationResult,
    (req, res) => controller.downloadPDF(req, res),
  );

  /**
   * Get certificate QR code
   * GET /api/certificates/:id/qrcode
   */
  router.get(
    '/:id/qrcode',
    authenticateFarmer,
    validateCertificateId,
    checkValidationResult,
    (req, res) => controller.getQRCode(req, res),
  );

  /**
   * Get certificate history
   * GET /api/certificates/:id/history
   */
  router.get(
    '/:id/history',
    authenticateFarmer,
    validateCertificateId,
    checkValidationResult,
    (req, res) => controller.getCertificateHistory(req, res),
  );

  /**
   * Verify certificate by ID
   * POST /api/certificates/:id/verify
   */
  router.post(
    '/:id/verify',
    authenticateFarmer,
    validateCertificateId,
    checkValidationResult,
    (req, res) => controller.verifyCertificate(req, res),
  );

  // ============================================
  // DTAM STAFF ROUTES (Admin/Manager only)
  // ============================================

  /**
   * Generate new certificate
   * POST /api/certificates/generate
   * Requires: DTAM Staff (ADMIN or MANAGER role)
   */
  router.post(
    '/generate',
    authenticateDTAM,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateGenerateCertificate,
    checkValidationResult,
    (req, res) => controller.generateCertificate(req, res),
  );

  /**
   * Revoke certificate
   * POST /api/certificates/:id/revoke
   * Requires: DTAM Staff (ADMIN or MANAGER role)
   */
  router.post(
    '/:id/revoke',
    authenticateDTAM,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateRevokeCertificate,
    checkValidationResult,
    (req, res) => controller.revokeCertificate(req, res),
  );

  /**
   * Renew certificate
   * POST /api/certificates/:id/renew
   * Requires: DTAM Staff (ADMIN or MANAGER role)
   */
  router.post(
    '/:id/renew',
    authenticateDTAM,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateRenewCertificate,
    checkValidationResult,
    (req, res) => controller.renewCertificate(req, res),
  );

  return router;
}

module.exports = setupCertificateRoutes;
