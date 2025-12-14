/**
 * 🌱 Farm Management Controller
 * HTTP request handlers for farm management operations
 */

const { successResponse, errorResponse } = require('../../shared/response');
const logger = require('../../shared/utils/logger');

class FarmManagementController {
  constructor(farmService) {
    this.farmService = farmService;
  }

  /**
   * Create new cultivation cycle
   * POST /api/farm/cycles
   */
  createCycle = async (req, res) => {
    try {
      const cycleData = {
        ...req.body,
        farmerId: req.user.id,
        farmerEmail: req.user.email,
      };

      const cycle = await this.farmService.createCultivationCycle(cycleData);

      return successResponse(res, cycle, 'Cultivation cycle created successfully', 201);
    } catch (error) {
      logger.error('[FarmController] Create cycle error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get all cycles (with filters)
   * GET /api/farm/cycles
   */
  listCycles = async (req, res) => {
    try {
      const filters = {};

      // If not admin, only show own cycles
      if (req.user.role !== 'admin') {
        filters.farmerId = req.user.id;
      }

      // Apply query filters
      if (req.query.status) {
        filters.status = req.query.status;
      }
      if (req.query.phase) {
        filters.phase = req.query.phase;
      }

      const collection = this.farmService.collection;
      const cycles = await collection.find(filters).sort({ createdAt: -1 }).toArray();

      return successResponse(res, {
        cycles,
        total: cycles.length,
      });
    } catch (error) {
      logger.error('[FarmController] List cycles error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get cycle by ID
   * GET /api/farm/cycles/:id
   */
  getCycleById = async (req, res) => {
    try {
      const cycle = await this.farmService.getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      return successResponse(res, cycle);
    } catch (error) {
      logger.error('[FarmController] Get cycle error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Record SOP activity
   * POST /api/farm/cycles/:id/activities
   */
  recordActivity = async (req, res) => {
    try {
      const cycle = await this.farmService.getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const activityData = {
        ...req.body,
        userId: req.user.id,
        userName: req.user.name || req.user.email,
      };

      const activity = await this.farmService.recordActivity(req.params.id, activityData);

      return successResponse(res, activity, 'Activity recorded successfully', 201);
    } catch (error) {
      logger.error('[FarmController] Record activity error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get activities for cycle
   * GET /api/farm/cycles/:id/activities
   */
  getActivities = async (req, res) => {
    try {
      const cycle = await this.farmService.getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      return successResponse(res, {
        activities: cycle.activities || [],
        total: cycle.activities?.length || 0,
      });
    } catch (error) {
      logger.error('[FarmController] Get activities error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Record compliance check (inspector)
   * POST /api/farm/cycles/:id/compliance
   */
  recordComplianceCheck = async (req, res) => {
    try {
      // Only admin/inspector can record compliance checks
      if (req.user.role !== 'admin' && req.user.role !== 'inspector') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const checkData = {
        ...req.body,
        inspectorId: req.user.id,
        inspectorName: req.user.name || req.user.email,
      };

      const complianceCheck = await this.farmService.recordComplianceCheck(
        req.params.id,
        checkData,
      );

      return successResponse(res, complianceCheck, 'Compliance check recorded', 201);
    } catch (error) {
      logger.error('[FarmController] Compliance check error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get compliance checks for cycle
   * GET /api/farm/cycles/:id/compliance
   */
  getComplianceChecks = async (req, res) => {
    try {
      const cycle = await this.farmService.getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      return successResponse(res, {
        checks: cycle.complianceChecks || [],
        score: cycle.complianceScore || null,
      });
    } catch (error) {
      logger.error('[FarmController] Get compliance error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Record harvest data
   * POST /api/farm/cycles/:id/harvest
   */
  recordHarvest = async (req, res) => {
    try {
      const cycle = await this.farmService.getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const harvestData = {
        ...req.body,
        userId: req.user.id,
        userName: req.user.name || req.user.email,
      };

      const harvest = await this.farmService.recordHarvest(req.params.id, harvestData);

      return successResponse(res, harvest, 'Harvest recorded successfully', 201);
    } catch (error) {
      logger.error('[FarmController] Record harvest error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get harvest data for cycle
   * GET /api/farm/cycles/:id/harvest
   */
  getHarvest = async (req, res) => {
    try {
      const cycle = await this.farmService.getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      // Get harvest records from database
      const harvestCollection = this.farmService.db.collection('harvestrecords');
      const harvests = await harvestCollection.find({ cycleId: cycle.id }).toArray();

      return successResponse(res, harvests);
    } catch (error) {
      logger.error('[FarmController] Get harvest error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Record quality test (laboratorian)
   * POST /api/farm/cycles/:id/quality-test
   */
  recordQualityTest = async (req, res) => {
    try {
      // Only admin/laboratorian can record quality tests
      if (req.user.role !== 'admin' && req.user.role !== 'laboratorian') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const testData = {
        ...req.body,
        laboratorianId: req.user.id,
        laboratorianName: req.user.name || req.user.email,
      };

      const qualityTest = await this.farmService.recordQualityTest(req.params.id, testData);

      return successResponse(res, qualityTest, 'Quality test recorded', 201);
    } catch (error) {
      logger.error('[FarmController] Quality test error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get quality tests for cycle
   * GET /api/farm/cycles/:id/quality-tests
   */
  getQualityTests = async (req, res) => {
    try {
      const cycle = await this.farmService.getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      // Get quality tests from database
      const testsCollection = this.farmService.db.collection('qualitytests');
      const tests = await testsCollection.find({ cycleId: cycle.id }).toArray();

      return successResponse(res, tests);
    } catch (error) {
      logger.error('[FarmController] Get quality tests error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Complete cultivation cycle
   * POST /api/farm/cycles/:id/complete
   */
  completeCycle = async (req, res) => {
    try {
      const cycle = await this.farmService.getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const result = await this.farmService.completeCycle(req.params.id, req.body);

      return successResponse(res, result, 'Cultivation cycle completed');
    } catch (error) {
      logger.error('[FarmController] Complete cycle error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get farmer dashboard
   * GET /api/farm/dashboard
   */
  getDashboard = async (req, res) => {
    try {
      const dashboardData = await this.farmService.getFarmerDashboard(req.user.id);

      return successResponse(res, dashboardData);
    } catch (error) {
      logger.error('[FarmController] Dashboard error:', error);
      return errorResponse(res, error);
    }
  };
}

module.exports = FarmManagementController;
