const { createLogger } = require('../../../shared/logger');
const logger = createLogger('certificate-management-certificate.controller');

/**
 * Certificate Controller
 *
 * HTTP request handlers for certificate management endpoints
 */

class CertificateController {
  constructor(service) {
    this.service = service;
  }

  /**
   * Create certificate
   * POST /api/certificates
   */
  async createCertificate(req, res) {
    try {
      const {
        applicationId,
        farmId,
        userId,
        farmName,
        farmerName,
        location,
        cropType,
        farmSize,
        standardId,
        standardName,
        score,
        validityYears,
      } = req.body;

      // Validate required fields
      if (!applicationId || !farmId || !userId || !farmName || !farmerName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      const issuedBy = req.user?.userId || req.user?.id;

      const certificate = await this.service.createCertificate({
        applicationId,
        farmId,
        userId,
        farmName,
        farmerName,
        location,
        cropType,
        farmSize,
        standardId,
        standardName,
        score,
        issuedBy,
        validityYears,
      });

      res.status(201).json({
        success: true,
        message: 'Certificate created successfully',
        certificate,
      });
    } catch (error) {
      logger.error('Error creating certificate:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create certificate',
        error: error.message,
      });
    }
  }

  /**
   * Get certificate by ID
   * GET /api/certificates/:id
   */
  async getCertificateById(req, res) {
    try {
      const { id } = req.params;

      const certificate = await this.service.getCertificateById(id);

      res.json({
        success: true,
        certificate,
      });
    } catch (error) {
      logger.error('Error getting certificate:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found',
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve certificate',
        error: error.message,
      });
    }
  }

  /**
   * Get certificate by number
   * GET /api/certificates/number/:certificateNumber
   */
  async getCertificateByNumber(req, res) {
    try {
      const { certificateNumber } = req.params;

      const certificate = await this.service.getCertificateByNumber(certificateNumber);

      res.json({
        success: true,
        certificate,
      });
    } catch (error) {
      logger.error('Error getting certificate:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found',
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve certificate',
        error: error.message,
      });
    }
  }

  /**
   * Get certificates by user
   * GET /api/certificates/user/:userId
   */
  async getCertificatesByUser(req, res) {
    try {
      const { userId } = req.params;
      const { status, standardId } = req.query;

      // Verify permission
      const requestUserId = req.user?.userId || req.user?.id;
      if (requestUserId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const certificates = await this.service.getCertificatesByUser(userId, {
        status,
        standardId,
      });

      res.json({
        success: true,
        count: certificates.length,
        certificates,
      });
    } catch (error) {
      logger.error('Error getting certificates by user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve certificates',
        error: error.message,
      });
    }
  }

  /**
   * Get all certificates
   * GET /api/certificates
   */
  async getAllCertificates(req, res) {
    try {
      const { status, standardId, search, page = 1, limit = 20 } = req.query;

      const result = await this.service.getAllCertificates(
        { status, standardId, search },
        parseInt(page, 10),
        parseInt(limit, 10),
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logger.error('Error getting all certificates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve certificates',
        error: error.message,
      });
    }
  }

  /**
   * Verify certificate
   * GET /api/certificates/verify/:certificateNumber
   */
  async verifyCertificate(req, res) {
    try {
      const { certificateNumber } = req.params;
      const { code } = req.query;

      const result = await this.service.verifyCertificate(certificateNumber, code);

      res.json({
        success: result.valid,
        ...result,
      });
    } catch (error) {
      logger.error('Error verifying certificate:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify certificate',
        error: error.message,
      });
    }
  }

  /**
   * Renew certificate
   * POST /api/certificates/:id/renew
   */
  async renewCertificate(req, res) {
    try {
      const { id } = req.params;
      const { validityYears = 3 } = req.body;

      const renewedBy = req.user?.userId || req.user?.id;

      const newCertificate = await this.service.renewCertificate(id, renewedBy, validityYears);

      res.json({
        success: true,
        message: 'Certificate renewed successfully',
        certificate: newCertificate,
      });
    } catch (error) {
      logger.error('Error renewing certificate:', error);

      if (error.message.includes('only be renewed within')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to renew certificate',
        error: error.message,
      });
    }
  }

  /**
   * Revoke certificate
   * POST /api/certificates/:id/revoke
   */
  async revokeCertificate(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Revocation reason is required',
        });
      }

      const revokedBy = req.user?.userId || req.user?.id;

      const result = await this.service.revokeCertificate(id, reason, revokedBy);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logger.error('Error revoking certificate:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to revoke certificate',
        error: error.message,
      });
    }
  }

  /**
   * Download certificate
   * GET /api/certificates/:id/download
   */
  async downloadCertificate(req, res) {
    try {
      const { id } = req.params;

      const certificate = await this.service.getCertificateById(id);

      // Increment download count
      await this.service.incrementDownloadCount(id);

      // Check if PDF exists
      if (!certificate.pdfUrl) {
        return res.status(404).json({
          success: false,
          message: 'PDF not yet generated',
        });
      }

      res.json({
        success: true,
        message: 'Certificate ready for download',
        pdfUrl: certificate.pdfUrl,
        certificateNumber: certificate.certificateNumber,
      });
    } catch (error) {
      logger.error('Error downloading certificate:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download certificate',
        error: error.message,
      });
    }
  }

  /**
   * Get certificate statistics
   * GET /api/certificates/stats
   */
  async getCertificateStats(req, res) {
    try {
      const stats = await this.service.getCertificateStats();

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      logger.error('Error getting certificate stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve certificate statistics',
        error: error.message,
      });
    }
  }

  /**
   * Get expiring certificates
   * GET /api/certificates/expiring
   */
  async getExpiringCertificates(req, res) {
    try {
      const { days = 90 } = req.query;

      const certificates = await this.service.getExpiringCertificates(parseInt(days, 10));

      res.json({
        success: true,
        count: certificates.length,
        certificates,
      });
    } catch (error) {
      logger.error('Error getting expiring certificates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve expiring certificates',
        error: error.message,
      });
    }
  }

  /**
   * Update certificate PDF info
   * PUT /api/certificates/:id/pdf
   */
  async updatePDFInfo(req, res) {
    try {
      const { id } = req.params;
      const { pdfUrl } = req.body;

      if (!pdfUrl) {
        return res.status(400).json({
          success: false,
          message: 'PDF URL is required',
        });
      }

      const result = await this.service.updatePDFInfo(id, pdfUrl);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logger.error('Error updating PDF info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update PDF info',
        error: error.message,
      });
    }
  }
}

module.exports = CertificateController;
