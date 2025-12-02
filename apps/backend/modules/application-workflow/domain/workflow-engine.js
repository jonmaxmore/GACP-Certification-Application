/**
 * Application Workflow Engine
 *
 * Orchestrates the complete GACP certification workflow using the State Machine.
 * Handles business logic, notifications, audit logging, and integration points.
 *
 * Business Process Integration:
 * - State transition management with validation
 * - Payment processing coordination
 * - Notification system integration
 * - Job ticket creation for DTAM staff
 * - Audit trail for compliance
 * - Document management lifecycle
 * - SLA monitoring and escalation
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../shared/logger/logger');
const EventEmitter = require('events');
const ApplicationStateMachine = require('./StateMachine');

class ApplicationWorkflowEngine extends EventEmitter {
  constructor(dependencies = {}) {
    super();

    // Initialize State Machine
    this.stateMachine = new ApplicationStateMachine();

    // Inject dependencies (will be provided by DI container)
    this.applicationRepo = dependencies.applicationRepository;
    this.userRepo = dependencies.userRepository;
    this.documentRepo = dependencies.documentRepository;
    this.notificationService = dependencies.notificationService;
    this.paymentService = dependencies.paymentService;
    this.auditService = dependencies.auditService;
    this.jobTicketService = dependencies.jobTicketService;
    this.certificateService = dependencies.certificateService;

    // Configuration
    this.config = {
      maxRevisionAttempts: 3,
      autoExpireJobHours: 72,
      slaWarningHours: 24,
      reminderIntervalHours: 48,
    };

    logger.info('[ApplicationWorkflowEngine] Initialized successfully');
  }

  /**
   * Initialize new application in DRAFT state
   * @param {Object} applicationData - Initial application data
   * @param {string} farmerId - Farmer ID creating the application
   * @returns {Promise<Object>} - Created application
   */
  async createApplication(applicationData, farmerId) {
    try {
      // Validate farmer exists and is active
      const farmer = await this.userRepo.findById(farmerId);
      if (!farmer || farmer.role !== 'FARMER' || !farmer.isActive) {
        throw new Error('Invalid or inactive farmer account');
      }

      // Generate application number
      const applicationNumber = await this._generateApplicationNumber();

      // Create application in DRAFT state
      const application = await this.applicationRepo.create({
        ...applicationData,
        applicationNumber,
        farmerId,
        farmerEmail: farmer.email,
        status: this.stateMachine.STATES.DRAFT,
        workflowHistory: [
          {
            state: this.stateMachine.STATES.DRAFT,
            enteredAt: new Date(),
            actor: farmerId,
            actorRole: 'FARMER',
            notes: 'Application created',
          },
        ],
        revisionCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create audit log
      await this._createAuditLog(application.id, 'APPLICATION_CREATED', {
        farmerId,
        applicationNumber,
        state: this.stateMachine.STATES.DRAFT,
      });

      // Emit event
      this.emit('application.created', {
        applicationId: application.id,
        farmerId,
        state: this.stateMachine.STATES.DRAFT,
      });

      return application;
    } catch (error) {
      logger.error('[WorkflowEngine] Error creating application:', error);
      throw error;
    }
  }

  /**
   * Submit application for review
   * @param {string} applicationId - Application ID
   * @param {string} userId - User performing the action
   * @returns {Promise<Object>} - Updated application
   */
  async submitApplication(applicationId, userId) {
    try {
      const application = await this.applicationRepo.findById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // Validate transition
      const validation = this.stateMachine.validateTransition(
        application,
        this.stateMachine.STATES.SUBMITTED,
        'FARMER',
        { documents: application.documents },
      );

      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Perform submission checks
      await this._validateSubmissionRequirements(application);

      // Transition to SUBMITTED
      const updatedApplication = await this._transitionState(
        application,
        this.stateMachine.STATES.SUBMITTED,
        userId,
        'FARMER',
        'Application submitted for review',
      );

      // Auto-transition to UNDER_REVIEW after submission
      setTimeout(async () => {
        await this._autoTransitionToReview(updatedApplication.id);
      }, 1000);

      return updatedApplication;
    } catch (error) {
      logger.error('[WorkflowEngine] Error submitting application:', error);
      throw error;
    }
  }

  /**
   * Reviewer approves application for payment
   * @param {string} applicationId - Application ID
   * @param {string} reviewerId - Reviewer ID
   * @param {Object} reviewData - Review details
   * @returns {Promise<Object>} - Updated application
   */
  async approveForPayment(applicationId, reviewerId, reviewData) {
    try {
      const application = await this.applicationRepo.findById(applicationId);

      // Validate transition
      const validation = this.stateMachine.validateTransition(
        application,
        this.stateMachine.STATES.PAYMENT_PENDING,
        'DTAM_REVIEWER',
      );

      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Update application with review data
      await this.applicationRepo.update(applicationId, {
        review: {
          reviewerId,
          completedAt: new Date(),
          approved: true,
          findings: reviewData.findings || [],
          notes: reviewData.notes,
        },
      });

      // Transition to PAYMENT_PENDING
      const updatedApplication = await this._transitionState(
        application,
        this.stateMachine.STATES.PAYMENT_PENDING,
        reviewerId,
        'DTAM_REVIEWER',
        `Review completed. Approved for payment. ${reviewData.notes || ''}`,
      );

      // Generate payment QR code
      const paymentData = await this.paymentService.generatePayment({
        applicationId,
        amount: 5000,
        phase: 1,
        description: `GACP Certification Phase 1 - ${application.applicationNumber}`,
      });

      // Update application with payment info
      await this.applicationRepo.update(applicationId, {
        'payment.phase1': paymentData,
      });

      // Send notification to farmer
      await this._sendNotification(application.farmerId, 'PAYMENT_REQUIRED', {
        applicationNumber: application.applicationNumber,
        amount: 5000,
        phase: 1,
        paymentUrl: paymentData.paymentUrl,
        qrCode: paymentData.qrCode,
      });

      return updatedApplication;
    } catch (error) {
      logger.error('[WorkflowEngine] Error approving for payment:', error);
      throw error;
    }
  }

  /**
   * Request revision from farmer
   * @param {string} applicationId - Application ID
   * @param {string} reviewerId - Reviewer ID
   * @param {Object} revisionData - Revision request details
   * @returns {Promise<Object>} - Updated application
   */
  async requestRevision(applicationId, reviewerId, revisionData) {
    try {
      const application = await this.applicationRepo.findById(applicationId);

      // Check revision limit
      if (application.revisionCount >= this.config.maxRevisionAttempts) {
        // Automatically reject if too many revisions
        return await this.rejectApplication(applicationId, reviewerId, {
          reason: 'Maximum revision attempts exceeded',
          autoRejection: true,
        });
      }

      // Validate transition
      const validation = this.stateMachine.validateTransition(
        application,
        this.stateMachine.STATES.REVISION_REQUIRED,
        'DTAM_REVIEWER',
      );

      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Increment revision count
      await this.applicationRepo.update(applicationId, {
        revisionCount: application.revisionCount + 1,
        'review.revisionRequested': true,
        'review.revisionReasons': revisionData.reasons,
        'review.revisionNotes': revisionData.notes,
      });

      // Transition to REVISION_REQUIRED
      const updatedApplication = await this._transitionState(
        application,
        this.stateMachine.STATES.REVISION_REQUIRED,
        reviewerId,
        'DTAM_REVIEWER',
        `Revision requested (${application.revisionCount + 1}/${this.config.maxRevisionAttempts}): ${revisionData.notes}`,
      );

      // Send notification to farmer
      await this._sendNotification(application.farmerId, 'REVISION_REQUIRED', {
        applicationNumber: application.applicationNumber,
        reasons: revisionData.reasons,
        notes: revisionData.notes,
        revisionCount: application.revisionCount + 1,
        maxRevisions: this.config.maxRevisionAttempts,
      });

      return updatedApplication;
    } catch (error) {
      logger.error('[WorkflowEngine] Error requesting revision:', error);
      throw error;
    }
  }

  /**
   * Process payment confirmation
   * @param {string} applicationId - Application ID
   * @param {Object} paymentData - Payment confirmation data
   * @returns {Promise<Object>} - Updated application
   */
  async confirmPayment(applicationId, paymentData) {
    try {
      const application = await this.applicationRepo.findById(applicationId);

      // Determine target state based on payment phase
      const targetState =
        paymentData.phase === 1
          ? this.stateMachine.STATES.PAYMENT_VERIFIED
          : this.stateMachine.STATES.PHASE2_PAYMENT_VERIFIED;

      // Validate transition
      const validation = this.stateMachine.validateTransition(application, targetState, 'SYSTEM', {
        paymentReference: paymentData.transactionId,
      });

      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Update payment information
      const paymentField = paymentData.phase === 1 ? 'payment.phase1' : 'payment.phase2';
      await this.applicationRepo.update(applicationId, {
        [`${paymentField}.paidAt`]: new Date(),
        [`${paymentField}.transactionId`]: paymentData.transactionId,
        [`${paymentField}.amount`]: paymentData.amount,
        [`${paymentField}.status`]: 'COMPLETED',
      });

      // Transition state
      const updatedApplication = await this._transitionState(
        application,
        targetState,
        'SYSTEM',
        'SYSTEM',
        `Payment phase ${paymentData.phase} confirmed: ${paymentData.transactionId}`,
      );

      // Handle post-payment logic
      if (paymentData.phase === 1) {
        // Create job ticket for inspector
        await this._createJobTicket(applicationId, 'DTAM_INSPECTOR', {
          title: `Farm Inspection Required - ${application.applicationNumber}`,
          description: 'Schedule and conduct farm inspection',
          priority: 'NORMAL',
          dueDate: this._calculateDueDate(14), // 14 days SLA
        });
      } else {
        // Phase 2 payment - create job for admin approval
        await this._createJobTicket(applicationId, 'DTAM_ADMIN', {
          title: `Final Approval Required - ${application.applicationNumber}`,
          description: 'Review and approve certificate issuance',
          priority: 'HIGH',
          dueDate: this._calculateDueDate(7), // 7 days SLA
        });
      }

      return updatedApplication;
    } catch (error) {
      logger.error('[WorkflowEngine] Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Schedule farm inspection
   * @param {string} applicationId - Application ID
   * @param {string} inspectorId - Inspector ID
   * @param {Object} scheduleData - Inspection schedule data
   * @returns {Promise<Object>} - Updated application
   */
  async scheduleInspection(applicationId, inspectorId, scheduleData) {
    try {
      const application = await this.applicationRepo.findById(applicationId);

      // Validate transition
      const validation = this.stateMachine.validateTransition(
        application,
        this.stateMachine.STATES.INSPECTION_SCHEDULED,
        'DTAM_INSPECTOR',
      );

      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Update inspection schedule
      await this.applicationRepo.update(applicationId, {
        'inspection.inspectorId': inspectorId,
        'inspection.scheduledDate': scheduleData.scheduledDate,
        'inspection.type': scheduleData.type, // 'onsite' or 'virtual'
        'inspection.notes': scheduleData.notes,
        'inspection.scheduledAt': new Date(),
      });

      // Transition state
      const updatedApplication = await this._transitionState(
        application,
        this.stateMachine.STATES.INSPECTION_SCHEDULED,
        inspectorId,
        'DTAM_INSPECTOR',
        `Inspection scheduled for ${scheduleData.scheduledDate}`,
      );

      // Send notifications
      await this._sendNotification(application.farmerId, 'INSPECTION_SCHEDULED', {
        applicationNumber: application.applicationNumber,
        inspectorName: await this._getInspectorName(inspectorId),
        scheduledDate: scheduleData.scheduledDate,
        type: scheduleData.type,
        notes: scheduleData.notes,
      });

      return updatedApplication;
    } catch (error) {
      logger.error('[WorkflowEngine] Error scheduling inspection:', error);
      throw error;
    }
  }

  /**
   * Complete farm inspection
   * @param {string} applicationId - Application ID
   * @param {string} inspectorId - Inspector ID
   * @param {Object} inspectionReport - Inspection results
   * @returns {Promise<Object>} - Updated application
   */
  async completeInspection(applicationId, inspectorId, inspectionReport) {
    try {
      const application = await this.applicationRepo.findById(applicationId);

      // Validate transition
      const validation = this.stateMachine.validateTransition(
        application,
        this.stateMachine.STATES.INSPECTION_COMPLETED,
        'DTAM_INSPECTOR',
        { inspectionReport },
      );

      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Calculate compliance score
      const complianceScore = this._calculateComplianceScore(inspectionReport);

      // Check if inspection passed
      if (complianceScore < 70) {
        return await this.rejectApplication(applicationId, inspectorId, {
          reason: 'Farm inspection failed',
          complianceScore,
          inspectionFindings: inspectionReport.findings,
        });
      }

      // Update inspection results
      await this.applicationRepo.update(applicationId, {
        'inspection.completedAt': new Date(),
        'inspection.passed': true,
        'inspection.complianceScore': complianceScore,
        'inspection.findings': inspectionReport.findings,
        'inspection.photos': inspectionReport.photos || [],
        'inspection.checklist': inspectionReport.checklist || {},
        'inspection.inspectorNotes': inspectionReport.notes,
      });

      // Transition state
      const updatedApplication = await this._transitionState(
        application,
        this.stateMachine.STATES.INSPECTION_COMPLETED,
        inspectorId,
        'DTAM_INSPECTOR',
        `Inspection completed successfully. Compliance score: ${complianceScore}%`,
      );

      // Auto-transition to Phase 2 payment
      setTimeout(async () => {
        await this._autoTransitionToPhase2Payment(applicationId);
      }, 1000);

      return updatedApplication;
    } catch (error) {
      logger.error('[WorkflowEngine] Error completing inspection:', error);
      throw error;
    }
  }

  /**
   * Final approval and certificate issuance
   * @param {string} applicationId - Application ID
   * @param {string} adminId - Admin ID
   * @param {Object} approvalData - Approval details
   * @returns {Promise<Object>} - Updated application
   */
  async finalApproval(applicationId, adminId, approvalData) {
    try {
      const application = await this.applicationRepo.findById(applicationId);

      // Validate transition
      const validation = this.stateMachine.validateTransition(
        application,
        this.stateMachine.STATES.APPROVED,
        'DTAM_ADMIN',
        { approverSignature: approvalData.signature },
      );

      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Update approval information
      await this.applicationRepo.update(applicationId, {
        'approval.adminId': adminId,
        'approval.approvedAt': new Date(),
        'approval.signature': approvalData.signature,
        'approval.notes': approvalData.notes,
        'approval.certificateTemplate': approvalData.certificateTemplate || 'standard',
      });

      // Transition to APPROVED
      const updatedApplication = await this._transitionState(
        application,
        this.stateMachine.STATES.APPROVED,
        adminId,
        'DTAM_ADMIN',
        `Application approved for certificate issuance. ${approvalData.notes || ''}`,
      );

      // Auto-generate certificate
      setTimeout(async () => {
        await this._generateCertificate(applicationId, adminId);
      }, 1000);

      return updatedApplication;
    } catch (error) {
      logger.error('[WorkflowEngine] Error processing final approval:', error);
      throw error;
    }
  }

  /**
   * Reject application
   * @param {string} applicationId - Application ID
   * @param {string} userId - User rejecting the application
   * @param {Object} rejectionData - Rejection details
   * @returns {Promise<Object>} - Updated application
   */
  async rejectApplication(applicationId, userId, rejectionData) {
    try {
      const application = await this.applicationRepo.findById(applicationId);

      // Determine user role
      const user = await this.userRepo.findById(userId);
      const userRole = this._mapUserRoleToWorkflowRole(user.role);

      // Validate transition
      const validation = this.stateMachine.validateTransition(
        application,
        this.stateMachine.STATES.REJECTED,
        userRole,
      );

      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Update rejection information
      await this.applicationRepo.update(applicationId, {
        'rejection.rejectedBy': userId,
        'rejection.rejectedAt': new Date(),
        'rejection.reason': rejectionData.reason,
        'rejection.stage': application.status,
        'rejection.notes': rejectionData.notes,
        'rejection.complianceScore': rejectionData.complianceScore || null,
        'rejection.autoRejection': rejectionData.autoRejection || false,
      });

      // Transition to REJECTED
      const updatedApplication = await this._transitionState(
        application,
        this.stateMachine.STATES.REJECTED,
        userId,
        userRole,
        `Application rejected: ${rejectionData.reason}`,
      );

      // Send notification to farmer
      await this._sendNotification(application.farmerId, 'APPLICATION_REJECTED', {
        applicationNumber: application.applicationNumber,
        reason: rejectionData.reason,
        stage: application.status,
        notes: rejectionData.notes,
        canReapply: true,
      });

      return updatedApplication;
    } catch (error) {
      logger.error('[WorkflowEngine] Error rejecting application:', error);
      throw error;
    }
  }

  /**
   * Get application workflow status
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} - Workflow status
   */
  async getWorkflowStatus(applicationId) {
    try {
      const application = await this.applicationRepo.findById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      const currentStateMetadata = this.stateMachine.getStateMetadata(application.status);
      const nextStates = this.stateMachine.getNextStates(application.status);
      const isExpired = this._isApplicationExpired(application);

      return {
        applicationId,
        applicationNumber: application.applicationNumber,
        currentState: application.status,
        currentStateMetadata,
        nextPossibleStates: nextStates,
        workflowHistory: application.workflowHistory || [],
        isExpired,
        progress: this._calculateProgress(application.status),
        estimatedCompletion: this._estimateCompletion(application),
        slaStatus: this._checkSLAStatus(application),
        canEdit: currentStateMetadata?.canEdit || false,
        paymentRequired: currentStateMetadata?.paymentRequired || false,
      };
    } catch (error) {
      logger.error('[WorkflowEngine] Error getting workflow status:', error);
      throw error;
    }
  }

  // Private helper methods

  async _generateApplicationNumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `APP-${year}${month}${day}`;
    const count = await this.applicationRepo.countToday();
    const sequence = String(count + 1).padStart(4, '0');

    return `${prefix}-${sequence}`;
  }

  async _transitionState(application, newState, userId, userRole, notes) {
    const now = new Date();

    // Update current state exit time
    const workflowHistory = [...(application.workflowHistory || [])];
    if (workflowHistory.length > 0) {
      workflowHistory[workflowHistory.length - 1].exitedAt = now;
      workflowHistory[workflowHistory.length - 1].duration =
        now.getTime() - new Date(workflowHistory[workflowHistory.length - 1].enteredAt).getTime();
    }

    // Add new state entry
    workflowHistory.push({
      state: newState,
      enteredAt: now,
      actor: userId,
      actorRole: userRole,
      notes: notes || '',
    });

    // Calculate expiration date
    const expirationDate = this.stateMachine.calculateExpirationDate(newState, now);

    // Update application
    const updatedApplication = await this.applicationRepo.update(application.id, {
      status: newState,
      workflowHistory,
      expiresAt: expirationDate,
      updatedAt: now,
    });

    // Create audit log
    await this._createAuditLog(application.id, 'STATE_TRANSITION', {
      fromState: application.status,
      toState: newState,
      userId,
      userRole,
      notes,
    });

    // Emit event
    this.emit('state.transitioned', {
      applicationId: application.id,
      fromState: application.status,
      toState: newState,
      userId,
      userRole,
    });

    return updatedApplication;
  }

  async _autoTransitionToReview(applicationId) {
    try {
      const application = await this.applicationRepo.findById(applicationId);
      if (application.status === this.stateMachine.STATES.SUBMITTED) {
        await this._transitionState(
          application,
          this.stateMachine.STATES.UNDER_REVIEW,
          'SYSTEM',
          'SYSTEM',
          'Automatically assigned to reviewer',
        );

        // Create job ticket for reviewer
        await this._createJobTicket(applicationId, 'DTAM_REVIEWER', {
          title: `Document Review Required - ${application.applicationNumber}`,
          description: 'Review application documents for completeness and accuracy',
          priority: 'NORMAL',
          dueDate: this._calculateDueDate(14),
        });
      }
    } catch (error) {
      logger.error('[WorkflowEngine] Error in auto-transition to review:', error);
    }
  }

  async _autoTransitionToPhase2Payment(applicationId) {
    try {
      const application = await this.applicationRepo.findById(applicationId);
      if (application.status === this.stateMachine.STATES.INSPECTION_COMPLETED) {
        await this._transitionState(
          application,
          this.stateMachine.STATES.PHASE2_PAYMENT_PENDING,
          'SYSTEM',
          'SYSTEM',
          'Automatically moved to Phase 2 payment after successful inspection',
        );

        // Generate Phase 2 payment
        const paymentData = await this.paymentService.generatePayment({
          applicationId,
          amount: 25000,
          phase: 2,
          description: `GACP Certification Phase 2 - ${application.applicationNumber}`,
        });

        await this.applicationRepo.update(applicationId, {
          'payment.phase2': paymentData,
        });

        // Send notification
        await this._sendNotification(application.farmerId, 'PHASE2_PAYMENT_REQUIRED', {
          applicationNumber: application.applicationNumber,
          amount: 25000,
          paymentUrl: paymentData.paymentUrl,
          qrCode: paymentData.qrCode,
        });
      }
    } catch (error) {
      logger.error('[WorkflowEngine] Error in auto-transition to Phase 2 payment:', error);
    }
  }

  async _generateCertificate(applicationId, issuedBy) {
    try {
      const application = await this.applicationRepo.findById(applicationId);
      if (application.status === this.stateMachine.STATES.APPROVED) {
        // Generate certificate
        const certificate = await this.certificateService.generateCertificate({
          applicationId,
          farmerId: application.farmerId,
          applicationNumber: application.applicationNumber,
          issuedBy,
          template: application.approval?.certificateTemplate || 'standard',
        });

        // Update application with certificate info
        await this.applicationRepo.update(applicationId, {
          certificateId: certificate.id,
          certificateNumber: certificate.certificateNumber,
          certificateIssuedAt: new Date(),
        });

        // Transition to final state
        await this._transitionState(
          application,
          this.stateMachine.STATES.CERTIFICATE_ISSUED,
          'SYSTEM',
          'SYSTEM',
          `Certificate issued: ${certificate.certificateNumber}`,
        );

        // Send notification
        await this._sendNotification(application.farmerId, 'CERTIFICATE_ISSUED', {
          applicationNumber: application.applicationNumber,
          certificateNumber: certificate.certificateNumber,
          downloadUrl: certificate.downloadUrl,
        });
      }
    } catch (error) {
      logger.error('[WorkflowEngine] Error generating certificate:', error);
    }
  }

  async _validateSubmissionRequirements(application) {
    const validationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // 1. Check required documents with detailed validation
    const requiredDocuments = {
      farm_license: {
        required: true,
        description: 'Farm registration license',
        validityCheck: true,
      },
      land_deed: {
        required: true,
        description: 'Land ownership document',
        validityCheck: true,
      },
      farmer_id: {
        required: true,
        description: 'Farmer identification card',
        validityCheck: true,
      },
      farm_photos: {
        required: true,
        description: 'Farm site photos (minimum 5 photos)',
        minCount: 5,
      },
      water_test_report: {
        required: true,
        description: 'Water quality test report',
        maxAge: 90, // days
      },
      soil_test_report: {
        required: false,
        description: 'Soil analysis report',
        maxAge: 180, // days
        recommended: true,
      },
    };

    const uploadedDocs = application.documents || [];

    for (const [docType, requirements] of Object.entries(requiredDocuments)) {
      const docs = uploadedDocs.filter(doc => doc.type === docType);

      if (requirements.required && docs.length === 0) {
        validationResult.errors.push(`Missing required document: ${requirements.description}`);
        validationResult.valid = false;
      }

      if (requirements.minCount && docs.length < requirements.minCount) {
        validationResult.errors.push(
          `${requirements.description} requires minimum ${requirements.minCount} files, found ${docs.length}`,
        );
        validationResult.valid = false;
      }

      // Check document validity and age
      for (const doc of docs) {
        if (requirements.validityCheck && doc.expiryDate) {
          const expiryDate = new Date(doc.expiryDate);
          if (expiryDate < new Date()) {
            validationResult.errors.push(
              `${requirements.description} has expired on ${expiryDate.toLocaleDateString()}`,
            );
            validationResult.valid = false;
          }
        }

        if (requirements.maxAge) {
          const docAge = Math.floor(
            (Date.now() - new Date(doc.uploadedAt)) / (1000 * 60 * 60 * 24),
          );
          if (docAge > requirements.maxAge) {
            validationResult.errors.push(
              `${requirements.description} is too old (${docAge} days, max ${requirements.maxAge} days)`,
            );
            validationResult.valid = false;
          }
        }
      }

      // Recommendations for optional documents
      if (!requirements.required && requirements.recommended && docs.length === 0) {
        validationResult.warnings.push(`Recommended document missing: ${requirements.description}`);
      }
    }

    // 2. Validate farm information completeness
    const farmValidation = this._validateFarmInformation(application.farm);
    if (!farmValidation.valid) {
      validationResult.errors.push(...farmValidation.errors);
      validationResult.warnings.push(...farmValidation.warnings);
      validationResult.valid = false;
    }

    // 3. Validate farmer eligibility
    const eligibilityCheck = await this._validateFarmerEligibility(application.farmerId);
    if (!eligibilityCheck.valid) {
      validationResult.errors.push(...eligibilityCheck.errors);
      validationResult.valid = false;
    }

    // 4. Business rule validations
    const businessRules = this._validateBusinessRules(application);
    if (!businessRules.valid) {
      validationResult.errors.push(...businessRules.errors);
      validationResult.warnings.push(...businessRules.warnings);
      validationResult.valid = false;
    }

    if (!validationResult.valid) {
      const error = new Error('Application submission validation failed');
      error.validationResult = validationResult;
      throw error;
    }

    return validationResult;
  }

  _calculateComplianceScore(inspectionReport) {
    if (!inspectionReport.checklist) {
      return 0;
    }

    const items = Object.values(inspectionReport.checklist);
    const passedItems = items.filter(item => item.passed === true);

    return Math.round((passedItems.length / items.length) * 100);
  }

  _calculateProgress(currentState) {
    const stateOrder = [
      'draft',
      'submitted',
      'under_review',
      'payment_pending',
      'payment_verified',
      'inspection_scheduled',
      'inspection_completed',
      'phase2_payment_pending',
      'phase2_payment_verified',
      'approved',
      'certificate_issued',
    ];

    const currentIndex = stateOrder.indexOf(currentState);
    return currentIndex >= 0 ? Math.round(((currentIndex + 1) / stateOrder.length) * 100) : 0;
  }

  _isApplicationExpired(application) {
    if (!application.expiresAt) {
      return false;
    }
    return new Date() > new Date(application.expiresAt);
  }

  _estimateCompletion(_application) {
    // Implementation for completion estimation based on current state and SLA
    return null; // Placeholder
  }

  _checkSLAStatus(_application) {
    // Implementation for SLA monitoring
    return 'on_time'; // Placeholder
  }

  _calculateDueDate(days) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  }

  _mapUserRoleToWorkflowRole(userRole) {
    const roleMapping = {
      FARMER: 'FARMER',
      DTAM_REVIEWER: 'DTAM_REVIEWER',
      DTAM_INSPECTOR: 'DTAM_INSPECTOR',
      DTAM_ADMIN: 'DTAM_ADMIN',
      ADMIN: 'DTAM_ADMIN',
    };
    return roleMapping[userRole] || userRole;
  }

  async _createAuditLog(applicationId, action, details) {
    if (this.auditService) {
      await this.auditService.log({
        entityType: 'APPLICATION',
        entityId: applicationId,
        action,
        details,
        timestamp: new Date(),
      });
    }
  }

  async _sendNotification(userId, type, data) {
    if (this.notificationService) {
      await this.notificationService.send({
        userId,
        type,
        data,
        channels: ['email', 'sms', 'in_app'],
      });
    }
  }

  async _createJobTicket(applicationId, assignedRole, ticketData) {
    if (this.jobTicketService) {
      await this.jobTicketService.create({
        applicationId,
        assignedRole,
        ...ticketData,
      });
    }
  }

  async _getInspectorName(inspectorId) {
    try {
      const inspector = await this.userRepo.findById(inspectorId);
      return inspector ? `${inspector.firstName} ${inspector.lastName}` : 'Inspector';
    } catch (error) {
      return 'Inspector';
    }
  }

  /**
   * Validate farm information completeness and accuracy
   * @private
   */
  _validateFarmInformation(farmData) {
    const result = { valid: true, errors: [], warnings: [] };

    if (!farmData) {
      result.errors.push('Farm information is required');
      result.valid = false;
      return result;
    }

    // Required farm fields
    const requiredFields = {
      name: 'Farm name',
      'address.street': 'Farm address',
      'address.district': 'District',
      'address.province': 'Province',
      'address.postalCode': 'Postal code',
      'coordinates.latitude': 'Farm coordinates (latitude)',
      'coordinates.longitude': 'Farm coordinates (longitude)',
      area: 'Farm area (rai)',
      farmType: 'Farm type (organic/conventional)',
      owner: 'Farm owner information',
    };

    for (const [field, description] of Object.entries(requiredFields)) {
      if (!this._getNestedValue(farmData, field)) {
        result.errors.push(`${description} is required`);
        result.valid = false;
      }
    }

    // Validate coordinates
    if (farmData.coordinates) {
      const { latitude, longitude } = farmData.coordinates;
      if (latitude < 5.612851 || latitude > 20.463194) {
        result.errors.push('Farm latitude must be within Thailand boundaries (5.61° - 20.46° N)');
        result.valid = false;
      }
      if (longitude < 97.345655 || longitude > 105.636812) {
        result.errors.push(
          'Farm longitude must be within Thailand boundaries (97.35° - 105.64° E)',
        );
        result.valid = false;
      }
    }

    // Validate farm area
    if (farmData.area) {
      if (farmData.area <= 0) {
        result.errors.push('Farm area must be greater than 0 rai');
        result.valid = false;
      }
      if (farmData.area > 10000) {
        result.warnings.push('Farm area exceeds 10,000 rai - please verify accuracy');
      }
    }

    // Validate farm type
    const validFarmTypes = ['ORGANIC', 'CONVENTIONAL', 'MIXED'];
    if (farmData.farmType && !validFarmTypes.includes(farmData.farmType.toUpperCase())) {
      result.errors.push(`Farm type must be one of: ${validFarmTypes.join(', ')}`);
      result.valid = false;
    }

    return result;
  }

  /**
   * Validate farmer eligibility for GACP certification
   * @private
   */
  async _validateFarmerEligibility(farmerId) {
    const result = { valid: true, errors: [], warnings: [] };

    try {
      const farmer = await this.userRepo.findById(farmerId);

      if (!farmer) {
        result.errors.push('Farmer account not found');
        result.valid = false;
        return result;
      }

      // Check farmer account status
      if (!farmer.isActive) {
        result.errors.push('Farmer account is inactive');
        result.valid = false;
      }

      if (!farmer.isVerified) {
        result.errors.push('Farmer account is not verified');
        result.valid = false;
      }

      // Check for existing active applications
      const activeApplications = await this.applicationRepo.findActiveByFarmer(farmerId);
      if (activeApplications.length > 0) {
        const activeApp = activeApplications[0];
        if (!['REJECTED', 'CERTIFICATE_ISSUED'].includes(activeApp.status)) {
          result.errors.push(
            `Farmer already has an active application: ${activeApp.applicationNumber}`,
          );
          result.valid = false;
        }
      }

      // Check previous rejections within 6 months
      const recentRejections = await this.applicationRepo.findRecentRejections(farmerId, 6);
      if (recentRejections.length >= 3) {
        result.errors.push('Too many recent rejections. Please wait 6 months before reapplying');
        result.valid = false;
      }

      // Check farmer profile completeness
      if (!farmer.profile?.farmInfo) {
        result.warnings.push('Farmer profile farm information is incomplete');
      }
    } catch (error) {
      logger.error('[WorkflowEngine] Error validating farmer eligibility:', error);
      result.errors.push('Error checking farmer eligibility');
      result.valid = false;
    }

    return result;
  }

  /**
   * Validate business rules and regulations
   * @private
   */
  _validateBusinessRules(application) {
    const result = { valid: true, errors: [], warnings: [] };

    // Rule 1: Farm must be in eligible provinces
    const eligibleProvinces = [
      'CHIANG_MAI',
      'CHIANG_RAI',
      'PHAYAO',
      'NAN',
      'LAMPANG',
      'LAMPHUN',
      'MAE_HONG_SON',
      'PHRAE',
      'UTTARADIT',
      'SUKHOTHAI',
      'TAK',
      'KAMPHAENG_PHET',
      'PHITSANULOK',
      'PHICHIT',
      'PHETCHABUN',
      'NAKHON_SAWAN',
    ];

    if (application.farm?.address?.province) {
      const province = application.farm.address.province.toUpperCase().replace(' ', '_');
      if (!eligibleProvinces.includes(province)) {
        result.errors.push(
          `Farm province "${application.farm.address.province}" is not eligible for GACP certification`,
        );
        result.valid = false;
      }
    }

    // Rule 2: Minimum farm size requirements
    if (application.farm?.area && application.farm.area < 0.5) {
      result.errors.push('Minimum farm size for GACP certification is 0.5 rai');
      result.valid = false;
    }

    // Rule 3: Farm type restrictions
    if (application.farm?.farmType === 'CONVENTIONAL') {
      result.warnings.push(
        'Conventional farms may require additional documentation and longer processing time',
      );
    }

    // Rule 4: Seasonal application restrictions
    const currentMonth = new Date().getMonth() + 1;
    const restrictedMonths = [6, 7, 8, 9]; // Rainy season
    if (restrictedMonths.includes(currentMonth)) {
      result.warnings.push('Applications during rainy season may experience delayed inspections');
    }

    // Rule 5: Previous certification checks
    if (application.farm?.certificationHistory?.length > 0) {
      const recentCerts = application.farm.certificationHistory.filter(cert => {
        const expiryDate = new Date(cert.expiryDate);
        return expiryDate > new Date();
      });

      if (recentCerts.length > 0) {
        result.warnings.push('Farm has existing certifications. Please ensure no conflicts');
      }
    }

    return result;
  }

  /**
   * Get nested object value by dot notation
   * @private
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  /**
   * Enhanced compliance score calculation with detailed breakdown (v2)
   * @private
   */
  _calculateComplianceScoreDetailed(inspectionReport) {
    if (!inspectionReport.checklist) {
      return 0;
    }

    const categories = {
      safety: { weight: 0.3, items: [] },
      quality: { weight: 0.25, items: [] },
      environmental: { weight: 0.2, items: [] },
      documentation: { weight: 0.15, items: [] },
      facility: { weight: 0.1, items: [] },
    };

    // Categorize checklist items
    for (const [itemId, itemData] of Object.entries(inspectionReport.checklist)) {
      const category = this._categorizeChecklistItem(itemId);
      if (categories[category]) {
        categories[category].items.push(itemData);
      }
    }

    let totalScore = 0;
    const breakdown = {};

    // Calculate weighted scores for each category
    for (const [categoryName, categoryData] of Object.entries(categories)) {
      if (categoryData.items.length === 0) {
        continue;
      }

      const passedItems = categoryData.items.filter(item => item.passed === true);
      const categoryScore = (passedItems.length / categoryData.items.length) * 100;
      const weightedScore = categoryScore * categoryData.weight;

      totalScore += weightedScore;
      breakdown[categoryName] = {
        score: Math.round(categoryScore),
        passed: passedItems.length,
        total: categoryData.items.length,
        weight: categoryData.weight,
      };
    }

    // Store detailed breakdown in inspection report
    inspectionReport.complianceBreakdown = breakdown;

    return Math.round(totalScore);
  }

  /**
   * Categorize checklist items for weighted scoring
   * @private
   */
  _categorizeChecklistItem(itemId) {
    const categoryMap = {
      safety: ['pesticide_storage', 'worker_protection', 'chemical_handling', 'equipment_safety'],
      quality: ['crop_quality', 'harvest_handling', 'post_harvest', 'traceability'],
      environmental: ['water_management', 'soil_conservation', 'waste_management', 'biodiversity'],
      documentation: ['record_keeping', 'training_records', 'certificates', 'procedures'],
      facility: ['storage_facilities', 'processing_area', 'hygiene', 'infrastructure'],
    };

    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => itemId.toLowerCase().includes(keyword))) {
        return category;
      }
    }

    return 'quality'; // Default category
  }
}

module.exports = ApplicationWorkflowEngine;
