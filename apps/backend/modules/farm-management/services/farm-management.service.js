/**
 * 🌱 Farm Management Service
 * Business logic for cultivation cycle management
 */

const { v4: uuidv4 } = require('uuid');
const CultivationCycle = require('../models/CultivationCycle');
const { AppError } = require('../../shared/utils/error-handler-utils');
const logger = require('../../shared/utils/logger');

class FarmManagementService {
  constructor(db) {
    this.db = db;
    this.collection = db ? db.collection('cultivationcycles') : null;
    logger.info('[FarmService] Service initialized');
  }

  /**
   * Create new cultivation cycle
   */
  async createCultivationCycle(cycleData) {
    try {
      const cycle = {
        id: uuidv4(),
        ...cycleData,
        status: 'planning',
        phase: 'germination',
        activities: [],
        complianceChecks: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
      };

      // Validate required fields
      if (!cycle.farmerId || !cycle.farmerEmail) {
        throw new AppError('Farmer ID and email are required', 400);
      }

      if (!cycle.cropType || !cycle.variety || !cycle.plantingDate) {
        throw new AppError('Crop type, variety, and planting date are required', 400);
      }

      // Save to database
      if (this.collection) {
        await this.collection.insertOne(cycle);
      }

      logger.info(`[FarmService] Cultivation cycle created: ${cycle.id}`, {
        farmerId: cycle.farmerId,
        cropType: cycle.cropType,
      });

      return cycle;
    } catch (error) {
      logger.error('[FarmService] Error creating cultivation cycle:', error);
      throw error;
    }
  }

  /**
   * Get cultivation cycle by ID
   */
  async getCycle(cycleId) {
    try {
      if (!this.collection) {
        throw new AppError('Database not initialized', 500);
      }

      const cycle = await this.collection.findOne({ id: cycleId });

      if (!cycle) {
        throw new AppError('Cultivation cycle not found', 404);
      }

      return cycle;
    } catch (error) {
      logger.error(`[FarmService] Error getting cycle ${cycleId}:`, error);
      throw error;
    }
  }

  /**
   * Record SOP activity
   */
  async recordActivity(cycleId, activityData) {
    try {
      // const cycle = await this.getCycle(cycleId);

      const activity = {
        id: uuidv4(),
        ...activityData,
        recordedAt: new Date(),
      };

      // Validate activity type - Extended for GACP SOP Integration
      const validTypes = [
        // Legacy types (backward compatibility)
        'watering',
        'fertilizing',
        'pruning',
        'pest_control',
        'inspection',
        'other',

        // Pre-Planting Phase
        'soil_preparation',
        'soil_testing',
        'water_testing',
        'seed_selection',
        'area_measurement',

        // Planting Phase
        'seed_germination',
        'seedling_transplant',
        'irrigation_setup',
        'plant_tagging',

        // Growing Phase
        'daily_watering',
        'weekly_fertilizing',
        'monthly_pruning',
        'pest_monitoring',
        'disease_inspection',
        'growth_measurement',

        // Harvesting Phase
        'maturity_assessment',
        'harvesting_process',
        'fresh_weight_recording',
        'initial_packaging',

        // Post-Harvest Phase
        'drying_process',
        'processing',
        'final_packaging',
        'storage_conditions',
        'quality_testing',
      ];

      if (!validTypes.includes(activity.type)) {
        throw new AppError('Invalid activity type', 400);
      }

      // Add GACP compliance metadata if SOP activity
      const isSOPActivity = ![
        'watering',
        'fertilizing',
        'pruning',
        'pest_control',
        'inspection',
        'other',
      ].includes(activity.type);
      if (isSOPActivity) {
        activity.isSOPActivity = true;
        activity.gacpCompliance = this._getGACPComplianceInfo(activity.type);
      }

      // Update cycle
      await this.collection.updateOne(
        { id: cycleId },
        {
          $push: { activities: activity },
          $set: { 'metadata.updatedAt': new Date() },
        },
      );

      logger.info(`[FarmService] Activity recorded for cycle ${cycleId}`, {
        activityType: activity.type,
        userId: activity.userId,
      });

      return activity;
    } catch (error) {
      logger.error('[FarmService] Error recording activity:', error);
      throw error;
    }
  }

  /**
   * Record compliance check (inspector)
   */
  async recordComplianceCheck(cycleId, checkData) {
    try {
      // const cycle = await this.getCycle(cycleId);

      const check = {
        id: uuidv4(),
        ...checkData,
        recordedAt: new Date(),
      };

      // Validate check type
      const validCheckTypes = ['routine', 'spot_check', 'certification', 'follow_up'];
      if (!validCheckTypes.includes(check.checkType)) {
        throw new AppError('Invalid check type', 400);
      }

      // Calculate compliance score
      const score = this._calculateComplianceScore(check);

      // Update cycle
      await this.collection.updateOne(
        { id: cycleId },
        {
          $push: { complianceChecks: check },
          $set: {
            'complianceScore.score': score,
            'complianceScore.lastUpdated': new Date(),
            'metadata.updatedAt': new Date(),
          },
        },
      );

      logger.info(`[FarmService] Compliance check recorded for cycle ${cycleId}`, {
        inspectorId: check.inspectorId,
        score,
      });

      return { ...check, score };
    } catch (error) {
      logger.error('[FarmService] Error recording compliance check:', error);
      throw error;
    }
  }

  /**
   * Record harvest data
   */
  async recordHarvest(cycleId, harvestData) {
    try {
      const cycle = await this.getCycle(cycleId);

      if (cycle.status !== 'active' && cycle.status !== 'harvesting') {
        throw new AppError('Cycle must be active or in harvesting phase', 400);
      }

      const harvest = {
        id: uuidv4(),
        cycleId,
        ...harvestData,
        recordedAt: new Date(),
      };

      // Update cycle status
      await this.collection.updateOne(
        { id: cycleId },
        {
          $set: {
            status: 'harvesting',
            phase: 'harvest',
            'harvestData.harvestDate': harvest.date || new Date(),
            'harvestData.totalYield': harvest.totalYield,
            'harvestData.yieldUnit': harvest.yieldUnit || 'kg',
            'harvestData.qualityGrade': harvest.qualityGrade,
            'harvestData.notes': harvest.notes,
            'metadata.updatedAt': new Date(),
          },
        },
      );

      // Also save to harvestrecords collection
      if (this.db) {
        const harvestCollection = this.db.collection('harvestrecords');
        await harvestCollection.insertOne(harvest);
      }

      logger.info(`[FarmService] Harvest recorded for cycle ${cycleId}`, {
        totalYield: harvest.totalYield,
      });

      return harvest;
    } catch (error) {
      logger.error('[FarmService] Error recording harvest:', error);
      throw error;
    }
  }

  /**
   * Record quality test (laboratorian)
   */
  async recordQualityTest(cycleId, testData) {
    try {
      // const cycle = await this.getCycle(cycleId);

      const test = {
        id: uuidv4(),
        cycleId,
        ...testData,
        recordedAt: new Date(),
      };

      // Save to qualitytests collection
      if (this.db) {
        const testsCollection = this.db.collection('qualitytests');
        await testsCollection.insertOne(test);
      }

      logger.info(`[FarmService] Quality test recorded for cycle ${cycleId}`, {
        laboratorianId: test.laboratorianId,
      });

      return test;
    } catch (error) {
      logger.error('[FarmService] Error recording quality test:', error);
      throw error;
    }
  }

  /**
   * Complete cultivation cycle
   */
  async completeCycle(cycleId, completionData) {
    try {
      const cycle = await this.getCycle(cycleId);

      if (cycle.status === 'completed') {
        throw new AppError('Cycle already completed', 400);
      }

      const completion = {
        completedDate: new Date(),
        ...completionData,
        finalComplianceScore: cycle.complianceScore?.score || null,
      };

      // Determine certification eligibility
      const certificationEligible =
        completion.finalComplianceScore && completion.finalComplianceScore >= 80;

      completion.certification = {
        eligible: certificationEligible,
        reason: certificationEligible
          ? 'Meets GACP compliance standards'
          : 'Compliance score below minimum threshold (80%)',
      };

      // Update cycle
      await this.collection.updateOne(
        { id: cycleId },
        {
          $set: {
            status: 'completed',
            phase: 'post-harvest',
            completionData: completion,
            'metadata.updatedAt': new Date(),
          },
        },
      );

      logger.info(`[FarmService] Cycle completed: ${cycleId}`, {
        certificationEligible,
        finalScore: completion.finalComplianceScore,
      });

      return { ...cycle, status: 'completed', completionData: completion };
    } catch (error) {
      logger.error('[FarmService] Error completing cycle:', error);
      throw error;
    }
  }

  /**
   * Get farmer dashboard data
   */
  async getFarmerDashboard(farmerId) {
    try {
      if (!this.collection) {
        throw new AppError('Database not initialized', 500);
      }

      // Get active cycles
      const activeCycles = await this.collection.find({ farmerId, status: 'active' }).toArray();

      // Get completed cycles (last 5)
      const completedCycles = await this.collection
        .find({ farmerId, status: 'completed' })
        .sort({ 'completionData.completedDate': -1 })
        .limit(5)
        .toArray();

      // Calculate statistics
      const totalYield = completedCycles.reduce((sum, cycle) => {
        return sum + (cycle.completionData?.totalYield || 0);
      }, 0);

      const avgComplianceScore =
        completedCycles.length > 0
          ? completedCycles.reduce((sum, c) => sum + (c.complianceScore?.score || 0), 0) /
            completedCycles.length
          : 0;

      return {
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
          avgComplianceScore: Math.round(avgComplianceScore),
        },
      };
    } catch (error) {
      logger.error(`[FarmService] Error getting dashboard for farmer ${farmerId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Calculate compliance score from check findings
   */
  _calculateComplianceScore(check) {
    let score = 100;

    if (check.findings && Array.isArray(check.findings)) {
      check.findings.forEach(finding => {
        if (finding.severity === 'critical') {
          score -= 20;
        } else if (finding.severity === 'major') {
          score -= 10;
        } else if (finding.severity === 'minor') {
          score -= 5;
        }
      });
    }

    return Math.max(0, score);
  }

  /**
   * Get GACP compliance info for SOP activities
   */
  _getGACPComplianceInfo(activityType) {
    const gacpMapping = {
      // Pre-Planting Phase
      soil_preparation: { requirement: 'GACP-05.1', points: 15, phase: 'pre_planting' },
      soil_testing: { requirement: 'GACP-05.2', points: 20, phase: 'pre_planting' },
      water_testing: { requirement: 'GACP-06.1', points: 20, phase: 'pre_planting' },
      seed_selection: { requirement: 'GACP-04.1', points: 15, phase: 'pre_planting' },
      area_measurement: { requirement: 'GACP-03.2', points: 10, phase: 'pre_planting' },

      // Planting Phase
      seed_germination: { requirement: 'GACP-04.2', points: 15, phase: 'planting' },
      seedling_transplant: { requirement: 'GACP-04.3', points: 15, phase: 'planting' },
      irrigation_setup: { requirement: 'GACP-06.2', points: 10, phase: 'planting' },
      plant_tagging: { requirement: 'GACP-10.1', points: 10, phase: 'planting' },

      // Growing Phase
      daily_watering: { requirement: 'GACP-06.3', points: 5, phase: 'growing' },
      weekly_fertilizing: { requirement: 'GACP-07.1', points: 10, phase: 'growing' },
      monthly_pruning: { requirement: 'GACP-08.1', points: 10, phase: 'growing' },
      pest_monitoring: { requirement: 'GACP-09.1', points: 15, phase: 'growing' },
      disease_inspection: { requirement: 'GACP-09.2', points: 15, phase: 'growing' },
      growth_measurement: { requirement: 'GACP-08.2', points: 10, phase: 'growing' },

      // Harvesting Phase
      maturity_assessment: { requirement: 'GACP-11.1', points: 15, phase: 'harvesting' },
      harvesting_process: { requirement: 'GACP-11.2', points: 20, phase: 'harvesting' },
      fresh_weight_recording: { requirement: 'GACP-11.3', points: 10, phase: 'harvesting' },
      initial_packaging: { requirement: 'GACP-12.1', points: 10, phase: 'harvesting' },

      // Post-Harvest Phase
      drying_process: { requirement: 'GACP-13.1', points: 20, phase: 'post_harvest' },
      processing: { requirement: 'GACP-13.2', points: 15, phase: 'post_harvest' },
      final_packaging: { requirement: 'GACP-12.2', points: 15, phase: 'post_harvest' },
      storage_conditions: { requirement: 'GACP-14.1', points: 10, phase: 'post_harvest' },
      quality_testing: { requirement: 'GACP-14.2', points: 25, phase: 'post_harvest' },
    };

    return gacpMapping[activityType] || { requirement: 'GACP-GEN', points: 0, phase: 'general' };
  }
}

module.exports = FarmManagementService;
