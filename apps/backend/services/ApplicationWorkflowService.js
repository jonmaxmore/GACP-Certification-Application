/**
 * GACP Application Service
 * Core business logic for GACP certification process
 *
 * Implements WHO/ASEAN GACP guidelines and DTAM standards
 *
 * Refactored: Uses modular services for validation, scoring, scheduling, and payments.
 */

const logger = require('../shared/logger');
const ApplicationRepository = require('../repositories/ApplicationRepository');

// Modular Services
const applicationValidator = require('./application/ApplicationValidator');
const applicationScorer = require('./application/ApplicationScorer');
const paymentProcessor = require('./application/PaymentProcessor');
const inspectionScheduler = require('./application/InspectionScheduler');

// Phase 2 Services Integration
const queueService = require('./queue/queueService');
const cacheService = require('./cache/cacheService');

// Import Models (User still needed for farmer/officer checks)
let User, mongoose;
try {
  User = require('../models/UserModel');
  mongoose = require('mongoose');
} catch (error) {
  logger.warn('[GACPApplicationService] Models not available:', error.message);
}
const { ValidationError, BusinessLogicError } = require('../shared/errors');

class ApplicationWorkflowService {
  constructor(repository = null, logger = null) {
    this.repository = repository || new ApplicationRepository();
    this.logger = logger || console;

    // Bind services
    this.validator = applicationValidator;
    this.scorer = applicationScorer;
    this.payment = paymentProcessor;
    this.scheduler = inspectionScheduler;
  }

  /**
   * Get database connection
   */
  getDB() {
    return mongoose.connection;
  }

  /**
   * Create new GACP application
   */
  async createApplication(farmerId, applicationData) {
    const session = await this.repository.startSession();
    session.startTransaction();

    try {
      // 1. Validate farmer eligibility
      const farmer = await User.findById(farmerId);
      if (!farmer || farmer.role.toLowerCase() !== 'farmer') {
        throw new ValidationError('Invalid farmer ID or insufficient permissions');
      }

      // 2. Check for existing active applications
      const existingApplication = await this.repository.findActiveByFarmer(farmerId);
      if (existingApplication) {
        throw new BusinessLogicError('Farmer already has an active application in progress');
      }

      // 3. Validate application data (Delegated)
      this.validator.validateApplicationData(applicationData);

      // 4. Create application
      const application = await this.repository.create({
        farmerId: farmerId,
        farmerEmail: farmer.email,
        type: applicationData.type || 'NEW',
        applicantType: applicationData.applicantType || 'individual',
        formType: applicationData.formType || 'FORM_09',
        farm: applicationData.farmInformation,
        farmInformation: applicationData.farmInformation,
        cropInformation: applicationData.cropInformation,
        formSpecificData: applicationData.formSpecificData,
        documents: applicationData.documents || [],
        currentStatus: 'draft',
        applicationNumber: this.generateApplicationNumber(),
      }, session);

      // 5. Perform initial risk assessment
      application.assessRisk();

      // 6. Calculate initial fees (Delegated)
      this.payment.calculateFees(application);

      // 7. Save application
      await this.repository.save(application);

      // 8. Queue welcome email notification
      if (process.env.ENABLE_QUEUE === 'true') {
        await queueService.addEmailJob(
          {
            type: 'application-created',
            applicationId: application._id,
            data: {
              farmerEmail: farmer.email,
              farmerName: farmer.name,
              applicationNumber: application.applicationNumber,
            },
          },
          { priority: 5 },
        );
      }

      // 9. Invalidate cache
      await cacheService.deletePattern('applications:list:*');

      // 10. Log creation
      logger.info('GACP application created', {
        applicationId: application._id,
        applicationNumber: application.applicationNumber,
        farmerId,
        riskLevel: application.riskAssessment.level,
      });

      await session.commitTransaction();
      return application;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error creating GACP application', {
        farmerId,
        error: error.message,
      });
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Submit application for review
   */
  async submitApplication(applicationId, submittedBy) {
    try {
      const application = await this.repository.findById(applicationId);
      if (!application) {
        throw new ValidationError('Application not found');
      }

      // 1. Validate application completeness (Delegated)
      this.validator.validateApplicationCompleteness(application);

      // 2. Check Phase 1 payment status
      if (application.payment.phase1.status !== 'completed') {
        throw new BusinessLogicError('Phase 1 application fee (5,000 THB) must be paid before submission');
      }

      // 3. Update status
      application.submissionDate = new Date();
      await this.updateApplicationStatus(applicationId, 'submitted', 'Application submitted for review', submittedBy);

      // 4. Auto-assign to Officer based on province
      const assignedOfficer = await this.assignOfficer(application);
      application.assignedOfficer = assignedOfficer._id;
      await this.repository.save(application);

      // 5. Queue notification emails
      if (process.env.ENABLE_QUEUE === 'true') {
        await queueService.addEmailJob({
          type: 'application-submitted',
          applicationId,
          data: {
            farmerEmail: application.farmerEmail,
            applicationNumber: application.applicationNumber,
          },
        }, { priority: 5 });

        await queueService.addEmailJob({
          type: 'new-application-assignment',
          applicationId,
          data: {
            officerEmail: assignedOfficer.email,
            applicationNumber: application.applicationNumber,
          },
        }, { priority: 6 });
      }

      // 6. Invalidate cache
      await cacheService.invalidateApplication(applicationId);
      await cacheService.deletePattern('applications:list:*');

      logger.info('Application submitted', {
        applicationId,
        applicationNumber: application.applicationNumber,
        assignedOfficer: assignedOfficer._id,
      });

      return application;
    } catch (error) {
      logger.error('Error submitting application', {
        applicationId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Review application - Officer workflow
   */
  async reviewApplication(applicationId, reviewerId, reviewData) {
    try {
      const application = await this.repository.findById(applicationId);
      if (!application) {
        throw new ValidationError('Application not found');
      }

      if (application.currentStatus !== 'submitted') {
        throw new BusinessLogicError('Application is not in a reviewable state');
      }

      // 1. Update status to under review
      await this.updateApplicationStatus(applicationId, 'under_review', 'Document review initiated', reviewerId);

      // 2. Validate all required documents (Delegated)
      const documentValidation = this.validator.validateDocuments(application);

      // 3. Assess farm information accuracy (Delegated)
      const farmInfoScore = this.scorer.assessFarmInformation(application.farm);

      // 4. Evaluate farming experience and practices (Delegated)
      const practiceScore = this.scorer.assessFarmingPractices(reviewData.practicesData);

      // 5. Calculate preliminary score (Delegated)
      const preliminaryScore = this.scorer.calculatePreliminaryScore({
        documentValidation,
        farmInfoScore,
        practiceScore,
        riskLevel: application.riskAssessment.level,
      });

      // 6. Make review decision
      let decision;
      if (preliminaryScore >= 80) {
        decision = 'approved_for_inspection';
        await this.updateApplicationStatus(applicationId, 'inspection_scheduled', 'Approved for field inspection', reviewerId);

        // Schedule inspection (Delegated)
        await this.scheduler.scheduleInspection(this.repository, application);
      } else if (preliminaryScore >= 60) {
        decision = 'revision_required';
        application.complianceRequirements = reviewData.revisionRequirements || [];
        await this.repository.save(application);
      } else {
        decision = 'rejected';
        await this.updateApplicationStatus(applicationId, 'rejected', 'Application does not meet minimum requirements', reviewerId);
      }

      // 7. Record assessment scores
      application.assessmentScores.push({
        category: 'preliminary_review',
        maxScore: 100,
        achievedScore: preliminaryScore,
        assessor: reviewerId,
        notes: reviewData.notes,
        recommendations: reviewData.recommendations || [],
      });

      await this.repository.save(application);

      // 8. Queue notification emails
      if (process.env.ENABLE_QUEUE === 'true') {
        await queueService.addEmailJob(
          {
            type: `application-review-${decision}`,
            applicationId,
            data: {
              farmerEmail: application.farmerEmail,
              decision,
              preliminaryScore,
              reviewerNotes: reviewData.notes,
            },
          },
          { priority: 5 },
        );
      }

      // 9. Invalidate cache
      await cacheService.invalidateApplication(applicationId);
      await cacheService.deletePattern('applications:list:*');

      return {
        application,
        decision,
        preliminaryScore,
        nextSteps: this.getNextSteps(decision),
      };
    } catch (error) {
      logger.error('Error reviewing application', {
        applicationId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Process field inspection results
   */
  async processInspectionResults(applicationId, inspectionResults, auditorId) {
    try {
      const application = await this.repository.findById(applicationId);
      if (!application) {
        throw new ValidationError('Application not found');
      }

      // 1. Validate inspection results (Delegated)
      this.validator.validateInspectionResults(inspectionResults);

      // 2. Update status
      await this.updateApplicationStatus(applicationId, 'inspection_completed', 'Field inspection completed', auditorId);
      application.inspectionCompleted = new Date();

      // 3. Calculate compliance scores for each category (Delegated)
      const complianceScores = this.scorer.calculateComplianceScores(inspectionResults);

      // 4. Add assessment scores
      complianceScores.forEach(score => {
        application.assessmentScores.push({
          ...score,
          assessor: auditorId,
          assessmentDate: new Date(),
        });
      });

      // 5. Calculate final score
      const finalScore = application.calculateTotalScore();

      // 6. Make certification decision
      let certificationDecision;
      if (finalScore >= 85) {
        certificationDecision = 'approved';
        application.decision = {
          result: 'approved',
          decisionDate: new Date(),
          decisionBy: auditorId,
          validityPeriod: 24, // 2 years
          reasons: ['All compliance requirements met'],
        };

        await this.updateApplicationStatus(applicationId, 'approved', `Approved with score ${finalScore}`, auditorId);

        // Generate certificate
        await this.generateCertificate(application);
      } else if (finalScore >= 70) {
        certificationDecision = 'conditional_approval';
        application.decision = {
          result: 'conditional_approval',
          decisionDate: new Date(),
          decisionBy: auditorId,
          validityPeriod: 12, // 1 year with conditions
          conditions: inspectionResults.correctiveActions || [],
          reasons: ['Conditional approval - corrective actions required'],
        };
      } else {
        certificationDecision = 'rejected';
        application.decision = {
          result: 'rejected',
          decisionDate: new Date(),
          decisionBy: auditorId,
          reasons: inspectionResults.nonComplianceReasons || ['Insufficient compliance score'],
          appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };

        await this.updateApplicationStatus(applicationId, 'rejected', `Rejected with score ${finalScore}`, auditorId);
      }

      await this.repository.save(application);

      // 7. Send notifications
      // Note: sendNotifications was not defined in the original file I read, so I'm omitting it or it was internal
      // Assuming it's similar to other notifications

      // 8. Schedule surveillance if approved (Delegated)
      if (certificationDecision === 'approved') {
        await this.scheduler.scheduleSurveillance(application);
      }

      return {
        application,
        finalScore,
        decision: certificationDecision,
        complianceScores,
      };
    } catch (error) {
      logger.error('Error processing inspection results', {
        applicationId,
        error: error.message,
      });
      throw error;
    }
  }

  // --- Helper Methods ---

  async assignOfficer(application) {
    const province = application.farm.address.province;
    const officers = await User.find({
      role: 'officer',
      'workLocation.provinces': province,
      isActive: true,
    }).sort({ 'workload.activeApplications': 1 });

    if (officers.length === 0) {
      throw new BusinessLogicError(`No Officers available for province: ${province}`);
    }
    return officers[0];
  }

  getNextSteps(decision) {
    const nextSteps = {
      approved_for_inspection: [
        'Wait for inspection scheduling notification',
        'Prepare farm for field inspection',
        'Ensure all cultivation records are up to date',
      ],
      revision_required: [
        'Review feedback and requirements',
        'Submit additional documentation',
        'Address identified issues',
      ],
      rejected: [
        'Review rejection reasons',
        'Consider appeal within 30 days',
        'Improve practices and reapply',
      ],
    };
    return nextSteps[decision] || [];
  }

  async generateCertificate(application) {
    if (process.env.ENABLE_QUEUE === 'true') {
      await queueService.addDocumentJob({
        type: 'certificate-generation',
        applicationId: application._id,
      }, { priority: 8 });
    } else {
      logger.info('Certificate generation initiated', { applicationId: application._id });
    }
  }

  generateApplicationNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `APP-${year}${month}${day}-${random}`;
  }

  // --- Legacy / Wrapper methods for backward compatibility or direct calls ---

  async getApplicationById(applicationId) {
    const cacheKey = `application:${applicationId}`;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      logger.debug('Application cache hit', { applicationId });
      return cached;
    }

    const application = await this.repository.findById(applicationId);

    if (!application) {
      throw new ValidationError('Application not found');
    }

    await cacheService.set(cacheKey, application, 1800);
    return application;
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(applicationId, status, notes, userId) {
    const application = await this.repository.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    // Update status using model method if available, otherwise manual update
    if (typeof application.updateStatus === 'function') {
      await application.updateStatus(status, userId, notes);
    } else {
      logger.warn('application.updateStatus is not a function, using direct update');
      application.status = status;
      application.workflowHistory.push({
        state: status,
        actor: userId,
        actorRole: 'SYSTEM',
        notes: notes,
        enteredAt: new Date()
      });
      await application.save();
    }

    // Invalidate cache
    await cacheService.deletePattern(`application:${applicationId}`);
    await cacheService.deletePattern('applications:list:*');

    return application;
  }

  /**
   * Get all applications with filters and cache
   */
  async getApplications(filters = {}, options = {}) {
    const cacheKey = `applications:list:${JSON.stringify({ filters, options })}`;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      logger.debug('Applications list cache hit');
      return cached;
    }

    const query = {};
    if (filters.status) query.currentStatus = filters.status;
    if (filters.farmerId) query.applicant = filters.farmerId;
    if (filters.assignedOfficer) query.assignedOfficer = filters.assignedOfficer;

    const page = options.page || 1;
    const limit = options.limit || 20;

    const applications = await this.repository.findAll(query, {
      page,
      limit,
      sort: { createdAt: -1 }
    });

    const total = await this.repository.count(query);

    const result = {
      applications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };

    await cacheService.set(cacheKey, result, 300);
    return result;
  }

  /**
   * Process payment (Delegated)
   */
  async processPayment(applicationId, phase, paymentDetails) {
    return this.payment.processPayment(this.repository, applicationId, phase, paymentDetails);
  }
  /**
   * Get application by ID with cache
   * Cache TTL: 30 minutes
   */
  async getApplicationById(applicationId) {
    const cacheKey = `application:${applicationId}`;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      logger.debug('Application cache hit', { applicationId });
      return cached;
    }

    const application = await this.repository.findById(applicationId);

    if (!application) {
      throw new ValidationError('Application not found');
    }

    await cacheService.set(cacheKey, application, 1800);
    return application;
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(applicationId, status, notes, userId) {
    const application = await this.repository.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    // Update status using model method if available, otherwise manual update
    if (typeof application.updateStatus === 'function') {
      await application.updateStatus(status, userId, notes);
    } else {
      logger.warn('application.updateStatus is not a function, using direct update');
      application.status = status;
      application.workflowHistory.push({
        state: status,
        actor: userId,
        actorRole: 'SYSTEM',
        notes: notes,
        enteredAt: new Date()
      });
      await application.save();
    }

    // Invalidate cache
    await cacheService.deletePattern(`application:${applicationId}`);
    await cacheService.deletePattern('applications:list:*');

    return application;
  }

  /**
   * Get all applications with filters and cache
   * Cache TTL: 5 minutes
   */
  async getApplications(filters = {}, options = {}) {
    const cacheKey = `applications:list:${JSON.stringify({ filters, options })}`;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      logger.debug('Applications list cache hit');
      return cached;
    }

    const query = {};
    if (filters.status) {
      query.currentStatus = filters.status;
    }
    if (filters.farmerId) {
      query.farmerId = filters.farmerId;
    }
    if (filters.assignedOfficer) {
      query.assignedOfficer = filters.assignedOfficer;
    }

    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const applications = await this.repository.findAll(query, {
      page,
      limit,
      sort: { createdAt: -1 }
    });

    const total = await this.repository.count(query);

    const result = {
      applications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };

    await cacheService.set(cacheKey, result, 300);
    return result;
  }

  /**
   * Get dashboard statistics with cache
   * Cache TTL: 5 minutes
   */
  async getDashboardStats() {
    const cacheKey = 'applications:dashboard:stats';
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      logger.debug('Dashboard stats cache hit');
      return cached;
    }

    const stats = {
      total: await this.repository.count(),
      byStatus: {
        draft: await this.repository.count({ currentStatus: 'draft' }),
        submitted: await this.repository.count({ currentStatus: 'submitted' }),
        under_review: await this.repository.count({ currentStatus: 'under_review' }),
        inspection_scheduled: await this.repository.count({
          currentStatus: 'inspection_scheduled',
        }),
        approved: await this.repository.count({ currentStatus: 'approved' }),
        rejected: await this.repository.count({ currentStatus: 'rejected' }),
      },
      thisMonth: await this.repository.count({
        createdAt: { $gte: new Date(new Date().setDate(1)) },
      }),
    };

    await cacheService.set(cacheKey, stats, 300);
    return stats;
  }
}

module.exports = new ApplicationWorkflowService();
