/**
 * 📋 Application Workflow API Routes
 * API endpoints สำหรับระบบสมัครใบรับรอง GACP
 */

const logger = require('../../shared/logger/logger');
const express = require('express');
const router = express.Router();

module.exports = (dependencies = {}) => {
  const { workflowEngine, auth } = dependencies;

  // 🔍 PM DEBUG: Check dependencies received
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('🔍 [ApplicationAPI] Received dependencies:');
  logger.info('   workflowEngine:', workflowEngine ? '✅ EXISTS' : '❌ UNDEFINED');
  logger.info('   auth:', auth ? '✅ EXISTS' : '❌ UNDEFINED');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!workflowEngine) {
    logger.error('❌ [ApplicationAPI] WorkflowEngine not provided - returning empty router');
    return router;
  }

  if (!auth) {
    logger.error('❌ [ApplicationAPI] Auth middleware not provided - returning empty router');
    return router;
  }

  logger.info('✅ [ApplicationAPI] All dependencies OK - registering routes...');

  /**
   * POST /api/applications
   * สร้างใบสมัครใหม่
   */
  router.post('/applications', auth, async (req, res) => {
    try {
      const applicationData = {
        ...req.body,
        farmerId: req.user.id,
        farmerEmail: req.user.email,
      };

      const application = await workflowEngine.createApplication(applicationData);

      res.status(201).json({
        success: true,
        message: 'Application created successfully',
        data: application,
      });
    } catch (error) {
      logger.error('[ApplicationAPI] Create error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * POST /api/applications/:id/submit
   * ยื่นใบสมัคร
   */
  router.post('/applications/:id/submit', auth, async (req, res) => {
    try {
      const application = await workflowEngine.submitApplication(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'Application submitted successfully',
        data: application,
      });
    } catch (error) {
      logger.error('[ApplicationAPI] Submit error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * POST /api/applications/:id/review
   * เริ่มตรวจสอบเอกสาร (Admin only)
   */
  router.post('/applications/:id/review', auth, async (req, res) => {
    try {
      // Check if user is admin/reviewer
      if (req.user.role !== 'admin' && req.user.role !== 'reviewer') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      const application = await workflowEngine.startDocumentReview(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'Document review started',
        data: application,
      });
    } catch (error) {
      logger.error('[ApplicationAPI] Review error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * POST /api/applications/:id/review/complete
   * เสร็จสิ้นการตรวจสอบเอกสาร
   */
  router.post('/applications/:id/review/complete', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'reviewer') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      const reviewResult = {
        ...req.body,
        reviewerId: req.user.id,
      };

      const application = await workflowEngine.completeDocumentReview(req.params.id, reviewResult);

      res.json({
        success: true,
        message: 'Document review completed',
        data: application,
      });
    } catch (error) {
      logger.error('[ApplicationAPI] Review complete error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * POST /api/applications/:id/inspection/start
   * เริ่มการตรวจสอบหน้างาน
   */
  router.post('/applications/:id/inspection/start', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'inspector') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      const application = await workflowEngine.startFieldInspection(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'Field inspection started',
        data: application,
      });
    } catch (error) {
      logger.error('[ApplicationAPI] Inspection start error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * POST /api/applications/:id/inspection/complete
   * บันทึกผลการตรวจสอบหน้างาน
   */
  router.post('/applications/:id/inspection/complete', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'inspector') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      const inspectionReport = {
        ...req.body,
        inspectorId: req.user.id,
      };

      const application = await workflowEngine.completeFieldInspection(
        req.params.id,
        inspectionReport,
      );

      res.json({
        success: true,
        message: 'Field inspection completed',
        data: application,
      });
    } catch (error) {
      logger.error('[ApplicationAPI] Inspection complete error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * POST /api/applications/:id/approve
   * อนุมัติใบสมัคร (Admin only)
   */
  router.post('/applications/:id/approve', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      const application = await workflowEngine.approveApplication(
        req.params.id,
        req.user.id,
        req.body.note,
      );

      res.json({
        success: true,
        message: 'Application approved successfully',
        data: application,
      });
    } catch (error) {
      logger.error('[ApplicationAPI] Approve error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * POST /api/applications/:id/reject
   * ปฏิเสธใบสมัคร (Admin only)
   */
  router.post('/applications/:id/reject', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      const application = await workflowEngine.rejectApplication(
        req.params.id,
        req.body.reason,
        req.user.id,
      );

      res.json({
        success: true,
        message: 'Application rejected',
        data: application,
      });
    } catch (error) {
      logger.error('[ApplicationAPI] Reject error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * GET /api/applications/:id
   * ดูรายละเอียดใบสมัคร
   */
  router.get('/applications/:id', auth, async (req, res) => {
    try {
      const application = await workflowEngine._getApplication(req.params.id);

      // Check permission
      if (
        application.farmerId !== req.user.id &&
        req.user.role !== 'admin' &&
        req.user.role !== 'reviewer'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      res.json({
        success: true,
        data: application,
      });
    } catch (error) {
      logger.error('[ApplicationAPI] Get error:', error);
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }
  });

  /**
   * PUT /api/applications/:id/step/:stepId
   * บันทึกข้อมูลแต่ละ step ของใบสมัคร
   */
  router.put('/applications/:id/step/:stepId', auth, async (req, res) => {
    try {
      const { id, stepId } = req.params;
      const { stepData } = req.body;

      // Get application to check ownership
      const application = await workflowEngine._getApplication(id);

      // Check permission
      if (application.farmerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      // Update step data
      const stepKey = `step${stepId}`;
      const updateData = {
        [stepKey]: stepData,
        updatedAt: new Date(),
      };

      const Application = require('../../models/mongodb/Application');
      const updatedApplication = await Application.findOneAndUpdate(
        { id: id },
        { $set: updateData },
        { new: true },
      );

      if (!updatedApplication) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      res.json({
        success: true,
        message: `Step ${stepId} saved successfully`,
        data: updatedApplication,
      });
    } catch (error) {
      logger.error('[ApplicationAPI] Save step error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * GET /api/applications
   * ดูรายการใบสมัครทั้งหมด
   */
  router.get('/applications', auth, async (req, res) => {
    try {
      const filters = {};

      // If not admin, only show own applications
      if (req.user.role !== 'admin' && req.user.role !== 'reviewer') {
        filters.farmerId = req.user.id;
      }

      // Apply query filters
      if (req.query.status) {
        filters.status = req.query.status;
      }

      const collection = workflowEngine.db.collection('applications');
      const applications = await collection.find(filters).toArray();

      res.json({
        success: true,
        data: applications,
        total: applications.length,
      });
    } catch (error) {
      logger.error('[ApplicationAPI] List error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * GET /api/applications/statistics
   * สถิติของใบสมัคร (Admin only)
   */
  router.get('/statistics', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      const stats = await workflowEngine.getWorkflowStatistics();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('[ApplicationAPI] Statistics error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  logger.info('[ApplicationAPI] Routes loaded successfully');

  return router;
};
