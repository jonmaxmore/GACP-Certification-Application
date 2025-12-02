/**
 * Cannabis Survey API Routes
 * Enhanced API endpoints for cannabis-specific survey management, compliance tracking, and regulatory reporting
 */

const express = require('express');
const router = express.Router();
const cannabisSurveyService = require('../services/cannabis-survey');
const { createLogger } = require('../shared/logger');
const logger = createLogger('cannabis-surveys');

const {
  CannabisSurveyTemplate,
  _CannabisQuestion,
  CannabisSurveyResponse,
} = require('../models/CannabisSurvey');
const authMiddleware = require('../middleware/authMiddleware-middleware');
const auditMiddleware = require('../middleware/audit-middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for cannabis survey endpoints
const cannabisLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many cannabis survey requests, please try again later',
    errorTH: 'คำขอแบบสำรวจกัญชามากเกินไป กรุณาลองใหม่อีกครั้ง',
  },
});

// Apply rate limiting to all routes
router.use(cannabisLimit);

// =============================================================================
// PUBLIC ROUTES (No authentication required)
// =============================================================================

/**
 * GET /api/cannabis-surveys/public/templates
 * Get public cannabis survey templates by region and category
 */
router.get('/public/templates', async (req, res) => {
  try {
    const { region, cannabisCategory, licenseType } = req.query;

    if (!region || !cannabisCategory) {
      return res.status(400).json({
        success: false,
        error: 'Region and cannabis category are required',
        errorTH: 'จำเป็นต้องระบุภูมิภาคและประเภทกัญชา',
      });
    }

    const templates = await cannabisSurveyService.getPublicTemplates(region, cannabisCategory);

    // Filter by license type if specified
    let filteredTemplates = templates;
    if (licenseType) {
      filteredTemplates = templates.filter(
        template => template.cannabisMetadata.licenseRequirements[licenseType] === true,
      );
    }

    res.json({
      success: true,
      data: {
        templates: filteredTemplates,
        total: filteredTemplates.length,
        region,
        cannabisCategory,
        licenseType: licenseType || 'all',
      },
      message: 'Cannabis survey templates retrieved successfully',
      messageTH: 'ดึงข้อมูลแบบสำรวจกัญชาเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error getting public cannabis survey templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cannabis survey templates',
      errorTH: 'ไม่สามารถดึงข้อมูลแบบสำรวจกัญชาได้',
      details: error.message,
    });
  }
});

/**
 * GET /api/cannabis-surveys/public/templates/:templateId/questions
 * Get questions for a specific cannabis survey template
 */
router.get('/public/templates/:templateId/questions', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { includeMetadata } = req.query;

    const template = await CannabisSurveyTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Cannabis survey template not found',
        errorTH: 'ไม่พบแบบสำรวจกัญชา',
      });
    }

    if (template.status !== 'published') {
      return res.status(403).json({
        success: false,
        error: 'Survey template is not publicly available',
        errorTH: 'แบบสำรวจนี้ไม่เปิดให้ใช้งานสาธารณะ',
      });
    }

    const questions = await cannabisSurveyService.getTemplateQuestions(templateId);

    // Remove sensitive data for public access
    const publicQuestions = questions.map(q => ({
      _id: q._id,
      type: q.type,
      text: q.text,
      textTH: q.textTH,
      description: q.description,
      descriptionTH: q.descriptionTH,
      category: q.category,
      options: q.options,
      validation: q.validation,
      order: q.order,
      metadata: includeMetadata === 'true' ? q.metadata : undefined,
      cannabisProperties: {
        licenseRequired: q.cannabisProperties.licenseRequired,
        thcRelevant: q.cannabisProperties.thcRelevant,
      },
    }));

    res.json({
      success: true,
      data: {
        templateId,
        templateTitle: template.title,
        templateTitleTH: template.titleTH,
        questions: publicQuestions,
        totalQuestions: publicQuestions.length,
        cannabisMetadata: {
          surveyType: template.cannabisMetadata.surveyType,
          cannabisCategory: template.cannabisMetadata.cannabisCategory,
          licenseRequirements: template.cannabisMetadata.licenseRequirements,
        },
      },
      message: 'Cannabis survey questions retrieved successfully',
      messageTH: 'ดึงข้อมูลคำถามแบบสำรวจกัญชาเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error getting cannabis survey questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cannabis survey questions',
      errorTH: 'ไม่สามารถดึงข้อมูลคำถามแบบสำรวจกัญชาได้',
      details: error.message,
    });
  }
});

/**
 * POST /api/cannabis-surveys/public/responses
 * Submit a public cannabis survey response
 */
router.post('/public/responses', auditMiddleware, async (req, res) => {
  try {
    const responseData = req.body;

    // Validate required fields
    if (!responseData.templateId || !responseData.answers || !responseData.respondent) {
      return res.status(400).json({
        success: false,
        error: 'Template ID, answers, and respondent information are required',
        errorTH: 'จำเป็นต้องระบุ ID แบบสำรวจ คำตอบ และข้อมูลผู้ตอบ',
      });
    }

    // Validate cannabis license if provided
    if (responseData.respondent.cannabisLicense) {
      const license = responseData.respondent.cannabisLicense;
      if (!license.licenseNumber || !license.licenseType) {
        return res.status(400).json({
          success: false,
          error: 'Cannabis license number and type are required',
          errorTH: 'จำเป็นต้องระบุหมายเลขและประเภทใบอนุญาตกัญชา',
        });
      }
    }

    // Add security metadata
    responseData.security = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID || 'anonymous',
    };

    const response = await cannabisSurveyService.submitPublicResponse(responseData);

    res.status(201).json({
      success: true,
      data: {
        responseId: response.responseId,
        submissionId: response._id,
        complianceScore: response.analytics.complianceScore.overall,
        riskLevel: response.analytics.riskProfile.overallRisk,
        completionRate: response.analytics.completionRate,
        status: response.status,
      },
      message: 'Cannabis survey response submitted successfully',
      messageTH: 'ส่งแบบสำรวจกัญชาเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error submitting cannabis survey response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit cannabis survey response',
      errorTH: 'ไม่สามารถส่งแบบสำรวจกัญชาได้',
      details: error.message,
    });
  }
});

// =============================================================================
// AUTHENTICATED ROUTES (Require authentication)
// =============================================================================

router.use(authMiddleware);

/**
 * POST /api/cannabis-surveys/templates
 * Create a new cannabis survey template (Admin/Cannabis Specialist only)
 */
router.post('/templates', async (req, res) => {
  try {
    // Check permissions
    if (!['admin', 'cannabis_specialist', 'reviewer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create cannabis survey templates',
        errorTH: 'ไม่มีสิทธิ์ในการสร้างแบบสำรวจกัญชา',
      });
    }

    const templateData = req.body;
    const template = await cannabisSurveyService.createTemplate(templateData, req.user.id);

    res.status(201).json({
      success: true,
      data: template,
      message: 'Cannabis survey template created successfully',
      messageTH: 'สร้างแบบสำรวจกัญชาเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error creating cannabis survey template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create cannabis survey template',
      errorTH: 'ไม่สามารถสร้างแบบสำรวจกัญชาได้',
      details: error.message,
    });
  }
});

/**
 * POST /api/cannabis-surveys/templates/:templateId/questions
 * Create questions for a cannabis survey template
 */
router.post('/templates/:templateId/questions', async (req, res) => {
  try {
    // Check permissions
    if (!['admin', 'cannabis_specialist', 'reviewer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create cannabis survey questions',
        errorTH: 'ไม่มีสิทธิ์ในการสร้างคำถามแบบสำรวจกัญชา',
      });
    }

    const { templateId } = req.params;
    const { questions, bulkCreate } = req.body;

    let result;
    if (bulkCreate && Array.isArray(questions)) {
      result = await cannabisSurveyService.createBulkQuestions(templateId, questions);
    } else {
      result = await cannabisSurveyService.createQuestion({
        ...req.body,
        templateId,
      });
    }

    res.status(201).json({
      success: true,
      data: result,
      message: bulkCreate
        ? 'Cannabis survey questions created successfully'
        : 'Cannabis survey question created successfully',
      messageTH: bulkCreate
        ? 'สร้างคำถามแบบสำรวจกัญชาเรียบร้อยแล้ว'
        : 'สร้างคำถามแบบสำรวจกัญชาเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error creating cannabis survey questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create cannabis survey questions',
      errorTH: 'ไม่สามารถสร้างคำถามแบบสำรวจกัญชาได้',
      details: error.message,
    });
  }
});

/**
 * GET /api/cannabis-surveys/templates
 * Get cannabis survey templates (with role-based filtering)
 */
router.get('/templates', async (req, res) => {
  try {
    const { region, cannabisCategory, status, surveyType } = req.query;

    const query = {
      'accessControl.allowedRoles': req.user.role,
    };

    if (region) {
      query.region = { $in: [region, 'national'] };
    }
    if (cannabisCategory) {
      query['cannabisMetadata.cannabisCategory'] = cannabisCategory;
    }
    if (status) {
      query.status = status;
    }
    if (surveyType) {
      query['cannabisMetadata.surveyType'] = surveyType;
    }

    const templates = await CannabisSurveyTemplate.find(query)
      .populate('createdBy', 'firstName lastName role')
      .populate('reviewedBy', 'firstName lastName role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        templates,
        total: templates.length,
        userRole: req.user.role,
      },
      message: 'Cannabis survey templates retrieved successfully',
      messageTH: 'ดึงข้อมูลแบบสำรวจกัญชาเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error getting cannabis survey templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cannabis survey templates',
      errorTH: 'ไม่สามารถดึงข้อมูลแบบสำรวจกัญชาได้',
      details: error.message,
    });
  }
});

/**
 * POST /api/cannabis-surveys/responses
 * Submit cannabis survey response (authenticated users)
 */
router.post('/responses', auditMiddleware, async (req, res) => {
  try {
    const responseData = req.body;

    // Add security metadata
    responseData.security = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
    };

    // Link to user
    responseData.respondent.userId = req.user.id;

    const response = await cannabisSurveyService.createResponse(responseData, req.user.id);

    res.status(201).json({
      success: true,
      data: {
        responseId: response.responseId,
        submissionId: response._id,
        complianceScore: response.analytics.complianceScore.overall,
        riskLevel: response.analytics.riskProfile.overallRisk,
        completionRate: response.analytics.completionRate,
        status: response.status,
        sopAdherence: response.analytics.sopAdherence,
      },
      message: 'Cannabis survey response submitted successfully',
      messageTH: 'ส่งแบบสำรวจกัญชาเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error submitting cannabis survey response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit cannabis survey response',
      errorTH: 'ไม่สามารถส่งแบบสำรวจกัญชาได้',
      details: error.message,
    });
  }
});

/**
 * GET /api/cannabis-surveys/responses/my-farm
 * Get cannabis survey responses for user's farm
 */
router.get('/responses/my-farm', async (req, res) => {
  try {
    const { limit = 10, status, surveyType } = req.query;

    // Get user's farm code from profile
    const farmCode = req.user.farmCode;
    if (!farmCode) {
      return res.status(400).json({
        success: false,
        error: 'Farm code not found in user profile',
        errorTH: 'ไม่พบรหัสฟาร์มในโปรไฟล์ผู้ใช้',
      });
    }

    const query = { 'respondent.farmCode': farmCode };
    if (status) {
      query.status = status;
    }
    if (surveyType) {
      // Need to populate template to filter by survey type
      const responses = await CannabisSurveyResponse.find(query)
        .populate({
          path: 'templateId',
          match: { 'cannabisMetadata.surveyType': surveyType },
        })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      // Filter out responses where template didn't match
      const filteredResponses = responses.filter(r => r.templateId);

      return res.json({
        success: true,
        data: {
          responses: filteredResponses,
          total: filteredResponses.length,
          farmCode,
        },
        message: 'Cannabis survey responses retrieved successfully',
        messageTH: 'ดึงข้อมูลแบบสำรวจกัญชาเรียบร้อยแล้ว',
      });
    }

    const responses = await cannabisSurveyService.getResponsesByFarm(farmCode, parseInt(limit));

    res.json({
      success: true,
      data: {
        responses,
        total: responses.length,
        farmCode,
      },
      message: 'Cannabis survey responses retrieved successfully',
      messageTH: 'ดึงข้อมูลแบบสำรวจกัญชาเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error getting cannabis survey responses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cannabis survey responses',
      errorTH: 'ไม่สามารถดึงข้อมูลแบบสำรวจกัญชาได้',
      details: error.message,
    });
  }
});

/**
 * GET /api/cannabis-surveys/compliance/report
 * Get compliance report for user's farm
 */
router.get('/compliance/report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get user's farm code
    const farmCode = req.user.farmCode;
    if (!farmCode) {
      return res.status(400).json({
        success: false,
        error: 'Farm code not found in user profile',
        errorTH: 'ไม่พบรหัสฟาร์มในโปรไฟล์ผู้ใช้',
      });
    }

    // Default to last 3 months if dates not provided
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate
      ? new Date(startDate)
      : new Date(endDateObj.getTime() - 90 * 24 * 60 * 60 * 1000);

    const report = await cannabisSurveyService.getComplianceReport(farmCode, {
      startDate: startDateObj,
      endDate: endDateObj,
    });

    res.json({
      success: true,
      data: report,
      message: 'Cannabis compliance report generated successfully',
      messageTH: 'สร้างรายงานการปฏิบัติตามข้อกำหนดกัญชาเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error generating compliance report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate compliance report',
      errorTH: 'ไม่สามารถสร้างรายงานการปฏิบัติตามข้อกำหนดได้',
      details: error.message,
    });
  }
});

/**
 * POST /api/cannabis-surveys/responses/:responseId/link-audit
 * Link cannabis survey response to audit
 */
router.post('/responses/:responseId/link-audit', async (req, res) => {
  try {
    const { responseId } = req.params;
    const { auditId } = req.body;

    if (!auditId) {
      return res.status(400).json({
        success: false,
        error: 'Audit ID is required',
        errorTH: 'จำเป็นต้องระบุ ID การตรวจสอบ',
      });
    }

    const response = await cannabisSurveyService.linkResponseToAudit(responseId, auditId);

    res.json({
      success: true,
      data: response,
      message: 'Cannabis survey response linked to audit successfully',
      messageTH: 'เชื่อมโยงแบบสำรวจกัญชากับการตรวจสอบเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error linking response to audit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to link response to audit',
      errorTH: 'ไม่สามารถเชื่อมโยงแบบสำรวจกับการตรวจสอบได้',
      details: error.message,
    });
  }
});

/**
 * POST /api/cannabis-surveys/responses/:responseId/sync-sop
 * Sync cannabis survey response with SOP system
 */
router.post('/responses/:responseId/sync-sop', async (req, res) => {
  try {
    const { responseId } = req.params;

    await cannabisSurveyService.syncWithSOPSystem(responseId);

    res.json({
      success: true,
      message: 'Cannabis survey response synced with SOP system successfully',
      messageTH: 'ซิงค์แบบสำรวจกัญชากับระบบ SOP เรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error syncing response with SOP system:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync response with SOP system',
      errorTH: 'ไม่สามารถซิงค์แบบสำรวจกับระบบ SOP ได้',
      details: error.message,
    });
  }
});

// =============================================================================
// ADMIN ROUTES (Admin and Cannabis Specialist only)
// =============================================================================

/**
 * GET /api/cannabis-surveys/admin/responses
 * Get all cannabis survey responses for admin review
 */
router.get('/admin/responses', async (req, res) => {
  try {
    // Check admin permissions
    if (!['admin', 'cannabis_specialist', 'reviewer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions for admin operations',
        errorTH: 'ไม่มีสิทธิ์ในการดำเนินการระดับผู้ดูแลระบบ',
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      riskLevel,
      complianceThreshold,
      farmCode,
      _region,
      startDate,
      endDate,
    } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (riskLevel) {
      query['analytics.riskProfile.overallRisk'] = riskLevel;
    }
    if (complianceThreshold) {
      query['analytics.complianceScore.overall'] = {
        $lt: parseInt(complianceThreshold),
      };
    }
    if (farmCode) {
      query['respondent.farmCode'] = farmCode;
    }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [responses, total] = await Promise.all([
      CannabisSurveyResponse.find(query)
        .populate('templateId', 'title titleTH cannabisMetadata')
        .populate('respondent.userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CannabisSurveyResponse.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        responses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit),
        },
      },
      message: 'Cannabis survey responses retrieved successfully',
      messageTH: 'ดึงข้อมูลแบบสำรวจกัญชาเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error getting admin cannabis survey responses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cannabis survey responses',
      errorTH: 'ไม่สามารถดึงข้อมูลแบบสำรวจกัญชาได้',
      details: error.message,
    });
  }
});

/**
 * PUT /api/cannabis-surveys/admin/responses/:responseId/review
 * Review cannabis survey response (Admin/Reviewer only)
 */
router.put('/admin/responses/:responseId/review', async (req, res) => {
  try {
    // Check permissions
    if (!['admin', 'cannabis_specialist', 'reviewer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to review responses',
        errorTH: 'ไม่มีสิทธิ์ในการตรวจสอบแบบสำรวจ',
      });
    }

    const { responseId } = req.params;
    const { status, reviewComments, complianceNotes, followUpRequired, followUpActions } = req.body;

    const updateData = {
      status,
      reviewInfo: {
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewComments,
        complianceNotes,
        followUpRequired: followUpRequired || false,
        followUpActions: followUpActions || [],
      },
    };

    const response = await cannabisSurveyService.updateResponse(
      responseId,
      updateData,
      req.user.id,
    );

    res.json({
      success: true,
      data: response,
      message: 'Cannabis survey response reviewed successfully',
      messageTH: 'ตรวจสอบแบบสำรวจกัญชาเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error reviewing cannabis survey response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review cannabis survey response',
      errorTH: 'ไม่สามารถตรวจสอบแบบสำรวจกัญชาได้',
      details: error.message,
    });
  }
});

/**
 * GET /api/cannabis-surveys/admin/analytics/dashboard
 * Get cannabis survey analytics dashboard
 */
router.get('/admin/analytics/dashboard', async (req, res) => {
  try {
    // Check admin permissions
    if (!['admin', 'cannabis_specialist'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions for analytics dashboard',
        errorTH: 'ไม่มีสิทธิ์ในการดูแดชบอร์ดการวิเคราะห์',
      });
    }

    const { period = '30d', region } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const matchQuery = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (region) {
      // Get templates for the region and use those template IDs
      const templates = await CannabisSurveyTemplate.find({
        region: { $in: [region, 'national'] },
      }).select('_id');

      matchQuery.templateId = { $in: templates.map(t => t._id) };
    }

    const analytics = await CannabisSurveyResponse.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalResponses: { $sum: 1 },
          averageCompliance: { $avg: '$analytics.complianceScore.overall' },
          highRiskCount: {
            $sum: {
              $cond: [{ $in: ['$analytics.riskProfile.overallRisk', ['high', 'critical']] }, 1, 0],
            },
          },
          lowComplianceCount: {
            $sum: {
              $cond: [{ $lt: ['$analytics.complianceScore.overall', 70] }, 1, 0],
            },
          },
        },
      },
    ]);

    const dashboardData = analytics[0] || {
      totalResponses: 0,
      averageCompliance: 0,
      highRiskCount: 0,
      lowComplianceCount: 0,
    };

    // Get cannabis category distribution
    const categoryDistribution = await CannabisSurveyResponse.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'cannabis_survey_templates',
          localField: 'templateId',
          foreignField: '_id',
          as: 'template',
        },
      },
      { $unwind: '$template' },
      {
        $group: {
          _id: '$template.cannabisMetadata.cannabisCategory',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        summary: dashboardData,
        categoryDistribution,
        period,
        region: region || 'all',
        dateRange: { startDate, endDate },
      },
      message: 'Cannabis survey analytics retrieved successfully',
      messageTH: 'ดึงข้อมูลการวิเคราะห์แบบสำรวจกัญชาเรียบร้อยแล้ว',
    });
  } catch (error) {
    logger.error('Error getting cannabis survey analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cannabis survey analytics',
      errorTH: 'ไม่สามารถดึงข้อมูลการวิเคราะห์แบบสำรวจกัญชาได้',
      details: error.message,
    });
  }
});

module.exports = router;
