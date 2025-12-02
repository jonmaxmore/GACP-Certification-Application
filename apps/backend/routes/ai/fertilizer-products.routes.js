/**
 * Fertilizer Products Routes
 *
 * API endpoints for managing GACP-approved fertilizer products
 *
 * Base path: /api/fertilizer-products
 */

const express = require('express');
const router = express.Router();
const fertilizerController = require('../../controllers/ai/fertilizer.controller');

// TODO: Import authentication middleware when ready
// const { authenticateUser } = require('../../middleware/auth-middleware');
// const { isAdmin } = require('../../middleware/roles-middleware');

/**
 * @route   GET /api/fertilizer-products/search
 * @desc    Search fertilizer products by name, brand, or NPK
 * @access  Public
 * @query   q (required) - Search query string
 */
router.get('/search', fertilizerController.searchProducts);

/**
 * @route   GET /api/fertilizer-products/top-rated
 * @desc    Get top-rated fertilizer products
 * @access  Public
 * @query   limit (optional) - Number of products to return (default: 10)
 */
router.get('/top-rated', fertilizerController.getTopRated);

/**
 * @route   GET /api/fertilizer-products/growth-stage/:plantType/:stage
 * @desc    Get products recommended for specific plant type and growth stage
 * @access  Public
 * @params  plantType - Plant type (cannabis, turmeric, etc.)
 *          stage - Growth stage (seedling, vegetative, flowering)
 * @query   region (optional) - Filter by region
 */
router.get('/growth-stage/:plantType/:stage', fertilizerController.getProductsForStage);

/**
 * @route   GET /api/fertilizer-products/:id
 * @desc    Get fertilizer product by ID
 * @access  Public
 * @params  id - Product ObjectId
 */
router.get('/:id', fertilizerController.getProduct);

/**
 * @route   GET /api/fertilizer-products
 * @desc    Get all GACP-approved fertilizer products with filters
 * @access  Public
 * @query   plantType - Filter by plant type
 *          growthStage - Filter by growth stage
 *          region - Filter by available region
 *          organic - Filter by organic certification (true/false)
 *          page - Page number (default: 1)
 *          limit - Results per page (default: 20)
 */
router.get('/', fertilizerController.listProducts);

/**
 * @route   POST /api/fertilizer-products
 * @desc    Create new fertilizer product
 * @access  Private (Admin only)
 * @body    FertilizerProduct schema
 */
router.post('/', fertilizerController.createProduct);
// When auth is ready: router.post('/', authenticateUser, isAdmin, fertilizerController.createProduct);

/**
 * @route   PUT /api/fertilizer-products/:id
 * @desc    Update fertilizer product
 * @access  Private (Admin only)
 * @params  id - Product ObjectId
 * @body    Partial FertilizerProduct schema
 */
router.put('/:id', fertilizerController.updateProduct);
// When auth is ready: router.put('/:id', authenticateUser, isAdmin, fertilizerController.updateProduct);

/**
 * @route   DELETE /api/fertilizer-products/:id
 * @desc    Delete (soft delete) fertilizer product
 * @access  Private (Admin only)
 * @params  id - Product ObjectId
 */
router.delete('/:id', fertilizerController.deleteProduct);
// When auth is ready: router.delete('/:id', authenticateUser, isAdmin, fertilizerController.deleteProduct);

/**
 * @route   POST /api/fertilizer-products/:id/reviews
 * @desc    Add review to fertilizer product
 * @access  Private (requires authentication)
 * @params  id - Product ObjectId
 * @body    {
 *            rating: number (1-5),
 *            review: string,
 *            plantUsedOn: string,
 *            resultsObserved: string,
 *            wouldRecommend: boolean
 *          }
 */
router.post('/:id/reviews', fertilizerController.addReview);
// When auth is ready: router.post('/:id/reviews', authenticateUser, fertilizerController.addReview);

module.exports = router;
