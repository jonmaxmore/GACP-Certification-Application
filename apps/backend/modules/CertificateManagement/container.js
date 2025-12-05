/**
 * Certificate Module - Dependency Injection Container
 * Clean Architecture Pattern
 *
 * Purpose: Wire up all layers following Clean Architecture principles
 * Flow: Infrastructure → Domain → Application → Presentation
 */

/* eslint-disable no-unused-vars */
const logger = require('../../shared/logger/logger');
const Certificate = require('./domain/entities/Certificate'); // Used for type documentation
const CertificateNumber = require('./domain/value-objects/CertificateNumber'); // Used for type documentation
/* eslint-enable no-unused-vars */

// Application Layer - Use Cases
const GenerateCertificateUseCase = require('./application/use-cases/generate-certificate-usecase');
const VerifyCertificateUseCase = require('./application/use-cases/verify-certificate-usecase');
const RevokeCertificateUseCase = require('./application/use-cases/revoke-certificate-usecase');

// Infrastructure Layer
const MongoDBCertificateRepository = require('./infrastructure/database/certificate-model');

// Presentation Layer
const CertificateController = require('./presentation/controllers/certificate-controller');
const setupCertificateRoutes = require('./presentation/routes/certificate.routes');

/**
 * Create certificate management module with Clean Architecture
 * @param {Object} dependencies - External dependencies
 * @returns {Object} Configured module with router and services
 */
function createCertificateModuleV2(dependencies = {}) {
  const { database, pdfService, qrcodeService, eventBus, middleware = {} } = dependencies;

  // Validate required dependencies
  if (!database) {
    throw new Error('Database connection is required');
  }

  // ============================================
  // INFRASTRUCTURE LAYER
  // ============================================

  const certificateRepository = new MongoDBCertificateRepository(database);

  // ============================================
  // APPLICATION LAYER - Use Cases
  // ============================================

  const generateCertificateUseCase = new GenerateCertificateUseCase({
    certificateRepository,
    pdfService: pdfService || createMockPDFService(),
    qrcodeService: qrcodeService || createMockQRCodeService(),
    eventBus: eventBus || createMockEventBus(),
  });

  const verifyCertificateUseCase = new VerifyCertificateUseCase({
    certificateRepository,
  });

  const revokeCertificateUseCase = new RevokeCertificateUseCase({
    certificateRepository,
    eventBus: eventBus || createMockEventBus(),
  });

  // Temporary use cases (to be moved to proper files)
  const renewCertificateUseCase = createRenewCertificateUseCase(certificateRepository, eventBus);
  const listCertificatesUseCase = createListCertificatesUseCase(certificateRepository);
  const getCertificateUseCase = createGetCertificateUseCase(certificateRepository);

  // ============================================
  // PRESENTATION LAYER
  // ============================================

  const certificateController = new CertificateController({
    generateCertificateUseCase,
    verifyCertificateUseCase,
    revokeCertificateUseCase,
    renewCertificateUseCase,
    listCertificatesUseCase,
    getCertificateUseCase,
  });

  const certificateRouter = setupCertificateRoutes(certificateController, middleware);

  // ============================================
  // MODULE EXPORTS
  // ============================================

  return {
    router: certificateRouter,
    services: {
      certificateRepository,
      generateCertificateUseCase,
      verifyCertificateUseCase,
      revokeCertificateUseCase,
      renewCertificateUseCase,
      listCertificatesUseCase,
      getCertificateUseCase,
    },
    controller: certificateController,
  };
}

// ============================================
// TEMPORARY USE CASE IMPLEMENTATIONS
// ============================================

function createRenewCertificateUseCase(certificateRepository, eventBus) {
  return {
    async execute({ id, validityPeriod, renewedBy }) {
      const certificate = await certificateRepository.findById(id);
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      const newExpiryDate = new Date();
      newExpiryDate.setMonth(newExpiryDate.getMonth() + validityPeriod);
      certificate.renew(newExpiryDate, renewedBy);

      const updated = await certificateRepository.save(certificate);

      if (eventBus) {
        await eventBus.publish({
          type: 'CertificateRenewed',
          payload: { certificateId: updated.id, renewedBy },
        });
      }

      return updated;
    },
  };
}

function createListCertificatesUseCase(certificateRepository) {
  return {
    async execute({ filters, pagination, sort }) {
      const certificates = await certificateRepository.findWithFilters({
        ...filters,
        skip: (pagination.page - 1) * pagination.limit,
        limit: pagination.limit,
        sort: { [sort.field]: sort.order === 'asc' ? 1 : -1 },
      });

      const total = await certificateRepository.countByStatus(filters.status);
      return { certificates, total };
    },
  };
}

function createGetCertificateUseCase(certificateRepository) {
  return {
    async execute({ id }) {
      return await certificateRepository.findById(id);
    },
  };
}

// ============================================
// MOCK SERVICES
// ============================================

function createMockPDFService() {
  return {
    async generateCertificatePDF(certificate) {
      logger.warn('⚠️ Using mock PDF service');
      return {
        url: `/certificates/${certificate.id}/certificate.pdf`,
        path: `/tmp/certificates/${certificate.certificateNumber}.pdf`,
      };
    },
  };
}

function createMockQRCodeService() {
  return {
    async generateQRCode(data) {
      logger.warn('⚠️ Using mock QR code service');
      return {
        url: `/certificates/qr/${data.certificateNumber}.png`,
        data: `https://gacp.go.th/verify/${data.certificateNumber}`,
      };
    },
  };
}

function createMockEventBus() {
  return {
    async publish(event) {
      logger.info('📢 Event published:', event.type);
    },
  };
}

module.exports = createCertificateModuleV2;
