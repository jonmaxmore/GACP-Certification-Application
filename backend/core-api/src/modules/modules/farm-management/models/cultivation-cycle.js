/**
 * 🌱 Cultivation Cycle Model
 * Model for Cannabis cultivation cycle management
 */

const mongoose = require('mongoose');

const cultivationCycleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    farmerId: {
      type: String,
      required: true,
      index: true,
    },
    farmerEmail: {
      type: String,
      required: true,
    },
    farmId: {
      type: String,
      required: false,
    },
    farmName: {
      type: String,
      required: false,
    },
    cropType: {
      type: String,
      required: true,
      enum: [
        // Primary Crop (Cannabis Focus)
        'cannabis',
        'hemp',
        'medicinal_cannabis',
        // Secondary Economic Crops (Phase 3 Support)
        'turmeric', // ขมิ้นชัน
        'ginger', // ขิง
        'black_galingale', // กระชายดำ
        'plai', // ไพล
        'kratom', // กระท่อม
      ],
    },
    variety: {
      type: String,
      required: true,
    },
    plantingDate: {
      type: Date,
      required: true,
    },
    expectedHarvestDate: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ['planning', 'active', 'harvesting', 'completed', 'cancelled'],
      default: 'planning',
      index: true,
    },
    phase: {
      type: String,
      required: true,
      enum: ['germination', 'vegetative', 'flowering', 'harvest', 'post-harvest'],
      default: 'germination',
    },
    area: {
      value: Number,
      unit: {
        type: String,
        enum: ['sqm', 'rai', 'hectare'],
        default: 'rai',
      },
    },
    plantCount: {
      type: Number,
      required: false,
    },
    activities: [
      {
        id: String,
        type: {
          type: String,
          enum: ['watering', 'fertilizing', 'pruning', 'pest_control', 'inspection', 'other'],
        },
        description: String,
        date: Date,
        userId: String,
        userName: String,
        notes: String,
        sopCompliance: Boolean,
        recordedAt: Date,
      },
    ],
    complianceChecks: [
      {
        id: String,
        inspectorId: String,
        inspectorName: String,
        checkDate: Date,
        checkType: {
          type: String,
          enum: ['routine', 'spot_check', 'certification', 'follow_up'],
        },
        findings: [
          {
            category: String,
            finding: String,
            severity: {
              type: String,
              enum: ['minor', 'major', 'critical'],
            },
            status: {
              type: String,
              enum: ['open', 'resolved', 'pending'],
            },
          },
        ],
        overallCompliance: {
          type: String,
          enum: ['compliant', 'non_compliant', 'partially_compliant'],
        },
        notes: String,
        recordedAt: Date,
      },
    ],
    complianceScore: {
      score: Number,
      lastUpdated: Date,
      breakdown: {
        sopCompliance: Number,
        gacpStandards: Number,
        safetyProtocols: Number,
        recordKeeping: Number,
      },
    },
    harvestData: {
      harvestDate: Date,
      totalYield: Number,
      yieldUnit: {
        type: String,
        enum: ['kg', 'ton', 'gram'],
      },
      qualityGrade: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
      },
      notes: String,
    },
    completionData: {
      completedDate: Date,
      totalYield: Number,
      finalComplianceScore: Number,
      certification: {
        eligible: Boolean,
        reason: String,
      },
      notes: String,
    },

    // === Phase 3: AI-Powered Recommendations ===
    recommendations: {
      fertilizer: [
        {
          date: Date,
          product: String,
          npkRatio: String,
          amount: Number, // kg or liters
          unit: String,
          cost: Number, // THB
          reason: String,
          growthStage: String,
          applied: {
            type: Boolean,
            default: false,
          },
          appliedDate: Date,
          appliedBy: String,
          gacpApproved: {
            type: Boolean,
            default: true,
          },
        },
      ],
      irrigation: [
        {
          date: Date,
          amount: Number, // liters or mm
          duration: Number, // minutes
          method: {
            type: String,
            enum: ['drip', 'sprinkler', 'flood', 'manual'],
          },
          reason: String,
          growthStage: String,
          applied: {
            type: Boolean,
            default: false,
          },
          appliedDate: Date,
        },
      ],
      actions: [
        {
          type: String, // 'pruning', 'pest_control', 'disease_treatment', 'other'
          description: String,
          priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
          },
          dueDate: Date,
          growthStage: String,
          sopCompliance: {
            type: Boolean,
            default: true,
          },
          completed: {
            type: Boolean,
            default: false,
          },
          completedDate: Date,
          completedBy: String,
          notes: String,
        },
      ],
    },

    // === Phase 3: Environmental Data Summary (from sensors) ===
    environmentalSummary: {
      avgTemperature: Number, // Celsius
      minTemperature: Number,
      maxTemperature: Number,
      avgHumidity: Number, // %
      totalRainfall: Number, // mm
      avgSoilMoisture: Number, // %
      avgSoilPH: Number,
      avgSoilTemperature: Number, // Celsius
      npkLevels: {
        nitrogen: Number, // ppm
        phosphorus: Number, // ppm
        potassium: Number, // ppm
      },
      ec: Number, // Electrical Conductivity (mS/cm)
      sunlightHours: Number, // hours/day average
      dataCollectionPeriod: {
        start: Date,
        end: Date,
      },
      lastUpdated: Date,
    },

    // === Phase 3: AI Insights & Predictions ===
    aiInsights: {
      yieldPrediction: {
        predicted: Number, // kg
        confidence: Number, // 0-100
        generatedAt: Date,
        factors: [String],
      },
      diseaseRisk: {
        overallRisk: Number, // 0-100
        predictedDiseases: [
          {
            diseaseId: String,
            diseaseName: String,
            probability: Number, // 0-100
            peakRiskDate: Date,
          },
        ],
        lastAssessment: Date,
      },
      resourceOptimization: {
        waterEfficiency: Number, // %
        fertilizerEfficiency: Number, // %
        potentialSavings: Number, // THB
        suggestions: [String],
      },
    },

    metadata: {
      createdBy: String,
      createdAt: Date,
      updatedBy: String,
      updatedAt: Date,
      version: {
        type: Number,
        default: 1,
      },
    },
  },
  {
    timestamps: true,
    collection: 'cultivationcycles',
  },
);

// Indexes for performance
cultivationCycleSchema.index({ farmerId: 1, status: 1 });
cultivationCycleSchema.index({ farmerId: 1, plantingDate: -1 });
cultivationCycleSchema.index({ status: 1, phase: 1 });

// Virtual for days since planting
cultivationCycleSchema.virtual('daysSincePlanting').get(function () {
  if (!this.plantingDate) {
    return 0;
  }
  const now = new Date();
  const diff = now - this.plantingDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Instance method to check if cycle is active
cultivationCycleSchema.methods.isActive = function () {
  return this.status === 'active';
};

// Instance method to calculate compliance score
cultivationCycleSchema.methods.calculateComplianceScore = function () {
  if (!this.complianceChecks || this.complianceChecks.length === 0) {
    return null;
  }

  // Calculate based on latest compliance check
  const latest = this.complianceChecks[this.complianceChecks.length - 1];

  let score = 100;

  if (latest.findings) {
    latest.findings.forEach(finding => {
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
};

// Static method to find active cycles for farmer
cultivationCycleSchema.statics.findActiveCyclesForFarmer = function (farmerId) {
  return this.find({
    farmerId,
    status: 'active',
  }).sort({ plantingDate: -1 });
};

const CultivationCycle = mongoose.model('CultivationCycle', cultivationCycleSchema);

module.exports = CultivationCycle;
