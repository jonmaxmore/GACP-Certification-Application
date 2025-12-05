/**
 * Generate Certificate Use Case
 *
 * Business Logic: สร้างใบรับรองเมื่อ application ได้รับการอนุมัติ
 *
 * Workflow:
 * 1. รับ application ที่ผ่านการอนุมัติแล้ว (status = DTAM_APPROVED)
 * 2. สร้างเลขที่ใบรับรอง GACP-YYYY-NNNN
 * 3. สร้าง verification code
 * 4. สร้าง QR code สำหรับตรวจสอบ
 * 5. สร้างไฟล์ PDF
 * 6. บันทึกใบรับรองลงฐานข้อมูล
 * 7. ส่ง event แจ้งเตือนและอัปเดต application status
 */

const logger = require('../../../../shared/logger/logger');
const Certificate = require('../../domain/entities/Certificate');
const CertificateNumber = require('../../domain/value-objects/CertificateNumber');

class GenerateCertificateUseCase {
  constructor({ certificateRepository, pdfService, qrcodeService, eventBus }) {
    this.certificateRepository = certificateRepository;
    this.pdfService = pdfService;
    this.qrcodeService = qrcodeService;
    this.eventBus = eventBus;
  }

  /**
   * สร้างใบรับรองจาก application ที่อนุมัติแล้ว
   * @param {Object} params - พารามิเตอร์การสร้างใบรับรอง
   * @param {string} params.applicationId - ID ของ application
   * @param {Object} params.applicationData - ข้อมูล application ที่อนุมัติ
   * @param {string} params.issuedBy - ผู้ออกใบรับรอง (DTAM staff ID)
   * @param {number} params.validityPeriod - ระยะเวลาใช้งาน (เดือน) ค่าเริ่มต้น 36 เดือน
   * @returns {Certificate} ใบรับรองที่สร้างเสร็จ
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

      logger.info(`🏁 Starting certificate generation for application: ${applicationId}`);

      // 2. สร้างเลขที่ใบรับรอง
      const certificateNumber = await this._generateCertificateNumber();
      logger.info(`🔢 Generated certificate number: ${certificateNumber.value}`);

      // 3. สร้าง verification code
      const verificationCode = this._generateVerificationCode();

      // 4. คำนวณวันหมดอายุ
      const issuedDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + validityPeriod);

      // 5. สร้าง Certificate entity
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

      logger.info(`📋 Certificate entity created: ${certificate.certificateNumber}`);

      // 6. สร้าง QR Code
      const qrCodeData = {
        certificateNumber: certificate.certificateNumber,
        verificationCode: certificate.verificationCode,
        verifyUrl: `https://gacp.go.th/verify/${certificate.certificateNumber}`,
      };

      const qrCode = await this.qrcodeService.generateQRCode(qrCodeData);
      certificate.setQRCode(qrCode.url, qrCode.data);
      logger.info(`📱 QR Code generated: ${qrCode.url}`);

      // 7. สร้างไฟล์ PDF
      const pdfResult = await this.pdfService.generateCertificatePDF({
        ...certificate.toJSON(),
        qrCodeUrl: qrCode.url,
        applicationData,
      });

      certificate.setPDFInfo(pdfResult.url, pdfResult.path);
      logger.info(`📄 PDF generated: ${pdfResult.url}`);

      // 8. บันทึกลงฐานข้อมูล
      const savedCertificate = await this.certificateRepository.save(certificate);
      logger.info(`💾 Certificate saved to database: ${savedCertificate.id}`);

      // 9. ส่ง event แจ้งการออกใบรับรอง
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

      logger.info(`✅ Certificate generation completed: ${savedCertificate.certificateNumber}`);
      return savedCertificate;
    } catch (error) {
      logger.error('❌ Certificate generation failed:', error);

      // ส่ง event แจ้งการล้มเหลว
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
   * สร้างเลขที่ใบรับรองแบบ auto-increment
   * รูปแบบ: GACP-YYYY-NNNN
   */
  async _generateCertificateNumber() {
    const currentYear = new Date().getFullYear();
    const yearlyCount = await this.certificateRepository.getYearlyCount(currentYear);
    const nextNumber = yearlyCount + 1;

    return CertificateNumber.create(currentYear, nextNumber);
  }

  /**
   * สร้าง verification code สำหรับตรวจสอบความถูกต้อง
   */
  _generateVerificationCode() {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  /**
   * สร้าง unique ID สำหรับใบรับรอง
   */
  _generateCertificateId() {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
  }
}

module.exports = GenerateCertificateUseCase;
