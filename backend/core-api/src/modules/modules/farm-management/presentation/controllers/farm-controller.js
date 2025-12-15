const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('farm-management-farm');

/**
 * FarmController (Presentation Layer)
 *
 * HTTP handlers for farm management
 * - Farmer endpoints: register, update, submit, view own farms
 * - DTAM endpoints: review, approve, reject, view all farms
 */

class FarmController {
  constructor({
    registerFarmUseCase,
    updateFarmUseCase,
    submitFarmForReviewUseCase,
    getFarmDetailsUseCase,
    listFarmsUseCase,
    startFarmReviewUseCase,
    approveFarmUseCase,
    rejectFarmUseCase,
  }) {
    this.registerFarmUseCase = registerFarmUseCase;
    this.updateFarmUseCase = updateFarmUseCase;
    this.submitFarmForReviewUseCase = submitFarmForReviewUseCase;
    this.getFarmDetailsUseCase = getFarmDetailsUseCase;
    this.listFarmsUseCase = listFarmsUseCase;
    this.startFarmReviewUseCase = startFarmReviewUseCase;
    this.approveFarmUseCase = approveFarmUseCase;
    this.rejectFarmUseCase = rejectFarmUseCase;
  }

  /**
   * Register new farm (Farmer only)
   * POST /farms
   */
  async registerFarm(req, res) {
    try {
      const ownerId = req.user.userId; // From auth middleware

      const farm = await this.registerFarmUseCase.execute({
        ownerId,
        ...req.body,
      });

      return res.status(201).json({
        success: true,
        message: 'Farm registered successfully',
        farm: farm.toJSON(),
      });
    } catch (error) {
      logger.error('Register farm error:', error);

      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to register farm',
      });
    }
  }

  /**
   * Update farm details (Farmer only)
   * PUT /farms/:id
   */
  async updateFarm(req, res) {
    try {
      const farmId = req.params.id;
      const ownerId = req.user.userId;

      const farm = await this.updateFarmUseCase.execute({
        farmId,
        ownerId,
        ...req.body,
      });

      return res.status(200).json({
        success: true,
        message: 'Farm updated successfully',
        farm: farm.toJSON(),
      });
    } catch (error) {
      logger.error('Update farm error:', error);

      if (error.message === 'Farm not found') {
        return res.status(404).json({
          success: false,
          message: 'Farm not found',
        });
      }

      if (error.message.includes('permission')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('cannot be edited')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to update farm',
      });
    }
  }

  /**
   * Submit farm for DTAM review (Farmer only)
   * POST /farms/:id/submit
   */
  async submitFarmForReview(req, res) {
    try {
      const farmId = req.params.id;
      const ownerId = req.user.userId;

      const farm = await this.submitFarmForReviewUseCase.execute({
        farmId,
        ownerId,
      });

      return res.status(200).json({
        success: true,
        message: 'Farm submitted for review successfully',
        farm: farm.toJSON(),
      });
    } catch (error) {
      logger.error('Submit farm error:', error);

      if (error.message === 'Farm not found') {
        return res.status(404).json({
          success: false,
          message: 'Farm not found',
        });
      }

      if (error.message.includes('permission')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('cannot be submitted')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to submit farm for review',
      });
    }
  }

  /**
   * Get farm details
   * GET /farms/:id
   * Farmers can view their own farms, DTAM staff can view any farm
   */
  async getFarmDetails(req, res) {
    try {
      const farmId = req.params.id;
      const userId = req.user?.userId || req.staff?.staffId;
      const userType = req.user ? 'farmer' : 'dtam_staff';

      const farm = await this.getFarmDetailsUseCase.execute({
        farmId,
        userId,
        userType,
      });

      return res.status(200).json({
        success: true,
        farm: farm.toJSON(),
      });
    } catch (error) {
      logger.error('Get farm details error:', error);

      if (error.message === 'Farm not found') {
        return res.status(404).json({
          success: false,
          message: 'Farm not found',
        });
      }

      if (error.message.includes('permission')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to get farm details',
      });
    }
  }

  /**
   * List farms
   * GET /farms
   * Farmers see only their farms, DTAM staff see all with filters
   */
  async listFarms(req, res) {
    try {
      const userId = req.user?.userId || req.staff?.staffId;
      const userType = req.user ? 'farmer' : 'dtam_staff';

      const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', ...filters } = req.query;

      const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

      const result = await this.listFarmsUseCase.execute({
        userId,
        userType,
        filters,
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortObj,
      });

      return res.status(200).json({
        success: true,
        ...result,
        farms: result.farms.map(farm => farm.toJSON()),
      });
    } catch (error) {
      logger.error('List farms error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to list farms',
      });
    }
  }

  /**
   * Start farm review (DTAM staff only)
   * POST /farms/:id/start-review
   */
  async startFarmReview(req, res) {
    try {
      const farmId = req.params.id;
      const staffId = req.staff.staffId;

      const farm = await this.startFarmReviewUseCase.execute({
        farmId,
        staffId,
      });

      return res.status(200).json({
        success: true,
        message: 'Farm review started',
        farm: farm.toJSON(),
      });
    } catch (error) {
      logger.error('Start farm review error:', error);

      if (error.message === 'Farm not found') {
        return res.status(404).json({
          success: false,
          message: 'Farm not found',
        });
      }

      if (error.message.includes('Only PENDING_REVIEW')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to start farm review',
      });
    }
  }

  /**
   * Approve farm (DTAM staff only)
   * POST /farms/:id/approve
   */
  async approveFarm(req, res) {
    try {
      const farmId = req.params.id;
      const staffId = req.staff.staffId;
      const { notes } = req.body;

      const farm = await this.approveFarmUseCase.execute({
        farmId,
        staffId,
        notes,
      });

      return res.status(200).json({
        success: true,
        message: 'Farm approved successfully',
        farm: farm.toJSON(),
      });
    } catch (error) {
      logger.error('Approve farm error:', error);

      if (error.message === 'Farm not found') {
        return res.status(404).json({
          success: false,
          message: 'Farm not found',
        });
      }

      if (error.message.includes('Only UNDER_REVIEW')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to approve farm',
      });
    }
  }

  /**
   * Reject farm (DTAM staff only)
   * POST /farms/:id/reject
   */
  async rejectFarm(req, res) {
    try {
      const farmId = req.params.id;
      const staffId = req.staff.staffId;
      const { reason } = req.body;

      const farm = await this.rejectFarmUseCase.execute({
        farmId,
        staffId,
        reason,
      });

      return res.status(200).json({
        success: true,
        message: 'Farm rejected',
        farm: farm.toJSON(),
      });
    } catch (error) {
      logger.error('Reject farm error:', error);

      if (error.message === 'Farm not found') {
        return res.status(404).json({
          success: false,
          message: 'Farm not found',
        });
      }

      if (error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('Only UNDER_REVIEW')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to reject farm',
      });
    }
  }
}

module.exports = FarmController;
