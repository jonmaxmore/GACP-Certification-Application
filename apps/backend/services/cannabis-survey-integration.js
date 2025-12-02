/**
 * Cannabis Survey Integration Service
 * Integrates the enhanced cannabis survey system with existing survey microservice and GACP systems
 */

const logger = require('../shared/logger');
const axios = require('axios');
const {
  CannabisSurveyTemplate,
  _CannabisQuestion,
  CannabisSurveyResponse,
} = require('../models/CannabisSurvey');
// Farm management is now a module - use module instead
const farmManagementModule = require('../modules/farm-management');
const enhancedNotificationService = require('./enhancedNotificationService');
const blitzzIntegrationService = require('./blitzzIntegrationService');

class CannabisSurveyIntegrationService {
  constructor() {
    this.surveyMicroserviceUrl = process.env.SURVEY_MICROSERVICE_URL || 'http://localhost:3003';
    this.gacpApiUrl = process.env.GACP_API_URL || 'http://localhost:3000';
    this.isConnected = false;
  }

  async initialize() {
    try {
      // Test connection to survey microservice
      await this.testMicroserviceConnection();

      // Sync cannabis templates with existing survey system
      await this.syncCannabisTemplates();

      // Set up webhook endpoints for real-time sync
      await this.setupWebhooks();

      this.isConnected = true;
      logger.info('✅ Cannabis Survey Integration Service initialized successfully');

      return { success: true, message: 'Integration service initialized' };
    } catch (error) {
      logger.error('❌ Failed to initialize Cannabis Survey Integration Service:', error);
      throw new Error(`Integration initialization failed: ${error.message}`);
    }
  }

  async testMicroserviceConnection() {
    try {
      const response = await axios.get(`${this.surveyMicroserviceUrl}/api/health`);
      if (response.status === 200) {
        logger.info('✅ Survey microservice connection successful');
        return true;
      }
    } catch (error) {
      logger.warn('⚠️  Survey microservice not available, operating in standalone mode');
      return false;
    }
  }

  async syncCannabisTemplates() {
    try {
      logger.info('🔄 Syncing cannabis templates with survey microservice...');

      const cannabisTemplates = await CannabisSurveyTemplate.find({ status: 'published' });

      for (const template of cannabisTemplates) {
        // Convert cannabis template to standard survey format
        const standardTemplate = this.convertToStandardFormat(template);

        try {
          // Check if template exists in microservice
          const existingResponse = await axios.get(
            `${this.surveyMicroserviceUrl}/api/admin/templates`,
            { params: { title: template.title } },
          );

          const existingTemplate = existingResponse.data.data?.find(
            t => t.title === template.title,
          );

          if (existingTemplate) {
            // Update existing template
            await axios.put(
              `${this.surveyMicroserviceUrl}/api/admin/templates/${existingTemplate._id}`,
              standardTemplate,
            );
            logger.info(`📝 Updated template: ${template.title}`);
          } else {
            // Create new template
            await axios.post(`${this.surveyMicroserviceUrl}/api/admin/templates`, standardTemplate);
            logger.info(`➕ Created template: ${template.title}`);
          }
        } catch (error) {
          logger.warn(`⚠️  Failed to sync template ${template.title}:`, error.message);
        }
      }

      logger.info('✅ Cannabis template sync completed');
    } catch (error) {
      logger.error('❌ Error syncing cannabis templates:', error);
      throw error;
    }
  }

  convertToStandardFormat(cannabisTemplate) {
    return {
      title: cannabisTemplate.title,
      titleTH: cannabisTemplate.titleTH,
      description: cannabisTemplate.description,
      descriptionTH: cannabisTemplate.descriptionTH,
      region: cannabisTemplate.region,
      version: cannabisTemplate.version,
      status: cannabisTemplate.status,

      // Map cannabis-specific metadata to standard metadata
      metadata: {
        surveyType: 'cannabis_survey',
        cannabisMetadata: cannabisTemplate.cannabisMetadata,
        targetAudience: {
          farmers: true,
          cannabis_farmers: true,
          licensed_cultivators: true,
        },
        category: 'cannabis_compliance',
        tags: [
          'cannabis',
          'gacp',
          'compliance',
          cannabisTemplate.cannabisMetadata.cannabisCategory,
          cannabisTemplate.cannabisMetadata.surveyType,
        ],
        estimatedTime: this.calculateEstimatedTime(cannabisTemplate),
        difficulty: this.assessDifficulty(cannabisTemplate),
        complianceLevel: cannabisTemplate.cannabisMetadata.gacpCompliance.certificationLevel,
      },

      settings: {
        allowAnonymous: cannabisTemplate.settings.allowAnonymous,
        allowMultipleSubmissions: cannabisTemplate.settings.allowMultipleSubmissions,
        requireAuthentication: true,
        requireLicenseVerification: cannabisTemplate.settings.requireLicenseVerification,
        encryptResponses: cannabisTemplate.settings.encryptSensitiveData,
        auditTrail: cannabisTemplate.settings.auditTrail,
        publicAccess: false,
        adminOnly: false,
      },

      accessControl: {
        roles: cannabisTemplate.accessControl.allowedRoles,
        restrictions: cannabisTemplate.accessControl.restrictedAccess,
        verificationRequired: cannabisTemplate.accessControl.licenseVerificationRequired,
      },

      createdBy: cannabisTemplate.createdBy,
      reviewedBy: cannabisTemplate.reviewedBy,
      approvedBy: cannabisTemplate.approvedBy,
    };
  }

  calculateEstimatedTime(template) {
    // Estimate based on question count and complexity
    const questionCount = template.questionCategories?.length || 10;
    const baseTime = 2; // minutes per question
    const complexityMultiplier = template.cannabisMetadata.gacpCompliance.required ? 1.5 : 1;

    return Math.ceil(questionCount * baseTime * complexityMultiplier);
  }

  assessDifficulty(template) {
    const criticalQuestions = template.cannabisMetadata.qualityParameters?.length || 0;
    const regulatoryRequirements = template.cannabisMetadata.regulatoryFocus?.length || 0;

    if (criticalQuestions > 5 || regulatoryRequirements > 3) {
      return 'expert';
    }
    if (criticalQuestions > 2 || regulatoryRequirements > 1) {
      return 'intermediate';
    }
    return 'beginner';
  }

  async syncResponseToMicroservice(cannabisResponse) {
    try {
      if (!this.isConnected) {
        return;
      }

      // Convert cannabis response to standard format
      const standardResponse = {
        templateId: cannabisResponse.templateId,
        responseId: cannabisResponse.responseId,
        respondent: {
          userId: cannabisResponse.respondent.userId,
          email: cannabisResponse.respondent.personalInfo?.email,
          farmCode: cannabisResponse.respondent.farmCode,
          metadata: {
            farmDetails: cannabisResponse.respondent.farmDetails,
            cannabisLicense: cannabisResponse.respondent.cannabisLicense,
            verificationStatus: cannabisResponse.respondent.cannabisLicense?.verificationStatus,
          },
        },
        answers: cannabisResponse.answers.map(answer => ({
          questionId: answer.questionId,
          answer: answer.answer,
          metadata: answer.metadata,
          cannabisData: answer.cannabisData,
        })),
        submittedAt: cannabisResponse.createdAt,
        status: cannabisResponse.status,
        analytics: {
          completionRate: cannabisResponse.analytics.completionRate,
          complianceScore: cannabisResponse.analytics.complianceScore.overall,
          riskLevel: cannabisResponse.analytics.riskProfile.overallRisk,
          qualityMetrics: cannabisResponse.analytics.qualityMetrics,
          sopCompliance: cannabisResponse.analytics.sopAdherence,
        },
        integration: {
          sourceSystem: 'cannabis_survey_enhanced',
          linkedApplications: cannabisResponse.integration?.linkedApplication,
          linkedAudits: cannabisResponse.integration?.linkedAudit,
          linkedSOPs: cannabisResponse.integration?.linkedSOPs,
        },
      };

      // Send to microservice
      await axios.post(`${this.surveyMicroserviceUrl}/api/responses`, standardResponse);

      logger.info(`✅ Synced cannabis response ${cannabisResponse.responseId} to microservice`);
    } catch (error) {
      logger.error('❌ Error syncing response to microservice:', error);
    }
  }

  async syncFromMicroservice() {
    try {
      logger.info('🔄 Syncing data from survey microservice...');

      // Get all cannabis-related responses from microservice
      const response = await axios.get(`${this.surveyMicroserviceUrl}/api/responses`, {
        params: {
          category: 'cannabis_compliance',
          limit: 100,
        },
      });

      const microserviceResponses = response.data.data || [];

      for (const msResponse of microserviceResponses) {
        // Check if response already exists in cannabis system
        const existingResponse = await CannabisSurveyResponse.findOne({
          responseId: msResponse.responseId,
        });

        if (
          !existingResponse &&
          msResponse.integration?.sourceSystem !== 'cannabis_survey_enhanced'
        ) {
          // Convert and import to cannabis system
          await this.importResponseFromMicroservice(msResponse);
        }
      }

      logger.info(`✅ Synced ${microserviceResponses.length} responses from microservice`);
    } catch (error) {
      logger.error('❌ Error syncing from microservice:', error);
    }
  }

  async importResponseFromMicroservice(msResponse) {
    try {
      // Find corresponding cannabis template
      const template = await CannabisSurveyTemplate.findOne({
        title: { $regex: new RegExp(msResponse.templateTitle, 'i') },
      });

      if (!template) {
        logger.warn(`⚠️  No matching cannabis template for: ${msResponse.templateTitle}`);
        return;
      }

      // Convert to cannabis response format
      const cannabisResponse = new CannabisSurveyResponse({
        templateId: template._id,
        responseId: msResponse.responseId || `IMPORTED-${Date.now()}`,
        respondent: {
          userId: msResponse.respondent?.userId,
          personalInfo: {
            email: msResponse.respondent?.email,
            ...msResponse.respondent?.metadata?.personalInfo,
          },
          farmCode: msResponse.respondent?.farmCode,
          farmDetails: msResponse.respondent?.metadata?.farmDetails,
          cannabisLicense: msResponse.respondent?.metadata?.cannabisLicense,
        },
        answers:
          msResponse.answers?.map(answer => ({
            questionId: answer.questionId,
            answer: answer.answer,
            metadata: answer.metadata || {},
            cannabisData: answer.cannabisData || {},
          })) || [],
        status: msResponse.status || 'submitted',
        analytics: {
          completionRate: msResponse.analytics?.completionRate || 1.0,
          complianceScore: {
            overall: msResponse.analytics?.complianceScore || 0,
            byCategory: [],
          },
          riskProfile: {
            overallRisk: msResponse.analytics?.riskLevel || 'medium',
            riskFactors: [],
          },
          sopAdherence: msResponse.analytics?.sopCompliance || {
            adoptedSOPs: [],
            complianceLevel: 0,
            gaps: [],
            recommendations: [],
          },
          qualityMetrics: msResponse.analytics?.qualityMetrics || {
            overallQuality: 0,
            qualityParameters: [],
          },
        },
        integration: {
          linkedApplication: msResponse.integration?.linkedApplications,
          linkedAudit: msResponse.integration?.linkedAudits,
          linkedSOPs: msResponse.integration?.linkedSOPs || [],
        },
        security: {
          auditTrail: [
            {
              action: 'imported_from_microservice',
              timestamp: new Date(),
              details: { sourceResponseId: msResponse._id },
            },
          ],
        },
      });

      await cannabisResponse.save();
      logger.info(`➕ Imported response ${msResponse.responseId} from microservice`);
    } catch (error) {
      logger.error(`❌ Error importing response ${msResponse.responseId}:`, error);
    }
  }

  async setupWebhooks() {
    try {
      // Set up webhooks for real-time synchronization
      const webhookEndpoints = [
        {
          event: 'response.created',
          url: `${this.gacpApiUrl}/api/webhooks/cannabis-survey/response-created`,
          description: 'Cannabis survey response created',
        },
        {
          event: 'response.updated',
          url: `${this.gacpApiUrl}/api/webhooks/cannabis-survey/response-updated`,
          description: 'Cannabis survey response updated',
        },
        {
          event: 'template.published',
          url: `${this.gacpApiUrl}/api/webhooks/cannabis-survey/template-published`,
          description: 'Cannabis survey template published',
        },
      ];

      for (const webhook of webhookEndpoints) {
        try {
          await axios.post(`${this.surveyMicroserviceUrl}/api/admin/webhooks`, webhook);
          logger.info(`🔗 Registered webhook: ${webhook.event}`);
        } catch (error) {
          logger.warn(`⚠️  Failed to register webhook ${webhook.event}:`, error.message);
        }
      }
    } catch (error) {
      logger.error('❌ Error setting up webhooks:', error);
    }
  }

  // Integration with Enhanced Farm Management
  async integrateWithFarmManagement(responseId) {
    try {
      const response = await CannabisSurveyResponse.findById(responseId);
      if (!response) {
        return;
      }

      // Extract cultivation data from cannabis survey
      const cultivationData = this.extractCultivationData(response);

      if (cultivationData && response.respondent.farmCode) {
        // Update farm cultivation records
        await farmManagementModule.updateCultivationRecord(
          response.respondent.farmCode,
          cultivationData,
        );

        logger.info(`🌱 Updated farm cultivation data for ${response.respondent.farmCode}`);
      }
    } catch (error) {
      logger.error('❌ Error integrating with farm management:', error);
    }
  }

  extractCultivationData(response) {
    const cultivationData = {
      surveyDate: response.createdAt,
      responseId: response._id,
      complianceScore: response.analytics.complianceScore.overall,
      riskLevel: response.analytics.riskProfile.overallRisk,
      cultivationStage: null,
      plantCount: null,
      strainInfo: null,
      thcContent: null,
      cbdContent: null,
      harvestData: null,
      qualityMetrics: response.analytics.qualityMetrics,
    };

    // Extract specific data from answers
    for (const answer of response.answers) {
      switch (answer.cannabisData?.cultivationPhase) {
        case 'vegetative':
        case 'flowering':
        case 'harvest':
          cultivationData.cultivationStage = answer.cannabisData.cultivationPhase;
          break;
      }

      if (answer.cannabisData?.strain) {
        cultivationData.strainInfo = answer.cannabisData.strain;
      }

      if (answer.cannabisData?.thcContent !== undefined) {
        cultivationData.thcContent = answer.cannabisData.thcContent;
      }

      if (answer.cannabisData?.cbdContent !== undefined) {
        cultivationData.cbdContent = answer.cannabisData.cbdContent;
      }

      // Extract plant count from relevant answers
      if (typeof answer.answer === 'number' && answer.answer > 0 && answer.answer < 10000) {
        // Likely a plant count or yield
        if (!cultivationData.plantCount) {
          cultivationData.plantCount = answer.answer;
        }
      }
    }

    return cultivationData;
  }

  // Integration with Notification System
  async triggerComplianceNotifications(responseId) {
    try {
      const response = await CannabisSurveyResponse.findById(responseId);
      if (!response) {
        return;
      }

      // Generate notifications based on cannabis survey results
      const notifications = [];

      // License expiry check
      if (response.respondent.cannabisLicense?.expiryDate) {
        const expiryDate = new Date(response.respondent.cannabisLicense.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 30) {
          notifications.push({
            type: 'license_expiry_warning',
            priority: daysUntilExpiry <= 7 ? 'urgent' : 'high',
            title: 'Cannabis License Expiring Soon',
            titleTH: 'ใบอนุญาตกัญชาใกล้หมดอายุ',
            message: `Your cannabis license expires in ${daysUntilExpiry} days`,
            messageTH: `ใบอนุญาตกัญชาของคุณจะหมดอายุใน ${daysUntilExpiry} วัน`,
            metadata: {
              licenseNumber: response.respondent.cannabisLicense.licenseNumber,
              expiryDate: expiryDate,
              daysRemaining: daysUntilExpiry,
            },
          });
        }
      }

      // THC compliance check
      const thcLevels = response.answers
        .filter(a => a.cannabisData?.thcContent !== undefined)
        .map(a => a.cannabisData.thcContent);

      const highThcLevels = thcLevels.filter(level => level > 0.2);
      if (highThcLevels.length > 0) {
        notifications.push({
          type: 'thc_compliance_violation',
          priority: 'critical',
          title: 'THC Level Exceeds Legal Limit',
          titleTH: 'ระดับ THC เกินขด จำกัดตามกฎหมาย',
          message: `THC levels detected above 0.2% limit: ${Math.max(...highThcLevels).toFixed(3)}%`,
          messageTH: `ตรวจพบระดับ THC เกิน 0.2%: ${Math.max(...highThcLevels).toFixed(3)}%`,
          metadata: {
            thcLevels: highThcLevels,
            maxAllowed: 0.2,
            responseId: response._id,
          },
        });
      }

      // Send notifications
      for (const notification of notifications) {
        await enhancedNotificationService.createNotification({
          ...notification,
          recipientId: response.respondent.userId,
        });
      }

      console.log(
        `📧 Sent ${notifications.length} compliance notifications for response ${responseId}`,
      );
    } catch (error) {
      logger.error('❌ Error triggering compliance notifications:', error);
    }
  }

  // Integration with Task Management
  async createComplianceTasks(responseId) {
    try {
      const response = await CannabisSurveyResponse.findById(responseId);
      if (!response) {
        return;
      }

      const tasks = [];

      // High-risk findings require immediate action
      if (['high', 'critical'].includes(response.analytics.riskProfile.overallRisk)) {
        tasks.push({
          title: 'Address High-Risk Cannabis Compliance Issues',
          titleTH: 'แก้ไขปัญหาการปฏิบัติตามข้อกำหนดกัญชาความเสี่ยงสูง',
          description: 'Review and address high-risk areas identified in cannabis survey',
          descriptionTH: 'ตรวจสอบและแก้ไขพื้นที่เสี่ยงสูงที่ระบุในแบบสำรวจกัญชา',
          priority: response.analytics.riskProfile.overallRisk === 'critical' ? 'urgent' : 'high',
          category: 'cannabis_compliance',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          metadata: {
            surveyResponseId: responseId,
            riskFactors: response.analytics.riskProfile.riskFactors,
            farmCode: response.respondent.farmCode,
          },
        });
      }

      // Low compliance score requires improvement plan
      if (response.analytics.complianceScore.overall < 70) {
        tasks.push({
          title: 'Develop Cannabis Compliance Improvement Plan',
          titleTH: 'พัฒนาแผนปรับปรุงการปฏิบัติตามข้อกำหนดกัญชา',
          description: 'Create and implement plan to improve cannabis compliance score',
          descriptionTH: 'สร้างและดำเนินการแผนปรับปรุงคะแนนการปฏิบัติตามข้อกำหนดกัญชา',
          priority: 'medium',
          category: 'compliance_improvement',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          metadata: {
            currentScore: response.analytics.complianceScore.overall,
            targetScore: 85,
            recommendations: response.analytics.sopAdherence.recommendations,
          },
        });
      }

      // Create tasks via Blitzz integration
      for (const task of tasks) {
        await blitzzIntegrationService.createTask(task);
      }

      logger.info(`📋 Created ${tasks.length} compliance tasks for response ${responseId}`);
    } catch (error) {
      logger.error('❌ Error creating compliance tasks:', error);
    }
  }

  async getIntegrationStatus() {
    try {
      const status = {
        isConnected: this.isConnected,
        microserviceStatus: 'unknown',
        lastSync: null,
        totalTemplatesSynced: 0,
        totalResponsesSynced: 0,
        integrationHealth: 'unknown',
      };

      // Check microservice status
      try {
        await axios.get(`${this.surveyMicroserviceUrl}/api/health`);
        status.microserviceStatus = 'online';
      } catch (error) {
        status.microserviceStatus = 'offline';
      }

      // Get sync statistics
      const templates = await CannabisSurveyTemplate.countDocuments();
      const responses = await CannabisSurveyResponse.countDocuments();

      status.totalTemplatesSynced = templates;
      status.totalResponsesSynced = responses;
      status.integrationHealth =
        status.microserviceStatus === 'online' && templates > 0 ? 'healthy' : 'degraded';

      return status;
    } catch (error) {
      return {
        isConnected: false,
        microserviceStatus: 'error',
        error: error.message,
        integrationHealth: 'unhealthy',
      };
    }
  }
}

module.exports = new CannabisSurveyIntegrationService();
