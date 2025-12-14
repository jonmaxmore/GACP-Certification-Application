const { createLogger } = require('../../shared/logger');
const logger = createLogger('gacp-system-orchestrator');

/**
 * GACP Platform System Integration Orchestrator
 *
 * Purpose: เป็น central coordinator ที่จัดการ workflow ทั้งหมดของระบบ GACP
 *
 * Business Logic Flow:
 * 1. Application Submission → Document Upload → Validation → Approval → Certificate Generation
 * 2. User Management → Role-based Access → Permission Control
 * 3. Payment Processing → Fee Calculation → Payment Verification
 * 4. Notification System → Multi-channel Alerts → Status Updates
 * 5. Audit Logging → Compliance Tracking → Report Generation
 *
 * Integration Architecture:
 * - Event-driven communication between modules
 * - Centralized error handling and retry mechanisms
 * - Workflow state management and recovery
 * - Business rule enforcement across modules
 * - Cross-module data consistency validation
 */

class GACPSystemOrchestrator {
  constructor({
    applicationService,
    userManagementService,
    documentService,
    paymentService,
    certificateService,
    notificationService,
    auditService,
    reportingService,
    eventBus,
    configService,
  }) {
    this.services = {
      application: applicationService,
      userManagement: userManagementService,
      document: documentService,
      payment: paymentService,
      certificate: certificateService,
      notification: notificationService,
      audit: auditService,
      reporting: reportingService,
    };

    this.eventBus = eventBus;
    this.configService = configService;
    this.workflowStates = new Map();
    this.businessRules = this._initializeBusinessRules();

    // Initialize event listeners
    this._registerSystemEventListeners();

    logger.info('🎯 GACP System Orchestrator initialized');
  }

  /**
   * ลงทะเบียน system-level event listeners
   */
  _registerSystemEventListeners() {
    // Application Workflow Events
    this.eventBus.on('ApplicationSubmitted', this.handleApplicationSubmitted.bind(this));
    this.eventBus.on('ApplicationDocumentsComplete', this.handleDocumentsComplete.bind(this));
    this.eventBus.on('ApplicationPaymentComplete', this.handlePaymentComplete.bind(this));
    this.eventBus.on('ApplicationDTAMApproved', this.handleApplicationApproved.bind(this));
    this.eventBus.on('CertificateGenerated', this.handleCertificateGenerated.bind(this));

    // Cross-module Events
    this.eventBus.on('UserRoleChanged', this.handleUserRoleChanged.bind(this));
    this.eventBus.on('SystemAlert', this.handleSystemAlert.bind(this));
    this.eventBus.on('BusinessRuleViolation', this.handleBusinessRuleViolation.bind(this));

    logger.info('📡 System event listeners registered');
  }

  /**
   * จัดการเมื่อมีการส่ง Application
   * Complete Workflow: Submission → Document Requirements → Payment → Review
   */
  async handleApplicationSubmitted(event) {
    try {
      logger.info(`🚀 Processing application submission: ${event.payload.applicationId}`);

      const { applicationId, userId, applicationData } = event.payload;

      // 1. Initialize workflow state
      await this._initializeWorkflowState(applicationId, 'APPLICATION_SUBMITTED', {
        userId,
        submittedAt: new Date(),
        currentStage: 'DOCUMENT_COLLECTION',
        requiredDocuments: this._getRequiredDocuments(applicationData),
        businessRules: this._getApplicableBusinessRules(applicationData),
      });

      // 2. Validate business rules
      const ruleValidation = await this._validateBusinessRules(applicationData, 'SUBMISSION');
      if (!ruleValidation.valid) {
        await this._handleBusinessRuleViolation(applicationId, ruleValidation.violations);
        return;
      }

      // 3. Calculate and create payment record
      const paymentInfo = await this.services.payment.calculateApplicationFees(applicationData);
      await this.services.payment.createPaymentRecord({
        applicationId,
        userId,
        amount: paymentInfo.totalAmount,
        feeBreakdown: paymentInfo.breakdown,
        dueDate: this._calculatePaymentDueDate(),
      });

      logger.info(`💰 Payment record created: ฿${paymentInfo.totalAmount}`);

      // 4. Send welcome notification with next steps
      await this.services.notification.sendApplicationSubmittedNotification({
        userId,
        applicationId,
        requiredDocuments: this._getRequiredDocuments(applicationData),
        paymentInfo,
        nextSteps: this._getNextSteps('DOCUMENT_COLLECTION'),
        channels: ['email', 'sms', 'in-app'],
      });

      // 5. Schedule follow-up reminders
      await this._scheduleWorkflowReminders(applicationId, 'DOCUMENT_COLLECTION');

      // 6. Log audit trail
      await this.services.audit.logWorkflowAction({
        action: 'APPLICATION_WORKFLOW_STARTED',
        entityType: 'APPLICATION',
        entityId: applicationId,
        userId,
        metadata: {
          stage: 'DOCUMENT_COLLECTION',
          paymentAmount: paymentInfo.totalAmount,
          requiredDocuments: this._getRequiredDocuments(applicationData).length,
        },
      });

      logger.info(`✅ Application submission workflow initialized: ${applicationId}`);
    } catch (error) {
      console.error(
        `❌ Application submission workflow failed: ${event.payload.applicationId}`,
        error,
      );
      await this._handleWorkflowError(event.payload.applicationId, 'SUBMISSION', error);
    }
  }

  /**
   * จัดการเมื่อเอกสารครบถ้วน
   * Workflow: Documents Complete → Payment Verification → QC Review
   */
  async handleDocumentsComplete(event) {
    try {
      logger.info(`📄 Processing documents completion: ${event.payload.applicationId}`);

      const { applicationId, userId } = event.payload;

      // 1. Update workflow state
      await this._updateWorkflowState(applicationId, 'DOCUMENTS_COMPLETE', {
        documentsCompletedAt: new Date(),
        currentStage: 'PAYMENT_VERIFICATION',
        nextAction: 'VERIFY_PAYMENT',
      });

      // 2. Check payment status
      const paymentStatus = await this.services.payment.getPaymentStatus(applicationId);

      if (paymentStatus.isPaid) {
        // Payment already completed → Move to QC review
        await this._triggerQCReview(applicationId, userId);
      } else {
        // Send payment reminder
        await this.services.notification.sendPaymentReminderNotification({
          userId,
          applicationId,
          paymentInfo: paymentStatus,
          urgency: 'NORMAL',
          channels: ['email', 'sms', 'in-app'],
        });

        logger.info(`💰 Payment reminder sent for application: ${applicationId}`);
      }

      // 3. Generate interim progress report
      const progressReport = await this._generateProgressReport(applicationId);
      await this.services.reporting.saveProgressReport(applicationId, progressReport);

      // 4. Log milestone
      await this.services.audit.logWorkflowMilestone({
        action: 'DOCUMENTS_COMPLETED',
        applicationId,
        userId,
        milestone: 'DOCUMENT_COLLECTION',
        nextStage: paymentStatus.isPaid ? 'QC_REVIEW' : 'PAYMENT_VERIFICATION',
      });

      logger.info(`✅ Documents completion processed: ${applicationId}`);
    } catch (error) {
      console.error(
        `❌ Documents completion processing failed: ${event.payload.applicationId}`,
        error,
      );
      await this._handleWorkflowError(event.payload.applicationId, 'DOCUMENTS_COMPLETE', error);
    }
  }

  /**
   * จัดการเมื่อการชำระเงินเสร็จสิ้น
   * Workflow: Payment Complete → QC Assignment → Review Process
   */
  async handlePaymentComplete(event) {
    try {
      logger.info(`💰 Processing payment completion: ${event.payload.applicationId}`);

      const { applicationId, userId, paymentData } = event.payload;

      // 1. Update workflow state
      await this._updateWorkflowState(applicationId, 'PAYMENT_COMPLETE', {
        paymentCompletedAt: new Date(),
        paymentAmount: paymentData.amount,
        currentStage: 'QC_REVIEW',
        nextAction: 'ASSIGN_QC_OFFICER',
      });

      // 2. Trigger QC review process
      await this._triggerQCReview(applicationId, userId);

      // 3. Send payment confirmation
      await this.services.notification.sendPaymentConfirmationNotification({
        userId,
        applicationId,
        paymentData,
        nextSteps: this._getNextSteps('QC_REVIEW'),
        channels: ['email', 'sms', 'in-app'],
      });

      // 4. Update financial reporting
      await this.services.reporting.updateFinancialMetrics({
        applicationId,
        paymentAmount: paymentData.amount,
        paymentDate: new Date(),
        category: 'APPLICATION_FEE',
      });

      logger.info(`✅ Payment completion processed: ${applicationId}`);
    } catch (error) {
      console.error(
        `❌ Payment completion processing failed: ${event.payload.applicationId}`,
        error,
      );
      await this._handleWorkflowError(event.payload.applicationId, 'PAYMENT_COMPLETE', error);
    }
  }

  /**
   * จัดการเมื่อ Application ได้รับการอนุมัติ
   * Workflow: DTAM Approval → Certificate Generation → Final Notifications
   */
  async handleApplicationApproved(event) {
    try {
      logger.info(`🎉 Processing application approval: ${event.payload.applicationId}`);

      const { applicationId, userId, approvedBy, applicationData } = event.payload;

      // 1. Update workflow state
      await this._updateWorkflowState(applicationId, 'DTAM_APPROVED', {
        approvedAt: new Date(),
        approvedBy,
        currentStage: 'CERTIFICATE_GENERATION',
        nextAction: 'GENERATE_CERTIFICATE',
      });

      // 2. Validate final business rules
      const finalValidation = await this._validateBusinessRules(applicationData, 'APPROVAL');
      if (!finalValidation.valid) {
        await this._handleBusinessRuleViolation(applicationId, finalValidation.violations);
        return;
      }

      // 3. Trigger certificate generation
      await this.services.certificate.generateCertificate({
        applicationId,
        applicationData,
        issuedBy: approvedBy,
        validityPeriod: 36, // 3 years
      });

      // 4. Send approval notification
      await this.services.notification.sendApplicationApprovedNotification({
        userId,
        applicationId,
        approvedBy,
        nextSteps: this._getNextSteps('CERTIFICATE_GENERATION'),
        channels: ['email', 'sms', 'in-app'],
      });

      // 5. Update success metrics
      await this.services.reporting.updateSuccessMetrics({
        applicationId,
        approvalDate: new Date(),
        processingTime: await this._calculateProcessingTime(applicationId),
        approvedBy,
      });

      logger.info(`✅ Application approval processed: ${applicationId}`);
    } catch (error) {
      console.error(
        `❌ Application approval processing failed: ${event.payload.applicationId}`,
        error,
      );
      await this._handleWorkflowError(event.payload.applicationId, 'APPROVAL', error);
    }
  }

  /**
   * จัดการเมื่อใบรับรองถูกสร้าง
   * Workflow: Certificate Generated → Final Documentation → Completion
   */
  async handleCertificateGenerated(event) {
    try {
      logger.info(`🏆 Processing certificate generation: ${event.payload.certificateNumber}`);

      const { applicationId, certificateId, certificateNumber, userId } = event.payload;

      // 1. Update workflow state to completion
      await this._updateWorkflowState(applicationId, 'CERTIFICATE_ISSUED', {
        certificateIssuedAt: new Date(),
        certificateId,
        certificateNumber,
        currentStage: 'COMPLETED',
        workflowStatus: 'SUCCESS',
      });

      // 2. Generate final completion report
      const completionReport = await this._generateCompletionReport(applicationId);
      await this.services.reporting.saveCompletionReport(applicationId, completionReport);

      // 3. Send final success notification
      await this.services.notification.sendCertificateIssuedNotification({
        userId,
        applicationId,
        certificateId,
        certificateNumber,
        downloadInstructions: this._getCertificateDownloadInstructions(certificateId),
        channels: ['email', 'sms', 'in-app'],
      });

      // 4. Schedule post-issuance follow-ups
      await this._schedulePostIssuanceFollowUps(applicationId, certificateId);

      // 5. Log successful completion
      await this.services.audit.logWorkflowCompletion({
        action: 'WORKFLOW_COMPLETED_SUCCESS',
        applicationId,
        certificateId,
        userId,
        totalProcessingTime: await this._calculateProcessingTime(applicationId),
        completedAt: new Date(),
      });

      logger.info(`🎯 Certificate generation workflow completed: ${certificateNumber}`);
    } catch (error) {
      console.error(
        `❌ Certificate generation processing failed: ${event.payload.certificateNumber}`,
        error,
      );
      await this._handleWorkflowError(event.payload.applicationId, 'CERTIFICATE_GENERATION', error);
    }
  }

  /**
   * จัดการเมื่อมีการเปลี่ยนบทบาทผู้ใช้
   * Cross-module Impact: Permissions → Access Control → Audit
   */
  async handleUserRoleChanged(event) {
    try {
      logger.info(`👤 Processing user role change: ${event.payload.userId}`);

      const { userId, oldRole, newRole, changedBy } = event.payload;

      // 1. Validate role change permissions
      const roleChangeValidation = await this.services.userManagement.validateRoleChange(
        changedBy,
        oldRole,
        newRole,
      );

      if (!roleChangeValidation.valid) {
        throw new Error(`Unauthorized role change: ${roleChangeValidation.reason}`);
      }

      // 2. Update access permissions across all modules
      await this._updateCrossModulePermissions(userId, newRole);

      // 3. Audit security implications
      await this.services.audit.logSecurityEvent({
        event: 'USER_ROLE_CHANGED',
        userId,
        severity: this._calculateRoleChangeSeverity(oldRole, newRole),
        metadata: {
          oldRole,
          newRole,
          changedBy,
          timestamp: new Date(),
        },
      });

      // 4. Send role change notification
      await this.services.notification.sendRoleChangeNotification({
        userId,
        oldRole,
        newRole,
        changedBy,
        newPermissions: await this.services.userManagement.getUserPermissions(userId),
        channels: ['email', 'in-app'],
      });

      logger.info(`✅ User role change processed: ${userId} (${oldRole} → ${newRole});`);
    } catch (error) {
      logger.error(`❌ User role change processing failed: ${event.payload.userId}`, error);
      await this._handleSystemError('USER_ROLE_CHANGE', error, event.payload);
    }
  }

  /**
   * Initialize workflow state tracking
   */
  async _initializeWorkflowState(applicationId, status, metadata) {
    const workflowState = {
      applicationId,
      status,
      startedAt: new Date(),
      currentStage: metadata.currentStage,
      history: [
        {
          status,
          timestamp: new Date(),
          metadata,
        },
      ],
      ...metadata,
    };

    this.workflowStates.set(applicationId, workflowState);

    // Persist to database
    await this.services.application.saveWorkflowState(applicationId, workflowState);
  }

  /**
   * Update workflow state
   */
  async _updateWorkflowState(applicationId, status, metadata) {
    const existingState =
      this.workflowStates.get(applicationId) ||
      (await this.services.application.getWorkflowState(applicationId));

    if (!existingState) {
      throw new Error(`Workflow state not found for application: ${applicationId}`);
    }

    // Add to history
    existingState.history.push({
      status,
      timestamp: new Date(),
      metadata,
    });

    // Update current state
    Object.assign(existingState, {
      status,
      lastUpdated: new Date(),
      ...metadata,
    });

    this.workflowStates.set(applicationId, existingState);

    // Persist to database
    await this.services.application.saveWorkflowState(applicationId, existingState);
  }

  /**
   * Trigger QC Review Process
   */
  async _triggerQCReview(applicationId, _userId) {
    // 1. Find available QC officer
    const qcOfficer = await this.services.userManagement.findAvailableQCOfficer({
      workload: 'LIGHT',
      province: await this._getApplicationProvince(applicationId),
    });

    if (!qcOfficer) {
      throw new Error('No available QC officer found');
    }

    // 2. Assign application to QC
    await this.services.application.assignQCOfficer(applicationId, qcOfficer.id);

    // 3. Update workflow state
    await this._updateWorkflowState(applicationId, 'QC_ASSIGNED', {
      qcOfficerId: qcOfficer.id,
      assignedAt: new Date(),
      currentStage: 'QC_REVIEW',
      nextAction: 'QC_INSPECTION',
    });

    // 4. Notify QC officer
    await this.services.notification.sendQCAssignmentNotification({
      userId: qcOfficer.id,
      applicationId,
      assignmentDetails: await this._getQCAssignmentDetails(applicationId),
      channels: ['email', 'in-app'],
    });

    logger.info(`👨‍🔬 QC Officer assigned: ${qcOfficer.id} for application: ${applicationId}`);
  }

  /**
   * Validate business rules
   */
  async _validateBusinessRules(applicationData, stage) {
    const applicableRules = this.businessRules[stage] || [];
    const violations = [];

    for (const rule of applicableRules) {
      const result = await rule.validate(applicationData);
      if (!result.valid) {
        violations.push({
          rule: rule.name,
          violation: result.message,
          severity: rule.severity,
          field: result.field,
        });
      }
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  /**
   * Initialize business rules
   */
  _initializeBusinessRules() {
    return {
      SUBMISSION: [
        {
          name: 'FARMER_AGE_REQUIREMENT',
          severity: 'HIGH',
          validate: async data => {
            const age = this._calculateAge(data.farmerProfile.birthDate);
            return {
              valid: age >= 18,
              message: age < 18 ? 'Farmer must be at least 18 years old' : null,
              field: 'farmerProfile.birthDate',
            };
          },
        },
        {
          name: 'FARM_SIZE_MINIMUM',
          severity: 'HIGH',
          validate: async data => {
            const farmSize = data.farmProfile.totalArea;
            return {
              valid: farmSize >= 0.25, // Minimum 0.25 rai
              message: farmSize < 0.25 ? 'Farm size must be at least 0.25 rai' : null,
              field: 'farmProfile.totalArea',
            };
          },
        },
        {
          name: 'VALID_FARM_LOCATION',
          severity: 'HIGH',
          validate: async data => {
            const location = data.farmProfile.location;
            const isValidProvince = await this._validateProvince(location.province);
            return {
              valid: isValidProvince,
              message: !isValidProvince ? 'Invalid farm province' : null,
              field: 'farmProfile.location.province',
            };
          },
        },
      ],
      APPROVAL: [
        {
          name: 'ALL_DOCUMENTS_VALIDATED',
          severity: 'CRITICAL',
          validate: async data => {
            const documentStatus = await this.services.document.getDocumentCompleteness(
              data.applicationId,
            );
            return {
              valid: documentStatus.allValidated,
              message: !documentStatus.allValidated
                ? 'Not all required documents are validated'
                : null,
              field: 'documents',
            };
          },
        },
        {
          name: 'PAYMENT_COMPLETED',
          severity: 'CRITICAL',
          validate: async data => {
            const paymentStatus = await this.services.payment.getPaymentStatus(data.applicationId);
            return {
              valid: paymentStatus.isPaid,
              message: !paymentStatus.isPaid ? 'Payment not completed' : null,
              field: 'payment',
            };
          },
        },
      ],
    };
  }

  /**
   * Handle business rule violations
   */
  async _handleBusinessRuleViolation(applicationId, violations) {
    logger.error(`❌ Business rule violations for application: ${applicationId}`, violations);

    // Update application status
    await this.services.application.updateStatus(applicationId, 'BUSINESS_RULE_VIOLATION', {
      violations,
      violatedAt: new Date(),
    });

    // Send violation notification
    const application = await this.services.application.getApplicationById(applicationId);
    await this.services.notification.sendBusinessRuleViolationNotification({
      userId: application.userId,
      applicationId,
      violations,
      correctionInstructions: this._getViolationCorrectionInstructions(violations),
      channels: ['email', 'in-app'],
    });

    // Log audit event
    await this.services.audit.logBusinessRuleViolation({
      applicationId,
      violations,
      timestamp: new Date(),
    });
  }

  /**
   * Handle workflow errors
   */
  async _handleWorkflowError(applicationId, stage, error) {
    logger.error(`❌ Workflow error in ${stage} for application: ${applicationId}`, error);

    // Update workflow state
    await this._updateWorkflowState(applicationId, 'ERROR', {
      errorStage: stage,
      errorMessage: error.message,
      errorAt: new Date(),
      requiresManualIntervention: true,
    });

    // Send error notification to administrators
    await this.services.notification.sendSystemErrorNotification({
      applicationId,
      stage,
      error: error.message,
      timestamp: new Date(),
      channels: ['email'],
    });

    // Log critical audit event
    await this.services.audit.logSystemError({
      event: 'WORKFLOW_ERROR',
      applicationId,
      stage,
      error: error.message,
      severity: 'HIGH',
      timestamp: new Date(),
    });
  }

  /**
   * Calculate processing time
   */
  async _calculateProcessingTime(applicationId) {
    const workflowState =
      this.workflowStates.get(applicationId) ||
      (await this.services.application.getWorkflowState(applicationId));

    if (!workflowState) {
      return null;
    }

    const startTime = new Date(workflowState.startedAt);
    const endTime = new Date();

    return {
      totalDays: Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)),
      totalHours: Math.ceil((endTime - startTime) / (1000 * 60 * 60)),
      businessDays: this._calculateBusinessDays(startTime, endTime),
    };
  }

  /**
   * Get required documents for application type
   */
  _getRequiredDocuments(applicationData) {
    const baseDocuments = ['FARM_LICENSE', 'ID_CARD', 'LAND_DOCUMENT'];

    // Add conditional documents based on application type
    if (applicationData.farmProfile.certificationStandard === 'GAP') {
      baseDocuments.push('GAP_CERTIFICATE');
    }

    if (applicationData.farmProfile.totalArea > 10) {
      baseDocuments.push('CROP_DETAILS');
    }

    return baseDocuments;
  }

  /**
   * Calculate payment due date
   */
  _calculatePaymentDueDate() {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from submission
    return dueDate;
  }

  /**
   * Get next steps for current stage
   */
  _getNextSteps(stage) {
    const nextSteps = {
      DOCUMENT_COLLECTION: [
        'อัปโหลดเอกสารที่จำเป็นทั้งหมด',
        'ตรวจสอบความถูกต้องของเอกสาร',
        'ชำระค่าธรรมเนียม',
      ],
      PAYMENT_VERIFICATION: ['ชำระค่าธรรมเนียมการสมัคร', 'รอการตรวจสอบการชำระเงิน'],
      QC_REVIEW: ['รอการตรวจสอบจากเจ้าหน้าที่ QC', 'อาจมีการนัดหมายตรวจสอบพื้นที่'],
      CERTIFICATE_GENERATION: ['รอการออกใบรับรอง', 'จะได้รับการแจ้งเตือนเมื่อใบรับรองพร้อม'],
    };

    return nextSteps[stage] || [];
  }

  /**
   * Calculate business days between dates
   */
  _calculateBusinessDays(startDate, endDate) {
    let count = 0;
    const curDate = new Date(startDate);

    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }

    return count;
  }
}

module.exports = GACPSystemOrchestrator;
