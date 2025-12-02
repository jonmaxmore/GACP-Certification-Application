/**
 * 📋 Application Workflow Controller
 * HTTP request handlers for application workflow operations
 */

const { successResponse, errorResponse } = require('../../shared/response');
const logger = require('../../shared/utils/logger');

class ApplicationWorkflowController {
  constructor(workflowService) {
    this.workflowService = workflowService;
  }

  /**
   * Create new application
   * POST /api/applications
   */
  createApplication = async (req, res) => {
    try {
      const applicationData = {
        ...req.body,
        farmerId: req.user.id,
        farmerEmail: req.user.email,
      };

      const application = await this.workflowService.createApplication(applicationData);

      return successResponse(res, application, 'Application created successfully', 201);
    } catch (error) {
      logger.error('[WorkflowController] Create application error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Submit application
   * POST /api/applications/:id/submit
   */
  submitApplication = async (req, res) => {
    try {
      const application = await this.workflowService.submitApplication(req.params.id, req.user.id);

      return successResponse(res, application, 'Application submitted successfully');
    } catch (error) {
      logger.error('[WorkflowController] Submit application error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Start document review (reviewer)
   * POST /api/applications/:id/review
   */
  startReview = async (req, res) => {
    try {
      // Check if user is admin/reviewer
      if (req.user.role !== 'admin' && req.user.role !== 'reviewer') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const application = await this.workflowService.startDocumentReview(
        req.params.id,
        req.user.id,
      );

      return successResponse(res, application, 'Document review started');
    } catch (error) {
      logger.error('[WorkflowController] Start review error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Complete document review
   * POST /api/applications/:id/review/complete
   */
  completeReview = async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'reviewer') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const reviewResult = {
        ...req.body,
        reviewerId: req.user.id,
      };

      const application = await this.workflowService.completeDocumentReview(
        req.params.id,
        reviewResult,
      );

      return successResponse(res, application, 'Document review completed');
    } catch (error) {
      logger.error('[WorkflowController] Complete review error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Start field inspection
   * POST /api/applications/:id/inspection/start
   */
  startInspection = async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'inspector') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const application = await this.workflowService.startFieldInspection(
        req.params.id,
        req.user.id,
      );

      return successResponse(res, application, 'Field inspection started');
    } catch (error) {
      logger.error('[WorkflowController] Start inspection error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Complete field inspection
   * POST /api/applications/:id/inspection/complete
   */
  completeInspection = async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'inspector') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const inspectionReport = {
        ...req.body,
        inspectorId: req.user.id,
      };

      const application = await this.workflowService.completeFieldInspection(
        req.params.id,
        inspectionReport,
      );

      return successResponse(res, application, 'Field inspection completed');
    } catch (error) {
      logger.error('[WorkflowController] Complete inspection error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Approve application (admin)
   * POST /api/applications/:id/approve
   */
  approveApplication = async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const application = await this.workflowService.approveApplication(
        req.params.id,
        req.user.id,
        req.body.note,
      );

      return successResponse(res, application, 'Application approved successfully');
    } catch (error) {
      logger.error('[WorkflowController] Approve application error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Reject application (admin)
   * POST /api/applications/:id/reject
   */
  rejectApplication = async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const application = await this.workflowService.rejectApplication(
        req.params.id,
        req.body.reason,
        req.user.id,
      );

      return successResponse(res, application, 'Application rejected');
    } catch (error) {
      logger.error('[WorkflowController] Reject application error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get application by ID
   * GET /api/applications/:id
   */
  getApplicationById = async (req, res) => {
    try {
      const application = await this.workflowService.getApplication(req.params.id);

      // Check permission
      if (
        application.farmerId !== req.user.id &&
        req.user.role !== 'admin' &&
        req.user.role !== 'reviewer' &&
        req.user.role !== 'inspector'
      ) {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      return successResponse(res, application);
    } catch (error) {
      logger.error('[WorkflowController] Get application error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Update application step data
   * PUT /api/applications/:id/step/:stepId
   */
  updateStepData = async (req, res) => {
    try {
      const { id, stepId } = req.params;
      const { stepData } = req.body;

      // Get application to check ownership
      const application = await this.workflowService.getApplication(id);

      // Check permission
      if (application.farmerId !== req.user.id) {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      // Update step data
      const stepKey = `step${stepId}`;
      const updateData = {
        [stepKey]: stepData,
        updatedAt: new Date(),
      };

      // Add step to completed steps if not already there
      if (!application.completedSteps?.includes(parseInt(stepId))) {
        await this.workflowService.collection.updateOne(
          { id },
          {
            $set: updateData,
            $addToSet: { completedSteps: parseInt(stepId) },
          },
        );
      } else {
        await this.workflowService.collection.updateOne({ id }, { $set: updateData });
      }

      // Get updated application
      const updatedApplication = await this.workflowService.getApplication(id);

      return successResponse(res, updatedApplication, `Step ${stepId} saved successfully`);
    } catch (error) {
      logger.error('[WorkflowController] Update step error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * List applications (with filters)
   * GET /api/applications
   */
  listApplications = async (req, res) => {
    try {
      const filters = {};

      // If not admin, only show own applications
      if (
        req.user.role !== 'admin' &&
        req.user.role !== 'reviewer' &&
        req.user.role !== 'inspector'
      ) {
        filters.farmerId = req.user.id;
      }

      // Apply query filters
      if (req.query.status) {
        filters.status = req.query.status;
      }

      const applications = await this.workflowService.collection
        .find(filters)
        .sort({ 'metadata.createdAt': -1 })
        .toArray();

      return successResponse(res, {
        applications,
        total: applications.length,
      });
    } catch (error) {
      logger.error('[WorkflowController] List applications error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get workflow statistics (admin)
   * GET /api/applications/statistics
   */
  getStatistics = async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const stats = await this.workflowService.getWorkflowStatistics();

      return successResponse(res, stats);
    } catch (error) {
      logger.error('[WorkflowController] Get statistics error:', error);
      return errorResponse(res, error);
    }
  };
}

module.exports = ApplicationWorkflowController;
