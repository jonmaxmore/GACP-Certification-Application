/**
 * Generate Certificate Use Case
 *
 * Business Logic: เธชเธฃเนเธฒเธเนเธเธฃเธฑเธเธฃเธญเธเน€เธกเธทเนเธญ application เนเธ”เนเธฃเธฑเธเธเธฒเธฃเธญเธเธธเธกเธฑเธ•เธด
 *
 * Workflow:
 * 1. เธฃเธฑเธ application เธ—เธตเนเธเนเธฒเธเธเธฒเธฃเธญเธเธธเธกเธฑเธ•เธดเนเธฅเนเธง (status = DTAM_APPROVED)
 * 2. เธชเธฃเนเธฒเธเน€เธฅเธเธ—เธตเนเนเธเธฃเธฑเธเธฃเธญเธ GACP-YYYY-NNNN
 * 3. เธชเธฃเนเธฒเธ verification code
 * 4. เธชเธฃเนเธฒเธ QR code เธชเธณเธซเธฃเธฑเธเธ•เธฃเธงเธเธชเธญเธ
 * 5. เธชเธฃเนเธฒเธเนเธเธฅเน PDF
 * 6. เธเธฑเธเธ—เธถเธเนเธเธฃเธฑเธเธฃเธญเธเธฅเธเธเธฒเธเธเนเธญเธกเธนเธฅ
 * 7. เธชเนเธ event เนเธเนเธเน€เธ•เธทเธญเธเนเธฅเธฐเธญเธฑเธเน€เธ”เธ• application status
 */

const logger = require('../../../../shared/logger/logger');
const Certificate = require('../../domain/entities/Certificate');
const CertificateNumber = require('../../domain/value-objects/certificate-number');

class GenerateCertificateUseCase {
  constructor({ certificateRepository, pdfService, qrcodeService, eventBus }) {
    this.certificateRepository = certificateRepository;
    this.pdfService = pdfService;
    this.qrcodeService = qrcodeService;
    this.eventBus = eventBus;
  }

  /**
   * เธชเธฃเนเธฒเธเนเธเธฃเธฑเธเธฃเธญเธเธเธฒเธ application เธ—เธตเนเธญเธเธธเธกเธฑเธ•เธดเนเธฅเนเธง
   * @param {Object} params - เธเธฒเธฃเธฒเธกเธดเน€เธ•เธญเธฃเนเธเธฒเธฃเธชเธฃเนเธฒเธเนเธเธฃเธฑเธเธฃเธญเธ
   * @param {string} params.applicationId - ID เธเธญเธ application
   * @param {Object} params.applicationData - เธเนเธญเธกเธนเธฅ application เธ—เธตเนเธญเธเธธเธกเธฑเธ•เธด
   * @param {string} params.issuedBy - เธเธนเนเธญเธญเธเนเธเธฃเธฑเธเธฃเธญเธ (DTAM staff ID)
   * @param {number} params.validityPeriod - เธฃเธฐเธขเธฐเน€เธงเธฅเธฒเนเธเนเธเธฒเธ (เน€เธ”เธทเธญเธ) เธเนเธฒเน€เธฃเธดเนเธกเธ•เนเธ 36 เน€เธ”เธทเธญเธ
   * @returns {Certificate} เนเธเธฃเธฑเธเธฃเธญเธเธ—เธตเนเธชเธฃเนเธฒเธเน€เธชเธฃเนเธ
   */
  async execute({ applicationId, applicationData, issuedBy, validityPeriod = 36 }) {
    try {
      // 1. Validate input and application status
      if (!applicationId || !applicationData || !issuedBy) {
        throw new Error('ApplicationId, applicationData, and issuedBy are required');
      }

      if (applicationData.status !== 'DTAM_APPROVED') {
        throw new Error(
          `Cannot generate certificate. Application status is ${applicationData.status}, expected DTAM_APPROVED`,
        );
      }

      logger.info(`๐ Starting certificate generation for application: ${applicationId}`);

      // 2. เธชเธฃเนเธฒเธเน€เธฅเธเธ—เธตเนเนเธเธฃเธฑเธเธฃเธญเธ
      const certificateNumber = await this._generateCertificateNumber();
      logger.info(`๐”ข Generated certificate number: ${certificateNumber.value}`);

      // 3. เธชเธฃเนเธฒเธ verification code
      const verificationCode = this._generateVerificationCode();

      // 4. เธเธณเธเธงเธ“เธงเธฑเธเธซเธกเธ”เธญเธฒเธขเธธ
      const issuedDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + validityPeriod);

      // 5. เธชเธฃเนเธฒเธ Certificate entity
      const certificate = Certificate.create({
        id: this._generateCertificateId(),
        certificateNumber: certificateNumber.value,
        applicationId,
        farmId: applicationData.farmId,
        userId: applicationData.userId,
        farmerName: applicationData.farmerProfile.fullName,
        farmName: applicationData.farmProfile.name,
        farmLocation: {
          province: applicationData.farmProfile.location.province,
          district: applicationData.farmProfile.location.district,
          subdistrict: applicationData.farmProfile.location.subdistrict,
          coordinates: applicationData.farmProfile.location.coordinates,
        },
        cropDetails: applicationData.farmProfile.cropDetails,
        certificationStandard: applicationData.farmProfile.certificationStandard || 'GACP',
        issuedDate,
        expiryDate,
        verificationCode,
        issuedBy,
        status: 'ACTIVE',
      });

      logger.info(`๐“ Certificate entity created: ${certificate.certificateNumber}`);

      // 6. เธชเธฃเนเธฒเธ QR Code
      const qrCodeData = {
        certificateNumber: certificate.certificateNumber,
        verificationCode: certificate.verificationCode,
        verifyUrl: `https://gacp.go.th/verify/${certificate.certificateNumber}`,
      };

      const qrCode = await this.qrcodeService.generateQRCode(qrCodeData);
      certificate.setQRCode(qrCode.url, qrCode.data);
      logger.info(`๐“ฑ QR Code generated: ${qrCode.url}`);

      // 7. เธชเธฃเนเธฒเธเนเธเธฅเน PDF
      const pdfResult = await this.pdfService.generateCertificatePDF({
        ...certificate.toJSON(),
        qrCodeUrl: qrCode.url,
        applicationData,
      });

      certificate.setPDFInfo(pdfResult.url, pdfResult.path);
      logger.info(`๐“ PDF generated: ${pdfResult.url}`);

      // 8. เธเธฑเธเธ—เธถเธเธฅเธเธเธฒเธเธเนเธญเธกเธนเธฅ
      const savedCertificate = await this.certificateRepository.save(certificate);
      logger.info(`๐’พ Certificate saved to database: ${savedCertificate.id}`);

      // 9. เธชเนเธ event เนเธเนเธเธเธฒเธฃเธญเธญเธเนเธเธฃเธฑเธเธฃเธญเธ
      await this.eventBus.publish({
        type: 'CertificateGenerated',
        payload: {
          certificateId: savedCertificate.id,
          certificateNumber: savedCertificate.certificateNumber,
          applicationId,
          userId: savedCertificate.userId,
          farmId: savedCertificate.farmId,
          issuedBy,
          issuedDate,
          expiryDate,
        },
        timestamp: new Date(),
      });

      logger.info(`โ… Certificate generation completed: ${savedCertificate.certificateNumber}`);
      return savedCertificate;
    } catch (error) {
      logger.error('โ Certificate generation failed:', error);

      // เธชเนเธ event เนเธเนเธเธเธฒเธฃเธฅเนเธกเน€เธซเธฅเธง
      await this.eventBus.publish({
        type: 'CertificateGenerationFailed',
        payload: {
          applicationId,
          error: error.message,
          issuedBy,
        },
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * เธชเธฃเนเธฒเธเน€เธฅเธเธ—เธตเนเนเธเธฃเธฑเธเธฃเธญเธเนเธเธ auto-increment
   * เธฃเธนเธเนเธเธ: GACP-YYYY-NNNN
   */
  async _generateCertificateNumber() {
    const currentYear = new Date().getFullYear();
    const yearlyCount = await this.certificateRepository.getYearlyCount(currentYear);
    const nextNumber = yearlyCount + 1;

    return CertificateNumber.create(currentYear, nextNumber);
  }

  /**
   * เธชเธฃเนเธฒเธ verification code เธชเธณเธซเธฃเธฑเธเธ•เธฃเธงเธเธชเธญเธเธเธงเธฒเธกเธ–เธนเธเธ•เนเธญเธ
   */
  _generateVerificationCode() {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  /**
   * เธชเธฃเนเธฒเธ unique ID เธชเธณเธซเธฃเธฑเธเนเธเธฃเธฑเธเธฃเธญเธ
   */
  _generateCertificateId() {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
  }
}

module.exports = GenerateCertificateUseCase;
