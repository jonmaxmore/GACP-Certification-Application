/**
 * 🌱 Farm Management API Routes
 * API endpoints สำหรับการจัดการฟาร์ม Cannabis
 */

const logger = require('../../shared/logger/logger');
const express = require('express');
const router = express.Router();

module.exports = (dependencies = {}) => {
  const { farmEngine, auth } = dependencies;

  if (!farmEngine) {
    logger.error('[FarmAPI] FarmEngine not provided');
    return router;
  }

  /**
   * POST /api/farm/cycles
   * สร้างรอบการเพาะปลูกใหม่
   */
  router.post('/cycles', auth, async (req, res) => {
    try {
      const cycleData = {
        ...req.body,
        farmerId: req.user.id,
        farmerEmail: req.user.email,
      };

      const cycle = await farmEngine.createCultivationCycle(cycleData);

      res.status(201).json({
        success: true,
        message: 'Cultivation cycle created successfully',
        data: cycle,
      });
    } catch (error) {
      logger.error('[FarmAPI] Create cycle error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * GET /api/farm/cycles
   * ดูรายการรอบการเพาะปลูกทั้งหมด
   */
  router.get('/cycles', auth, async (req, res) => {
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

      const collection = farmEngine.db.collection('cultivationcycles');
      const cycles = await collection.find(filters).sort({ createdAt: -1 }).toArray();

      res.json({
        success: true,
        data: cycles,
        total: cycles.length,
      });
    } catch (error) {
      logger.error('[FarmAPI] List cycles error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * GET /api/farm/cycles/:id
   * ดูรายละเอียดรอบการเพาะปลูก
   */
  router.get('/cycles/:id', auth, async (req, res) => {
    try {
      const cycle = await farmEngine._getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      res.json({
        success: true,
        data: cycle,
      });
    } catch (error) {
      logger.error('[FarmAPI] Get cycle error:', error);
      res.status(404).json({
        success: false,
        message: 'Cycle not found',
      });
    }
  });

  /**
   * POST /api/farm/cycles/:id/activities
   * บันทึกกิจกรรม SOP
   */
  router.post('/cycles/:id/activities', auth, async (req, res) => {
    try {
      const cycle = await farmEngine._getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      const activityData = {
        ...req.body,
        userId: req.user.id,
      };

      const activity = await farmEngine.recordActivity(req.params.id, activityData);

      res.status(201).json({
        success: true,
        message: 'Activity recorded successfully',
        data: activity,
      });
    } catch (error) {
      logger.error('[FarmAPI] Record activity error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * GET /api/farm/cycles/:id/activities
   * ดูรายการกิจกรรมทั้งหมดของรอบการเพาะปลูก
   */
  router.get('/cycles/:id/activities', auth, async (req, res) => {
    try {
      const cycle = await farmEngine._getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      res.json({
        success: true,
        data: cycle.activities || [],
        total: cycle.activities?.length || 0,
      });
    } catch (error) {
      logger.error('[FarmAPI] Get activities error:', error);
      res.status(404).json({
        success: false,
        message: 'Cycle not found',
      });
    }
  });

  /**
   * POST /api/farm/cycles/:id/compliance
   * บันทึกผลการตรวจสอบความสอดคล้อง
   */
  router.post('/cycles/:id/compliance', auth, async (req, res) => {
    try {
      // Only admin/inspector can record compliance checks
      if (req.user.role !== 'admin' && req.user.role !== 'inspector') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      const checkData = {
        ...req.body,
        inspectorId: req.user.id,
      };

      const complianceCheck = await farmEngine.recordComplianceCheck(req.params.id, checkData);

      res.status(201).json({
        success: true,
        message: 'Compliance check recorded',
        data: complianceCheck,
      });
    } catch (error) {
      logger.error('[FarmAPI] Compliance check error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * GET /api/farm/cycles/:id/compliance
   * ดูผลการตรวจสอบความสอดคล้อง
   */
  router.get('/cycles/:id/compliance', auth, async (req, res) => {
    try {
      const cycle = await farmEngine._getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      res.json({
        success: true,
        data: {
          checks: cycle.complianceChecks || [],
          score: cycle.complianceScore || null,
        },
      });
    } catch (error) {
      logger.error('[FarmAPI] Get compliance error:', error);
      res.status(404).json({
        success: false,
        message: 'Cycle not found',
      });
    }
  });

  /**
   * POST /api/farm/cycles/:id/harvest
   * บันทึกข้อมูลการเก็บเกี่ยว
   */
  router.post('/cycles/:id/harvest', auth, async (req, res) => {
    try {
      const cycle = await farmEngine._getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      const harvestData = {
        ...req.body,
        userId: req.user.id,
      };

      const harvest = await farmEngine.recordHarvest(req.params.id, harvestData);

      res.status(201).json({
        success: true,
        message: 'Harvest recorded successfully',
        data: harvest,
      });
    } catch (error) {
      logger.error('[FarmAPI] Record harvest error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * GET /api/farm/cycles/:id/harvest
   * ดูข้อมูลการเก็บเกี่ยว
   */
  router.get('/cycles/:id/harvest', auth, async (req, res) => {
    try {
      const cycle = await farmEngine._getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      // Get harvest records
      const collection = farmEngine.db.collection('harvestrecords');
      const harvests = await collection
        .find({
          cycleId: cycle.id,
        })
        .toArray();

      res.json({
        success: true,
        data: harvests,
      });
    } catch (error) {
      logger.error('[FarmAPI] Get harvest error:', error);
      res.status(404).json({
        success: false,
        message: 'Cycle not found',
      });
    }
  });

  /**
   * POST /api/farm/cycles/:id/quality-test
   * บันทึกผลการทดสอบคุณภาพ
   */
  router.post('/cycles/:id/quality-test', auth, async (req, res) => {
    try {
      // Only admin/laboratorian can record quality tests
      if (req.user.role !== 'admin' && req.user.role !== 'laboratorian') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      const testData = {
        ...req.body,
        laboratorianId: req.user.id,
      };

      const qualityTest = await farmEngine.recordQualityTest(req.params.id, testData);

      res.status(201).json({
        success: true,
        message: 'Quality test recorded',
        data: qualityTest,
      });
    } catch (error) {
      logger.error('[FarmAPI] Quality test error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * GET /api/farm/cycles/:id/quality-tests
   * ดูผลการทดสอบคุณภาพทั้งหมด
   */
  router.get('/cycles/:id/quality-tests', auth, async (req, res) => {
    try {
      const cycle = await farmEngine._getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      // Get quality tests
      const collection = farmEngine.db.collection('qualitytests');
      const tests = await collection
        .find({
          cycleId: cycle.id,
        })
        .toArray();

      res.json({
        success: true,
        data: tests,
      });
    } catch (error) {
      logger.error('[FarmAPI] Get quality tests error:', error);
      res.status(404).json({
        success: false,
        message: 'Cycle not found',
      });
    }
  });

  /**
   * POST /api/farm/cycles/:id/complete
   * ปิดรอบการเพาะปลูก
   */
  router.post('/cycles/:id/complete', auth, async (req, res) => {
    try {
      const cycle = await farmEngine._getCycle(req.params.id);

      // Check permission
      if (cycle.farmerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      const result = await farmEngine.completeCycle(req.params.id, req.body);

      res.json({
        success: true,
        message: 'Cultivation cycle completed',
        data: result,
      });
    } catch (error) {
      logger.error('[FarmAPI] Complete cycle error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * GET /api/farm/dashboard
   * Dashboard สำหรับเกษตรกร
   */
  router.get('/dashboard', auth, async (req, res) => {
    try {
      const collection = farmEngine.db.collection('cultivationcycles');

      const filters = { farmerId: req.user.id };

      // Get active cycles
      const activeCycles = await collection
        .find({
          ...filters,
          status: 'active',
        })
        .toArray();

      // Get completed cycles
      const completedCycles = await collection
        .find({
          ...filters,
          status: 'completed',
        })
        .limit(5)
        .sort({ completedAt: -1 })
        .toArray();

      // Calculate statistics
      const totalYield = completedCycles.reduce((sum, cycle) => {
        return sum + (cycle.completionData?.totalYield || 0);
      }, 0);

      res.json({
        success: true,
        data: {
          activeCycles: {
            count: activeCycles.length,
            cycles: activeCycles,
          },
          completedCycles: {
            count: completedCycles.length,
            cycles: completedCycles,
          },
          statistics: {
            totalYield,
            avgComplianceScore:
              completedCycles.reduce((sum, c) => sum + (c.complianceScore?.score || 0), 0) /
              (completedCycles.length || 1),
          },
        },
      });
    } catch (error) {
      logger.error('[FarmAPI] Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  logger.info('[FarmAPI] Routes loaded successfully');

  return router;
};
