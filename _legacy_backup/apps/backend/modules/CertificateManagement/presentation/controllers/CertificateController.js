/**
 * Certificate Controller
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Handle HTTP requests/responses and coordinate with application layer
 * - Receives HTTP requests
 * - Validates input (via validators)
 * - Calls Use Cases from Application Layer
 * - Returns formatted HTTP responses
 */

const {
  GenerateCertificateRequestDTO,
  CertificateResponseDTO,
  VerifyCertificateResponseDTO,
  RevokeCertificateRequestDTO,
  RenewCertificateRequestDTO,
  CertificateListQueryDTO,
} = require('../dto/CertificateDTO');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('certificate-management-certificate');

class CertificateController {
  constructor({
    generateCertificateUseCase,
    verifyCertificateUseCase,
    revokeCertificateUseCase,
    renewCertificateUseCase,
    listCertificatesUseCase,
    getCertificateUseCase,
  }) {
    this.generateCertificateUseCase = generateCertificateUseCase;
    this.verifyCertificateUseCase = verifyCertificateUseCase;
    this.revokeCertificateUseCase = revokeCertificateUseCase;
    this.renewCertificateUseCase = renewCertificateUseCase;
    this.listCertificatesUseCase = listCertificatesUseCase;
    this.getCertificateUseCase = getCertificateUseCase;
  }

  /**
   * Generate new certificate
   * POST /api/certificates/generate
   */
  async generateCertificate(req, res) {
    try {
      const requestDTO = new GenerateCertificateRequestDTO(req.body);

      // Additional validation if needed
      const validationErrors = requestDTO.validate();
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: validationErrors,
        });
      }

      const certificate = await this.generateCertificateUseCase.execute(
        requestDTO.toApplicationRequest(),
      );

      return res.status(201).json({
        success: true,
        message: 'Certificate generated successfully',
        data: CertificateResponseDTO.fromDomain(certificate),
      });
    } catch (error) {
      logger.error('Error generating certificate:', error);

      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return res.status(404).json({
          success: false,
          error: 'Resource Not Found',
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to generate certificate',
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

      const certificate = await this.getCertificateUseCase.execute({ id });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Certificate not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: CertificateResponseDTO.fromDomain(certificate),
      });
    } catch (error) {
      logger.error('Error getting certificate:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve certificate',
      });
    }
  }

  /**
   * List certificates with filters
   * GET /api/certificates
   */
  async listCertificates(req, res) {
    try {
      const queryDTO = new CertificateListQueryDTO(req.query);

      const validationErrors = queryDTO.validate();
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: validationErrors,
        });
      }

      const result = await this.listCertificatesUseCase.execute(queryDTO.toApplicationQuery());

      return res.status(200).json({
        success: true,
        data: CertificateResponseDTO.fromDomainList(result.certificates),
        pagination: {
          page: queryDTO.page,
          limit: queryDTO.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / queryDTO.limit),
        },
      });
    } catch (error) {
      logger.error('Error listing certificates:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve certificates',
      });
    }
  }

  /**
   * Verify certificate by ID or number
   * POST /api/certificates/:id/verify
   * GET /api/public/certificates/verify/:number
   */
  async verifyCertificate(req, res) {
    try {
      const identifier = req.params.id || req.params.number;

      const result = await this.verifyCertificateUseCase.execute({
        identifier,
      });

      const responseDTO = VerifyCertificateResponseDTO.fromVerificationResult(result);

      return res.status(200).json({
        success: true,
        data: responseDTO,
      });
    } catch (error) {
      logger.error('Error verifying certificate:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to verify certificate',
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
      const requestDTO = new RevokeCertificateRequestDTO(req.body);

      const validationErrors = requestDTO.validate();
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: validationErrors,
        });
      }

      const certificate = await this.revokeCertificateUseCase.execute({
        id,
        ...requestDTO.toApplicationRequest(),
      });

      return res.status(200).json({
        success: true,
        message: 'Certificate revoked successfully',
        data: CertificateResponseDTO.fromDomain(certificate),
      });
    } catch (error) {
      logger.error('Error revoking certificate:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Certificate not found',
        });
      }

      if (error.message.includes('already revoked')) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to revoke certificate',
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
      const requestDTO = new RenewCertificateRequestDTO(req.body);

      const validationErrors = requestDTO.validate();
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: validationErrors,
        });
      }

      const certificate = await this.renewCertificateUseCase.execute({
        id,
        ...requestDTO.toApplicationRequest(),
      });

      return res.status(200).json({
        success: true,
        message: 'Certificate renewed successfully',
        data: CertificateResponseDTO.fromDomain(certificate),
      });
    } catch (error) {
      logger.error('Error renewing certificate:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Certificate not found',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to renew certificate',
      });
    }
  }

  /**
   * Download certificate PDF
   * GET /api/certificates/:id/pdf
   */
  async downloadPDF(req, res) {
    try {
      const { id } = req.params;

      const certificate = await this.getCertificateUseCase.execute({ id });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Certificate not found',
        });
      }

      if (!certificate.pdfUrl) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'PDF not available for this certificate',
        });
      }

      // Redirect to PDF URL or serve file
      return res.redirect(certificate.pdfUrl);
    } catch (error) {
      logger.error('Error downloading PDF:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to download PDF',
      });
    }
  }

  /**
   * Get certificate QR code
   * GET /api/certificates/:id/qrcode
   */
  async getQRCode(req, res) {
    try {
      const { id } = req.params;

      const certificate = await this.getCertificateUseCase.execute({ id });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Certificate not found',
        });
      }

      if (!certificate.qrCodeUrl) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'QR code not available for this certificate',
        });
      }

      // Redirect to QR code URL or serve image
      return res.redirect(certificate.qrCodeUrl);
    } catch (error) {
      logger.error('Error getting QR code:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve QR code',
      });
    }
  }

  /**
   * Get certificate history
   * GET /api/certificates/:id/history
   */
  async getCertificateHistory(req, res) {
    try {
      const { id } = req.params;

      // This would call a dedicated use case for history
      // For now, return basic info
      const certificate = await this.getCertificateUseCase.execute({ id });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Certificate not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          certificateId: certificate.id,
          history: [
            {
              action: 'ISSUED',
              timestamp: certificate.issuedDate,
              by: certificate.issuedBy,
            },
            ...(certificate.revokedDate
              ? [
                  {
                    action: 'REVOKED',
                    timestamp: certificate.revokedDate,
                    by: certificate.revokedBy,
                    reason: certificate.revocationReason,
                  },
                ]
              : []),
            ...(certificate.renewedDate
              ? [
                  {
                    action: 'RENEWED',
                    timestamp: certificate.renewedDate,
                    by: certificate.renewedBy,
                  },
                ]
              : []),
          ],
        },
      });
    } catch (error) {
      logger.error('Error getting certificate history:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve certificate history',
      });
    }
  }
}

module.exports = CertificateController;
