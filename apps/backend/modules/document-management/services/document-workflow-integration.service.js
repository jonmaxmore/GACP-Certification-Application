const { createLogger } = require('../../../shared/logger');
const logger = createLogger('document-management-document-workflow-integration.service');

/**
 * Document Workflow Integration Service
 *
 * Purpose: เชื่อมต่อ Document Management กับ Application Workflow และ modules อื่นๆ
 *
 * Business Logic:
 * 1. เมื่อมีการอัปโหลดเอกสาร → ตรวจสอบและ validate
 * 2. เมื่อเอกสารผ่านการตรวจสอบ → อัปเดต application progress
 * 3. เมื่อเอกสารใกล้หมดอายุ → แจ้งเตือนเกษตรกร
 * 4. เมื่อ application ถูกอนุมัติ → สร้างเอกสารใบรับรอง
 *
 * Integration Points:
 * - Application Module → Document Requirements
 * - Certificate Module → PDF Generation
 * - Notification Module → Document Alerts
 * - Audit Module → Document Tracking
 */

class DocumentWorkflowIntegration {
  constructor({
    documentService,
    applicationService,
    certificateService,
    notificationService,
    auditService,
    eventBus,
  }) {
    this.documentService = documentService;
    this.applicationService = applicationService;
    this.certificateService = certificateService;
    this.notificationService = notificationService;
    this.auditService = auditService;
    this.eventBus = eventBus;

    // ลงทะเบียน event listeners
    this._registerEventListeners();
  }

  /**
   * ลงทะเบียน event listeners สำหรับ document workflow
   */
  _registerEventListeners() {
    // เมื่อมีการอัปโหลดเอกสาร → ตรวจสอบ
    this.eventBus.on('DocumentUploaded', this.handleDocumentUploaded.bind(this));

    // เมื่อเอกสารผ่านการตรวจสอบ → อัปเดต application
    this.eventBus.on('DocumentValidated', this.handleDocumentValidated.bind(this));

    // เมื่อเอกสารถูกปฏิเสธ → แจ้งเตือน
    this.eventBus.on('DocumentRejected', this.handleDocumentRejected.bind(this));

    // เมื่อใบรับรองถูกสร้าง → สร้างเอกสาร PDF
    this.eventBus.on('CertificateGenerated', this.handleCertificateGenerated.bind(this));

    // เมื่อเอกสารใกล้หมดอายุ → แจ้งเตือน
    this.eventBus.on('DocumentExpiringSoon', this.handleDocumentExpiringSoon.bind(this));

    logger.info('📁 Document workflow integration initialized');
  }

  /**
   * จัดการเมื่อมีการอัปโหลดเอกสาร
   * Workflow: Document Upload → Validation → Security Check → Application Update
   */
  async handleDocumentUploaded(event) {
    try {
      logger.info(`📄 Processing uploaded document: ${event.payload.documentId}`);

      const { documentId, applicationId, documentType, userId } = event.payload;

      // 1. ดึงข้อมูลเอกสาร
      const document = await this.documentService.getDocumentById(documentId);
      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      // 2. ตรวจสอบความปลอดภัย (Virus Scan)
      logger.info(`🔍 Starting security validation for: ${documentId}`);
      const securityCheck = await this.documentService.performSecurityCheck(documentId);

      if (!securityCheck.safe) {
        await this._handleUnsafeDocument(documentId, securityCheck.threats, userId);
        return;
      }

      // 3. ตรวจสอบเนื้อหาเอกสาร (OCR + Validation)
      logger.info(`📋 Starting content validation for: ${documentId}`);
      const contentValidation = await this.documentService.validateDocumentContent(
        documentId,
        documentType,
      );

      if (!contentValidation.valid) {
        await this.eventBus.publish({
          type: 'DocumentValidationFailed',
          payload: {
            documentId,
            applicationId,
            userId,
            errors: contentValidation.errors,
            documentType,
          },
          timestamp: new Date(),
        });
        return;
      }

      // 4. อัปเดตสถานะเอกสารเป็น VALIDATED
      await this.documentService.updateDocumentStatus(documentId, 'VALIDATED', {
        validatedAt: new Date(),
        validationResults: contentValidation,
      });

      // 5. ส่ง event แจ้งว่าเอกสารผ่านการตรวจสอบ
      await this.eventBus.publish({
        type: 'DocumentValidated',
        payload: {
          documentId,
          applicationId,
          documentType,
          userId,
          validationResults: contentValidation,
        },
        timestamp: new Date(),
      });

      logger.info(`✅ Document validation completed: ${documentId}`);
    } catch (error) {
      logger.error(`❌ Document upload processing failed: ${event.payload.documentId}`, error);

      await this.eventBus.publish({
        type: 'DocumentProcessingFailed',
        payload: {
          documentId: event.payload.documentId,
          error: error.message,
          userId: event.payload.userId,
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * จัดการเมื่อเอกสารผ่านการตรวจสอบ
   * Workflow: Document Validated → Update Application Progress → Check Completeness
   */
  async handleDocumentValidated(event) {
    try {
      logger.info(`✅ Processing validated document: ${event.payload.documentId}`);

      const { documentId, applicationId, documentType, userId } = event.payload;

      // 1. อัปเดต application progress
      await this.applicationService.updateDocumentProgress(applicationId, documentType, {
        documentId,
        status: 'VALIDATED',
        validatedAt: new Date(),
      });

      logger.info(`📝 Updated application progress: ${applicationId}`);

      // 2. ตรวจสอบว่าเอกสารครบหรือยัง
      // const application = await this.applicationService.getApplicationById(applicationId);
      const completenessCheck =
        await this.applicationService.checkDocumentCompleteness(applicationId);

      if (completenessCheck.isComplete) {
        // เอกสารครบแล้ว → อัปเดตสถานะ application
        await this.applicationService.updateStatus(applicationId, 'DOCUMENTS_COMPLETE');

        logger.info(`🎉 All documents completed for application: ${applicationId}`);

        // ส่ง event แจ้งว่าเอกสารครบแล้ว
        await this.eventBus.publish({
          type: 'ApplicationDocumentsComplete',
          payload: {
            applicationId,
            userId,
            completedAt: new Date(),
          },
          timestamp: new Date(),
        });
      }

      // 3. ส่งการแจ้งเตือนไปยังเกษตรกร
      await this.notificationService.sendDocumentValidatedNotification({
        userId,
        applicationId,
        documentType,
        documentId,
        channels: ['email', 'in-app'],
      });

      // 4. บันทึก audit log
      await this.auditService.logAction({
        action: 'DOCUMENT_VALIDATED',
        entityType: 'DOCUMENT',
        entityId: documentId,
        userId,
        metadata: {
          applicationId,
          documentType,
        },
      });
    } catch (error) {
      logger.error(`❌ Document validation processing failed: ${event.payload.documentId}`, error);
    }
  }

  /**
   * จัดการเมื่อเอกสารถูกปฏิเสธ
   * Workflow: Document Rejected → Notify User → Update Application
   */
  async handleDocumentRejected(event) {
    try {
      logger.info(`❌ Processing rejected document: ${event.payload.documentId}`);

      const { documentId, applicationId, userId, rejectionReasons } = event.payload;

      // 1. อัปเดตสถานะเอกสารเป็น REJECTED
      await this.documentService.updateDocumentStatus(documentId, 'REJECTED', {
        rejectedAt: new Date(),
        rejectionReasons,
      });

      // 2. อัปเดต application progress
      await this.applicationService.updateDocumentProgress(
        applicationId,
        event.payload.documentType,
        {
          documentId,
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReasons,
        },
      );

      // 3. ส่งการแจ้งเตือนไปยังเกษตรกร
      await this.notificationService.sendDocumentRejectedNotification({
        userId,
        applicationId,
        documentType: event.payload.documentType,
        rejectionReasons,
        channels: ['email', 'sms', 'in-app'],
      });

      // 4. บันทึก audit log
      await this.auditService.logAction({
        action: 'DOCUMENT_REJECTED',
        entityType: 'DOCUMENT',
        entityId: documentId,
        userId,
        metadata: {
          applicationId,
          rejectionReasons,
        },
      });

      logger.info(`📧 Document rejection notifications sent for: ${documentId}`);
    } catch (error) {
      logger.error(`❌ Document rejection processing failed: ${event.payload.documentId}`, error);
    }
  }

  /**
   * จัดการเมื่อใบรับรองถูกสร้าง
   * Workflow: Certificate Generated → Create PDF Document → Link to Application
   */
  async handleCertificateGenerated(event) {
    try {
      logger.info(`🏆 Processing certificate generation: ${event.payload.certificateNumber}`);

      const { certificateId, certificateNumber, applicationId, userId } = event.payload;

      // 1. ดึงข้อมูลใบรับรอง
      const certificate = await this.certificateService.getCertificateById(certificateId);
      if (!certificate) {
        throw new Error(`Certificate not found: ${certificateId}`);
      }

      // 2. สร้างเอกสาร PDF ใบรับรอง
      const pdfDocument = await this.documentService.createCertificatePDF({
        certificate,
        applicationId,
        documentType: 'CERTIFICATE_PDF',
        userId,
      });

      logger.info(`📄 Certificate PDF created: ${pdfDocument.id}`);

      // 3. Link เอกสาร PDF กับใบรับรอง
      await this.certificateService.updateCertificatePDF(certificateId, {
        documentId: pdfDocument.id,
        pdfUrl: pdfDocument.downloadUrl,
        generatedAt: new Date(),
      });

      // 4. ส่งการแจ้งเตือนพร้อมลิงก์ดาวน์โหลด
      await this.notificationService.sendCertificateReadyNotification({
        userId,
        applicationId,
        certificateNumber,
        downloadUrl: pdfDocument.downloadUrl,
        channels: ['email', 'sms', 'in-app'],
      });

      // 5. บันทึก audit log
      await this.auditService.logAction({
        action: 'CERTIFICATE_PDF_GENERATED',
        entityType: 'DOCUMENT',
        entityId: pdfDocument.id,
        userId,
        metadata: {
          certificateId,
          certificateNumber,
          applicationId,
        },
      });

      logger.info(`✅ Certificate PDF workflow completed: ${certificateNumber}`);
    } catch (error) {
      console.error(
        `❌ Certificate PDF generation failed: ${event.payload.certificateNumber}`,
        error,
      );
    }
  }

  /**
   * จัดการเมื่อเอกสารใกล้หมดอายุ
   * Workflow: Document Expiring → Send Renewal Reminders
   */
  async handleDocumentExpiringSoon(event) {
    try {
      logger.info(`⏰ Processing expiring document: ${event.payload.documentId}`);

      const { documentId, userId, documentType, daysUntilExpiry } = event.payload;

      // ส่งการแจ้งเตือนการต่ออายุเอกสาร
      await this.notificationService.sendDocumentRenewalReminder({
        userId,
        documentId,
        documentType,
        daysUntilExpiry,
        channels: ['email', 'sms', 'in-app'],
      });

      logger.info(`📨 Document renewal reminder sent: ${documentId} (${daysUntilExpiry} days);`);

      // บันทึก audit log
      await this.auditService.logAction({
        action: 'DOCUMENT_RENEWAL_REMINDER_SENT',
        entityType: 'DOCUMENT',
        entityId: documentId,
        userId,
        metadata: {
          documentType,
          daysUntilExpiry,
        },
      });
    } catch (error) {
      logger.error(`❌ Document expiry processing failed: ${event.payload.documentId}`, error);
    }
  }

  /**
   * จัดการเอกสารที่ไม่ปลอดภัย
   */
  async _handleUnsafeDocument(documentId, threats, userId) {
    // อัปเดตสถานะเอกสารเป็น QUARANTINED
    await this.documentService.updateDocumentStatus(documentId, 'QUARANTINED', {
      quarantinedAt: new Date(),
      threats,
    });

    // ส่งการแจ้งเตือนความปลอดภัย
    await this.notificationService.sendSecurityAlertNotification({
      userId,
      documentId,
      threats,
      channels: ['email', 'in-app'],
    });

    // บันทึก security audit log
    await this.auditService.logSecurityEvent({
      event: 'UNSAFE_DOCUMENT_DETECTED',
      entityType: 'DOCUMENT',
      entityId: documentId,
      userId,
      severity: 'HIGH',
      metadata: { threats },
    });

    logger.info(`🚨 Unsafe document quarantined: ${documentId}`);
  }

  /**
   * ตรวจสอบเอกสารที่ใกล้หมดอายุ (Scheduled Task)
   * ควรรันทุกวันเวลา 08:00 น.
   */
  async checkExpiringDocuments() {
    try {
      logger.info('🔍 Checking for expiring documents...');

      // ค้นหาเอกสารที่จะหมดอายุใน 30, 7, และ 1 วัน
      const expiringRanges = [30, 7, 1];

      for (const days of expiringRanges) {
        const expiringDocuments = await this.documentService.findDocumentsExpiringSoon(days);

        for (const document of expiringDocuments) {
          await this.eventBus.publish({
            type: 'DocumentExpiringSoon',
            payload: {
              documentId: document.id,
              userId: document.userId,
              documentType: document.documentType,
              daysUntilExpiry: days,
              expiryDate: document.expiryDate,
            },
            timestamp: new Date(),
          });
        }

        logger.info(`📊 Found ${expiringDocuments.length} documents expiring in ${days} days`);
      }
    } catch (error) {
      logger.error('❌ Failed to check expiring documents:', error);
    }
  }
}

module.exports = DocumentWorkflowIntegration;
