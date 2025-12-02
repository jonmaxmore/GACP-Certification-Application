/**
 * GACP Survey System - 4 Regions API Routes
 *
 * Endpoints for:
 * - Survey template management (4 regions)
 * - Wizard flow (7 steps)
 * - Regional analytics
 * - Score calculation with regional bonus
 *
 * Regions: Central, Southern, Northern, Northeastern
 */

const logger = require('../../shared/logger/logger');
const express = require('express');
const router = express.Router();
const path = require('path');
const SurveyProcessEngine = require(
  path.join(__dirname, '../../services/survey-process-engine-4regions'),
);
const Survey = require(path.join(__dirname, '../../models/mongodb/Survey'));

// Auth middleware - try to load from shared or create simple one
let auth;
try {
  const authModule = require(path.join(__dirname, '../../middleware/auth-middleware'));
  auth = authModule.authenticateToken || authModule.authenticateFarmer || authModule;
} catch (error) {
  // Fallback auth middleware
  auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Simple token validation (you should use JWT verify in production)
    try {
      // For now, just pass through
      req.user = { userId: 'test-user', role: 'farmer' };
      next();
    } catch (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
  };
}

// Note: Survey Engine will be initialized after MongoDB connection
// using the initializeEngine function below
let surveyEngine = null;

/**
 * Initialize Survey Engine with database connection
 * Call this after MongoDB is connected
 */
function initializeEngine(db) {
  surveyEngine = new SurveyProcessEngine(db);
  logger.info('[Survey4Regions] Engine initialized with database');
}

// Export initialization function
router.initializeEngine = initializeEngine;

// Middleware to check if engine is initialized
const checkEngineInitialized = (req, res, next) => {
  if (!surveyEngine) {
    return res.status(503).json({
      success: false,
      error: 'Survey engine not initialized. Please wait for database connection.',
    });
  }
  next();
};

// ============================================================================
// 1. SURVEY TEMPLATE ENDPOINTS
// ============================================================================

/**
 * GET /api/surveys-4regions/templates
 * Get all available survey templates (4 regions)
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = await Survey.find({
      status: 'active',
      templateId: { $regex: /^SURVEY_TEMPLATE_/ },
    }).select('templateId region title description totalQuestions metadata');

    res.json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch survey templates',
      message: error.message,
    });
  }
});

/**
 * GET /api/surveys-4regions/templates/:region
 * Get survey template for specific region
 * Params: region = central|southern|northern|northeastern
 */
router.get('/templates/:region', async (req, res) => {
  try {
    const { region } = req.params;

    // Validate region
    const validRegions = ['central', 'southern', 'northern', 'northeastern'];
    if (!validRegions.includes(region.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid region',
        validRegions,
      });
    }

    const template = await Survey.findOne({
      region: region.toLowerCase(),
      status: 'active',
      templateId: { $regex: /^SURVEY_TEMPLATE_/ },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: `Template not found for region: ${region}`,
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    logger.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch survey template',
      message: error.message,
    });
  }
});

// ============================================================================
// 2. WIZARD FLOW ENDPOINTS (7 Steps)
// ============================================================================

/**
 * POST /api/surveys-4regions/wizard/start
 * Start a new survey wizard
 * Body: { region, userId, farmId }
 */
router.post('/wizard/start', auth, checkEngineInitialized, async (req, res) => {
  try {
    const { region, farmId } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!region) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['region'],
      });
    }

    // Get template for this region
    const template = await Survey.findOne({
      templateId: `SURVEY_TEMPLATE_${region.toUpperCase()}`,
      status: 'active',
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: `No template found for region: ${region}`,
      });
    }

    // Create survey response
    const result = await surveyEngine.createSurveyResponse({
      surveyId: template._id,
      userId,
      region,
      farmId,
    });

    // Check if engine returned success
    if (!result.success || !result.data) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to create survey response',
      });
    }

    const surveyResponse = result.data;

    res.status(201).json({
      success: true,
      message: 'Survey wizard started',
      data: {
        surveyId: surveyResponse._id,
        region: surveyResponse.region,
        currentStep: surveyResponse.currentStep,
        progress: surveyResponse.progress,
        totalSteps: 7,
      },
    });
  } catch (error) {
    logger.error('Error starting wizard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start survey wizard',
      message: error.message,
    });
  }
});

/**
 * GET /api/surveys-4regions/wizard/:surveyId/current
 * Get current wizard step and progress
 */
router.get('/wizard/:surveyId/current', auth, async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user.userId;

    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found',
      });
    }

    // Check ownership
    if (survey.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to survey',
      });
    }

    // Get current step questions
    const template = await Survey.findOne({
      region: survey.region,
      templateId: { $regex: /^SURVEY_TEMPLATE_/ },
    });

    const currentStepQuestions = template.sections.find(
      section => section.id === survey.wizardData.currentStep,
    );

    res.json({
      success: true,
      data: {
        surveyId: survey._id,
        currentStep: survey.wizardData.currentStep,
        progress: survey.wizardData.progress,
        totalSteps: 7,
        stepData: survey.wizardData.stepData[survey.wizardData.currentStep] || {},
        questions: currentStepQuestions?.questions || [],
        region: survey.region,
      },
    });
  } catch (error) {
    logger.error('Error fetching wizard state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wizard state',
      message: error.message,
    });
  }
});

/**
 * PUT /api/surveys-4regions/wizard/:surveyId/step/:stepId
 * Update wizard step data
 * Body: { stepData, autoSave: boolean }
 */
router.put('/wizard/:surveyId/step/:stepId', auth, async (req, res) => {
  try {
    const { surveyId, stepId } = req.params;
    const { stepData, autoSave = false } = req.body;
    const userId = req.user.userId;

    // Update wizard step
    const result = await surveyEngine.updateWizardStep(
      surveyId,
      parseInt(stepId),
      stepData,
      userId,
    );

    res.json({
      success: true,
      message: autoSave ? 'Progress auto-saved' : 'Step updated successfully',
      data: {
        surveyId,
        stepId: parseInt(stepId),
        currentStep: result.currentStep,
        progress: result.progress,
        isComplete: result.isComplete,
      },
    });
  } catch (error) {
    logger.error('Error updating wizard step:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update wizard step',
      message: error.message,
    });
  }
});

/**
 * POST /api/surveys-4regions/wizard/:surveyId/submit
 * Submit completed wizard (calculate scores)
 */
router.post('/wizard/:surveyId/submit', auth, async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user.userId;

    // Submit wizard
    const result = await surveyEngine.submitWizard(surveyId, userId);

    res.json({
      success: true,
      message: 'Survey submitted successfully',
      data: {
        surveyId,
        status: result.status,
        scores: result.scores,
        regionalBonus: result.regionalBonus,
        totalScore: result.totalScore,
        recommendations: result.recommendations,
        submittedAt: result.submittedAt,
      },
    });
  } catch (error) {
    logger.error('Error submitting wizard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit survey',
      message: error.message,
    });
  }
});

/**
 * GET /api/surveys-4regions/wizard/:surveyId/progress
 * Get wizard progress overview
 */
router.get('/wizard/:surveyId/progress', auth, checkEngineInitialized, async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user.userId;

    const { ObjectId } = require('mongodb');

    // Get survey response from engine
    const surveyResponse = await surveyEngine.surveyResponses.findOne({
      _id: new ObjectId(surveyId),
    });

    if (!surveyResponse) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found',
      });
    }

    // Check ownership
    if (surveyResponse.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access',
      });
    }

    // Calculate step completion
    const stepCompletion = {
      step1: { name: 'Region Selection', completed: !!surveyResponse.regionSelection },
      step2: { name: 'Personal Info', completed: !!surveyResponse.personalInfo },
      step3: { name: 'Farm Info', completed: !!surveyResponse.farmInfo },
      step4: { name: 'Management', completed: !!surveyResponse.managementProduction },
      step5: { name: 'Cost & Revenue', completed: !!surveyResponse.costRevenue },
      step6: { name: 'Market & Sales', completed: !!surveyResponse.marketSales },
      step7: { name: 'Problems & Needs', completed: !!surveyResponse.problemsNeeds },
    };

    const completedSteps = Object.values(stepCompletion).filter(s => s.completed).length;
    const totalSteps = 7;

    res.json({
      success: true,
      data: {
        surveyId,
        region: surveyResponse.region,
        currentStep: surveyResponse.currentStep,
        overallProgress: surveyResponse.progress,
        stepCompletion,
        completedSteps,
        totalSteps,
        status: surveyResponse.state,
        lastSaved: surveyResponse.lastSavedAt,
      },
    });
  } catch (error) {
    logger.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress',
      message: error.message,
    });
  }
});

// ============================================================================
// 3. SURVEY MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/surveys-4regions/my-surveys
 * Get all surveys for current user
 */
router.get('/my-surveys', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, region } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }
    if (region) {
      query.region = region;
    }

    const surveys = await Survey.find(query)
      .sort({ createdAt: -1 })
      .select('region status wizardData.progress scores totalScore createdAt submittedAt');

    res.json({
      success: true,
      count: surveys.length,
      data: surveys,
    });
  } catch (error) {
    logger.error('Error fetching surveys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch surveys',
      message: error.message,
    });
  }
});

/**
 * GET /api/surveys-4regions/:surveyId
 * Get specific survey details
 */
router.get('/:surveyId', auth, async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user.userId;

    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found',
      });
    }

    // Check ownership or admin
    if (survey.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access',
      });
    }

    res.json({
      success: true,
      data: survey,
    });
  } catch (error) {
    logger.error('Error fetching survey:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch survey',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/surveys-4regions/:surveyId
 * Delete survey (only if status is DRAFT)
 */
router.delete('/:surveyId', auth, async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user.userId;

    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found',
      });
    }

    // Check ownership
    if (survey.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Only allow deletion of drafts
    if (survey.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: 'Can only delete draft surveys',
      });
    }

    await Survey.findByIdAndDelete(surveyId);

    res.json({
      success: true,
      message: 'Survey deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting survey:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete survey',
      message: error.message,
    });
  }
});

// ============================================================================
// 4. REGIONAL ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/surveys-4regions/analytics/regional/:region
 * Get analytics for specific region
 */
router.get('/analytics/regional/:region', auth, async (req, res) => {
  try {
    const { region } = req.params;

    const analytics = await surveyEngine.getRegionalAnalytics(region);

    res.json({
      success: true,
      region,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error fetching regional analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message,
    });
  }
});

/**
 * POST /api/surveys-4regions/analytics/compare
 * Compare multiple regions
 * Body: { regions: ['central', 'southern', ...] }
 */
router.post('/analytics/compare', auth, async (req, res) => {
  try {
    const { regions } = req.body;

    if (!regions || !Array.isArray(regions) || regions.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least 2 regions to compare',
      });
    }

    const comparison = await surveyEngine.compareRegions(regions);

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    logger.error('Error comparing regions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare regions',
      message: error.message,
    });
  }
});

/**
 * GET /api/surveys-4regions/analytics/overview
 * Get overall system analytics (all regions)
 */
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    const regions = ['central', 'southern', 'northern', 'northeastern'];

    const analyticsPromises = regions.map(region => surveyEngine.getRegionalAnalytics(region));

    const results = await Promise.all(analyticsPromises);

    const overview = {
      totalSurveys: results.reduce((sum, r) => sum + r.totalSurveys, 0),
      totalCompleted: results.reduce((sum, r) => sum + r.completedSurveys, 0),
      averageScore: results.reduce((sum, r) => sum + r.averageScore, 0) / regions.length,
      regions: regions.reduce((obj, region, index) => {
        obj[region] = results[index];
        return obj;
      }, {}),
    };

    res.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    logger.error('Error fetching overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overview',
      message: error.message,
    });
  }
});

// ============================================================================
// 5. ADMIN ENDPOINTS
// ============================================================================

/**
 * GET /api/surveys-4regions/admin/all
 * Get all surveys (admin only)
 */
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== 'admin' && req.user.role !== 'reviewer') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const { page = 1, limit = 20, status, region } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (region) {
      query.region = region;
    }

    const surveys = await Survey.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email')
      .populate('farmId', 'farmName');

    const count = await Survey.countDocuments(query);

    res.json({
      success: true,
      data: surveys,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching all surveys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch surveys',
      message: error.message,
    });
  }
});

/**
 * PUT /api/surveys-4regions/admin/:surveyId/review
 * Review and approve/reject survey (admin only)
 */
router.put('/admin/:surveyId/review', auth, async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== 'admin' && req.user.role !== 'reviewer') {
      return res.status(403).json({
        success: false,
        error: 'Reviewer access required',
      });
    }

    const { surveyId } = req.params;
    const { action, comments } = req.body; // action: 'approve' | 'reject'

    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found',
      });
    }

    if (action === 'approve') {
      survey.status = 'COMPLETED';
      survey.reviewedBy = req.user.userId;
      survey.reviewedAt = new Date();
      survey.reviewComments = comments;
    } else if (action === 'reject') {
      survey.status = 'REVIEWED';
      survey.reviewedBy = req.user.userId;
      survey.reviewedAt = new Date();
      survey.reviewComments = comments;
      survey.needsRevision = true;
    }

    await survey.save();

    res.json({
      success: true,
      message: `Survey ${action}d successfully`,
      data: {
        surveyId,
        status: survey.status,
        reviewedAt: survey.reviewedAt,
      },
    });
  } catch (error) {
    logger.error('Error reviewing survey:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review survey',
      message: error.message,
    });
  }
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

router.use((error, req, res, _next) => {
  logger.error('Survey API Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});

module.exports = router;
