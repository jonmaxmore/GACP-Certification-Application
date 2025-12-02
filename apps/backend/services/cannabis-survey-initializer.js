/**
 * Cannabis Survey System Initialization Script
 * Sets up the complete cannabis survey system with templates, questions, and configurations
 */

const logger = require('../shared/logger');
const { createCannabisTemplates } = require('../config/cannabisTemplates');
const { CannabisSurveyTemplate, CannabisQuestion } = require('../models/CannabisSurvey');
const User = require('../models/user-model');

class CannabisSurveyInitializer {
  constructor() {
    this.isInitialized = false;
  }

  async initialize(options = {}) {
    try {
      logger.info('🌿 Starting Cannabis Survey System initialization...');

      const { recreateTemplates = false, createSampleData = true, runValidation = true } = options;

      // Check if already initialized
      if (!recreateTemplates && (await this.checkExistingSystem())) {
        logger.info('✅ Cannabis Survey System already initialized');
        return {
          success: true,
          message: 'System already initialized',
          existingTemplates: await this.getSystemStats(),
        };
      }

      // Step 1: Clear existing data if recreating
      if (recreateTemplates) {
        await this.clearExistingData();
      }

      // Step 2: Find or create system admin user
      const systemAdmin = await this.getOrCreateSystemAdmin();

      // Step 3: Create cannabis survey templates
      logger.info('📋 Creating cannabis survey templates...');
      const templateResults = await createCannabisTemplates(systemAdmin._id);

      // Step 4: Create sample responses if requested
      let sampleData = null;
      if (createSampleData) {
        logger.info('📊 Creating sample survey data...');
        sampleData = await this.createSampleData(templateResults);
      }

      // Step 5: Validate system integrity
      if (runValidation) {
        logger.info('🔍 Validating system integrity...');
        await this.validateSystemIntegrity();
      }

      // Step 6: Set initialization flag
      this.isInitialized = true;

      const stats = await this.getSystemStats();

      logger.info('🎉 Cannabis Survey System initialization completed successfully!');
      console.log(`📈 System Statistics:
        - Templates: ${stats.templates}
        - Questions: ${stats.questions}
        - Survey Types: ${stats.surveyTypes}
        - Cannabis Categories: ${stats.cannabisCategories}`);

      return {
        success: true,
        message: 'Cannabis Survey System initialized successfully',
        results: {
          templates: templateResults,
          sampleData,
          stats,
        },
      };
    } catch (error) {
      logger.error('❌ Cannabis Survey System initialization failed:', error);
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  async checkExistingSystem() {
    try {
      const templateCount = await CannabisSurveyTemplate.countDocuments();
      const questionCount = await CannabisQuestion.countDocuments();

      // Consider system initialized if we have at least 3 templates and 20 questions
      return templateCount >= 3 && questionCount >= 20;
    } catch (error) {
      logger.error('Error checking existing system:', error);
      return false;
    }
  }

  async clearExistingData() {
    try {
      logger.info('🧹 Clearing existing cannabis survey data...');

      await Promise.all([CannabisQuestion.deleteMany({}), CannabisSurveyTemplate.deleteMany({})]);

      logger.info('✅ Existing data cleared');
    } catch (error) {
      logger.error('Error clearing existing data:', error);
      throw error;
    }
  }

  async getOrCreateSystemAdmin() {
    try {
      // Try to find existing admin user
      let admin = await User.findOne({
        role: 'admin',
        email: { $regex: /system|admin|cannabis/i },
      });

      if (!admin) {
        // Create a system admin user for cannabis survey management
        admin = new User({
          email: 'cannabis.admin@gacp.system',
          firstName: 'Cannabis',
          lastName: 'Administrator',
          role: 'admin',
          isActive: true,
          permissions: [
            'manage_surveys',
            'manage_cannabis_surveys',
            'view_all_responses',
            'manage_templates',
            'system_administration',
          ],
          profile: {
            organization: 'GACP Cannabis Division',
            position: 'Cannabis Survey System Administrator',
            specializations: ['cannabis_regulations', 'survey_management', 'compliance_monitoring'],
          },
        });

        await admin.save();
        logger.info('👤 Created system admin user for cannabis surveys');
      }

      return admin;
    } catch (error) {
      logger.error('Error getting/creating system admin:', error);
      throw error;
    }
  }

  async createSampleData(templateResults) {
    try {
      // This would create sample survey responses for testing
      // In a production environment, you might skip this
      const sampleResponses = [];

      for (const result of templateResults.slice(0, 2)) {
        // Create samples for first 2 templates
        const template = result.template;
        const questions = result.questions;

        // Create 2-3 sample responses per template
        for (let i = 0; i < 2; i++) {
          const sampleResponse = {
            templateId: template._id,
            responseId: `SAMPLE-${template.cannabisMetadata.surveyType.toUpperCase()}-${Date.now()}-${i}`,
            respondent: {
              personalInfo: {
                firstName: `Sample Farmer ${i + 1}`,
                lastName: 'Cannabis',
                email: `sample.farmer${i + 1}@example.com`,
                phone: `080-000-000${i + 1}`,
                address: {
                  province: 'Bangkok',
                  district: 'Sample District',
                  subdistrict: 'Sample Subdistrict',
                  zipCode: '10100',
                },
              },
              farmCode: `SAMPLE-FARM-${String(i + 1).padStart(3, '0')}`,
              cannabisLicense: {
                licenseNumber: `CB-${Date.now()}-${i + 1}`,
                licenseType: 'cultivation',
                issueDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                issuingAuthority: 'Department of Agriculture',
                verificationStatus: 'verified',
              },
              farmDetails: {
                farmName: `Sample Cannabis Farm ${i + 1}`,
                totalArea: 5 + i * 2, // 5, 7 rai
                cannabisArea: 3 + i, // 3, 4 rai
                cultivationMethod: i % 2 === 0 ? 'indoor' : 'greenhouse',
                securityMeasures: ['cctv_24_7', 'access_control', 'perimeter_fence'],
                irrigationSystem: 'drip_irrigation',
                soilType: 'loamy_soil',
              },
            },
            answers: this.generateSampleAnswers(questions),
            status: 'submitted',
            analytics: {
              completionRate: 1.0,
              complianceScore: {
                overall: 85 + i * 5, // 85, 90
                byCategory: [
                  { category: 'license_verification', score: 100 },
                  { category: 'cultivation_practices', score: 85 + i * 5 },
                  { category: 'compliance_verification', score: 90 + i * 3 },
                ],
              },
              riskProfile: {
                overallRisk: i === 0 ? 'low' : 'medium',
                riskFactors: [],
              },
              sopAdherence: {
                adoptedSOPs: ['GACP-CULT-001', 'GACP-WATER-001'],
                complianceLevel: 80 + i * 10,
                gaps: [],
                recommendations: ['Continue current practices', 'Consider advanced monitoring'],
              },
            },
          };

          sampleResponses.push(sampleResponse);
        }
      }

      logger.info(`📊 Created ${sampleResponses.length} sample survey responses`);
      return sampleResponses;
    } catch (error) {
      logger.error('Error creating sample data:', error);
      // Don't throw here, sample data is optional
      return [];
    }
  }

  generateSampleAnswers(questions) {
    const answers = [];

    for (const question of questions) {
      let answer;

      switch (question.type) {
        case 'boolean':
          answer = Math.random() > 0.3; // 70% chance of true
          break;

        case 'single_choice':
          if (question.options && question.options.length > 0) {
            // Prefer options with higher compliance scores
            const sortedOptions = question.options.sort(
              (a, b) => (b.complianceScore || 50) - (a.complianceScore || 50),
            );
            answer = sortedOptions[0].value;
          }
          break;

        case 'multi_choice':
          if (question.options && question.options.length > 0) {
            // Select 2-3 high-scoring options
            const goodOptions = question.options
              .filter(opt => (opt.complianceScore || 0) > 70)
              .slice(0, 3);
            answer = goodOptions.map(opt => opt.value);
          }
          break;

        case 'number':
        case 'thc_measurement':
        case 'cultivation_area':
          if (question.validation) {
            const min = question.validation.minValue || 0;
            const max = question.validation.maxValue || 100;
            answer = Math.random() * (max - min) + min;

            // For THC measurements, keep it low
            if (question.type === 'thc_measurement') {
              answer = Math.random() * 0.15; // Below 0.2% limit
            }
          } else {
            answer = Math.random() * 100;
          }
          break;

        case 'text':
          answer = `Sample answer for ${question.text.substring(0, 30)}...`;
          break;

        case 'date':
          answer = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Within last 30 days
          break;

        case 'rating_scale':
          if (question.options && question.options.length > 0) {
            // Tend towards higher ratings
            const ratings = question.options.map(opt => parseInt(opt.value)).sort((a, b) => b - a);
            answer = ratings[Math.floor(Math.random() * Math.min(3, ratings.length))]; // Top 3 ratings
          } else {
            answer = 4; // Default good rating
          }
          break;

        case 'license_verification':
          answer = {
            licenseNumber: `CB-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            licenseType: 'cultivation',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          };
          break;

        case 'compliance_checklist':
          if (question.options && question.options.length > 0) {
            // Check most items (high compliance)
            answer = question.options
              .filter(() => Math.random() > 0.2) // 80% chance to check each item
              .map(opt => opt.value);
          }
          break;

        default:
          answer = 'Sample response';
      }

      answers.push({
        questionId: question._id,
        answer: answer,
        metadata: {
          answeredAt: new Date(),
          timeSpent: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
          confidence: Math.floor(Math.random() * 2) + 4, // 4-5 confidence
        },
      });
    }

    return answers;
  }

  async validateSystemIntegrity() {
    try {
      const issues = [];

      // Check template-question relationships
      const templates = await CannabisSurveyTemplate.find();
      for (const template of templates) {
        const questionCount = await CannabisQuestion.countDocuments({
          templateId: template._id,
          isActive: true,
        });

        if (questionCount === 0) {
          issues.push(`Template "${template.title}" has no active questions`);
        }
      }

      // Check for orphaned questions
      const orphanedQuestions = await CannabisQuestion.countDocuments({
        templateId: { $nin: templates.map(t => t._id) },
      });

      if (orphanedQuestions > 0) {
        issues.push(`Found ${orphanedQuestions} orphaned questions`);
      }

      // Check survey type coverage
      const surveyTypes = await CannabisSurveyTemplate.distinct('cannabisMetadata.surveyType');
      const expectedTypes = [
        'pre_cultivation_assessment',
        'cultivation_practices',
        'harvest_processing',
      ];
      const missingTypes = expectedTypes.filter(type => !surveyTypes.includes(type));

      if (missingTypes.length > 0) {
        issues.push(`Missing survey types: ${missingTypes.join(', ')}`);
      }

      if (issues.length > 0) {
        logger.warn('⚠️  System validation found issues:', issues);
        return { valid: false, issues };
      }

      logger.info('✅ System validation passed');
      return { valid: true, issues: [] };
    } catch (error) {
      logger.error('Error during system validation:', error);
      throw error;
    }
  }

  async getSystemStats() {
    try {
      const [templateCount, questionCount, surveyTypes, cannabisCategories, regions] =
        await Promise.all([
          CannabisSurveyTemplate.countDocuments(),
          CannabisQuestion.countDocuments({ isActive: true }),
          CannabisSurveyTemplate.distinct('cannabisMetadata.surveyType'),
          CannabisSurveyTemplate.distinct('cannabisMetadata.cannabisCategory'),
          CannabisSurveyTemplate.distinct('region'),
        ]);

      return {
        templates: templateCount,
        questions: questionCount,
        surveyTypes: surveyTypes.length,
        cannabisCategories: cannabisCategories.length,
        regions: regions.length,
        details: {
          surveyTypes,
          cannabisCategories,
          regions,
        },
      };
    } catch (error) {
      logger.error('Error getting system stats:', error);
      return {
        templates: 0,
        questions: 0,
        surveyTypes: 0,
        cannabisCategories: 0,
        regions: 0,
      };
    }
  }

  async reinitialize(options = {}) {
    try {
      logger.info('🔄 Reinitializing Cannabis Survey System...');

      return await this.initialize({
        ...options,
        recreateTemplates: true,
      });
    } catch (error) {
      logger.error('Error during reinitialization:', error);
      throw error;
    }
  }

  async checkSystemHealth() {
    try {
      const stats = await this.getSystemStats();
      const validation = await this.validateSystemIntegrity();

      const health = {
        status: validation.valid && stats.templates > 0 ? 'healthy' : 'unhealthy',
        initialized: this.isInitialized,
        stats,
        validation,
        timestamp: new Date(),
      };

      return health;
    } catch (error) {
      return {
        status: 'error',
        initialized: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  // Method to add new survey templates
  async addCustomTemplate(templateData, createdBy) {
    try {
      const template = new CannabisSurveyTemplate({
        ...templateData,
        createdBy,
      });

      await template.save();
      logger.info(`✅ Added custom cannabis survey template: ${template.title}`);

      return template;
    } catch (error) {
      logger.error('Error adding custom template:', error);
      throw error;
    }
  }

  // Method to export system configuration
  async exportConfiguration() {
    try {
      const templates = await CannabisSurveyTemplate.find().populate(
        'createdBy',
        'firstName lastName email',
      );

      const templateIds = templates.map(t => t._id);
      const questions = await CannabisQuestion.find({
        templateId: { $in: templateIds },
      });

      const configuration = {
        exportDate: new Date(),
        version: '1.0.0',
        templates: templates,
        questions: questions,
        stats: await this.getSystemStats(),
      };

      return configuration;
    } catch (error) {
      logger.error('Error exporting configuration:', error);
      throw error;
    }
  }
}

// Create singleton instance
const cannabisSurveyInitializer = new CannabisSurveyInitializer();

module.exports = cannabisSurveyInitializer;
