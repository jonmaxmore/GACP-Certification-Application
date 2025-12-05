/**
 * Renew Certificate Use Case
 *
 * Business Logic: ต่ออายุใบรับรองที่ใกล้หมดอายุ
 *
 * Workflow:
 * 1. ตรวจสอบใบรับรองที่ขอต่ออายุ
 * 2. ตรวจสอบเงื่อนไขการต่ออายุ (ห่างจากหมดอายุไม่เกิน 90 วัน)
 * 3. ตรวจสอบสถานะฟาร์มยังคงสมเหตุสมผล
 * 4. สร้างใบรับรองใหม่พร้อมอายุใหม่
 * 5. อัปเดตสถานะใบรับรองเก่าเป็น RENEWED
 * 6. ส่ง event แจ้งเตือน
 */

const logger = require('../../../../shared/logger/logger');
const Certificate = require('../../domain/entities/Certificate');

class RenewCertificateUseCase {
  constructor({ certificateRepository, eventBus, farmVerificationService }) {
    this.certificateRepository = certificateRepository;
    this.eventBus = eventBus;
    this.farmVerificationService = farmVerificationService;
  }

  /**
   * ต่ออายุใบรับรอง
   * @param {Object} params - พารามิเตอร์การต่ออายุ
   * @param {string} params.certificateId - ID ของใบรับรองที่จะต่ออายุ
   * @param {string} params.renewedBy - ผู้ดำเนินการต่ออายุ
   * @param {number} params.validityPeriod - ระยะเวลาใหม่ (เดือน) ค่าเริ่มต้น 36 เดือน
   * @param {string} params.renewalReason - เหตุผลการต่ออายุ
   * @returns {Certificate} ใบรับรองที่ต่ออายุแล้ว
   */
  async execute({
    certificateId,
    renewedBy,
    validityPeriod = 36,
    renewalReason = 'Regular renewal',
  }) {
    try {
      logger.info(`🔄 Starting certificate renewal for: ${certificateId}`);

      // 1. ดึงใบรับรองที่ต้องการต่ออายุ
      const existingCertificate = await this.certificateRepository.findById(certificateId);
      if (!existingCertificate) {
        throw new Error(`Certificate not found: ${certificateId}`);
      }

      // 2. ตรวจสอบสถานะใบรับรอง
      if (existingCertificate.status !== 'ACTIVE') {
        throw new Error(`Cannot renew certificate with status: ${existingCertificate.status}`);
      }

      // 3. ตรวจสอบช่วงเวลาการต่ออายุ (ไม่เกิน 90 วันก่อนหมดอายุ)
      const now = new Date();
      const expiryDate = new Date(existingCertificate.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry > 90) {
        throw new Error(
          `Certificate renewal is only allowed within 90 days of expiry. Current days until expiry: ${daysUntilExpiry}`,
        );
      }

      if (daysUntilExpiry < 0) {
        throw new Error('Cannot renew expired certificate. Please apply for a new certificate.');
      }

      logger.info(`📅 Certificate expires in ${daysUntilExpiry} days - eligible for renewal`);

      // 4. ตรวจสอบสถานะฟาร์ม (optional verification)
      if (this.farmVerificationService) {
        const farmStatus = await this.farmVerificationService.verifyFarmStatus(
          existingCertificate.farmId,
        );
        if (!farmStatus.isActive) {
          throw new Error(`Farm is not active: ${farmStatus.reason}`);
        }
      }

      // 5. คำนวณวันหมดอายุใหม่
      const renewalDate = new Date();
      const newExpiryDate = new Date();
      newExpiryDate.setMonth(newExpiryDate.getMonth() + validityPeriod);

      // 6. อัปเดตใบรับรองเดิม
      existingCertificate.status = 'RENEWED';
      existingCertificate.renewalInfo = {
        renewedAt: renewalDate,
        renewedBy,
        renewalReason,
        newCertificateId: null, // จะอัปเดตหลังจากสร้างใบรับรองใหม่
      };

      await this.certificateRepository.save(existingCertificate);
      logger.info('📝 Updated existing certificate status to RENEWED');

      // 7. สร้างใบรับรองใหม่
      const renewedCertificate = Certificate.createRenewal({
        originalCertificateId: existingCertificate.id,
        originalCertificateNumber: existingCertificate.certificateNumber,
        farmId: existingCertificate.farmId,
        userId: existingCertificate.userId,
        farmerName: existingCertificate.farmerName,
        farmName: existingCertificate.farmName,
        farmLocation: existingCertificate.farmLocation,
        cropDetails: existingCertificate.cropDetails,
        certificationStandard: existingCertificate.certificationStandard,
        issuedDate: renewalDate,
        expiryDate: newExpiryDate,
        renewedBy,
        renewalReason,
      });

      const savedRenewedCertificate = await this.certificateRepository.save(renewedCertificate);
      logger.info(`✨ New certificate created: ${savedRenewedCertificate.certificateNumber}`);

      // 8. อัปเดต reference ในใบรับรองเดิม
      existingCertificate.renewalInfo.newCertificateId = savedRenewedCertificate.id;
      await this.certificateRepository.save(existingCertificate);

      // 9. ส่ง event แจ้งการต่ออายุ
      await this.eventBus.publish({
        type: 'CertificateRenewed',
        payload: {
          originalCertificateId: existingCertificate.id,
          originalCertificateNumber: existingCertificate.certificateNumber,
          newCertificateId: savedRenewedCertificate.id,
          newCertificateNumber: savedRenewedCertificate.certificateNumber,
          userId: savedRenewedCertificate.userId,
          farmId: savedRenewedCertificate.farmId,
          renewedBy,
          renewalDate,
          newExpiryDate,
          validityPeriod,
        },
        timestamp: new Date(),
      });

      console.log(
        `✅ Certificate renewal completed: ${existingCertificate.certificateNumber} → ${savedRenewedCertificate.certificateNumber}`,
      );
      return savedRenewedCertificate;
    } catch (error) {
      logger.error('❌ Certificate renewal failed:', error);

      // ส่ง event แจ้งการล้มเหลว
      await this.eventBus.publish({
        type: 'CertificateRenewalFailed',
        payload: {
          certificateId,
          error: error.message,
          renewedBy,
        },
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * ตรวจสอบว่าใบรับรองสามารถต่ออายุได้หรือไม่
   * @param {string} certificateId - ID ของใบรับรอง
   * @returns {Object} ผลการตรวจสอบ
   */
  async checkRenewalEligibility(certificateId) {
    try {
      const certificate = await this.certificateRepository.findById(certificateId);
      if (!certificate) {
        return { eligible: false, reason: 'Certificate not found' };
      }

      if (certificate.status !== 'ACTIVE') {
        return { eligible: false, reason: `Certificate status is ${certificate.status}` };
      }

      const now = new Date();
      const expiryDate = new Date(certificate.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry > 90) {
        return {
          eligible: false,
          reason: `Renewal available within 90 days of expiry. Days remaining: ${daysUntilExpiry}`,
        };
      }

      if (daysUntilExpiry < 0) {
        return { eligible: false, reason: 'Certificate has expired' };
      }

      return {
        eligible: true,
        daysUntilExpiry,
        certificate: certificate.toJSON(),
      };
    } catch (error) {
      logger.error('Error checking renewal eligibility:', error);
      return { eligible: false, reason: 'System error occurred' };
    }
  }
}

module.exports = RenewCertificateUseCase;
