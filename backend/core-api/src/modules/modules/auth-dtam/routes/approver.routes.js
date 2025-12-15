/**
 * DTAM Approver API Routes
 * Handles all approver-related operations
 */

const express = require('express');
const router = express.Router();

// Middleware (assume these exist)
const { authenticateJWT, requireRole } = require('../../../middleware/auth-middleware');

/**
 * GET /api/v1/dtam/approver/dashboard/stats
 * Get approver dashboard statistics
 */
router.get(
  '/dashboard/stats',
  authenticateJWT,
  requireRole(['APPROVER', 'ADMIN']),
  async (req, res) => {
    try {
      const approverId = req.user.id;
      const { DTAMApplication } = req.container;

      // Get statistics
      const pending = await DTAMApplication.count({
        status: 'PENDING_APPROVAL',
      });

      const approvedToday = await DTAMApplication.count({
        approvalStatus: 'APPROVED',
        approvedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      });

      const rejected = await DTAMApplication.count({
        approverId,
        approvalStatus: 'REJECTED',
        approvedAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      });

      const certificatesIssued = await DTAMApplication.count({
        status: 'CERTIFICATE_ISSUED',
        certificateIssuedAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      });

      // Calculate average approval time
      const avgTime = await DTAMApplication.aggregate([
        {
          $match: {
            approvalStatus: { $in: ['APPROVED', 'REJECTED'] },
            inspectionCompletedDate: { $exists: true },
            approvedAt: { $exists: true },
          },
        },
        {
          $project: {
            approvalTime: {
              $divide: [
                { $subtract: ['$approvedAt', '$inspectionCompletedDate'] },
                1000 * 60 * 60 * 24, // Convert to days
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: '$approvalTime' },
          },
        },
      ]);

      res.json({
        success: true,
        data: {
          pending,
          approvedToday,
          rejected,
          certificatesIssued,
          avgApprovalTimeDays: avgTime[0]?.avgTime || 0,
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
 * GET /api/v1/dtam/approver/applications
 * Get applications pending approval
 */
router.get(
  '/applications',
  authenticateJWT,
  requireRole(['APPROVER', 'ADMIN']),
  async (req, res) => {
    try {
      const { status, paymentStatus, page = 1, limit = 20 } = req.query;
      const { DTAMApplication } = req.container;

      const query = {};

      if (status) {
        query.status = status;
      } else {
        // Default: show pending approvals
        query.status = { $in: ['INSPECTION_COMPLETED', 'PENDING_APPROVAL'] };
      }

      if (paymentStatus) {
        query.paymentStatus = paymentStatus;
      }

      const skip = (page - 1) * limit;

      const [applications, total] = await Promise.all([
        DTAMApplication.find(query)
          .sort({ inspectionCompletedDate: 1 })
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
 * GET /api/v1/dtam/approver/applications/:id
 * Get application detail for approval
 */
router.get(
  '/applications/:id',
  authenticateJWT,
  requireRole(['APPROVER', 'ADMIN']),
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
 * POST /api/v1/dtam/approver/applications/:id/verify-payment
 * Verify payment for application
 */
router.post(
  '/applications/:id/verify-payment',
  authenticateJWT,
  requireRole(['APPROVER', 'ADMIN']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { receiptUrl, amount } = req.body;
      const { DTAMApplication } = req.container;

      if (!receiptUrl || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Receipt URL and amount are required',
        });
      }

      const application = await DTAMApplication.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      application.verifyPayment(receiptUrl, amount);
      await application.save();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: application.toJSON(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to verify payment',
        error: error.message,
      });
    }
  },
);

/**
 * POST /api/v1/dtam/approver/applications/:id/assign
 * Assign application to approver
 */
router.post(
  '/applications/:id/assign',
  authenticateJWT,
  requireRole(['APPROVER', 'ADMIN']),
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

      const approverName = `${req.user.firstName} ${req.user.lastName}`;
      application.assignToApprover(req.user.id, approverName);
      await application.save();

      res.json({
        success: true,
        message: 'Application assigned to you',
        data: application.toJSON(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to assign application',
        error: error.message,
      });
    }
  },
);

/**
 * POST /api/v1/dtam/approver/applications/:id/approve
 * Approve application
 */
router.post(
  '/applications/:id/approve',
  authenticateJWT,
  requireRole(['APPROVER', 'ADMIN']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const { DTAMApplication } = req.container;

      const application = await DTAMApplication.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      // Check if payment is verified
      if (application.paymentStatus !== 'VERIFIED') {
        return res.status(400).json({
          success: false,
          message: 'Payment must be verified before approval',
        });
      }

      application.approve(comments, req.user.id);
      await application.save();

      res.json({
        success: true,
        message: 'Application approved successfully',
        data: application.toJSON(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to approve application',
        error: error.message,
      });
    }
  },
);

/**
 * POST /api/v1/dtam/approver/applications/:id/reject
 * Reject application
 */
router.post(
  '/applications/:id/reject',
  authenticateJWT,
  requireRole(['APPROVER', 'ADMIN']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const { DTAMApplication } = req.container;

      if (!comments || comments.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Rejection comments are required',
        });
      }

      const application = await DTAMApplication.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      application.reject(comments, req.user.id);
      await application.save();

      res.json({
        success: true,
        message: 'Application rejected',
        data: application.toJSON(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to reject application',
        error: error.message,
      });
    }
  },
);

/**
 * POST /api/v1/dtam/approver/applications/:id/send-back
 * Send application back for revision
 */
router.post(
  '/applications/:id/send-back',
  authenticateJWT,
  requireRole(['APPROVER', 'ADMIN']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, sendTo } = req.body;
      const { DTAMApplication } = req.container;

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Reason is required',
        });
      }

      if (!sendTo || !['REVIEWER', 'INSPECTOR'].includes(sendTo)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sendTo value. Must be REVIEWER or INSPECTOR',
        });
      }

      const application = await DTAMApplication.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      // Send back based on target
      if (sendTo === 'REVIEWER') {
        application.currentStage = 'REVIEW';
        application.status = 'IN_REVIEW';
        application.reviewStatus = null;
        application.reviewComments = reason;
      } else if (sendTo === 'INSPECTOR') {
        application.currentStage = 'INSPECTION';
        application.status = 'INSPECTION_SCHEDULED';
        application.inspectionStatus = null;
        application.inspectionReport = reason;
      }

      application.updatedAt = new Date();
      await application.save();

      res.json({
        success: true,
        message: `Application sent back to ${sendTo}`,
        data: application.toJSON(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to send back application',
        error: error.message,
      });
    }
  },
);

/**
 * POST /api/v1/dtam/approver/applications/:id/issue-certificate
 * Issue certificate for approved application
 */
router.post(
  '/applications/:id/issue-certificate',
  authenticateJWT,
  requireRole(['APPROVER', 'ADMIN']),
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

      // Generate certificate number (format: GACP-YYYY-XXXXX)
      const year = new Date().getFullYear();
      const count = await DTAMApplication.countDocuments({
        certificateNumber: { $regex: `^GACP-${year}-` },
      });
      const certificateNumber = `GACP-${year}-${String(count + 1).padStart(5, '0')}`;

      application.issueCertificate(certificateNumber);
      await application.save();

      res.json({
        success: true,
        message: 'Certificate issued successfully',
        data: {
          certificateNumber: application.certificateNumber,
          issuedAt: application.certificateIssuedAt,
          expiresAt: application.certificateExpiresAt,
          application: application.toJSON(),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to issue certificate',
        error: error.message,
      });
    }
  },
);

/**
 * GET /api/v1/dtam/approver/applications/pending/count
 * Get count of pending approvals (for notifications)
 */
router.get(
  '/applications/pending/count',
  authenticateJWT,
  requireRole(['APPROVER', 'ADMIN']),
  async (req, res) => {
    try {
      const { DTAMApplication } = req.container;

      const count = await DTAMApplication.countDocuments({
        status: 'PENDING_APPROVAL',
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
