/**
 * GACP Quality Compliance Comparator - Database Seeder
 * Service to populate database with initial standards, parameters, and values
 */

const mongoose = require('mongoose');
const Standard = require('../models/Standard');
const Parameter = require('../models/Parameter');
const StandardValue = require('../models/StandardValue');
const logger = require('../shared/logger');

// Import seed data
const {
  seedStandards,
  seedParameters,
  seedStandardValues,
} = require('../data/compliance-seed-data');

class ComplianceSeeder {
  /**
   * Seed all compliance data
   */
  static async seedAll(options = {}) {
    const { force = false, verbose = true } = options;

    try {
      // Check if data already exists
      if (!force) {
        const existingStandards = await Standard.countDocuments();
        const existingParameters = await Parameter.countDocuments();

        if (existingStandards > 0 || existingParameters > 0) {
          return {
            success: false,
            message: 'Database already seeded. Use force option to override.',
            counts: {
              standards: existingStandards,
              parameters: existingParameters,
            },
          };
        }
      }

      // Clear existing data if force mode
      if (force) {
        await StandardValue.deleteMany({});
        await Parameter.deleteMany({});
        await Standard.deleteMany({});
      }
      let adminUserId;
      try {
        const User = mongoose.model('User');
        const adminUser = await User.findOne({ userType: 'admin' });
        adminUserId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();
      } catch (error) {
        adminUserId = new mongoose.Types.ObjectId();
      }

      // Seed standards
      const createdStandards = new Map();

      for (const standardData of seedStandards) {
        const standard = new Standard({
          ...standardData,
          createdBy: adminUserId,
          lastModifiedBy: adminUserId,
        });

        await standard.save();
        createdStandards.set(standardData.abbreviation, standard);

        if (verbose) {
          logger.info(`✅ Created standard: ${standardData.name}`);
        }
      }

      // Seed parameters
      const createdParameters = new Map();

      for (const parameterData of seedParameters) {
        const parameter = new Parameter({
          ...parameterData,
          createdBy: adminUserId,
          lastModifiedBy: adminUserId,
        });

        await parameter.save();
        createdParameters.set(parameterData.code, parameter);

        if (verbose) {
          logger.info(`✅ Created parameter: ${parameterData.name}`);
        }
      }

      // Seed standard values
      for (const valueData of seedStandardValues) {
        const standard = createdStandards.get(valueData.standardRef);
        const parameter = createdParameters.get(valueData.parameterRef);

        if (!standard || !parameter) {
          console.warn(
            `  ⚠️  Skipping value: Standard '${valueData.standardRef}' or Parameter '${valueData.parameterRef}' not found`,
          );
          continue;
        }

        const standardValue = new StandardValue({
          standardId: standard._id,
          parameterId: parameter._id,
          limitValue: valueData.limitValue,
          limitType: valueData.limitType,
          unit: valueData.unit,
          strictnessScore: valueData.strictnessScore,
          description: valueData.description,
          complianceLevel: valueData.complianceLevel,
          enforcementLevel: valueData.enforcementLevel,
          sourceSection: valueData.sourceSection,
          testingRequired: valueData.testingRequired,
          testingFrequency: valueData.testingFrequency,
          dataQuality: valueData.dataQuality,
          createdBy: adminUserId,
          lastModifiedBy: adminUserId,
        });

        await standardValue.save();

        if (verbose) {
          logger.info(
            `✅ Created standard value for ${valueData.standardRef}/${valueData.parameterRef}`,
          );
        }
      }

      // Add some additional demonstration data
      await this.seedAdditionalData(createdStandards, createdParameters, adminUserId, verbose);

      const finalCounts = {
        standards: await Standard.countDocuments(),
        parameters: await Parameter.countDocuments(),
        standardValues: await StandardValue.countDocuments(),
      };

      return {
        success: true,
        message: 'Database seeded successfully',
        counts: finalCounts,
      };
    } catch (error) {
      logger.error('❌ Error seeding compliance database:', error);
      throw error;
    }
  }

  /**
   * Seed additional demonstration data
   */
  static async seedAdditionalData(standardsMap, parametersMap, adminUserId, verbose) {
    try {
      // Add more parameters for comprehensive comparison
      const additionalParameters = [
        {
          name: 'Cadmium',
          code: 'CD',
          category: 'contaminant',
          subcategory: 'heavy_metals',
          unit: 'ppm',
          dataType: 'numeric',
          maxValue: 20,
          description: 'Cadmium content in dried medicinal plant material',
          riskLevel: 'high',
          severity: 'critical',
          displayOrder: 6,
        },
        {
          name: 'Mercury',
          code: 'HG',
          category: 'contaminant',
          subcategory: 'heavy_metals',
          unit: 'ppm',
          dataType: 'numeric',
          maxValue: 10,
          description: 'Mercury content in dried medicinal plant material',
          riskLevel: 'critical',
          severity: 'critical',
          displayOrder: 7,
        },
        {
          name: 'Escherichia coli',
          code: 'ECOLI',
          category: 'microbiological',
          subcategory: 'pathogenic_bacteria',
          unit: 'CFU/g',
          dataType: 'numeric',
          maxValue: 1000,
          description: 'E. coli count in medicinal plant material',
          riskLevel: 'high',
          severity: 'major',
          displayOrder: 8,
        },
        {
          name: 'Pesticide Residues',
          code: 'PESTICIDE',
          category: 'contaminant',
          subcategory: 'chemical_residues',
          unit: 'ppm',
          dataType: 'numeric',
          maxValue: 0.1,
          description: 'Total pesticide residue content',
          riskLevel: 'high',
          severity: 'major',
          displayOrder: 9,
        },
      ];

      // Create additional parameters
      for (const paramData of additionalParameters) {
        const parameter = new Parameter({
          ...paramData,
          applicableProducts: ['herbs', 'medicinal_plants'],
          applicableStages: ['processing', 'storage'],
          tags: [paramData.subcategory, paramData.category],
          keywords: [paramData.code.toLowerCase(), paramData.name.toLowerCase()],
          createdBy: adminUserId,
          lastModifiedBy: adminUserId,
        });

        await parameter.save();
        parametersMap.set(paramData.code, parameter);

        if (verbose) {
          logger.info(`✅ Created additional parameter: ${paramData.name}`);
        }
      }

      // Add values for these new parameters across all standards
      const additionalValues = [
        // Cadmium values
        { standardRef: 'GACP', parameterRef: 'CD', limitValue: 1.0, strictnessScore: 7 },
        { standardRef: 'THAI_FDA', parameterRef: 'CD', limitValue: 0.5, strictnessScore: 8 },
        { standardRef: 'ASEAN_HERBAL', parameterRef: 'CD', limitValue: 0.8, strictnessScore: 7 },

        // Mercury values
        { standardRef: 'GACP', parameterRef: 'HG', limitValue: 0.5, strictnessScore: 8 },
        { standardRef: 'THAI_FDA', parameterRef: 'HG', limitValue: 0.3, strictnessScore: 9 },
        { standardRef: 'ASEAN_HERBAL', parameterRef: 'HG', limitValue: 0.4, strictnessScore: 8 },

        // E. coli values
        { standardRef: 'GACP', parameterRef: 'ECOLI', limitValue: 100, strictnessScore: 7 },
        { standardRef: 'THAI_FDA', parameterRef: 'ECOLI', limitValue: 50, strictnessScore: 8 },
        { standardRef: 'ASEAN_HERBAL', parameterRef: 'ECOLI', limitValue: 100, strictnessScore: 7 },

        // Pesticide values
        { standardRef: 'GACP', parameterRef: 'PESTICIDE', limitValue: 0.05, strictnessScore: 7 },
        {
          standardRef: 'THAI_FDA',
          parameterRef: 'PESTICIDE',
          limitValue: 0.01,
          strictnessScore: 9,
        },
        {
          standardRef: 'ASEAN_HERBAL',
          parameterRef: 'PESTICIDE',
          limitValue: 0.03,
          strictnessScore: 8,
        },
      ];

      // Create additional standard values
      for (const valueData of additionalValues) {
        const standard = standardsMap.get(valueData.standardRef);
        const parameter = parametersMap.get(valueData.parameterRef);

        if (standard && parameter) {
          const standardValue = new StandardValue({
            standardId: standard._id,
            parameterId: parameter._id,
            limitValue: valueData.limitValue,
            limitType: 'maximum',
            unit: parameter.unit,
            strictnessScore: valueData.strictnessScore,
            complianceLevel: 'mandatory',
            enforcementLevel: 'strict',
            testingRequired: true,
            testingFrequency: 'per_batch',
            dataQuality: 'verified',
            createdBy: adminUserId,
            lastModifiedBy: adminUserId,
          });

          await standardValue.save();

          if (verbose) {
            logger.info(`✅ Created value for ${standard.abbreviation}/${parameter.code}`);
          }
        }
      }
    } catch (error) {
      logger.error('Error adding additional data:', error);
      throw error;
    }
  }

  /**
   * Verify seeded data integrity
   */
  static async verifyData() {
    try {
      const standards = await Standard.find({ status: 'active' });
      const parameters = await Parameter.find({ status: 'active' });
      const standardValues = await StandardValue.find({ status: 'active' });

      // Check for orphaned standard values
      const orphanedValues = await StandardValue.aggregate([
        {
          $lookup: {
            from: 'standards',
            localField: 'standardId',
            foreignField: '_id',
            as: 'standard',
          },
        },
        {
          $lookup: {
            from: 'parameters',
            localField: 'parameterId',
            foreignField: '_id',
            as: 'parameter',
          },
        },
        {
          $match: {
            $or: [{ standard: { $size: 0 } }, { parameter: { $size: 0 } }],
          },
        },
      ]);

      if (orphanedValues.length > 0) {
        logger.warn(`⚠️  Found ${orphanedValues.length} orphaned standard values`);
      } else {
        logger.info('✅ No orphaned standard values found');
      }

      // Verify each standard has at least one parameter
      for (const standard of standards) {
        const valueCount = await StandardValue.countDocuments({
          standardId: standard._id,
          status: 'active',
        });

        if (valueCount === 0) {
          logger.warn(`⚠️  Standard '${standard.abbreviation}' has no parameter values`);
        }
      }

      return {
        success: true,
        counts: {
          standards: standards.length,
          parameters: parameters.length,
          standardValues: standardValues.length,
          orphanedValues: orphanedValues.length,
        },
      };
    } catch (error) {
      logger.error('❌ Error verifying data:', error);
      throw error;
    }
  }

  /**
   * Clear all compliance data
   */
  static async clearAll() {
    try {
      await StandardValue.deleteMany({});
      await Parameter.deleteMany({});
      await Standard.deleteMany({});

      return { success: true, message: 'All compliance data cleared' };
    } catch (error) {
      logger.error('❌ Error clearing data:', error);
      throw error;
    }
  }
}

// Export for CLI usage
if (require.main === module) {
  const mongoose = require('mongoose');
  const { createLogger } = require('../shared/logger');
  const logger = createLogger('compliance-seeder');

  // Simple CLI interface
  const command = process.argv[2] || 'seed';
  const force = process.argv.includes('--force');
  const verbose = !process.argv.includes('--quiet');

  const runCommand = async function () {
    try {
      // Connect to MongoDB (use existing connection if available)
      if (mongoose.connection.readyState === 0) {
        const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_platform';
        await mongoose.connect(dbUrl);
      }

      switch (command) {
        case 'seed':
          await ComplianceSeeder.seedAll({ force, verbose });
          break;
        case 'verify':
          await ComplianceSeeder.verifyData();
          break;
        case 'clear':
          await ComplianceSeeder.clearAll();
          break;
        default:
          logger.error('Unknown command. Use: seed, verify, or clear');
          process.exit(1);
      }

      process.exit(0);
    } catch (error) {
      logger.error('Command failed:', error);
      process.exit(1);
    }
  };

  runCommand();
}

module.exports = ComplianceSeeder;
