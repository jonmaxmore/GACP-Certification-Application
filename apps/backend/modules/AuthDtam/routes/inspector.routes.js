/**
 * DTAM Inspector API Routes
 * Handles all inspector-related operations
 */

const express = require('express');
const router = express.Router();

// Middleware (assume these exist)
const { authenticateJWT, requireRole } = require('../../../middleware/auth-middleware');

/**
 * GET /api/v1/dtam/inspector/dashboard/stats
 * Get inspector dashboard statistics
 */
router.get(
  '/dashboard/stats',
  authenticateJWT,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req, res) => {
    try {
      const inspectorId = req.user.id;
      const { DTAMApplication } = req.container;

      // Get statistics
      const pending = await DTAMApplication.count({
        inspectorId,
        status: { $in: ['REVIEW_PASSED', 'INSPECTION_SCHEDULED'] },
      });

      const inProgress = await DTAMApplication.count({
        inspectorId,
        status: 'INSPECTION_IN_PROGRESS',
      });

      const completed = await DTAMApplication.count({
        inspectorId,
        status: 'INSPECTION_COMPLETED',
        inspectionCompletedDate: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      });

      const avgScore = await DTAMApplication.aggregate([
        { $match: { inspectorId, inspectionScore: { $exists: true } } },
        { $group: { _id: null, avgScore: { $avg: '$inspectionScore' } } },
      ]);

      res.json({
        success: true,
        data: {
          pending,
          inProgress,
          completed,
          avgScore: avgScore[0]?.avgScore || 0,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
        error: error.message,
      });
    }
  },
);

/**
 * GET /api/v1/dtam/inspector/applications
 * Get inspector's application queue
 */
router.get(
  '/applications',
  authenticateJWT,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req, res) => {
    try {
      const inspectorId = req.user.id;
      const { status, inspectionType, page = 1, limit = 20 } = req.query;
      const { DTAMApplication } = req.container;

      const query = { inspectorId };

      if (status) {
        query.status = status;
      } else {
        // Default: show pending and in-progress
        query.status = {
          $in: ['REVIEW_PASSED', 'INSPECTION_SCHEDULED', 'INSPECTION_IN_PROGRESS'],
        };
      }

      if (inspectionType) {
        query.inspectionType = inspectionType;
      }

      const skip = (page - 1) * limit;

      const [applications, total] = await Promise.all([
        DTAMApplication.find(query)
          .sort({ inspectionScheduledDate: 1, submittedAt: 1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        DTAMApplication.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: {
          applications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
        error: error.message,
      });
    }
  },
);

/**
 * GET /api/v1/dtam/inspector/applications/:id
 * Get application detail for inspection
 */
router.get(
  '/applications/:id',
  authenticateJWT,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { DTAMApplication } = req.container;

      const application = await DTAMApplication.findById(id).lean();

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      // Check if inspector is assigned to this application
      if (application.inspectorId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this application',
        });
      }

      res.json({
        success: true,
        data: application,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch application',
        error: error.message,
      });
    }
  },
);

/**
 * POST /api/v1/dtam/inspector/applications/:id/schedule
 * Schedule inspection
 */
router.post(
  '/applications/:id/schedule',
  authenticateJWT,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { scheduledDate } = req.body;
      const { DTAMApplication } = req.container;

      const application = await DTAMApplication.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      // Schedule inspection
      application.scheduleInspection(new Date(scheduledDate), req.user.id);

      await application.save();

      res.json({
        success: true,
        message: 'Inspection scheduled successfully',
        data: application.toJSON(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to schedule inspection',
        error: error.message,
      });
    }
  },
);

/**
 * POST /api/v1/dtam/inspector/applications/:id/start
 * Start inspection
 */
router.post(
  '/applications/:id/start',
  authenticateJWT,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { DTAMApplication } = req.container;

      const application = await DTAMApplication.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      application.startInspection();
      await application.save();

      res.json({
        success: true,
        message: 'Inspection started',
        data: application.toJSON(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to start inspection',
        error: error.message,
      });
    }
  },
);

/**
 * POST /api/v1/dtam/inspector/applications/:id/complete
 * Complete inspection
 */
router.post(
  '/applications/:id/complete',
  authenticateJWT,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { score, report, evidence } = req.body;
      const { DTAMApplication } = req.container;

      if (!score || score < 0 || score > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid score. Must be between 0 and 100',
        });
      }

      const application = await DTAMApplication.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      application.completeInspection(score, report, evidence);
      await application.save();

      res.json({
        success: true,
        message: 'Inspection completed successfully',
        data: application.toJSON(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to complete inspection',
        error: error.message,
      });
    }
  },
);

/**
 * POST /api/v1/dtam/inspector/applications/:id/evidence
 * Upload inspection evidence
 */
router.post(
  '/applications/:id/evidence',
  authenticateJWT,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { type, url, description, gpsLocation } = req.body;
      const { DTAMApplication } = req.container;

      const application = await DTAMApplication.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      // Add evidence
      application.inspectionEvidence.push({
        type,
        url,
        description,
        gpsLocation,
        uploadedAt: new Date(),
        uploadedBy: req.user.id,
      });

      application.updatedAt = new Date();
      await application.save();

      res.json({
        success: true,
        message: 'Evidence uploaded successfully',
        data: application.inspectionEvidence,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to upload evidence',
        error: error.message,
      });
    }
  },
);

/**
 * GET /api/v1/dtam/inspector/applications/pending/count
 * Get count of pending inspections (for notifications)
 */
router.get(
  '/applications/pending/count',
  authenticateJWT,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req, res) => {
    try {
      const inspectorId = req.user.id;
      const { DTAMApplication } = req.container;

      const count = await DTAMApplication.countDocuments({
        inspectorId,
        status: { $in: ['REVIEW_PASSED', 'INSPECTION_SCHEDULED'] },
      });

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch count',
        error: error.message,
      });
    }
  },
);

module.exports = router;
