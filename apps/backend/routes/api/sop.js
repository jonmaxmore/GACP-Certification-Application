/**
 * SOP Management API Routes
 * Comprehensive API for SOP creation, management, and cultivation record integration
 */

const express = require('express');
const _mongoose = require('_mongoose');
const { body, param, query, validationResult } = require('express-validator');
const SOP = require('../models/mongodb/SOP');
const EnhancedCultivationRecord = require('../models/mongodb/EnhancedCultivationRecord');
const { createLogger } = require('../../shared/logger');
const logger = createLogger('sop');

const router = express.Router();

// Middleware for validation error handling
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

// Authentication middleware (assuming it exists)
const authenticate = require('../middleware/auth-middleware');
const authorizeRoles = require('../middleware/rbac-middleware');

/**
 * @route GET /api/sop
 * @desc Get all SOPs with filtering and pagination
 * @access Private (All authenticated users)
 */
router.get(
  '/',
  authenticate,
  [
    query('cropType')
      .optional()
      .isIn([
        'cannabis',
        'herbal_medicine',
        'vegetable',
        'fruit',
        'rice',
        'flower',
        'spice',
        'other',
      ]),
    query('status')
      .optional()
      .isIn(['draft', 'review', 'approved', 'published', 'deprecated', 'archived']),
    query('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert']),
    query('strain').optional().isString(),
    query('medicalPurpose').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        cropType,
        status = 'published',
        difficulty,
        strain,
        medicalPurpose,
        page = 1,
        limit = 20,
        search,
      } = req.query;

      // Build query
      const query = { status };

      if (cropType) {
        query.cropType = cropType;
      }
      if (difficulty) {
        query.difficulty = difficulty;
      }
      if (strain) {
        query['cannabisDetails.strain'] = strain;
      }
      if (medicalPurpose) {
        query['cannabisDetails.medicalPurpose'] = medicalPurpose;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { titleTH: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      // Execute query with pagination
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { 'usage.timesUsed': -1, createdAt: -1 },
        select:
          'sopCode title titleTH description cropType cannabisDetails.strain difficulty status usage.timesUsed createdAt versionString',
      };

      const result = await SOP.paginate(query, options);

      res.json({
        success: true,
        data: {
          sops: result.docs,
          pagination: {
            current: result.page,
            pages: result.totalPages,
            total: result.totalDocs,
            hasNext: result.hasNextPage,
            hasPrev: result.hasPrevPage,
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching SOPs:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching SOPs',
        error: error.message,
      });
    }
  },
);

/**
 * @route GET /api/sop/cannabis
 * @desc Get cannabis-specific SOPs
 * @access Private
 */
router.get(
  '/cannabis',
  authenticate,
  [
    query('strain').optional().isIn(['indica', 'sativa', 'hybrid', 'cbd_dominant', 'thc_dominant']),
    query('medicalPurpose')
      .optional()
      .isIn(['pain_relief', 'anxiety', 'epilepsy', 'cancer_treatment', 'sleep_disorder', 'other']),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { strain, medicalPurpose } = req.query;

      const sops = await SOP.findCannabisSOP(strain, medicalPurpose);

      res.json({
        success: true,
        data: {
          sops,
          count: sops.length,
        },
      });
    } catch (error) {
      logger.error('Error fetching cannabis SOPs:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching cannabis SOPs',
        error: error.message,
      });
    }
  },
);

/**
 * @route GET /api/sop/:sopCode
 * @desc Get detailed SOP information
 * @access Private
 */
router.get(
  '/:sopCode',
  authenticate,
  [param('sopCode').isString().notEmpty()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sopCode } = req.params;

      const sop = await SOP.findOne({ sopCode }).lean();

      if (!sop) {
        return res.status(404).json({
          success: false,
          message: 'SOP not found',
        });
      }

      // Mark as used (increment usage counter)
      await SOP.findOneAndUpdate(
        { sopCode },
        {
          $inc: { 'usage.timesUsed': 1 },
          $set: { 'usage.lastUsed': new Date() },
        },
      );

      res.json({
        success: true,
        data: { sop },
      });
    } catch (error) {
      logger.error('Error fetching SOP:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching SOP',
        error: error.message,
      });
    }
  },
);

/**
 * @route POST /api/sop
 * @desc Create new SOP
 * @access Private (Admin, Expert)
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(['admin', 'expert', 'supervisor']),
  [
    body('title').isString().isLength({ min: 5, max: 200 }),
    body('titleTH').isString().isLength({ min: 5, max: 200 }),
    body('description').isString().isLength({ min: 10, max: 1000 }),
    body('cropType').isIn([
      'cannabis',
      'herbal_medicine',
      'vegetable',
      'fruit',
      'rice',
      'flower',
      'spice',
      'other',
    ]),
    body('phases').isArray({ min: 1 }),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert']),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const sopData = {
        ...req.body,
        approvalWorkflow: {
          createdBy: {
            userId: req.user.id,
            name: req.user.firstName + ' ' + req.user.lastName,
            role: req.user.role,
            createdAt: new Date(),
          },
        },
      };

      const sop = new SOP(sopData);
      await sop.save();

      res.status(201).json({
        success: true,
        message: 'SOP created successfully',
        data: {
          sopCode: sop.sopCode,
          title: sop.title,
          status: sop.status,
        },
      });
    } catch (error) {
      logger.error('Error creating SOP:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating SOP',
        error: error.message,
      });
    }
  },
);

/**
 * @route PUT /api/sop/:sopCode
 * @desc Update SOP
 * @access Private (Admin, Expert, Creator)
 */
router.put(
  '/:sopCode',
  authenticate,
  [param('sopCode').isString().notEmpty()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sopCode } = req.params;

      const sop = await SOP.findOne({ sopCode });

      if (!sop) {
        return res.status(404).json({
          success: false,
          message: 'SOP not found',
        });
      }

      // Check permissions
      const canEdit =
        req.user.role === 'admin' ||
        req.user.role === 'expert' ||
        sop.approvalWorkflow.createdBy.userId === req.user.id;

      if (!canEdit) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to edit this SOP',
        });
      }

      // Update SOP
      Object.assign(sop, req.body);

      // Increment version for significant changes
      if (req.body.phases || req.body.gacpCompliance) {
        sop.version.minor += 1;
      }

      await sop.save();

      res.json({
        success: true,
        message: 'SOP updated successfully',
        data: {
          sopCode: sop.sopCode,
          version: sop.versionString,
        },
      });
    } catch (error) {
      logger.error('Error updating SOP:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating SOP',
        error: error.message,
      });
    }
  },
);

/**
 * @route POST /api/sop/:sopCode/feedback
 * @desc Add feedback to SOP
 * @access Private (Farmers who have used the SOP)
 */
router.post(
  '/:sopCode/feedback',
  authenticate,
  [
    param('sopCode').isString().notEmpty(),
    body('farmCode').isString().notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isString().isLength({ max: 500 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sopCode } = req.params;
      const { farmCode, rating, comment } = req.body;

      const sop = await SOP.findOne({ sopCode });

      if (!sop) {
        return res.status(404).json({
          success: false,
          message: 'SOP not found',
        });
      }

      // Verify user has permission to provide feedback for this farm
      // (Implementation depends on your auth system)

      await sop.addFeedback(farmCode, rating, comment);

      res.json({
        success: true,
        message: 'Feedback added successfully',
      });
    } catch (error) {
      logger.error('Error adding SOP feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding feedback',
        error: error.message,
      });
    }
  },
);

/**
 * @route POST /api/sop/:sopCode/adopt
 * @desc Adopt SOP for cultivation record
 * @access Private (Farmers)
 */
router.post(
  '/:sopCode/adopt',
  authenticate,
  authorizeRoles(['farmer', 'admin']),
  [
    param('sopCode').isString().notEmpty(),
    body('cultivationRecordCode').isString().notEmpty(),
    body('customizations').optional().isArray(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sopCode } = req.params;
      const { cultivationRecordCode, customizations = [] } = req.body;

      // Find SOP
      const sop = await SOP.findOne({ sopCode });
      if (!sop) {
        return res.status(404).json({
          success: false,
          message: 'SOP not found',
        });
      }

      // Find cultivation record
      const cultivationRecord = await EnhancedCultivationRecord.findOne({
        recordCode: cultivationRecordCode,
      });
      if (!cultivationRecord) {
        return res.status(404).json({
          success: false,
          message: 'Cultivation record not found',
        });
      }

      // Adopt SOP
      cultivationRecord.sopIntegration = {
        primarySOP: {
          sopCode: sop.sopCode,
          sopTitle: sop.title,
          sopVersion: sop.versionString,
          adoptedAt: new Date(),
          customizations,
        },
        complianceTracking: {
          overallCompliance: 0,
          phaseCompliance: sop.phases.map(phase => ({
            phaseCode: phase.phaseCode,
            phaseName: phase.phaseName,
            completedSteps: 0,
            totalSteps: phase.steps ? phase.steps.length : 0,
            compliancePercentage: 0,
            status: 'not_started',
          })),
          deviations: [],
        },
      };

      // Generate activities from SOP steps
      for (const phase of sop.phases) {
        if (phase.steps) {
          for (const step of phase.steps) {
            cultivationRecord.sopActivities.push({
              sopPhaseCode: phase.phaseCode,
              sopStepCode: step.stepCode,
              sopStepName: step.stepName,
              scheduledDate: new Date(), // This should be calculated based on SOP timing
              status: 'planned',
              assignedTo: [
                {
                  userId: req.user.id,
                  name: req.user.firstName + ' ' + req.user.lastName,
                  role: req.user.role,
                },
              ],
            });
          }
        }
      }

      await cultivationRecord.save();

      // Mark SOP as used
      await sop.markAsUsed(cultivationRecord.farmCode);

      res.json({
        success: true,
        message: 'SOP adopted successfully',
        data: {
          cultivationRecordCode,
          sopCode,
          activitiesGenerated: cultivationRecord.sopActivities.length,
        },
      });
    } catch (error) {
      logger.error('Error adopting SOP:', error);
      res.status(500).json({
        success: false,
        message: 'Error adopting SOP',
        error: error.message,
      });
    }
  },
);

/**
 * @route GET /api/sop/cultivation/:recordCode/activities
 * @desc Get SOP activities for cultivation record
 * @access Private
 */
router.get(
  '/cultivation/:recordCode/activities',
  authenticate,
  [
    param('recordCode').isString().notEmpty(),
    query('status')
      .optional()
      .isIn(['planned', 'in_progress', 'completed', 'skipped', 'failed', 'rescheduled']),
    query('phase').optional().isString(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { recordCode } = req.params;
      const { status, phase } = req.query;

      const cultivationRecord = await EnhancedCultivationRecord.findOne({ recordCode });

      if (!cultivationRecord) {
        return res.status(404).json({
          success: false,
          message: 'Cultivation record not found',
        });
      }

      let activities = cultivationRecord.sopActivities;

      // Filter by status
      if (status) {
        activities = activities.filter(activity => activity.status === status);
      }

      // Filter by phase
      if (phase) {
        activities = activities.filter(activity => activity.sopPhaseCode === phase);
      }

      res.json({
        success: true,
        data: {
          activities,
          compliance: cultivationRecord.sopCompliancePercentage,
          totalActivities: cultivationRecord.sopActivities.length,
          completedActivities: cultivationRecord.sopActivities.filter(a => a.status === 'completed')
            .length,
        },
      });
    } catch (error) {
      logger.error('Error fetching SOP activities:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching activities',
        error: error.message,
      });
    }
  },
);

/**
 * @route PUT /api/sop/cultivation/:recordCode/activity/:activityId
 * @desc Update SOP activity status
 * @access Private (Farmers)
 */
router.put(
  '/cultivation/:recordCode/activity/:activityId',
  authenticate,
  [
    param('recordCode').isString().notEmpty(),
    param('activityId').isString().notEmpty(),
    body('status').isIn([
      'planned',
      'in_progress',
      'completed',
      'skipped',
      'failed',
      'rescheduled',
    ]),
    body('notes').optional().isString(),
    body('photos').optional().isArray(),
    body('materialsUsed').optional().isArray(),
    body('qualityMeasurements').optional().isArray(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { recordCode, activityId } = req.params;
      const updateData = req.body;

      const cultivationRecord = await EnhancedCultivationRecord.findOne({ recordCode });

      if (!cultivationRecord) {
        return res.status(404).json({
          success: false,
          message: 'Cultivation record not found',
        });
      }

      const activity = cultivationRecord.sopActivities.id(activityId);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found',
        });
      }

      // Update activity
      Object.assign(activity, updateData);

      if (updateData.status === 'completed') {
        activity.actualDate = new Date();
        activity.executedBy = [
          {
            userId: req.user.id,
            name: req.user.firstName + ' ' + req.user.lastName,
            timestamp: new Date(),
          },
        ];
      }

      // Update compliance
      cultivationRecord.updateSOPCompliance();

      await cultivationRecord.save();

      res.json({
        success: true,
        message: 'Activity updated successfully',
        data: {
          activityId,
          status: activity.status,
          compliance: cultivationRecord.sopCompliancePercentage,
        },
      });
    } catch (error) {
      logger.error('Error updating SOP activity:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating activity',
        error: error.message,
      });
    }
  },
);

module.exports = router;
