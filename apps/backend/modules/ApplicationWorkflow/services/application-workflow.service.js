/**
 * 📋 Application Workflow Service
 * Business logic for GACP certification application workflow
 */

const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../../shared/utils/error-handler-utils');
const logger = require('../../shared/utils/logger');

class ApplicationWorkflowService {
  constructor(db) {
    this.db = db;
    this.collection = db ? db.collection('applications') : null;
    logger.info('[WorkflowService] Service initialized');
  }

  /**
   * Create new application
   */
  async createApplication(applicationData) {
    try {
      const application = {
        id: uuidv4(),
        applicationNumber: this._generateApplicationNumber(),
        ...applicationData,
        status: 'draft',
        workflowState: 'draft',
        currentStep: 1,
        completedSteps: [],
        history: [
          {
            action: 'created',
            timestamp: new Date(),
            userId: applicationData.farmerId,
            note: 'Application created',
          },
        ],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
      };

      // Validate required fields
      if (!application.farmerId || !application.farmerEmail) {
        throw new AppError('Farmer ID and email are required', 400);
      }

      // Save to database
      if (this.collection) {
        await this.collection.insertOne(application);
      }

      logger.info(`[WorkflowService] Application created: ${application.id}`, {
        farmerId: application.farmerId,
        applicationNumber: application.applicationNumber,
      });

      return application;
    } catch (error) {
      logger.error('[WorkflowService] Error creating application:', error);
      throw error;
    }
  }

  /**
   * Get application by ID
   */
  async getApplication(applicationId) {
    try {
      if (!this.collection) {
        throw new AppError('Database not initialized', 500);
      }

      const application = await this.collection.findOne({ id: applicationId });

      if (!application) {
        throw new AppError('Application not found', 404);
      }

      return application;
    } catch (error) {
      logger.error(`[WorkflowService] Error getting application ${applicationId}:`, error);
      throw error;
    }
  }

  /**
   * Submit application for review
   */
  async submitApplication(applicationId, userId) {
    try {
      const application = await this.getApplication(applicationId);

      if (application.status !== 'draft') {
        throw new AppError('Only draft applications can be submitted', 400);
      }

      // Validate application completeness
      this._validateApplicationForSubmission(application);

      // Update status
      await this.collection.updateOne(
        { id: applicationId },
        {
          $set: {
            status: 'submitted',
            workflowState: 'pending_review',
            submittedAt: new Date(),
            'metadata.updatedAt': new Date(),
          },
          $push: {
            history: {
              action: 'submitted',
              timestamp: new Date(),
              userId,
              note: 'Application submitted for review',
            },
          },
        },
      );

      logger.info(`[WorkflowService] Application submitted: ${applicationId}`);

      return { ...application, status: 'submitted', workflowState: 'pending_review' };
    } catch (error) {
      logger.error('[WorkflowService] Error submitting application:', error);
      throw error;
    }
  }

  /**
   * Start document review (reviewer)
   */
  async startDocumentReview(applicationId, reviewerId) {
    try {
      const application = await this.getApplication(applicationId);

      if (application.status !== 'submitted' && application.workflowState !== 'pending_review') {
        throw new AppError('Application must be in submitted state', 400);
      }

      await this.collection.updateOne(
        { id: applicationId },
        {
          $set: {
            status: 'in_review',
            workflowState: 'document_review',
            'review.startedAt': new Date(),
            'review.reviewerId': reviewerId,
            'metadata.updatedAt': new Date(),
          },
          $push: {
            history: {
              action: 'review_started',
              timestamp: new Date(),
              userId: reviewerId,
              note: 'Document review started',
            },
          },
        },
      );

      logger.info(`[WorkflowService] Document review started: ${applicationId}`, {
        reviewerId,
      });

      return { ...application, status: 'in_review', workflowState: 'document_review' };
    } catch (error) {
      logger.error('[WorkflowService] Error starting review:', error);
      throw error;
    }
  }

  /**
   * Complete document review
   */
  async completeDocumentReview(applicationId, reviewResult) {
    try {
      const application = await this.getApplication(applicationId);

      if (application.workflowState !== 'document_review') {
        throw new AppError('Application must be in document review state', 400);
      }

      const { approved, findings, reviewerId } = reviewResult;

      const updateData = {
        'review.completedAt': new Date(),
        'review.approved': approved,
        'review.findings': findings,
        'metadata.updatedAt': new Date(),
      };

      if (approved) {
        updateData.status = 'in_review';
        updateData.workflowState = 'pending_inspection';
      } else {
        updateData.status = 'revision_required';
        updateData.workflowState = 'revision';
      }

      await this.collection.updateOne(
        { id: applicationId },
        {
          $set: updateData,
          $push: {
            history: {
              action: 'review_completed',
              timestamp: new Date(),
              userId: reviewerId,
              note: approved ? 'Document review approved' : 'Revision required',
              details: findings,
            },
          },
        },
      );

      logger.info(`[WorkflowService] Document review completed: ${applicationId}`, {
        approved,
      });

      return { ...application, ...updateData };
    } catch (error) {
      logger.error('[WorkflowService] Error completing review:', error);
      throw error;
    }
  }

  /**
   * Start field inspection
   */
  async startFieldInspection(applicationId, inspectorId) {
    try {
      const application = await this.getApplication(applicationId);

      if (application.workflowState !== 'pending_inspection') {
        throw new AppError('Application must be pending inspection', 400);
      }

      await this.collection.updateOne(
        { id: applicationId },
        {
          $set: {
            status: 'in_inspection',
            workflowState: 'field_inspection',
            'inspection.startedAt': new Date(),
            'inspection.inspectorId': inspectorId,
            'metadata.updatedAt': new Date(),
          },
          $push: {
            history: {
              action: 'inspection_started',
              timestamp: new Date(),
              userId: inspectorId,
              note: 'Field inspection started',
            },
          },
        },
      );

      logger.info(`[WorkflowService] Field inspection started: ${applicationId}`, {
        inspectorId,
      });

      return { ...application, status: 'in_inspection', workflowState: 'field_inspection' };
    } catch (error) {
      logger.error('[WorkflowService] Error starting inspection:', error);
      throw error;
    }
  }

  /**
   * Complete field inspection
   */
  async completeFieldInspection(applicationId, inspectionReport) {
    try {
      const application = await this.getApplication(applicationId);

      if (application.workflowState !== 'field_inspection') {
        throw new AppError('Application must be in field inspection state', 400);
      }

      const { passed, findings, complianceScore, inspectorId } = inspectionReport;

      const updateData = {
        'inspection.completedAt': new Date(),
        'inspection.passed': passed,
        'inspection.findings': findings,
        'inspection.complianceScore': complianceScore,
        'metadata.updatedAt': new Date(),
      };

      if (passed && complianceScore >= 80) {
        updateData.status = 'pending_approval';
        updateData.workflowState = 'pending_approval';
      } else {
        updateData.status = 'revision_required';
        updateData.workflowState = 'revision';
      }

      await this.collection.updateOne(
        { id: applicationId },
        {
          $set: updateData,
          $push: {
            history: {
              action: 'inspection_completed',
              timestamp: new Date(),
              userId: inspectorId,
              note: passed ? 'Field inspection passed' : 'Inspection failed - revision required',
              details: { complianceScore, findings },
            },
          },
        },
      );

      logger.info(`[WorkflowService] Field inspection completed: ${applicationId}`, {
        passed,
        complianceScore,
      });

      return { ...application, ...updateData };
    } catch (error) {
      logger.error('[WorkflowService] Error completing inspection:', error);
      throw error;
    }
  }

  /**
   * Approve application (admin)
   */
  async approveApplication(applicationId, adminId, note) {
    try {
      const application = await this.getApplication(applicationId);

      if (application.workflowState !== 'pending_approval') {
        throw new AppError('Application must be pending approval', 400);
      }

      const certificateNumber = this._generateCertificateNumber();

      await this.collection.updateOne(
        { id: applicationId },
        {
          $set: {
            status: 'approved',
            workflowState: 'approved',
            approvedAt: new Date(),
            approvedBy: adminId,
            certificateNumber,
            'metadata.updatedAt': new Date(),
          },
          $push: {
            history: {
              action: 'approved',
              timestamp: new Date(),
              userId: adminId,
              note: note || 'Application approved',
              details: { certificateNumber },
            },
          },
        },
      );

      logger.info(`[WorkflowService] Application approved: ${applicationId}`, {
        certificateNumber,
      });

      return { ...application, status: 'approved', certificateNumber };
    } catch (error) {
      logger.error('[WorkflowService] Error approving application:', error);
      throw error;
    }
  }

  /**
   * Reject application (admin)
   */
  async rejectApplication(applicationId, reason, adminId) {
    try {
      const application = await this.getApplication(applicationId);

      await this.collection.updateOne(
        { id: applicationId },
        {
          $set: {
            status: 'rejected',
            workflowState: 'rejected',
            rejectedAt: new Date(),
            rejectedBy: adminId,
            rejectionReason: reason,
            'metadata.updatedAt': new Date(),
          },
          $push: {
            history: {
              action: 'rejected',
              timestamp: new Date(),
              userId: adminId,
              note: 'Application rejected',
              details: { reason },
            },
          },
        },
      );

      logger.info(`[WorkflowService] Application rejected: ${applicationId}`);

      return { ...application, status: 'rejected', rejectionReason: reason };
    } catch (error) {
      logger.error('[WorkflowService] Error rejecting application:', error);
      throw error;
    }
  }

  /**
   * Get workflow statistics (admin)
   */
  async getWorkflowStatistics() {
    try {
      if (!this.collection) {
        throw new AppError('Database not initialized', 500);
      }

      const stats = await this.collection
        .aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      const total = await this.collection.countDocuments();

      const avgProcessingTime = await this._calculateAvgProcessingTime();

      return {
        total,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        avgProcessingTime,
      };
    } catch (error) {
      logger.error('[WorkflowService] Error getting statistics:', error);
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Generate application number (APP-YYYYMMDD-XXXX)
   */
  _generateApplicationNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    return `APP-${year}${month}${day}-${random}`;
  }

  /**
   * Generate certificate number (CERT-YYYY-XXXX)
   */
  _generateCertificateNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    return `CERT-${year}-${random}`;
  }

  /**
   * Validate application completeness before submission
   */
  _validateApplicationForSubmission(application) {
    const requiredFields = ['farmerId', 'farmerEmail'];

    for (const field of requiredFields) {
      if (!application[field]) {
        throw new AppError(`Missing required field: ${field}`, 400);
      }
    }

    // Check if all required steps are completed
    const requiredSteps = [1, 2, 3, 4, 5, 6, 7];
    const completedSteps = application.completedSteps || [];

    const missingSteps = requiredSteps.filter(step => !completedSteps.includes(step));

    if (missingSteps.length > 0) {
      throw new AppError(`Incomplete steps: ${missingSteps.join(', ')}`, 400);
    }
  }

  /**
   * Calculate average processing time (days)
   */
  async _calculateAvgProcessingTime() {
    try {
      const approvedApps = await this.collection
        .find({
          status: 'approved',
          approvedAt: { $exists: true },
          'metadata.createdAt': { $exists: true },
        })
        .toArray();

      if (approvedApps.length === 0) {
        return 0;
      }

      const totalDays = approvedApps.reduce((sum, app) => {
        const created = new Date(app.metadata.createdAt);
        const approved = new Date(app.approvedAt);
        const days = Math.ceil((approved - created) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);

      return Math.round(totalDays / approvedApps.length);
    } catch (error) {
      logger.error('[WorkflowService] Error calculating avg processing time:', error);
      return 0;
    }
  }
}

module.exports = ApplicationWorkflowService;
