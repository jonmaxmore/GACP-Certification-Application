/**
 * Audit Calendar API Routes
 * Comprehensive audit scheduling and management endpoints
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const AuditCalendar = require('../models/mongodb/AuditCalendar');
const Farm = require('../microservices/api-trace/src/models/Farm');
const _EnhancedCultivationRecord = require('../models/mongodb/_EnhancedCultivationRecord');

const router = express.Router();

// Middleware
const authenticate = require('../middleware/auth-middleware');
const authorizeRoles = require('../middleware/rbac-middleware');
const { createLogger } = require('../../shared/logger');
const logger = createLogger('audit-calendar');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * @route GET /api/audit-calendar
 * @desc Get audit calendar with filtering and pagination
 * @access Private (Auditor, Admin, Supervisor)
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(['auditor', 'admin', 'supervisor', 'reviewer']),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('status')
      .optional()
      .isIn([
        'scheduled',
        'confirmed',
        'preparation',
        'in_progress',
        'fieldwork_complete',
        'reporting',
        'review',
        'completed',
        'cancelled',
        'postponed',
      ]),
    query('auditType').optional().isString(),
    query('auditorId').optional().isString(),
    query('farmCode').optional().isString(),
    query('view').optional().isIn(['calendar', 'list', 'gantt']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        status,
        auditType,
        auditorId,
        farmCode,
        view = 'list',
        page = 1,
        limit = 20,
      } = req.query;

      // Build query
      const query = {};

      // Date range filter
      if (startDate || endDate) {
        query['scheduling.scheduledDate'] = {};
        if (startDate) {
          query['scheduling.scheduledDate'].$gte = new Date(startDate);
        }
        if (endDate) {
          query['scheduling.scheduledDate'].$lte = new Date(endDate);
        }
      }

      // Status filter
      if (status) {
        query.status = status;
      }

      // Audit type filter
      if (auditType) {
        query.auditType = auditType;
      }

      // Auditor filter
      if (auditorId) {
        query.$or = [
          { 'personnel.leadAuditor.userId': auditorId },
          { 'personnel.auditTeam.userId': auditorId },
        ];
      }

      // Farm filter
      if (farmCode) {
        query['auditTarget.farmCode'] = farmCode;
      }

      // Role-based filtering
      if (req.user.role === 'auditor') {
        query.$or = [
          { 'personnel.leadAuditor.userId': req.user.id },
          { 'personnel.auditTeam.userId': req.user.id },
        ];
      }

      let result;

      if (view === 'calendar') {
        // Calendar view - group by date
        result = await AuditCalendar.aggregate([
          { $match: query },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$scheduling.scheduledDate',
                },
              },
              audits: {
                $push: {
                  auditId: '$auditId',
                  title: '$title',
                  auditType: '$auditType',
                  status: '$status',
                  farmCode: '$auditTarget.farmCode',
                  farmName: '$auditTarget.farmName',
                  leadAuditor: '$personnel.leadAuditor.name',
                  scheduledTime: '$scheduling.scheduledTime',
                  priority: '$priority',
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);
      } else {
        // List/Gantt view - paginated results
        const options = {
          page: parseInt(page),
          limit: parseInt(limit),
          sort: { 'scheduling.scheduledDate': 1 },
          populate: [{ path: 'auditTarget.farmCode', select: 'farmInfo.name farmInfo.ownerName' }],
        };

        result = await AuditCalendar.paginate(query, options);
      }

      res.json({
        success: true,
        data: {
          view,
          ...(view === 'calendar'
            ? { calendar: result }
            : {
                audits: result.docs,
                pagination: {
                  current: result.page,
                  pages: result.totalPages,
                  total: result.totalDocs,
                  hasNext: result.hasNextPage,
                  hasPrev: result.hasPrevPage,
                },
              }),
        },
      });
    } catch (error) {
      logger.error('Error fetching audit calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching audit calendar',
        error: error.message,
      });
    }
  },
);

/**
 * @route GET /api/audit-calendar/upcoming
 * @desc Get upcoming audits (next 7 days)
 * @access Private
 */
router.get(
  '/upcoming',
  authenticate,
  authorizeRoles(['auditor', 'admin', 'supervisor', 'reviewer', 'farmer']),
  async (req, res) => {
    try {
      const query = {};

      // Role-based filtering
      if (req.user.role === 'auditor') {
        query.$or = [
          { 'personnel.leadAuditor.userId': req.user.id },
          { 'personnel.auditTeam.userId': req.user.id },
        ];
      } else if (req.user.role === 'farmer') {
        // Get farm codes for this farmer
        const farms = await Farm.find({ 'farmInfo.ownerEmail': req.user.email });
        const farmCodes = farms.map(farm => farm.farmCode);
        query['auditTarget.farmCode'] = { $in: farmCodes };
      }

      const upcomingAudits = await AuditCalendar.findUpcoming(7);
      const filteredAudits = upcomingAudits.filter(audit => {
        if (req.user.role === 'auditor') {
          return (
            audit.personnel.leadAuditor.userId === req.user.id ||
            audit.personnel.auditTeam.some(member => member.userId === req.user.id)
          );
        } else if (req.user.role === 'farmer') {
          return query['auditTarget.farmCode'].$in.includes(audit.auditTarget.farmCode);
        }
        return true;
      });

      res.json({
        success: true,
        data: {
          upcomingAudits: filteredAudits,
          count: filteredAudits.length,
        },
      });
    } catch (error) {
      logger.error('Error fetching upcoming audits:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching upcoming audits',
        error: error.message,
      });
    }
  },
);

/**
 * @route GET /api/audit-calendar/overdue
 * @desc Get overdue audits
 * @access Private (Admin, Supervisor)
 */
router.get('/overdue', authenticate, authorizeRoles(['admin', 'supervisor']), async (req, res) => {
  try {
    const overdueAudits = await AuditCalendar.findOverdue();

    res.json({
      success: true,
      data: {
        overdueAudits,
        count: overdueAudits.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching overdue audits:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue audits',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/audit-calendar/cannabis
 * @desc Get cannabis-specific audits
 * @access Private (Admin, Cannabis auditors)
 */
router.get(
  '/cannabis',
  authenticate,
  authorizeRoles(['admin', 'supervisor', 'auditor']),
  async (req, res) => {
    try {
      const cannabisAudits = await AuditCalendar.findCannabisAudits();

      res.json({
        success: true,
        data: {
          cannabisAudits,
          count: cannabisAudits.length,
        },
      });
    } catch (error) {
      logger.error('Error fetching cannabis audits:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching cannabis audits',
        error: error.message,
      });
    }
  },
);

/**
 * @route GET /api/audit-calendar/:auditId
 * @desc Get detailed audit information
 * @access Private
 */
router.get(
  '/:auditId',
  authenticate,
  [param('auditId').isString().notEmpty()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { auditId } = req.params;

      const audit = await AuditCalendar.findOne({ auditId });

      if (!audit) {
        return res.status(404).json({
          success: false,
          message: 'Audit not found',
        });
      }

      // Check permissions
      const hasAccess =
        req.user.role === 'admin' ||
        req.user.role === 'supervisor' ||
        audit.personnel.leadAuditor.userId === req.user.id ||
        audit.personnel.auditTeam.some(member => member.userId === req.user.id);

      if (!hasAccess && req.user.role === 'farmer') {
        // Check if this farmer owns the farm being audited
        const farm = await Farm.findOne({ farmCode: audit.auditTarget.farmCode });
        if (!farm || farm.farmInfo.ownerEmail !== req.user.email) {
          return res.status(403).json({
            success: false,
            message: 'Access denied',
          });
        }
      } else if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      res.json({
        success: true,
        data: { audit },
      });
    } catch (error) {
      logger.error('Error fetching audit:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching audit',
        error: error.message,
      });
    }
  },
);

/**
 * @route POST /api/audit-calendar
 * @desc Schedule new audit
 * @access Private (Admin, Supervisor)
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(['admin', 'supervisor']),
  [
    body('title').isString().isLength({ min: 5, max: 200 }),
    body('titleTH').isString().isLength({ min: 5, max: 200 }),
    body('auditType').isIn([
      'initial_audit',
      'surveillance',
      'recertification',
      'special_audit',
      'complaint_audit',
      'follow_up',
      'cannabis_compliance',
      'sop_compliance',
    ]),
    body('scheduledDate').isISO8601(),
    body('farmCode').isString().notEmpty(),
    body('leadAuditorId').isString().notEmpty(),
    body('estimatedDuration').optional().isFloat({ min: 0.5, max: 24 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const auditData = {
        ...req.body,
        scheduling: {
          scheduledDate: new Date(req.body.scheduledDate),
          scheduledTime: req.body.scheduledTime || { start: '09:00', end: '17:00' },
          duration: {
            estimated: req.body.estimatedDuration || 8,
          },
        },
        auditTarget: {
          farmCode: req.body.farmCode,
        },
        personnel: {
          leadAuditor: {
            userId: req.body.leadAuditorId,
            assignedAt: new Date(),
          },
          auditTeam: [],
        },
        createdBy: {
          userId: req.user.id,
          name: req.user.firstName + ' ' + req.user.lastName,
          role: req.user.role,
        },
        status: 'scheduled',
      };

      // Get farm information
      const farm = await Farm.findOne({ farmCode: req.body.farmCode });
      if (farm) {
        auditData.auditTarget.farmName = farm.farmInfo.name;
        auditData.auditTarget.farmerInfo = {
          name: farm.farmInfo.ownerName,
          phone: farm.farmInfo.phone,
          email: farm.farmInfo.email,
        };

        // Check if cannabis audit is required
        if (
          farm.farmInfo.cropTypes.includes('cannabis') ||
          req.body.auditType === 'cannabis_compliance'
        ) {
          auditData.cannabisAuditDetails = {
            required: true,
            licenseVerification: {
              licenseNumber: farm.cannabisFeatures?.licenseInfo?.licenseNumber,
            },
          };
        }
      }

      const audit = new AuditCalendar(auditData);
      await audit.save();

      // Send notifications
      await audit.sendNotification('audit_scheduled', [
        req.body.leadAuditorId,
        audit.auditTarget.farmerInfo?.email,
      ]);

      res.status(201).json({
        success: true,
        message: 'Audit scheduled successfully',
        data: {
          auditId: audit.auditId,
          scheduledDate: audit.scheduling.scheduledDate,
          farmCode: audit.auditTarget.farmCode,
        },
      });
    } catch (error) {
      logger.error('Error scheduling audit:', error);
      res.status(500).json({
        success: false,
        message: 'Error scheduling audit',
        error: error.message,
      });
    }
  },
);

/**
 * @route PUT /api/audit-calendar/:auditId/reschedule
 * @desc Reschedule audit
 * @access Private (Admin, Supervisor, Lead Auditor)
 */
router.put(
  '/:auditId/reschedule',
  authenticate,
  [
    param('auditId').isString().notEmpty(),
    body('newDate').isISO8601(),
    body('reason').isString().isLength({ min: 10, max: 500 }),
    body('newTime').optional().isObject(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { auditId } = req.params;
      const { newDate, reason, newTime } = req.body;

      const audit = await AuditCalendar.findOne({ auditId });

      if (!audit) {
        return res.status(404).json({
          success: false,
          message: 'Audit not found',
        });
      }

      // Check permissions
      const canReschedule =
        req.user.role === 'admin' ||
        req.user.role === 'supervisor' ||
        audit.personnel.leadAuditor.userId === req.user.id;

      if (!canReschedule) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to reschedule audit',
        });
      }

      // Reschedule audit
      await audit.reschedule(new Date(newDate), reason, req.user.id);

      if (newTime) {
        audit.scheduling.scheduledTime = newTime;
        await audit.save();
      }

      // Update status to reflect rescheduling
      await audit.addStatusHistory('scheduled', req.user.id, 'Rescheduled', reason);

      // Send notifications
      await audit.sendNotification('audit_rescheduled', [
        audit.personnel.leadAuditor.userId,
        audit.auditTarget.farmerInfo?.email,
      ]);

      res.json({
        success: true,
        message: 'Audit rescheduled successfully',
        data: {
          auditId: audit.auditId,
          newDate: audit.scheduling.scheduledDate,
          reason,
        },
      });
    } catch (error) {
      logger.error('Error rescheduling audit:', error);
      res.status(500).json({
        success: false,
        message: 'Error rescheduling audit',
        error: error.message,
      });
    }
  },
);

/**
 * @route PUT /api/audit-calendar/:auditId/status
 * @desc Update audit status
 * @access Private (Admin, Supervisor, Lead Auditor)
 */
router.put(
  '/:auditId/status',
  authenticate,
  [
    param('auditId').isString().notEmpty(),
    body('status').isIn([
      'scheduled',
      'confirmed',
      'preparation',
      'in_progress',
      'fieldwork_complete',
      'reporting',
      'review',
      'completed',
      'cancelled',
      'postponed',
    ]),
    body('reason').optional().isString(),
    body('notes').optional().isString(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { auditId } = req.params;
      const { status, reason, notes } = req.body;

      const audit = await AuditCalendar.findOne({ auditId });

      if (!audit) {
        return res.status(404).json({
          success: false,
          message: 'Audit not found',
        });
      }

      // Check permissions
      const canUpdate =
        req.user.role === 'admin' ||
        req.user.role === 'supervisor' ||
        audit.personnel.leadAuditor.userId === req.user.id;

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to update audit status',
        });
      }

      // Update status
      await audit.addStatusHistory(status, req.user.id, reason, notes);

      // Handle status-specific actions
      if (status === 'completed') {
        audit.scheduling.duration.actual = req.body.actualDuration;
      }

      res.json({
        success: true,
        message: 'Audit status updated successfully',
        data: {
          auditId: audit.auditId,
          status: audit.status,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error updating audit status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating audit status',
        error: error.message,
      });
    }
  },
);

/**
 * @route GET /api/audit-calendar/auditor/:auditorId/workload
 * @desc Get auditor workload analysis
 * @access Private (Admin, Supervisor, Self)
 */
router.get(
  '/auditor/:auditorId/workload',
  authenticate,
  authorizeRoles(['admin', 'supervisor', 'auditor']),
  [
    param('auditorId').isString().notEmpty(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { auditorId } = req.params;
      const { startDate, endDate } = req.query;

      // Check permissions
      if (req.user.role === 'auditor' && req.user.id !== auditorId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const workload = await AuditCalendar.getAuditorWorkload(auditorId, start, end);

      res.json({
        success: true,
        data: {
          auditorId,
          period: { start, end },
          workload: workload[0] || {
            totalAudits: 0,
            estimatedHours: 0,
            auditTypes: [],
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching auditor workload:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching auditor workload',
        error: error.message,
      });
    }
  },
);

module.exports = router;
