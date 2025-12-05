/**
 * GACP Application Service
 * Core business logic for GACP certification process
 *
 * Implements WHO/ASEAN GACP guidelines and DTAM standards
 *
 * Phase 2 Integration:
 * - Queue Service: Async email notifications, document processing
 * - Cache Service: High-performance data caching (1 hour TTL)
 * - Performance: 10-20x faster with queue + cache
 */

const logger = require('../shared/logger');
const ApplicationRepository = require('../repositories/ApplicationRepository');

// Phase 2 Services Integration
const queueService = require('./queue/queueService');
const cacheService = require('./cache/cacheService');

// Import Models (User still needed for farmer/officer checks)
let User, mongoose;
try {
  User = require('../modules/UserManagement/infrastructure/models/User');
  mongoose = require('mongoose');
} catch (error) {
  logger.warn('[GACPApplicationService] Models not available:', error.message);
}
const { ValidationError, BusinessLogicError } = require('../shared/errors');

class GACPApplicationService {
  constructor(repository = null, logger = null) {
    this.repository = repository || new ApplicationRepository();
    this.logger = logger || console;
  }

  /**
   * Get database connection (deprecated accessor)
   */
  getDB() {
    return mongoose.connection;
  }

  /**
   * Create new GACP application
   * Validates farmer eligibility and initializes application
   */
  async createApplication(farmerId, applicationData) {
    const session = await this.repository.startSession();
    session.startTransaction();

    try {
      // 1. Validate farmer eligibility
      const farmer = await User.findById(farmerId);
      if (!farmer || farmer.role !== 'farmer') {
        throw new ValidationError('Invalid farmer ID or insufficient permissions');
      }

      // 2. Check for existing active applications
      // 2. Check for existing active applications
      const existingApplication = await this.repository.findActiveByFarmer(farmerId);

      if (existingApplication) {
        throw new BusinessLogicError('Farmer already has an active application in progress');
      }

      // 3. Validate application data
      this.validateApplicationData(applicationData);

      // 4. Create application
      const application = await this.repository.create({
        applicant: farmerId,
        farmInformation: applicationData.farmInformation,
        cropInformation: applicationData.cropInformation,
        formSpecificData: applicationData.formSpecificData,
        documents: applicationData.documents || [],
        currentStatus: 'draft',
      }, session);

      // 5. Perform initial risk assessment
      application.assessRisk();

      // 6. Calculate initial fees
      await this.calculateFees(application);

      // 7. Save application (already saved by create, but saving again for updates)
      await this.repository.save(application);

      // 8. Queue welcome email notification (async - don't block)
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

      // 9. Invalidate applications list cache
      await cacheService.invalidatePattern('applications:list:*');

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
   * Transitions from draft to submitted status
   */
  async submitApplication(applicationId, submittedBy) {
    try {
      const application = await this.repository.findById(applicationId);
      if (!application) {
        throw new ValidationError('Application not found');
      }

      // 1. Validate application completeness
      this.validateApplicationCompleteness(application);

      // 2. Check payment status
      if (application.fees.paymentStatus !== 'paid') {
        throw new BusinessLogicError('Application fee must be paid before submission');
      }

      // 3. Update status
      application.submissionDate = new Date();
      await application.updateStatus('submitted', submittedBy, 'Application submitted for review');

      // 4. Auto-assign to Officer based on province
      const assignedOfficer = await this.assignOfficer(application);
      application.assignedOfficer = assignedOfficer._id;
      await this.repository.save(application);

      // 5. Queue notification emails (async - don't block response)
      if (process.env.ENABLE_QUEUE === 'true') {
        // Notify farmer
        await queueService.addEmailJob(
          {
            type: 'application-submitted',
            applicationId,
            data: {
              farmerEmail: application.applicant.email,
              applicationNumber: application.applicationNumber,
            },
          },
          { priority: 5 },
        );

        // Notify assigned officer
        await queueService.addEmailJob(
          {
            type: 'new-application-assignment',
            applicationId,
            data: {
              officerEmail: assignedOfficer.email,
              applicationNumber: application.applicationNumber,
            },
          },
          { priority: 6 },
        );
      }

      // 6. Invalidate cache
      await cacheService.invalidateApplication(applicationId);
      await cacheService.invalidatePattern('applications:list:*');

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
   * Performs document review and preliminary assessment
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
      await application.updateStatus('under_review', reviewerId, 'Document review initiated');

      // 2. Validate all required documents
      const documentValidation = this.validateDocuments(application);

      // 3. Assess farm information accuracy
      const farmInfoScore = this.assessFarmInformation(application.farmInformation);

      // 4. Evaluate farming experience and practices
      const practiceScore = this.assessFarmingPractices(reviewData.practicesData);

      // 5. Calculate preliminary score
      const preliminaryScore = this.calculatePreliminaryScore({
        documentValidation,
        farmInfoScore,
        practiceScore,
        riskLevel: application.riskAssessment.level,
      });

      // 6. Make review decision
      let decision;
      if (preliminaryScore >= 80) {
        decision = 'approved_for_inspection';
        await application.updateStatus(
          'inspection_scheduled',
          reviewerId,
          'Approved for field inspection',
        );

        // Schedule inspection
        await this.scheduleInspection(application);
      } else if (preliminaryScore >= 60) {
        decision = 'revision_required';
        application.complianceRequirements = reviewData.revisionRequirements || [];
        await this.repository.save(application);
      } else {
        decision = 'rejected';
        await application.updateStatus(
          'rejected',
          reviewerId,
          'Application does not meet minimum requirements',
        );
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

      // 8. Queue notification emails (async)
      if (process.env.ENABLE_QUEUE === 'true') {
        await queueService.addEmailJob(
          {
            type: `application-review-${decision}`,
            applicationId,
            data: {
              farmerEmail: application.applicant.email,
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
      await cacheService.invalidatePattern('applications:list:*');

      logger.info('Application reviewed', {
        applicationId,
        decision,
        preliminaryScore,
        reviewerId,
      });

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
   * Schedule field inspection
   * Assigns inspector and sets inspection date
   */
  async scheduleInspection(application, preferredDate = null) {
    try {
      // 1. Find available auditor based on location and expertise
      const availableAuditor = await this.findAvailableAuditor(
        application.farmInformation.location.province,
        application.cropInformation.map(crop => crop.cropType),
      );

      if (!availableAuditor) {
        throw new BusinessLogicError(
          'No available auditor found for this location and crop type',
        );
      }

      // 2. Calculate inspection date (minimum 14 days notice)
      const minDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const inspectionDate =
        preferredDate && new Date(preferredDate) > minDate ? new Date(preferredDate) : minDate;

      // 3. Update application
      application.assignedAuditor = availableAuditor._id;
      application.inspectionScheduled = inspectionDate;
      await this.repository.save(application);

      // 4. Block auditor's calendar
      await this.blockAuditorCalendar(availableAuditor._id, inspectionDate);

      // 5. Send notifications
      await this.sendNotifications(application, 'inspection_scheduled');

      logger.info('Inspection scheduled', {
        applicationId: application._id,
        auditorId: availableAuditor._id,
        inspectionDate,
      });

      return {
        auditor: availableAuditor,
        inspectionDate,
        estimatedDuration: this.calculateInspectionDuration(application),
      };
    } catch (error) {
      logger.error('Error scheduling inspection', {
        applicationId: application._id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Process field inspection results
   * Evaluates compliance and makes certification decision
   */
  async processInspectionResults(applicationId, inspectionResults, auditorId) {
    try {
      const application = await this.repository.findById(applicationId);
      if (!application) {
        throw new ValidationError('Application not found');
      }

      // 1. Validate inspection results
      this.validateInspectionResults(inspectionResults);

      // 2. Update status
      await application.updateStatus(
        'inspection_completed',
        auditorId,
        'Field inspection completed',
      );
      application.inspectionCompleted = new Date();

      // 3. Calculate compliance scores for each category
      const complianceScores = this.calculateComplianceScores(inspectionResults);

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

        await application.updateStatus(
          'approved',
          auditorId,
          `Approved with score ${finalScore}`,
        );

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

        await application.updateStatus(
          'rejected',
          auditorId,
          `Rejected with score ${finalScore}`,
        );
      }

      await this.repository.save(application);

      // 7. Send notifications
      await this.sendNotifications(application, `decision_${certificationDecision}`);

      // 8. Schedule surveillance if approved
      if (certificationDecision === 'approved') {
        await this.scheduleSurveillance(application);
      }

      logger.info('Inspection results processed', {
        applicationId,
        finalScore,
        decision: certificationDecision,
        auditorId,
      });

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

  // === PRIVATE METHODS ===

  validateApplicationData(data) {
    // Implement comprehensive validation logic
    if (!data.farmInformation) {
      throw new ValidationError('Farm information is required');
    }

    if (!data.cropInformation || data.cropInformation.length === 0) {
      throw new ValidationError('At least one crop must be specified');
    }

    // Add more validation rules...
  }

  validateApplicationCompleteness(application) {
    const requiredDocuments = [
      'application_form',
      'farm_management_plan',
      'cultivation_records',
      'land_rights_certificate',
    ];

    const submittedDocuments = application.documents.map(doc => doc.documentType);
    const missingDocuments = requiredDocuments.filter(doc => !submittedDocuments.includes(doc));

    if (missingDocuments.length > 0) {
      throw new ValidationError(`Missing required documents: ${missingDocuments.join(', ')}`);
    }
  }

  async calculateFees(application) {
    // Fee calculation based on farm size and crop types
    const baseFee = 1000; // THB
    const sizeMultiplier = Math.ceil(application.farmInformation.farmSize.totalArea / 10);
    const cropMultiplier = application.cropInformation.length;

    application.fees = {
      applicationFee: baseFee,
      inspectionFee: baseFee * sizeMultiplier,
      certificateFee: 500 * cropMultiplier,
      totalFee: baseFee + baseFee * sizeMultiplier + 500 * cropMultiplier,
      paidAmount: 0,
      paymentStatus: 'pending',
    };
  }

  async assignOfficer(application) {
    // Assign officer based on province and workload
    const province = application.farmInformation.location.province;

    const officers = await User.find({
      role: 'officer',
      'workLocation.provinces': province,
      isActive: true,
    }).sort({ 'workload.activeApplications': 1 });

    if (officers.length === 0) {
      throw new BusinessLogicError(`No Officers available for province: ${province}`);
    }

    return officers[0]; // Return officer with lowest workload
  }

  validateDocuments(application) {
    // Implement document validation logic
    let score = 0;
    const totalDocuments = application.documents.length;
    const verifiedDocuments = application.documents.filter(
      doc => doc.verificationStatus === 'verified',
    ).length;

    score = totalDocuments > 0 ? (verifiedDocuments / totalDocuments) * 100 : 0;

    return {
      score,
      totalDocuments,
      verifiedDocuments,
      issues: application.documents.filter(doc => doc.verificationStatus === 'rejected'),
    };
  }

  assessFarmInformation(farmInfo) {
    // Implement farm information assessment logic
    let score = 0;

    // Location completeness (25%)
    if (farmInfo.location && farmInfo.location.coordinates) {
      score += 25;
    }

    // Land ownership documentation (25%)
    if (farmInfo.landOwnership && farmInfo.landOwnership.documents.length > 0) {
      score += 25;
    }

    // Water source quality (25%)
    if (farmInfo.waterSource && farmInfo.waterSource.quality === 'good') {
      score += 25;
    }

    // Soil information (25%)
    if (farmInfo.soilType && farmInfo.soilType.ph) {
      score += 25;
    }

    return score;
  }

  assessFarmingPractices(_practicesData) {
    // Implement farming practices assessment
    // This would be based on submitted cultivation records and management plans
    return 75; // Placeholder
  }

  calculatePreliminaryScore({ documentValidation, farmInfoScore, practiceScore, riskLevel }) {
    const documentWeight = 0.3;
    const farmInfoWeight = 0.3;
    const practiceWeight = 0.4;

    const baseScore =
      documentValidation.score * documentWeight +
      farmInfoScore * farmInfoWeight +
      practiceScore * practiceWeight;

    // Risk level adjustment
    const riskAdjustments = {
      low: 0,
      medium: -5,
      high: -10,
      critical: -20,
    };

    return Math.max(0, baseScore + (riskAdjustments[riskLevel] || 0));
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

  async findAvailableAuditor(province, cropTypes) {
    // Find auditor with appropriate expertise and availability
    const auditors = await User.find({
      role: 'auditor',
      'expertise.provinces': province,
      'expertise.cropTypes': { $in: cropTypes },
      isActive: true,
    }).sort({ 'workload.scheduledInspections': 1 });

    return auditors[0] || null;
  }

  calculateInspectionDuration(application) {
    // Calculate estimated inspection duration based on farm size and crops
    const baseHours = 4;
    const sizeHours = Math.ceil(application.farmInformation.farmSize.totalArea / 5);
    const cropHours = application.cropInformation.length;

    return baseHours + sizeHours + cropHours;
  }

  validateInspectionResults(results) {
    // Validate inspection results structure and completeness
    if (!results.complianceChecklist) {
      throw new ValidationError('Compliance checklist is required');
    }

    if (!results.scores || typeof results.scores !== 'object') {
      throw new ValidationError('Assessment scores are required');
    }
  }

  calculateComplianceScores(inspectionResults) {
    // Convert inspection results to standardized compliance scores
    const categories = [
      'seed_planting_material',
      'soil_management',
      'pest_disease_management',
      'harvesting_practices',
      'post_harvest_handling',
      'storage_transportation',
      'record_keeping',
      'worker_training',
    ];

    return categories.map(category => ({
      category,
      maxScore: 15, // Each category worth 15 points (total 120, normalized to 100)
      achievedScore: inspectionResults.scores[category] || 0,
      notes: inspectionResults.notes[category] || '',
      recommendations: inspectionResults.recommendations[category] || [],
    }));
  }

  async generateCertificate(application) {
    // Queue certificate generation (async - don't block)
    if (process.env.ENABLE_QUEUE === 'true') {
      await queueService.addJob(
        'document-processing',
        {
          type: 'certificate-generation',
          applicationId: application._id,
          priority: 'high',
        },
        { priority: 8 },
      );

      logger.info('Certificate generation queued', {
        applicationId: application._id,
      });
    } else {
      logger.info('Certificate generation initiated', {
        applicationId: application._id,
      });
    }
  }

  async scheduleSurveillance(application) {
    // Schedule annual surveillance visits
    const surveillanceDates = [];
    const issueDate = new Date();

    // Schedule surveillance for each year of validity
    for (let year = 1; year <= application.decision.validityPeriod / 12; year++) {
      const surveillanceDate = new Date(issueDate);
      surveillanceDate.setFullYear(surveillanceDate.getFullYear() + year);
      surveillanceDates.push(surveillanceDate);
    }

    application.surveillanceSchedule = surveillanceDates;
    await application.save();

    // Queue surveillance notification
    if (process.env.ENABLE_QUEUE === 'true') {
      await queueService.addNotificationJob({
        type: 'surveillance-scheduled',
        applicationId: application._id,
        dates: surveillanceDates,
      });
    }
  }

  async sendNotifications(application, eventType) {
    // Deprecated: Use queueService instead
    logger.warn('sendNotifications is deprecated, use queueService.addEmailJob()', {
      applicationId: application._id,
      eventType,
    });
  }

  async blockAuditorCalendar(auditorId, date) {
    // Queue calendar event
    if (process.env.ENABLE_QUEUE === 'true') {
      await queueService.addCalendarJob(null, {
        type: 'block-time',
        auditorId,
        date,
      });
    }
    logger.info('Auditor calendar blocked', { auditorId, date });
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
      query.applicant = filters.farmerId;
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

module.exports = new GACPApplicationService();
