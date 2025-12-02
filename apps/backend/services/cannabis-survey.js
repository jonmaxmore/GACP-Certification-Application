/**
 * Enhanced Cannabis Survey Service
 * Comprehensive service for managing cannabis-specific surveys, compliance tracking, and regulatory reporting
 */

const {
  CannabisSurveyTemplate,
  CannabisQuestion,
  CannabisSurveyResponse,
} = require('../models/CannabisSurvey');
const SOP = require('../models/SOP');
const User = require('../models/user-model');
const AuditCalendar = require('../models/AuditCalendar');
const enhancedNotificationService = require('./enhancedNotificationService');
const blitzzIntegrationService = require('./blitzzIntegrationService');
class CannabisSurveyService {
  // Template Management
  async createTemplate(templateData, createdBy) {
    try {
      // Validate creator permissions
      const creator = await User.findById(createdBy);
      if (!creator || !['admin', 'cannabis_specialist', 'reviewer'].includes(creator.role)) {
        throw new Error('Insufficient permissions to create cannabis survey templates');
      }

      // Auto-generate cannabis-specific configurations
      const cannabisTemplate = new CannabisSurveyTemplate({
        ...templateData,
        createdBy,
        cannabisMetadata: {
          ...templateData.cannabisMetadata,
          gacpCompliance: {
            required: true,
            certificationLevel:
              templateData.cannabisMetadata?.gacpCompliance?.certificationLevel || 'standard',
            sopRequired: true,
          },
          thcLimitCompliance: {
            required: true,
            maxThcLevel: templateData.cannabisMetadata?.thcLimitCompliance?.maxThcLevel || 0.2,
            testingRequired: true,
          },
        },
        settings: {
          ...templateData.settings,
          requireLicenseVerification: true,
          encryptSensitiveData: true,
          auditTrail: true,
        },
      });

      await cannabisTemplate.save();

      // Create notification for template creation
      await enhancedNotificationService.createNotification({
        recipientId: createdBy,
        type: 'template_created',
        title: 'Cannabis Survey Template Created',
        titleTH: 'สร้างแบบสำรวจกัญชาแล้ว',
        message: `Cannabis survey template "${templateData.title}" has been created successfully`,
        messageTH: `สร้างแบบสำรวจกัญชา "${templateData.titleTH}" เรียบร้อยแล้ว`,
        metadata: {
          templateId: cannabisTemplate._id,
          templateType: templateData.cannabisMetadata?.surveyType,
          cannabisCategory: templateData.cannabisMetadata?.cannabisCategory,
        },
      });

      return cannabisTemplate;
    } catch (error) {
      throw new Error(`Failed to create cannabis survey template: ${error.message}`);
    }
  }

  async getTemplatesByCategory(cannabisCategory, region, userRole) {
    try {
      const query = {
        'cannabisMetadata.cannabisCategory': cannabisCategory,
        region: { $in: [region, 'national'] },
        status: 'published',
        'accessControl.allowedRoles': userRole,
      };

      const templates = await CannabisSurveyTemplate.find(query)
        .populate('createdBy', 'firstName lastName role')
        .populate('reviewedBy', 'firstName lastName role')
        .sort({ 'cannabisMetadata.surveyType': 1, version: -1 });

      return templates;
    } catch (error) {
      throw new Error(`Failed to get cannabis survey templates: ${error.message}`);
    }
  }

  async getTemplateQuestions(templateId) {
    try {
      const questions = await CannabisQuestion.find({
        templateId,
        isActive: true,
      }).sort({ order: 1 });

      return questions;
    } catch (error) {
      throw new Error(`Failed to get template questions: ${error.message}`);
    }
  }

  // Question Management
  async createQuestion(questionData) {
    try {
      // Validate template exists
      const template = await CannabisSurveyTemplate.findById(questionData.templateId);
      if (!template) {
        throw new Error('Cannabis survey template not found');
      }

      // Auto-generate cannabis-specific properties
      const cannabisQuestion = new CannabisQuestion({
        ...questionData,
        cannabisProperties: {
          ...questionData.cannabisProperties,
          complianceCritical: this.isComplianceCritical(questionData.category, questionData.type),
          riskLevel: this.assessQuestionRiskLevel(questionData.category, questionData.type),
        },
      });

      await cannabisQuestion.save();
      return cannabisQuestion;
    } catch (error) {
      throw new Error(`Failed to create cannabis question: ${error.message}`);
    }
  }

  async createBulkQuestions(templateId, questionsData) {
    try {
      const questions = questionsData.map((q, index) => ({
        ...q,
        templateId,
        order: q.order || index + 1,
        cannabisProperties: {
          ...q.cannabisProperties,
          complianceCritical: this.isComplianceCritical(q.category, q.type),
          riskLevel: this.assessQuestionRiskLevel(q.category, q.type),
        },
      }));

      const createdQuestions = await CannabisQuestion.insertMany(questions);
      return createdQuestions;
    } catch (error) {
      throw new Error(`Failed to create bulk cannabis questions: ${error.message}`);
    }
  }

  // Response Management
  async createResponse(responseData, userId) {
    try {
      // Validate user and license
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate cannabis license if required
      const template = await CannabisSurveyTemplate.findById(responseData.templateId);
      if (template.settings.requireLicenseVerification) {
        await this.validateCannabisLicense(responseData.respondent.cannabisLicense);
      }

      // Create response with analytics
      const cannabisResponse = new CannabisSurveyResponse({
        ...responseData,
        analytics: await this.calculateResponseAnalytics(responseData.answers, template),
        security: {
          ipAddress: responseData.security?.ipAddress,
          userAgent: responseData.security?.userAgent,
          sessionId: responseData.security?.sessionId,
          auditTrail: [
            {
              action: 'response_created',
              timestamp: new Date(),
              userId: userId,
              details: { templateId: responseData.templateId },
            },
          ],
        },
      });

      await cannabisResponse.save();

      // Process compliance and risk notifications
      await this.processResponseNotifications(cannabisResponse, user);

      // Create tasks if high risk or non-compliant
      if (
        cannabisResponse.analytics.riskProfile.overallRisk === 'high' ||
        cannabisResponse.analytics.riskProfile.overallRisk === 'critical'
      ) {
        await this.createRiskMitigationTasks(cannabisResponse);
      }

      return cannabisResponse;
    } catch (error) {
      throw new Error(`Failed to create cannabis survey response: ${error.message}`);
    }
  }

  async updateResponse(responseId, updateData, userId) {
    try {
      const response = await CannabisSurveyResponse.findById(responseId);
      if (!response) {
        throw new Error('Cannabis survey response not found');
      }

      // Check permissions
      if (
        response.respondent.userId?.toString() !== userId &&
        !['admin', 'reviewer', 'cannabis_specialist'].includes((await User.findById(userId)).role)
      ) {
        throw new Error('Insufficient permissions to update this response');
      }

      // Update analytics if answers changed
      if (updateData.answers) {
        const template = await CannabisSurveyTemplate.findById(response.templateId);
        updateData.analytics = await this.calculateResponseAnalytics(updateData.answers, template);
      }

      // Add audit trail
      response.security.auditTrail.push({
        action: 'response_updated',
        timestamp: new Date(),
        userId: userId,
        details: { changes: Object.keys(updateData) },
      });

      const updatedResponse = await CannabisSurveyResponse.findByIdAndUpdate(
        responseId,
        updateData,
        { new: true, runValidators: true },
      );

      return updatedResponse;
    } catch (error) {
      throw new Error(`Failed to update cannabis survey response: ${error.message}`);
    }
  }

  // Analytics and Compliance
  async calculateResponseAnalytics(answers, template) {
    try {
      const questions = await CannabisQuestion.find({
        templateId: template._id,
        isActive: true,
      });

      let totalScore = 0;
      let maxScore = 0;
      const categoryScores = {};
      const riskFactors = [];
      const sopAdherence = {
        adoptedSOPs: [],
        complianceLevel: 0,
        gaps: [],
        recommendations: [],
      };

      for (const answer of answers) {
        const question = questions.find(q => q._id.toString() === answer.questionId.toString());
        if (!question) {
          continue;
        }

        // Calculate compliance score
        const answerScore = this.calculateAnswerScore(answer, question);
        totalScore += answerScore;
        maxScore += 100; // Each question max 100 points

        // Category scoring
        if (!categoryScores[question.category]) {
          categoryScores[question.category] = { score: 0, count: 0 };
        }
        categoryScores[question.category].score += answerScore;
        categoryScores[question.category].count += 1;

        // Risk assessment
        if (
          question.cannabisProperties.riskLevel === 'high' ||
          question.cannabisProperties.riskLevel === 'critical'
        ) {
          riskFactors.push({
            factor: question.text,
            severity: question.cannabisProperties.riskLevel,
            questionCategory: question.category,
          });
        }

        // SOP adherence tracking
        if (question.cannabisProperties.sopLinked?.sopCode) {
          if (this.indicatesSOPAdoption(answer, question)) {
            sopAdherence.adoptedSOPs.push(question.cannabisProperties.sopLinked.sopCode);
          } else {
            sopAdherence.gaps.push(question.cannabisProperties.sopLinked.sopCode);
          }
        }
      }

      const overallScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      // Convert category scores
      const byCategory = Object.keys(categoryScores).map(category => ({
        category,
        score:
          categoryScores[category].count > 0
            ? categoryScores[category].score / categoryScores[category].count
            : 0,
      }));

      // Determine overall risk
      const overallRisk = this.calculateOverallRisk(riskFactors, overallScore);

      // Calculate SOP compliance level
      sopAdherence.complianceLevel =
        sopAdherence.adoptedSOPs.length > 0
          ? (sopAdherence.adoptedSOPs.length /
              (sopAdherence.adoptedSOPs.length + sopAdherence.gaps.length)) *
            100
          : 0;

      return {
        completionRate: answers.length / questions.length,
        complianceScore: {
          overall: Math.round(overallScore),
          byCategory,
        },
        riskProfile: {
          overallRisk,
          riskFactors,
        },
        sopAdherence,
        qualityMetrics: {
          overallQuality: Math.round(overallScore),
          qualityParameters: await this.extractQualityParameters(answers, questions),
        },
      };
    } catch (error) {
      throw new Error(`Failed to calculate response analytics: ${error.message}`);
    }
  }

  // Compliance Tracking
  async getComplianceReport(farmCode, dateRange) {
    try {
      const query = {
        'respondent.farmCode': farmCode,
        createdAt: {
          $gte: new Date(dateRange.startDate),
          $lte: new Date(dateRange.endDate),
        },
      };

      const responses = await CannabisSurveyResponse.find(query)
        .populate('templateId', 'title cannabisMetadata')
        .sort({ createdAt: -1 });

      const complianceReport = {
        farmCode,
        period: dateRange,
        totalSurveys: responses.length,
        averageComplianceScore: 0,
        complianceTrend: [],
        riskAreas: [],
        sopAdoption: {
          adopted: new Set(),
          gaps: new Set(),
          adoptionRate: 0,
        },
        regulatoryCompliance: {
          cannabisAct: 0,
          gacpStandards: 0,
          fdaRegulations: 0,
        },
        recommendations: [],
      };

      let totalComplianceScore = 0;

      for (const response of responses) {
        totalComplianceScore += response.analytics.complianceScore.overall;

        // Track SOP adoption
        response.analytics.sopAdherence.adoptedSOPs.forEach(sop =>
          complianceReport.sopAdoption.adopted.add(sop),
        );
        response.analytics.sopAdherence.gaps.forEach(sop =>
          complianceReport.sopAdoption.gaps.add(sop),
        );

        // Track risk areas
        response.analytics.riskProfile.riskFactors.forEach(factor => {
          if (!complianceReport.riskAreas.find(area => area.factor === factor.factor)) {
            complianceReport.riskAreas.push(factor);
          }
        });

        // Track compliance trend
        complianceReport.complianceTrend.push({
          date: response.createdAt,
          score: response.analytics.complianceScore.overall,
          surveyType: response.templateId.cannabisMetadata.surveyType,
        });
      }

      if (responses.length > 0) {
        complianceReport.averageComplianceScore = totalComplianceScore / responses.length;
      }

      complianceReport.sopAdoption.adoptionRate =
        complianceReport.sopAdoption.adopted.size > 0
          ? (complianceReport.sopAdoption.adopted.size /
              (complianceReport.sopAdoption.adopted.size +
                complianceReport.sopAdoption.gaps.size)) *
            100
          : 0;

      // Generate recommendations
      complianceReport.recommendations =
        await this.generateComplianceRecommendations(complianceReport);

      return complianceReport;
    } catch (error) {
      throw new Error(`Failed to generate compliance report: ${error.message}`);
    }
  }

  // Integration Methods
  async linkResponseToAudit(responseId, auditId) {
    try {
      const response = await CannabisSurveyResponse.findById(responseId);
      const audit = await AuditCalendar.findById(auditId);

      if (!response || !audit) {
        throw new Error('Response or audit not found');
      }

      response.integration.linkedAudit = auditId;
      await response.save();

      // Create audit preparation tasks based on response
      if (
        response.analytics.riskProfile.overallRisk === 'high' ||
        response.analytics.riskProfile.overallRisk === 'critical'
      ) {
        await this.createAuditPreparationTasks(response, audit);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to link response to audit: ${error.message}`);
    }
  }

  async syncWithSOPSystem(responseId) {
    try {
      const response = await CannabisSurveyResponse.findById(responseId);
      if (!response) {
        throw new Error('Response not found');
      }

      // Update SOP adoption records
      for (const sopCode of response.analytics.sopAdherence.adoptedSOPs) {
        await SOP.findOneAndUpdate(
          { sopCode },
          {
            $addToSet: {
              adoptionRecords: {
                farmCode: response.respondent.farmCode,
                adoptionDate: response.createdAt,
                adoptionLevel: 'implemented',
                evidenceSource: 'cannabis_survey',
                evidenceId: responseId,
              },
            },
          },
        );
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to sync with SOP system: ${error.message}`);
    }
  }

  // Notification and Task Management
  async processResponseNotifications(response, user) {
    try {
      // const template = await CannabisSurveyTemplate.findById(response.templateId);

      // High-risk notification
      if (
        response.analytics.riskProfile.overallRisk === 'high' ||
        response.analytics.riskProfile.overallRisk === 'critical'
      ) {
        await enhancedNotificationService.createNotification({
          recipientId: user._id,
          type: 'high_risk_detected',
          priority: 'high',
          title: 'High Risk Cannabis Survey Response',
          titleTH: 'ตรวจพบความเสี่ยงสูงในแบบสำรวจกัญชา',
          message:
            'Your cannabis survey response indicates high risk areas that require immediate attention',
          messageTH: 'การตอบแบบสำรวจกัญชาของคุณพบความเสี่ยงสูงที่ต้องดำเนินการทันที',
          metadata: {
            responseId: response._id,
            riskLevel: response.analytics.riskProfile.overallRisk,
            riskFactors: response.analytics.riskProfile.riskFactors.slice(0, 3),
          },
        });
      }

      // Low compliance notification
      if (response.analytics.complianceScore.overall < 70) {
        await enhancedNotificationService.createNotification({
          recipientId: user._id,
          type: 'low_compliance',
          priority: 'medium',
          title: 'Cannabis Compliance Score Below Threshold',
          titleTH: 'คะแนนการปฏิบัติตามข้อกำหนดกัญชาต่ำกว่าเกณฑ์',
          message: `Your compliance score is ${response.analytics.complianceScore.overall}%. Improvement needed.`,
          messageTH: `คะแนนการปฏิบัติตามของคุณคือ ${response.analytics.complianceScore.overall}% ต้องปรับปรุง`,
          metadata: {
            responseId: response._id,
            complianceScore: response.analytics.complianceScore.overall,
            improvements: response.analytics.sopAdherence.recommendations.slice(0, 3),
          },
        });
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to process response notifications: ${error.message}`);
    }
  }

  async createRiskMitigationTasks(response) {
    try {
      const riskTasks = response.analytics.riskProfile.riskFactors.map(risk => ({
        title: `Mitigate Cannabis Risk: ${risk.factor}`,
        titleTH: `จัดการความเสี่ยงกัญชา: ${risk.factor}`,
        description: 'Address high-risk area identified in cannabis survey',
        descriptionTH: 'แก้ไขพื้นที่เสี่ยงสูงที่พบในแบบสำรวจกัญชา',
        priority: risk.severity === 'critical' ? 'urgent' : 'high',
        category: 'cannabis_compliance',
        metadata: {
          surveyResponseId: response._id,
          riskFactor: risk.factor,
          riskSeverity: risk.severity,
          farmCode: response.respondent.farmCode,
        },
      }));

      // Create tasks via Blitzz integration
      for (const task of riskTasks) {
        await blitzzIntegrationService.createTask(task);
      }

      return riskTasks;
    } catch (error) {
      throw new Error(`Failed to create risk mitigation tasks: ${error.message}`);
    }
  }

  // Helper Methods
  isComplianceCritical(category, type) {
    const criticalCategories = [
      'license_verification',
      'quality_testing',
      'compliance_verification',
      'regulatory_awareness',
    ];

    const criticalTypes = ['license_verification', 'thc_measurement', 'compliance_checklist'];

    return criticalCategories.includes(category) || criticalTypes.includes(type);
  }

  assessQuestionRiskLevel(category, type) {
    const highRiskCategories = [
      'quality_testing',
      'compliance_verification',
      'regulatory_awareness',
    ];

    const criticalTypes = ['license_verification', 'thc_measurement'];

    if (criticalTypes.includes(type)) {
      return 'critical';
    }
    if (highRiskCategories.includes(category)) {
      return 'high';
    }
    return 'medium';
  }

  calculateAnswerScore(answer, question) {
    // Complex scoring logic based on question type and cannabis-specific criteria
    if (question.type === 'boolean') {
      return answer.answer === true ? 100 : 0;
    }

    if (question.type === 'single_choice' || question.type === 'multi_choice') {
      const selectedOption = question.options.find(opt => opt.value === answer.answer);
      return selectedOption ? selectedOption.complianceScore || 50 : 0;
    }

    if (question.type === 'rating_scale') {
      const maxRating = Math.max(...question.options.map(opt => parseInt(opt.value)));
      return (parseInt(answer.answer) / maxRating) * 100;
    }

    // Default scoring for other types
    return 75;
  }

  calculateOverallRisk(riskFactors, complianceScore) {
    const criticalFactors = riskFactors.filter(f => f.severity === 'critical').length;
    const highFactors = riskFactors.filter(f => f.severity === 'high').length;

    if (criticalFactors > 0 || complianceScore < 50) {
      return 'critical';
    }
    if (highFactors > 2 || complianceScore < 70) {
      return 'high';
    }
    if (highFactors > 0 || complianceScore < 85) {
      return 'medium';
    }
    return 'low';
  }

  indicatesSOPAdoption(answer, question) {
    // Logic to determine if the answer indicates SOP adoption
    if (question.type === 'boolean') {
      return answer.answer === true;
    }

    if (question.type === 'rating_scale') {
      const rating = parseInt(answer.answer);
      return rating >= 4; // Assuming 5-point scale
    }

    return true; // Default assumption
  }

  async extractQualityParameters(answers, questions) {
    const qualityParams = [];

    for (const answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId.toString());

      if (question && question.cannabisProperties.qualityParameter) {
        const param = question.cannabisProperties.qualityParameter;
        qualityParams.push({
          parameter: param.parameter,
          value: parseFloat(answer.answer) || 0,
          unit: param.acceptableRange?.unit || '',
          status: this.assessParameterStatus(parseFloat(answer.answer) || 0, param.acceptableRange),
        });
      }
    }

    return qualityParams;
  }

  assessParameterStatus(value, range) {
    if (!range || typeof value !== 'number') {
      return 'unknown';
    }

    if (value >= range.min && value <= range.max) {
      return 'acceptable';
    }
    if (value >= range.min * 0.9 && value <= range.max * 1.1) {
      return 'marginal';
    }
    return 'unacceptable';
  }

  async generateComplianceRecommendations(report) {
    const recommendations = [];

    if (report.averageComplianceScore < 70) {
      recommendations.push({
        priority: 'high',
        category: 'compliance_improvement',
        recommendation: 'Implement comprehensive compliance training program',
        recommendationTH: 'จัดโปรแกรมการฝึกอบรมการปฏิบัติตามข้อกำหนดอย่างครอบคลุม',
      });
    }

    if (report.sopAdoption.adoptionRate < 50) {
      recommendations.push({
        priority: 'medium',
        category: 'sop_adoption',
        recommendation: 'Increase SOP adoption through focused training',
        recommendationTH: 'เพิ่มการนำ SOP ไปใช้ผ่านการฝึกอบรมเฉพาะ',
      });
    }

    if (report.riskAreas.length > 5) {
      recommendations.push({
        priority: 'high',
        category: 'risk_management',
        recommendation: 'Develop systematic risk management procedures',
        recommendationTH: 'พัฒนาขั้นตอนการบริหารความเสี่ยงอย่างเป็นระบบ',
      });
    }

    return recommendations;
  }

  async validateCannabisLicense(licenseData) {
    if (!licenseData.licenseNumber) {
      throw new Error('Cannabis license number is required');
    }

    if (new Date(licenseData.expiryDate) < new Date()) {
      throw new Error('Cannabis license has expired');
    }

    // Additional validation logic would go here
    return true;
  }

  async createAuditPreparationTasks(response, audit) {
    try {
      const preparationTasks = [
        {
          title: 'Prepare Cannabis Documentation for Audit',
          titleTH: 'เตรียมเอกสารกัญชาสำหรับการตรวจสอบ',
          description: 'Gather all required cannabis documentation for upcoming audit',
          descriptionTH: 'รวบรวมเอกสารกัญชาที่จำเป็นทั้งหมดสำหรับการตรวจสอบที่จะมาถึง',
          dueDate: new Date(audit.auditDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before audit
          priority: 'high',
          category: 'audit_preparation',
        },
        {
          title: 'Review SOP Compliance Status',
          titleTH: 'ตรวจสอบสถานะการปฏิบัติตาม SOP',
          description: 'Review and update SOP compliance based on survey findings',
          descriptionTH: 'ตรวจสอบและปรับปรุงการปฏิบัติตาม SOP ตามผลการสำรวจ',
          dueDate: new Date(audit.auditDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before audit
          priority: 'medium',
          category: 'compliance_review',
        },
      ];

      for (const task of preparationTasks) {
        await blitzzIntegrationService.createTask({
          ...task,
          metadata: {
            auditId: audit._id,
            surveyResponseId: response._id,
            farmCode: response.respondent.farmCode,
          },
        });
      }

      return preparationTasks;
    } catch (error) {
      throw new Error(`Failed to create audit preparation tasks: ${error.message}`);
    }
  }

  // Public API Methods
  async getPublicTemplates(region, cannabisCategory) {
    try {
      return await this.getTemplatesByCategory(cannabisCategory, region, 'farmer');
    } catch (error) {
      throw new Error(`Failed to get public templates: ${error.message}`);
    }
  }

  async submitPublicResponse(responseData) {
    try {
      return await this.createResponse(responseData, null);
    } catch (error) {
      throw new Error(`Failed to submit public response: ${error.message}`);
    }
  }

  async getResponsesByFarm(farmCode, limit = 10) {
    try {
      const responses = await CannabisSurveyResponse.find({
        'respondent.farmCode': farmCode,
      })
        .populate('templateId', 'title titleTH cannabisMetadata')
        .sort({ createdAt: -1 })
        .limit(limit);

      return responses;
    } catch (error) {
      throw new Error(`Failed to get responses by farm: ${error.message}`);
    }
  }
}

module.exports = new CannabisSurveyService();
