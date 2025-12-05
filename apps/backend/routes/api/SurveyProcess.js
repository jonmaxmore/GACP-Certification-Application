/**
 * Survey Process Engine API Routes
 * Handles survey workflow: create, update, submit, review
 */

const logger = require('../../shared/logger/logger');
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

let surveyEngine = null;

// Initialize survey engine
function initialize(engine) {
  surveyEngine = engine;
  logger.info('[SurveyAPI] Routes loaded successfully');
}

// Middleware to check survey engine
const checkEngine = (req, res, next) => {
  if (!surveyEngine) {
    return res.status(503).json({
      success: false,
      message: 'Survey engine not initialized',
    });
  }
  next();
};

/**
 * @route POST /api/survey-process/responses
 * @desc Create new survey response
 * @access Farmer
 */
router.post('/responses', checkEngine, async (req, res) => {
  try {
    const { surveyId, farmId, region } = req.body;
    const userId = req.user.id;

    if (!surveyId || !region) {
      return res.status(400).json({
        success: false,
        message: 'Survey ID and region are required',
      });
    }

    const result = await surveyEngine.createSurveyResponse({
      surveyId: new ObjectId(surveyId),
      userId: new ObjectId(userId),
      farmId: farmId ? new ObjectId(farmId) : null,
      region: region,
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Survey response created successfully',
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    logger.error('[SurveyAPI] Error creating response:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/survey-process/responses/:id
 * @desc Update survey response (save progress)
 * @access Farmer
 */
router.put('/responses/:id', checkEngine, async (req, res) => {
  try {
    const { id } = req.params;
    const { responses } = req.body;

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        message: 'Responses array is required',
      });
    }

    const result = await surveyEngine.updateSurveyResponse(new ObjectId(id), responses);

    if (result.success) {
      res.json({
        success: true,
        message: 'Survey response updated successfully',
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    logger.error('[SurveyAPI] Error updating response:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * @route POST /api/survey-process/responses/:id/submit
 * @desc Submit completed survey
 * @access Farmer
 */
router.post('/responses/:id/submit', checkEngine, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await surveyEngine.submitSurvey(new ObjectId(id), new ObjectId(userId));

    if (result.success) {
      res.json({
        success: true,
        message: 'Survey submitted successfully',
        data: result.data,
        score: result.score,
        recommendations: result.recommendations,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    logger.error('[SurveyAPI] Error submitting survey:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * @route POST /api/survey-process/responses/:id/review
 * @desc Review submitted survey
 * @access Reviewer, Admin
 */
router.post('/responses/:id/review', checkEngine, async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const reviewerId = req.user.id;

    // Check if user has reviewer or admin role
    if (!['reviewer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only reviewers and admins can review surveys',
      });
    }

    const result = await surveyEngine.reviewSurvey(new ObjectId(id), {
      reviewerId: new ObjectId(reviewerId),
      comments: comments || '',
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Survey reviewed successfully',
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    logger.error('[SurveyAPI] Error reviewing survey:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/survey-process/responses
 * @desc Get all survey responses (filtered by user role)
 * @access All authenticated users
 */
router.get('/responses', checkEngine, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build query based on role
    const query = {};

    if (userRole === 'farmer') {
      query.userId = new ObjectId(userId);
    }

    if (status) {
      query.state = status.toUpperCase();
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const responses = await surveyEngine.surveyResponses
      .find(query)
      .sort({ 'metadata.createdAt': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await surveyEngine.surveyResponses.countDocuments(query);

    res.json({
      success: true,
      data: responses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('[SurveyAPI] Error getting responses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/survey-process/responses/:id
 * @desc Get specific survey response
 * @access Owner or Reviewer/Admin
 */
router.get('/responses/:id', checkEngine, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const response = await surveyEngine.surveyResponses.findOne({
      _id: new ObjectId(id),
    });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Survey response not found',
      });
    }

    // Check access rights
    if (userRole === 'farmer' && response.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error('[SurveyAPI] Error getting response:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/survey-process/statistics
 * @desc Get survey statistics
 * @access All authenticated users
 */
router.get('/statistics', checkEngine, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const stats = await surveyEngine.getStatistics(userId, userRole);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('[SurveyAPI] Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/survey-process/templates
 * @desc Get available survey templates
 * @access All authenticated users
 */
router.get('/templates', checkEngine, async (req, res) => {
  try {
    const { region } = req.query;

    const query = { active: true };

    if (region) {
      query.region = region;
    }

    const templates = await surveyEngine.surveys.find(query).sort({ region: 1 }).toArray();

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    logger.error('[SurveyAPI] Error getting templates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/survey-process/templates/:id
 * @desc Get specific survey template with questions
 * @access All authenticated users
 */
router.get('/templates/:id', checkEngine, async (req, res) => {
  try {
    const { id } = req.params;

    const template = await surveyEngine.surveys.findOne({
      _id: new ObjectId(id),
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Survey template not found',
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    logger.error('[SurveyAPI] Error getting template:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/survey-process/responses/:id
 * @desc Delete survey response (only DRAFT)
 * @access Owner or Admin
 */
router.delete('/responses/:id', checkEngine, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const response = await surveyEngine.surveyResponses.findOne({
      _id: new ObjectId(id),
    });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Survey response not found',
      });
    }

    // Check permissions
    if (userRole !== 'admin' && response.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Only allow deleting DRAFT surveys
    if (response.state !== surveyEngine.STATES.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Can only delete DRAFT surveys',
      });
    }

    await surveyEngine.surveyResponses.deleteOne({ _id: new ObjectId(id) });

    res.json({
      success: true,
      message: 'Survey response deleted successfully',
    });
  } catch (error) {
    logger.error('[SurveyAPI] Error deleting response:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = { router, initialize };
