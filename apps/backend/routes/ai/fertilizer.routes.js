/**
 * Fertilizer Recommendation Routes
 *
 * API endpoints for AI-powered fertilizer recommendations and product management
 *
 * Base path: /api/ai/fertilizer or /api/fertilizer-products
 */

const express = require('express');
const router = express.Router();
const fertilizerController = require('../../controllers/ai/fertilizer.controller');

const { authenticateFarmer } = require('../../middleware/auth-middleware');

/**
 * @route   POST /api/ai/fertilizer/recommend
 * @desc    Generate AI-powered fertilizer recommendation
 * @access  Private (requires authentication)
 * @body    {
 *            farmId: ObjectId,
 *            cultivationCycleId: ObjectId,
 *            growthStage?: string,
 *            options?: {
 *              organicOnly?: boolean,
 *              maxPrice?: number
 *            }
 *          }
 */
router.post('/recommend', authenticateFarmer, fertilizerController.generateRecommendation);

module.exports = router;
