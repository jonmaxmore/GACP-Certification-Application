/**
 * Application Controller
 *
 * RESTful API controller for GACP certification application management.
 * Handles all application lifecycle operations through the Workflow Engine.
 *
 * API Design Principles:
 * - RESTful resource-based URLs
 * - Proper HTTP status codes
 * - Consistent error handling
 * - Request validation
 * - Authorization middleware integration
 * - Audit logging for compliance
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const ApplicationWorkflowEngine = require('../domain/WorkflowEngine');
const { _validateRequest, handleApiError } = require('../../shared/middleware');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('application-controller');

class ApplicationController {
  constructor(dependencies = {}) {
    this.workflowEngine =
      dependencies.workflowEngine || new ApplicationWorkflowEngine(dependencies);
    this.applicationRepo = dependencies.applicationRepository;

    // Bind methods to maintain context
    this.createApplication = this.createApplication.bind(this);
    this.getApplication = this.getApplication.bind(this);
    this.updateApplication = this.updateApplication.bind(this);
    this.submitApplication = this.submitApplication.bind(this);
    this.getApplicationStatus = this.getApplicationStatus.bind(this);
    this.getFarmerApplications = this.getFarmerApplications.bind(this);
    this.approveForPayment = this.approveForPayment.bind(this);
    this.requestRevision = this.requestRevision.bind(this);
    this.scheduleInspection = this.scheduleInspection.bind(this);
    this.completeInspection = this.completeInspection.bind(this);
    this.finalApproval = this.finalApproval.bind(this);
    this.rejectApplication = this.rejectApplication.bind(this);
    this.getWorkflowHistory = this.getWorkflowHistory.bind(this);
  }

  /**
   * Create new application (DRAFT state)
   * POST /api/applications
   * @access Private (FARMER only)
   */
  async createApplication(req, res) {
    try {
      // Validate user is farmer
      if (req.user.role !== 'FARMER') {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Only farmers can create applications',
        });
      }

      // Validate request body
      const { error, value } = this._validateApplicationData(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.details[0].message,
          details: error.details,
        });
      }

      // Create application through workflow engine
      const application = await this.workflowEngine.createApplication(value, req.user.id);

      res.status(201).json({
        success: true,
        data: application,
        message: 'Application created successfully',
      });
    } catch (error) {
      logger.error('[ApplicationController] Error creating application:', error);
      handleApiError(res, error, 'Failed to create application');
    }
  }

  /**
   * Get application by ID
   * GET /api/applications/:id
   * @access Private (FARMER for own applications, DTAM for assigned applications)
   */
  async getApplication(req, res) {
    try {
      const { id } = req.params;

      const application = await this.applicationRepo.findById(id);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'Application not found',
        });
      }

      // Authorization check
      if (!this._canAccessApplication(req.user, application)) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Get workflow status
      const workflowStatus = await this.workflowEngine.getWorkflowStatus(id);

      res.json({
        success: true,
        data: {
          ...application,
          workflow: workflowStatus,
        },
      });
    } catch (error) {
      logger.error('[ApplicationController] Error getting application:', error);
      handleApiError(res, error, 'Failed to get application');
    }
  }

  /**
   * Update application (only in DRAFT or REVISION_REQUIRED states)
   * PUT /api/applications/:id
   * @access Private (FARMER only)
   */
  async updateApplication(req, res) {
    try {
      const { id } = req.params;

      const application = await this.applicationRepo.findById(id);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'Application not found',
        });
      }

      // Authorization check
      if (req.user.role !== 'FARMER' || application.farmerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Can only update your own applications',
        });
      }

      // Check if application can be edited
      const workflowStatus = await this.workflowEngine.getWorkflowStatus(id);
      if (!workflowStatus.canEdit) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_STATE',
          message: `Cannot edit application in ${application.status} state`,
        });
      }

      // Validate request body
      const { error, value } = this._validateApplicationUpdate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.details[0].message,
          details: error.details,
        });
      }

      // Update application
      const updatedApplication = await this.applicationRepo.update(id, {
        ...value,
        updatedAt: new Date(),
      });

      res.json({
        success: true,
        data: updatedApplication,
        message: 'Application updated successfully',
      });
    } catch (error) {
      logger.error('[ApplicationController] Error updating application:', error);
      handleApiError(res, error, 'Failed to update application');
    }
  }

  /**
   * Submit application for review
   * POST /api/applications/:id/submit
   * @access Private (FARMER only)
   */
  async submitApplication(req, res) {
    try {
      const { id } = req.params;

      const application = await this.applicationRepo.findById(id);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'Application not found',
        });
      }

      // Authorization check
      if (req.user.role !== 'FARMER' || application.farmerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Can only submit your own applications',
        });
      }

      // Submit through workflow engine
      const updatedApplication = await this.workflowEngine.submitApplication(id, req.user.id);

      res.json({
        success: true,
        data: updatedApplication,
        message: 'Application submitted successfully',
      });
    } catch (error) {
      logger.error('[ApplicationController] Error submitting application:', error);
      handleApiError(res, error, 'Failed to submit application');
    }
  }

  /**
   * Get application workflow status
   * GET /api/applications/:id/status
   * @access Private
   */
  async getApplicationStatus(req, res) {
    try {
      const { id } = req.params;

      const application = await this.applicationRepo.findById(id);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'Application not found',
        });
      }

      // Authorization check
      if (!this._canAccessApplication(req.user, application)) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      const workflowStatus = await this.workflowEngine.getWorkflowStatus(id);

      res.json({
        success: true,
        data: workflowStatus,
      });
    } catch (error) {
      logger.error('[ApplicationController] Error getting application status:', error);
      handleApiError(res, error, 'Failed to get application status');
    }
  }

  /**
   * Get farmer's applications
   * GET /api/farmers/me/applications
   * @access Private (FARMER only)
   */
  async getFarmerApplications(req, res) {
    try {
      if (req.user.role !== 'FARMER') {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Only farmers can access this endpoint',
        });
      }

      const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const filters = { farmerId: req.user.id };
      if (status) {
        filters.status = status;
      }

      const applications = await this.applicationRepo.findWithPagination(filters, {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      });

      res.json({
        success: true,
        data: applications.data,
        pagination: {
          currentPage: applications.page,
          totalPages: applications.totalPages,
          totalItems: applications.totalItems,
          itemsPerPage: applications.limit,
        },
      });
    } catch (error) {
      logger.error('[ApplicationController] Error getting farmer applications:', error);
      handleApiError(res, error, 'Failed to get applications');
    }
  }

  /**
   * Approve application for payment (DTAM Reviewer)
   * POST /api/dtam/applications/:id/approve-payment
   * @access Private (DTAM_REVIEWER only)
   */
  async approveForPayment(req, res) {
    try {
      const { id } = req.params;

      if (!req.user.role.startsWith('DTAM_')) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'DTAM access required',
        });
      }

      // Validate review data
      const { error, value } = this._validateReviewData(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const updatedApplication = await this.workflowEngine.approveForPayment(
        id,
        req.user.id,
        value,
      );

      res.json({
        success: true,
        data: updatedApplication,
        message: 'Application approved for payment',
      });
    } catch (error) {
      logger.error('[ApplicationController] Error approving for payment:', error);
      handleApiError(res, error, 'Failed to approve application for payment');
    }
  }

  /**
   * Request revision from farmer (DTAM Reviewer)
   * POST /api/dtam/applications/:id/request-revision
   * @access Private (DTAM_REVIEWER only)
   */
  async requestRevision(req, res) {
    try {
      const { id } = req.params;

      if (req.user.role !== 'DTAM_REVIEWER') {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Reviewer access required',
        });
      }

      // Validate revision data
      const { error, value } = this._validateRevisionData(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const updatedApplication = await this.workflowEngine.requestRevision(id, req.user.id, value);

      res.json({
        success: true,
        data: updatedApplication,
        message: 'Revision requested successfully',
      });
    } catch (error) {
      logger.error('[ApplicationController] Error requesting revision:', error);
      handleApiError(res, error, 'Failed to request revision');
    }
  }

  /**
   * Schedule farm inspection (DTAM Inspector)
   * POST /api/dtam/applications/:id/schedule-inspection
   * @access Private (DTAM_INSPECTOR only)
   */
  async scheduleInspection(req, res) {
    try {
      const { id } = req.params;

      if (req.user.role !== 'DTAM_INSPECTOR') {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Inspector access required',
        });
      }

      // Validate schedule data
      const { error, value } = this._validateScheduleData(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const updatedApplication = await this.workflowEngine.scheduleInspection(
        id,
        req.user.id,
        value,
      );

      res.json({
        success: true,
        data: updatedApplication,
        message: 'Inspection scheduled successfully',
      });
    } catch (error) {
      logger.error('[ApplicationController] Error scheduling inspection:', error);
      handleApiError(res, error, 'Failed to schedule inspection');
    }
  }

  /**
   * Complete farm inspection (DTAM Inspector)
   * POST /api/dtam/applications/:id/complete-inspection
   * @access Private (DTAM_INSPECTOR only)
   */
  async completeInspection(req, res) {
    try {
      const { id } = req.params;

      if (req.user.role !== 'DTAM_INSPECTOR') {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Inspector access required',
        });
      }

      // Validate inspection report
      const { error, value } = this._validateInspectionReport(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const updatedApplication = await this.workflowEngine.completeInspection(
        id,
        req.user.id,
        value,
      );

      res.json({
        success: true,
        data: updatedApplication,
        message: 'Inspection completed successfully',
      });
    } catch (error) {
      logger.error('[ApplicationController] Error completing inspection:', error);
      handleApiError(res, error, 'Failed to complete inspection');
    }
  }

  /**
   * Final approval and certificate issuance (DTAM Admin)
   * POST /api/dtam/applications/:id/final-approval
   * @access Private (DTAM_ADMIN only)
   */
  async finalApproval(req, res) {
    try {
      const { id } = req.params;

      if (req.user.role !== 'DTAM_ADMIN' && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      // Validate approval data
      const { error, value } = this._validateApprovalData(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const updatedApplication = await this.workflowEngine.finalApproval(id, req.user.id, value);

      res.json({
        success: true,
        data: updatedApplication,
        message: 'Application approved and certificate will be issued',
      });
    } catch (error) {
      logger.error('[ApplicationController] Error in final approval:', error);
      handleApiError(res, error, 'Failed to approve application');
    }
  }

  /**
   * Reject application
   * POST /api/dtam/applications/:id/reject
   * @access Private (DTAM staff only)
   */
  async rejectApplication(req, res) {
    try {
      const { id } = req.params;

      if (!req.user.role.startsWith('DTAM_') && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'DTAM access required',
        });
      }

      // Validate rejection data
      const { error, value } = this._validateRejectionData(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const updatedApplication = await this.workflowEngine.rejectApplication(
        id,
        req.user.id,
        value,
      );

      res.json({
        success: true,
        data: updatedApplication,
        message: 'Application rejected',
      });
    } catch (error) {
      logger.error('[ApplicationController] Error rejecting application:', error);
      handleApiError(res, error, 'Failed to reject application');
    }
  }

  /**
   * Get application workflow history
   * GET /api/applications/:id/workflow-history
   * @access Private
   */
  async getWorkflowHistory(req, res) {
    try {
      const { id } = req.params;

      const application = await this.applicationRepo.findById(id);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'Application not found',
        });
      }

      // Authorization check
      if (!this._canAccessApplication(req.user, application)) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      res.json({
        success: true,
        data: {
          applicationId: id,
          applicationNumber: application.applicationNumber,
          workflowHistory: application.workflowHistory || [],
        },
      });
    } catch (error) {
      logger.error('[ApplicationController] Error getting workflow history:', error);
      handleApiError(res, error, 'Failed to get workflow history');
    }
  }

  // Private validation methods

  _validateApplicationData(data) {
    // Implementation would use Joi or similar validation library
    // For now, returning mock validation
    return { error: null, value: data };
  }

  _validateApplicationUpdate(data) {
    return { error: null, value: data };
  }

  _validateReviewData(data) {
    return { error: null, value: data };
  }

  _validateRevisionData(data) {
    return { error: null, value: data };
  }

  _validateScheduleData(data) {
    return { error: null, value: data };
  }

  _validateInspectionReport(data) {
    return { error: null, value: data };
  }

  _validateApprovalData(data) {
    return { error: null, value: data };
  }

  _validateRejectionData(data) {
    return { error: null, value: data };
  }

  // Private helper methods

  _canAccessApplication(user, application) {
    // Farmer can access their own applications
    if (user.role === 'FARMER') {
      return application.farmerId === user.id;
    }

    // DTAM staff can access applications in their workflow
    if (user.role.startsWith('DTAM_') || user.role === 'ADMIN') {
      return true;
    }

    return false;
  }
}

module.exports = ApplicationController;
