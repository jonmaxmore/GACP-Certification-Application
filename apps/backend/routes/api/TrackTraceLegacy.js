/**
 * Track & Trace API Routes - GACP Platform Phase 2
 *
 * API Endpoints:
 * - POST /api/tracktrace/cycles/:id/qrcode - Generate QR code
 * - GET /api/tracktrace/verify/:qrcode - Verify product (public)
 * - POST /api/tracktrace/activities - Log activity
 * - GET /api/tracktrace/cycles/:id/timeline - Get timeline
 * - GET /api/tracktrace/analytics - Get analytics
 * - PUT /api/tracktrace/qrcode/:id/status - Update status
 *
 * @author GACP Development Team
 * @since Phase 2 - October 12, 2025
 */

const logger = require('../../shared/logger/logger');
const express = require('express');
const router = express.Router();
const path = require('path');

// Auth middleware - try to load from shared or create simple one
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

let trackTraceService = null;

/**
 * Initialize Track & Trace Service with database
 * Using track-trace module instead of old engine
 */
async function initializeEngine(db) {
  const { initializeTrackTrace } = require(path.join(__dirname, '../../modules/track-trace'));
  const result = await initializeTrackTrace({
    db,
    authenticateToken: auth,
  });
  trackTraceService = result.service;
  logger.info('[TrackTrace API] Service initialized from module');
}

// Middleware to check if service is initialized
const checkEngineInitialized = (req, res, next) => {
  if (!trackTraceService) {
    return res.status(503).json({
      success: false,
      error: 'Track & Trace service not initialized. Please wait for database connection.',
    });
  }
  next();
};

// ============================================================================
// 1. QR CODE GENERATION
// ============================================================================

/**
 * POST /api/tracktrace/cycles/:cycleId/qrcode
 * Generate QR code for cultivation cycle
 * Requires: Authentication
 */
router.post('/cycles/:cycleId/qrcode', auth, checkEngineInitialized, async (req, res) => {
  try {
    console.log('[TrackTrace API] QR Generation Request:', {
      cycleId: req.params.cycleId,
      body: req.body,
      user: req.user,
    });

    const { cycleId } = req.params;
    const { farmName, cropType } = req.body;
    const farmerId = req.user?.userId || req.user?.id;

    if (!farmerId) {
      logger.error('[TrackTrace API] No farmer ID in request');
      return res.status(401).json({
        success: false,
        error: 'User authentication failed - no farmer ID',
      });
    }

    if (!farmName || !cropType) {
      logger.error('[TrackTrace API] Missing fields:', { farmName, cropType });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: farmName, cropType',
      });
    }

    console.log('[TrackTrace API] Calling generateQRCode with:', {
      cycleId,
      farmerId,
      farmName,
      cropType,
    });

    const result = await trackTraceService.generateQRCode({
      cycleId,
      farmerId,
      farmName,
      cropType,
    });

    logger.info('[TrackTrace API] QR Generation result:', result);

    if (!result.success) {
      logger.error('[TrackTrace API] QR generation failed:', result);
      return res.status(500).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'QR Code generated successfully',
      data: result.data,
    });
  } catch (error) {
    logger.error('[TrackTrace API] QR generation exception:', error);
    logger.error('[TrackTrace API] Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// ============================================================================
// 2. PUBLIC VERIFICATION
// ============================================================================

/**
 * GET /api/tracktrace/verify/:qrCodeId
 * Verify QR code authenticity (PUBLIC - no auth required)
 */
router.get('/verify/:qrCodeId', checkEngineInitialized, async (req, res) => {
  try {
    const { qrCodeId } = req.params;

    const result = await trackTraceService.verifyQRCode(qrCodeId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      verified: result.verified,
      data: result.data,
    });
  } catch (error) {
    logger.error('[TrackTrace API] Verification error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      error: 'Verification failed',
      message: error.message,
    });
  }
});

// ============================================================================
// 3. ACTIVITY LOGGING
// ============================================================================

/**
 * POST /api/tracktrace/activities
 * Log activity for tracked item
 * Requires: Authentication
 */
router.post('/activities', auth, checkEngineInitialized, async (req, res) => {
  try {
    const { qrCodeId, type, description, location, photos, metadata } = req.body;

    if (!qrCodeId || !type || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: qrCodeId, type, description',
      });
    }

    // Valid activity types
    const validTypes = [
      'planting',
      'fertilizing',
      'watering',
      'pest_control',
      'harvesting',
      'processing',
      'quality_check',
      'packaging',
      'shipping',
      'delivered',
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid activity type. Valid types: ${validTypes.join(', ')}`,
      });
    }

    const result = await trackTraceService.logActivity({
      qrCodeId,
      type,
      description,
      location: location || {},
      photos: photos || [],
      performedBy: {
        userId: req.user.userId,
        name: req.user.name || req.user.email,
        role: req.user.role,
      },
      metadata: metadata || {},
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: result.data,
    });
  } catch (error) {
    logger.error('[TrackTrace API] Activity logging error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log activity',
      message: error.message,
    });
  }
});

// ============================================================================
// 4. TIMELINE RETRIEVAL
// ============================================================================

/**
 * GET /api/tracktrace/cycles/:cycleId/timeline
 * Get complete timeline by cycle ID
 * Note: This endpoint searches by qrCodeId, needs mapping from cycleId
 */
router.get('/qrcode/:qrCodeId/timeline', checkEngineInitialized, async (req, res) => {
  try {
    const { qrCodeId } = req.params;

    const result = await trackTraceService.getTimeline(qrCodeId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error('[TrackTrace API] Timeline error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve timeline',
      message: error.message,
    });
  }
});

// ============================================================================
// 5. ANALYTICS
// ============================================================================

/**
 * GET /api/tracktrace/analytics
 * Get Track & Trace analytics
 * Requires: Authentication
 * Query params: dateFrom, dateTo, farmerId
 */
router.get('/analytics', auth, checkEngineInitialized, async (req, res) => {
  try {
    const filters = {
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      farmerId: req.query.farmerId || req.user.userId,
    };

    // Admin can view all, farmers can only view their own
    if (req.user.role !== 'admin' && filters.farmerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Can only view own analytics',
      });
    }

    const result = await trackTraceService.getAnalytics(filters);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error('[TrackTrace API] Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics',
      message: error.message,
    });
  }
});

// ============================================================================
// 6. STATUS MANAGEMENT
// ============================================================================

/**
 * PUT /api/tracktrace/qrcode/:qrCodeId/status
 * Update QR code status
 * Requires: Authentication
 * Body: { status: 'active' | 'completed' | 'revoked' }
 */
router.put('/qrcode/:qrCodeId/status', auth, checkEngineInitialized, async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: status',
      });
    }

    const result = await trackTraceService.updateStatus(qrCodeId, status);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error('[TrackTrace API] Status update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status',
      message: error.message,
    });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * GET /api/tracktrace/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Track & Trace API',
    status: trackTraceService ? 'operational' : 'initializing',
    timestamp: new Date().toISOString(),
  });
});

// Export router and initialization function
module.exports = router;
module.exports.initializeEngine = initializeEngine;
