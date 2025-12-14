const { createLogger } = require('../../../shared/logger');
const logger = createLogger('certificate-management-certificate-workflow-integration.service');

/**
 * Certificate Workflow Integration Service
 *
 * Purpose: เชื่อมต่อระหว่าง Application Workflow และ Certificate Management
 *
 * Business Logic:
 * 1. เมื่อ Application ได้รับการอนุมัติจาก DTAM → สร้างใบรับรอง
 * 2. เมื่อใบรับรองใกล้หมดอายุ → แจ้งเตือนเกษตรกร
 * 3. เมื่อมีการต่ออายุใบรับรอง → อัปเดตสถานะ
 * 4. เมื่อมีการยกเลิกใบรับรอง → บันทึก audit trail
 *
 * Integration Points:
 * - Application Module → Certificate Generation
 * - Notification Module → Certificate Alerts
 * - Audit Module → Certificate Tracking
 */

class CertificateWorkflowIntegration {
  constructor({
    certificateService,
    applicationService,
    notificationService,
    auditService,
    eventBus,
  }) {
    this.certificateService = certificateService;
    this.applicationService = applicationService;
    this.notificationService = notificationService;
    this.auditService = auditService;
    this.eventBus = eventBus;

    // ลงทะเบียน event listeners
    this._registerEventListeners();
  }

  /**
   * ลงทะเบียน event listeners สำหรับ workflow integration
   */
  _registerEventListeners() {
    // เมื่อ Application ได้รับการอนุมัติ → สร้างใบรับรอง
    this.eventBus.on('ApplicationDTAMApproved', this.handleApplicationApproved.bind(this));

    // เมื่อใบรับรองถูกสร้าง → อัปเดต application status
    this.eventBus.on('CertificateGenerated', this.handleCertificateGenerated.bind(this));

    // เมื่อใบรับรองใกล้หมดอายุ → ส่งการแจ้งเตือน
    this.eventBus.on('CertificateExpiringSoon', this.handleCertificateExpiringSoon.bind(this));

    // เมื่อใบรับรองหมดอายุ → อัปเดตสถานะ
    this.eventBus.on('CertificateExpired', this.handleCertificateExpired.bind(this));

    logger.info('🔗 Certificate workflow integration initialized');
  }

  /**
   * จัดการเมื่อ Application ได้รับการอนุมัติจาก DTAM
   * Workflow: Application (DTAM_APPROVED) → Certificate Generation
   */
  async handleApplicationApproved(event) {
    try {
      logger.info(`📋 Processing approved application: ${event.payload.applicationId}`);

      const { applicationId, applicationData, approvedBy } = event.payload;

      // 1. ตรวจสอบว่า application อยู่ในสถานะที่ถูกต้อง
      if (applicationData.status !== 'DTAM_APPROVED') {
        console.warn(
          `⚠️ Application ${applicationId} is not in DTAM_APPROVED status: ${applicationData.status}`,
        );
        return;
      }

      // 2. ตรวจสอบว่าใบรับรองยังไม่ถูกสร้าง
      const existingCertificate = await this.certificateService.findByApplicationId(applicationId);
      if (existingCertificate) {
        logger.warn(`⚠️ Certificate already exists for application: ${applicationId}`);
        return;
      }

      // 3. สร้างใบรับรอง
      logger.info(`🏆 Generating certificate for approved application: ${applicationId}`);

      const certificate = await this.certificateService.generateCertificate({
        applicationId,
        applicationData,
        issuedBy: approvedBy,
        validityPeriod: 36, // 3 years
      });

      logger.info(`✅ Certificate generated successfully: ${certificate.certificateNumber}`);

      // 4. ส่ง event แจ้งว่าใบรับรองถูกสร้างแล้ว
      await this.eventBus.publish({
        type: 'CertificateGenerated',
        payload: {
          certificateId: certificate.id,
          certificateNumber: certificate.certificateNumber,
          applicationId,
          userId: certificate.userId,
          farmId: certificate.farmId,
          issuedBy: approvedBy,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(
        `❌ Failed to process approved application: ${event.payload.applicationId}`,
        error,
      );

      // ส่ง event แจ้งการล้มเหลว
      await this.eventBus.publish({
        type: 'CertificateGenerationFailed',
        payload: {
          applicationId: event.payload.applicationId,
          error: error.message,
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * จัดการเมื่อใบรับรองถูกสร้างเสร็จ
   * Workflow: Certificate Generated → Update Application Status + Send Notifications
   */
  async handleCertificateGenerated(event) {
    try {
      logger.info(`🎉 Processing certificate generation: ${event.payload.certificateNumber}`);

      const { applicationId, certificateId, certificateNumber, userId, farmId } = event.payload;

      // 1. อัปเดตสถานะ Application เป็น CERTIFICATE_ISSUED
      await this.applicationService.updateStatus(applicationId, 'CERTIFICATE_ISSUED', {
        certificateId,
        certificateNumber,
        issuedAt: new Date(),
      });

      logger.info(`📝 Updated application status to CERTIFICATE_ISSUED: ${applicationId}`);

      // 2. ส่งการแจ้งเตือนไปยังเกษตรกร
      await this.notificationService.sendCertificateIssuedNotification({
        userId,
        farmId,
        certificateNumber,
        applicationId,
        channels: ['email', 'sms', 'in-app'],
      });

      logger.info(`📧 Sent certificate issued notification to user: ${userId}`);

      // 3. บันทึก audit log
      await this.auditService.logAction({
        action: 'CERTIFICATE_ISSUED',
        entityType: 'CERTIFICATE',
        entityId: certificateId,
        userId,
        metadata: {
          applicationId,
          certificateNumber,
          farmId,
        },
      });

      logger.info(`📋 Audit log recorded for certificate issuance: ${certificateNumber}`);
    } catch (error) {
      console.error(
        `❌ Failed to process certificate generation: ${event.payload.certificateNumber}`,
        error,
      );
    }
  }

  /**
   * จัดการเมื่อใบรับรองใกล้หมดอายุ
   * Workflow: Certificate Expiring Soon → Send Renewal Reminders
   */
  async handleCertificateExpiringSoon(event) {
    try {
      logger.info(`⏰ Processing expiring certificate: ${event.payload.certificateNumber}`);

      const { certificateId, certificateNumber, userId, farmId, daysUntilExpiry } = event.payload;

      // ส่งการแจ้งเตือนการต่ออายุ
      await this.notificationService.sendCertificateRenewalReminder({
        userId,
        farmId,
        certificateId,
        certificateNumber,
        daysUntilExpiry,
        channels: ['email', 'sms', 'in-app'],
      });

      console.log(
        `📨 Sent renewal reminder for certificate: ${certificateNumber} (${daysUntilExpiry} days)`,
      );

      // บันทึก audit log
      await this.auditService.logAction({
        action: 'CERTIFICATE_RENEWAL_REMINDER_SENT',
        entityType: 'CERTIFICATE',
        entityId: certificateId,
        userId,
        metadata: {
          certificateNumber,
          daysUntilExpiry,
          farmId,
        },
      });
    } catch (error) {
      console.error(
        `❌ Failed to process expiring certificate: ${event.payload.certificateNumber}`,
        error,
      );
    }
  }

  /**
   * จัดการเมื่อใบรับรองหมดอายุ
   * Workflow: Certificate Expired → Update Status + Send Notifications
   */
  async handleCertificateExpired(event) {
    try {
      logger.info(`⏲️ Processing expired certificate: ${event.payload.certificateNumber}`);

      const { certificateId, certificateNumber, userId, farmId } = event.payload;

      // 1. อัปเดตสถานะใบรับรองเป็น EXPIRED
      await this.certificateService.updateStatus(certificateId, 'EXPIRED');

      // 2. ส่งการแจ้งเตือนใบรับรองหมดอายุ
      await this.notificationService.sendCertificateExpiredNotification({
        userId,
        farmId,
        certificateId,
        certificateNumber,
        channels: ['email', 'sms', 'in-app'],
      });

      logger.info(`📧 Sent expiration notification for certificate: ${certificateNumber}`);

      // 3. บันทึก audit log
      await this.auditService.logAction({
        action: 'CERTIFICATE_EXPIRED',
        entityType: 'CERTIFICATE',
        entityId: certificateId,
        userId,
        metadata: {
          certificateNumber,
          farmId,
          expiredAt: new Date(),
        },
      });
    } catch (error) {
      console.error(
        `❌ Failed to process expired certificate: ${event.payload.certificateNumber}`,
        error,
      );
    }
  }

  /**
   * ตรวจสอบใบรับรองที่ใกล้หมดอายุ (Scheduled Task)
   * ควรรันทุกวันเวลา 08:00 น.
   */
  async checkExpiringSooonCertificates() {
    try {
      logger.info('🔍 Checking for expiring certificates...');

      // ค้นหาใบรับรองที่จะหมดอายุใน 30, 7, และ 1 วัน
      const expiringRanges = [30, 7, 1];

      for (const days of expiringRanges) {
        const expiringCertificates = await this.certificateService.findExpiringSoon(days);

        for (const certificate of expiringCertificates) {
          await this.eventBus.publish({
            type: 'CertificateExpiringSoon',
            payload: {
              certificateId: certificate.id,
              certificateNumber: certificate.certificateNumber,
              userId: certificate.userId,
              farmId: certificate.farmId,
              daysUntilExpiry: days,
              expiryDate: certificate.expiryDate,
            },
            timestamp: new Date(),
          });
        }

        console.log(
          `📊 Found ${expiringCertificates.length} certificates expiring in ${days} days`,
        );
      }
    } catch (error) {
      logger.error('❌ Failed to check expiring certificates:', error);
    }
  }

  /**
   * ตรวจสอบใบรับรองที่หมดอายุแล้ว (Scheduled Task)
   * ควรรันทุกวันเวลา 09:00 น.
   */
  async processExpiredCertificates() {
    try {
      logger.info('🔍 Processing expired certificates...');

      const expiredCertificates = await this.certificateService.findExpiredCertificates();

      for (const certificate of expiredCertificates) {
        await this.eventBus.publish({
          type: 'CertificateExpired',
          payload: {
            certificateId: certificate.id,
            certificateNumber: certificate.certificateNumber,
            userId: certificate.userId,
            farmId: certificate.farmId,
            expiredAt: new Date(),
          },
          timestamp: new Date(),
        });
      }

      logger.info(`📊 Processed ${expiredCertificates.length} expired certificates`);
    } catch (error) {
      logger.error('❌ Failed to process expired certificates:', error);
    }
  }
}

module.exports = CertificateWorkflowIntegration;
