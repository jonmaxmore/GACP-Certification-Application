/**
 * Standards Comparison API Routes - GACP Platform Phase 2
 *
 * API Endpoints:
 * - GET /api/standards - List available standards
 * - GET /api/standards/:id - Get standard details
 * - POST /api/standards/compare - Compare farm against standards
 * - GET /api/standards/comparison/:id - Get comparison results
 * - GET /api/standards/gaps/:comparisonId - Analyze gaps
 * - GET /api/standards/history/:farmId - Get comparison history
 * - GET /api/standards/recommendations/:comparisonId - Get recommendations
 *
 * @author GACP Development Team
 * @since Phase 2 - October 12, 2025
 */

const logger = require('../../shared/logger/logger');
const express = require('express');
const router = express.Router();
const path = require('path');

// Auth middleware
let auth;
try {
  const authModule = require(path.join(__dirname, '../../middleware/auth-middleware'));
  auth = authModule.authenticateToken || authModule.authenticateFarmer || authModule;
} catch (error) {
  auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    try {
      req.user = { userId: 'test-user', role: 'farmer' };
      next();
    } catch (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
  };
}

let standardsService = null;

/**
 * Initialize Standards Service with database
 * Using standards-comparison module instead of old engine
 */
async function initializeEngine(db) {
  const { initializeStandardsComparison } = require(
    path.join(__dirname, '../../modules/standards-comparison'),
  );
  const result = await initializeStandardsComparison(db, auth);
  standardsService = result.service;
  logger.info('[Standards API] Service initialized from module');
}

// Middleware to check if service is initialized
const checkEngineInitialized = (req, res, next) => {
  if (!standardsService) {
    return res.status(503).json({
      success: false,
      error: 'Standards service not initialized. Please wait for database connection.',
    });
  }
  next();
};

// ============================================================================
// 1. HEALTH CHECK (MUST BE FIRST)
// ============================================================================

/**
 * GET /api/standards/health
 * Health check endpoint
 */
router.get('/health', checkEngineInitialized, (req, res) => {
  res.json({
    success: true,
    service: 'Standards Comparison API',
    status: 'operational',
    standardsLoaded: standardsService.standards ? standardsService.standards.size : 0,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// 2. LIST AVAILABLE STANDARDS
// ============================================================================

/**
 * GET /api/standards
 * Get list of all available certification standards
 * Public endpoint
 */
router.get('/', checkEngineInitialized, async (req, res) => {
  try {
    const standards = standardsService.getAvailableStandards();

    res.json({
      success: true,
      count: standards.length,
      standards,
    });
  } catch (error) {
    logger.error('[Standards API] List error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve standards',
      message: error.message,
    });
  }
});

// ============================================================================
// 3. GET STANDARD DETAILS
// ============================================================================

/**
 * GET /api/standards/:id
 * Get detailed information about a specific standard
 * Public endpoint
 */
router.get('/:id', checkEngineInitialized, async (req, res) => {
  try {
    const { id } = req.params;
    const standard = standardsService.getStandard(id);

    if (!standard) {
      return res.status(404).json({
        success: false,
        error: `Standard not found: ${id}`,
      });
    }

    res.json({
      success: true,
      standard,
    });
  } catch (error) {
    logger.error('[Standards API] Get standard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve standard',
      message: error.message,
    });
  }
});

// ============================================================================
// 3. COMPARE FARM AGAINST STANDARDS
// ============================================================================

/**
 * POST /api/standards/compare
 * Compare farm data against one or more standards
 * Requires: Authentication
 *
 * Body: {
 *   farmId: string,
 *   standardIds: string[],
 *   farmData: {
 *     farmName: string,
 *     location: object,
 *     cropType: string,
 *     practices: object,
 *     documents: array,
 *     certifications: array,
 *     records: object
 *   }
 * }
 */
router.post('/compare', auth, checkEngineInitialized, async (req, res) => {
  try {
    const { farmId, standardIds, farmData } = req.body;

    // Validation
    if (!farmId || !standardIds || !farmData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: farmId, standardIds, farmData',
      });
    }

    if (!Array.isArray(standardIds) || standardIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'standardIds must be a non-empty array',
      });
    }

    // Perform comparison
    const result = await standardsService.compareAgainstStandards({
      farmId,
      standardIds,
      farmData,
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Comparison completed successfully',
      comparisonId: result.comparisonId,
      results: result.results,
      summary: {
        standardsCompared: result.results.length,
        certified: result.results.filter(r => r.certified).length,
        notCertified: result.results.filter(r => !r.certified).length,
      },
    });
  } catch (error) {
    logger.error('[Standards API] Comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete comparison',
      message: error.message,
    });
  }
});

// ============================================================================
// 4. GET COMPARISON RESULTS
// ============================================================================

/**
 * GET /api/standards/comparison/:id
 * Retrieve saved comparison results
 * Requires: Authentication
 */
router.get('/comparison/:id', auth, checkEngineInitialized, async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = require('mongodb');

    const comparison = await standardsService.comparisons.findOne({
      _id: new ObjectId(id),
    });

    if (!comparison) {
      return res.status(404).json({
        success: false,
        error: 'Comparison not found',
      });
    }

    res.json({
      success: true,
      comparison: {
        id: comparison._id.toString(),
        farmId: comparison.farmId,
        farmData: comparison.farmData,
        results: comparison.comparisons,
        createdAt: comparison.createdAt,
      },
    });
  } catch (error) {
    logger.error('[Standards API] Get comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve comparison',
      message: error.message,
    });
  }
});

// ============================================================================
// 5. ANALYZE GAPS
// ============================================================================

/**
 * GET /api/standards/gaps/:comparisonId
 * Analyze gaps and identify areas for improvement
 * Requires: Authentication
 */
router.get('/gaps/:comparisonId', auth, checkEngineInitialized, async (req, res) => {
  try {
    const { comparisonId } = req.params;

    const result = await standardsService.analyzeGaps({ comparisonId });

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      comparisonId,
      gapAnalysis: {
        totalGaps: result.gapCount,
        priority: result.priority,
        gaps: result.gaps,
        topRecommendations: result.recommendations,
      },
    });
  } catch (error) {
    logger.error('[Standards API] Gap analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze gaps',
      message: error.message,
    });
  }
});

// ============================================================================
// 6. GET COMPARISON HISTORY
// ============================================================================

/**
 * GET /api/standards/history/:farmId
 * Get comparison history for a farm
 * Requires: Authentication
 */
router.get('/history/:farmId', auth, checkEngineInitialized, async (req, res) => {
  try {
    const { farmId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const result = await standardsService.getComparisonHistory(farmId, limit);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      farmId,
      historyCount: result.count,
      comparisons: result.comparisons,
    });
  } catch (error) {
    logger.error('[Standards API] History error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve history',
      message: error.message,
    });
  }
});

// ============================================================================
// 7. GET RECOMMENDATIONS
// ============================================================================

/**
 * GET /api/standards/recommendations/:comparisonId
 * Get detailed recommendations for improvement
 * Requires: Authentication
 */
router.get('/recommendations/:comparisonId', auth, checkEngineInitialized, async (req, res) => {
  try {
    const { comparisonId } = req.params;

    const result = await standardsService.analyzeGaps({ comparisonId });

    if (!result.success) {
      return res.status(404).json(result);
    }

    // Group recommendations by priority
    const groupedRecommendations = {
      critical: result.recommendations.filter(r => r.priority === 'Critical'),
      important: result.recommendations.filter(r => r.priority === 'Important'),
      optional: result.recommendations.filter(r => r.priority === 'Optional'),
    };

    res.json({
      success: true,
      comparisonId,
      recommendations: result.recommendations,
      grouped: groupedRecommendations,
      summary: {
        total: result.recommendations.length,
        critical: groupedRecommendations.critical.length,
        important: groupedRecommendations.important.length,
        optional: groupedRecommendations.optional.length,
      },
    });
  } catch (error) {
    logger.error('[Standards API] Recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      message: error.message,
    });
  }
});

// ============================================================================
// Export router and initialization function
// ============================================================================

module.exports = {
  router,
  initializeEngine,
};
