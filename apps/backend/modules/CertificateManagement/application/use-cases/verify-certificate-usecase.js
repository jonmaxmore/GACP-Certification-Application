const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('certificate-management-verify-certificate');

/**
 * Verify Certificate Use Case
 *
 * Business Logic: ตรวจสอบความถูกต้องของใบรับรอง (Public Service)
 *
 * Workflow:
 * 1. รับเลขที่ใบรับรองและ verification code (ถ้ามี)
 * 2. ค้นหาใบรับรองในระบบ
 * 3. ตรวจสอบสถานะและความถูกต้อง
 * 4. บันทึกการตรวจสอบ
 * 5. ส่งผลการตรวจสอบ
 */

class VerifyCertificateUseCase {
  constructor({ certificateRepository, auditService }) {
    this.certificateRepository = certificateRepository;
    this.auditService = auditService;
  }

  /**
   * ตรวจสอบใบรับรอง (Public API)
   * @param {Object} params - พารามิเตอร์การตรวจสอบ
   * @param {string} params.certificateNumber - เลขที่ใบรับรอง
   * @param {string} params.verificationCode - รหัสตรวจสอบ (optional)
   * @param {string} params.clientIP - IP ของผู้ตรวจสอบ
   * @returns {Object} ผลการตรวจสอบ
   */
  async execute({ certificateNumber, verificationCode, clientIP }) {
    try {
      logger.info(`🔍 Verifying certificate: ${certificateNumber}`);

      // 1. Validate input
      if (!certificateNumber) {
        throw new Error('Certificate number is required');
      }

      // 2. ค้นหาใบรับรองในระบบ
      const certificate =
        await this.certificateRepository.findByCertificateNumber(certificateNumber);

      if (!certificate) {
        await this._logVerificationAttempt({
          certificateNumber,
          verificationCode,
          clientIP,
          result: 'NOT_FOUND',
          timestamp: new Date(),
        });

        return {
          isValid: false,
          status: 'NOT_FOUND',
          message: 'ไม่พบใบรับรองในระบบ',
          details: {
            certificateNumber,
            verifiedAt: new Date(),
          },
        };
      }

      // 3. ตรวจสอบ verification code (ถ้ามี)
      if (verificationCode && certificate.verificationCode !== verificationCode) {
        await this._logVerificationAttempt({
          certificateNumber,
          verificationCode,
          clientIP,
          result: 'INVALID_CODE',
          certificateId: certificate.id,
          timestamp: new Date(),
        });

        return {
          isValid: false,
          status: 'INVALID_CODE',
          message: 'รหัสตรวจสอบไม่ถูกต้อง',
          details: {
            certificateNumber,
            verifiedAt: new Date(),
          },
        };
      }

      // 4. ตรวจสอบสถานะใบรับรอง
      const validationResult = this._validateCertificateStatus(certificate);

      // 5. บันทึกการตรวจสอบ
      certificate.incrementVerificationCount();
      await this.certificateRepository.save(certificate);

      await this._logVerificationAttempt({
        certificateNumber,
        verificationCode,
        clientIP,
        result: validationResult.status,
        certificateId: certificate.id,
        timestamp: new Date(),
      });

      // 6. ส่งผลการตรวจสอบ
      if (validationResult.isValid) {
        logger.info(`✅ Certificate verification successful: ${certificateNumber}`);

        return {
          isValid: true,
          status: 'VALID',
          message: 'ใบรับรองถูกต้องและใช้งานได้',
          certificate: {
            certificateNumber: certificate.certificateNumber,
            farmerName: certificate.farmerName,
            farmName: certificate.farmName,
            farmLocation: certificate.farmLocation,
            certificationStandard: certificate.certificationStandard,
            issuedDate: certificate.issuedDate,
            expiryDate: certificate.expiryDate,
            status: certificate.status,
            verificationCount: certificate.verificationCount,
          },
          details: {
            verifiedAt: new Date(),
            daysUntilExpiry: this._calculateDaysUntilExpiry(certificate.expiryDate),
          },
        };
      } else {
        console.log(
          `❌ Certificate verification failed: ${certificateNumber} - ${validationResult.message}`,
        );

        return {
          isValid: false,
          status: validationResult.status,
          message: validationResult.message,
          certificate: {
            certificateNumber: certificate.certificateNumber,
            status: certificate.status,
            farmerName: certificate.farmerName,
            farmName: certificate.farmName,
          },
          details: {
            verifiedAt: new Date(),
            ...validationResult.details,
          },
        };
      }
    } catch (error) {
      logger.error('❌ Certificate verification error:', error);

      // บันทึก error
      await this._logVerificationAttempt({
        certificateNumber,
        verificationCode,
        clientIP,
        result: 'ERROR',
        error: error.message,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * ตรวจสอบสถานะและความถูกต้องของใบรับรอง
   */
  _validateCertificateStatus(certificate) {
    const now = new Date();
    const expiryDate = new Date(certificate.expiryDate);

    // ตรวจสอบสถานะ
    switch (certificate.status) {
      case 'ACTIVE': {
        // ตรวจสอบว่าหมดอายุหรือยัง
        if (expiryDate < now) {
          return {
            isValid: false,
            status: 'EXPIRED',
            message: 'ใบรับรองหมดอายุแล้ว',
            details: {
              expiredDate: expiryDate,
              expiredDays: Math.ceil((now - expiryDate) / (1000 * 60 * 60 * 24)),
            },
          };
        }

        // ตรวจสอบว่าใกล้หมดอายุหรือไม่
        const daysUntilExpiry = this._calculateDaysUntilExpiry(expiryDate);
        if (daysUntilExpiry <= 30) {
          return {
            isValid: true,
            status: 'VALID_EXPIRING_SOON',
            message: `ใบรับรองใช้งานได้ แต่จะหมดอายุใน ${daysUntilExpiry} วัน`,
            details: { daysUntilExpiry },
          };
        }

        return {
          isValid: true,
          status: 'VALID',
          message: 'ใบรับรองถูกต้องและใช้งานได้',
        };
      }

      case 'REVOKED':
        return {
          isValid: false,
          status: 'REVOKED',
          message: 'ใบรับรองถูกยกเลิกแล้ว',
          details: {
            revokedDate: certificate.revocationInfo?.revokedAt,
            revokedReason: certificate.revocationInfo?.reason,
          },
        };

      case 'RENEWED':
        return {
          isValid: false,
          status: 'RENEWED',
          message: 'ใบรับรองได้ถูกต่ออายุแล้ว กรุณาใช้ใบรับรองฉบับใหม่',
          details: {
            renewedDate: certificate.renewalInfo?.renewedAt,
            newCertificateId: certificate.renewalInfo?.newCertificateId,
          },
        };

      default:
        return {
          isValid: false,
          status: 'INVALID',
          message: `สถานะใบรับรองไม่ถูกต้อง: ${certificate.status}`,
        };
    }
  }

  /**
   * คำนวณจำนวนวันจนกว่าจะหมดอายุ
   */
  _calculateDaysUntilExpiry(expiryDate) {
    const now = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  }

  /**
   * บันทึกการตรวจสอบเพื่อการ audit
   */
  async _logVerificationAttempt(logData) {
    try {
      if (this.auditService) {
        await this.auditService.logVerification(logData);
      } else {
        logger.info('📝 Verification attempt:', logData);
      }
    } catch (error) {
      logger.error('Failed to log verification attempt:', error);
      // ไม่ throw error เพราะไม่ควรให้การ log ทำให้การตรวจสอบล้มเหลว
    }
  }
}

module.exports = VerifyCertificateUseCase;
