/**
 * Fertilizer Recommendation Controller
 *
 * Handles HTTP requests for AI-powered fertilizer recommendations
 *
 * Endpoints:
 * - POST /api/ai/fertilizer/recommend - Generate fertilizer recommendation
 * - GET /api/fertilizer-products - List GACP-approved fertilizer products
 * - GET /api/fertilizer-products/:id - Get product details
 * - POST /api/fertilizer-products - Create new product (Admin only)
 */

const fertilizerService = require('../../services/ai/fertilizer-recommendation.service');
const FertilizerProduct = require('../../models/FertilizerProduct');

/**
 * Generate fertilizer recommendation
 * POST /api/ai/fertilizer/recommend
 */
exports.generateRecommendation = async (req, res) => {
  try {
    const { farmId, cultivationCycleId, growthStage, options } = req.body;

    // Validate required fields
    if (!farmId) {
      return res.status(400).json({
        success: false,
        error: 'farmId is required',
      });
    }

    if (!cultivationCycleId) {
      return res.status(400).json({
        success: false,
        error: 'cultivationCycleId is required',
      });
    }

    // Generate recommendation
    const recommendation = await fertilizerService.generateRecommendation({
      farmId,
      cultivationCycleId,
      growthStage,
      options: options || {},
    });

    if (!recommendation.success) {
      return res.status(400).json(recommendation);
    }

    // Return recommendation
    return res.status(200).json({
      success: true,
      data: recommendation.recommendation,
      message: 'Fertilizer recommendation generated successfully',
    });
  } catch (error) {
    console.error('Error generating fertilizer recommendation:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Get all GACP-approved fertilizer products
 * GET /api/fertilizer-products
 *
 * Query params:
 * - plantType: Filter by plant (cannabis, turmeric, etc.)
 * - growthStage: Filter by growth stage
 * - region: Filter by available region
 * - organic: true/false - Filter by organic certification
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20)
 */
exports.listProducts = async (req, res) => {
  try {
    const { plantType, growthStage, region, organic, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {
      status: 'active',
      'compliance.gacpApproved': true,
    };

    if (plantType) {
      query['recommendedFor.plants'] = { $in: [plantType, 'all'] };
    }

    if (growthStage) {
      query['recommendedFor.growthStages'] = { $in: [growthStage, 'all'] };
    }

    if (region) {
      query['availability.availableRegions'] = { $in: [region] };
    }

    if (organic === 'true') {
      query['compliance.organicCertified'] = true;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await FertilizerProduct.find(query)
      .sort({ 'performance.userSatisfaction.rating': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await FertilizerProduct.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error listing fertilizer products:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Get fertilizer product by ID
 * GET /api/fertilizer-products/:id
 */
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await FertilizerProduct.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error getting fertilizer product:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Search fertilizer products
 * GET /api/fertilizer-products/search
 *
 * Query params:
 * - q: Search query (product name, brand, NPK ratio)
 */
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
    }

    const products = await FertilizerProduct.searchProducts(q);

    return res.status(200).json({
      success: true,
      data: {
        products,
        count: products.length,
      },
    });
  } catch (error) {
    console.error('Error searching fertilizer products:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Get products for specific growth stage
 * GET /api/fertilizer-products/growth-stage/:plantType/:stage
 */
exports.getProductsForStage = async (req, res) => {
  try {
    const { plantType, stage } = req.params;
    const { region } = req.query;

    const products = await FertilizerProduct.getForGrowthStage(plantType, stage, region || null);

    return res.status(200).json({
      success: true,
      data: {
        products,
        count: products.length,
        plantType,
        growthStage: stage,
        region: region || 'all',
      },
    });
  } catch (error) {
    console.error('Error getting products for growth stage:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Get top-rated products
 * GET /api/fertilizer-products/top-rated
 */
exports.getTopRated = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await FertilizerProduct.getTopRated(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: {
        products,
        count: products.length,
      },
    });
  } catch (error) {
    console.error('Error getting top-rated products:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Create new fertilizer product (Admin only)
 * POST /api/fertilizer-products
 */
exports.createProduct = async (req, res) => {
  try {
    // TODO: Add admin authentication check
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Unauthorized - Admin access required',
    //   });
    // }

    const productData = req.body;

    // Validate required fields
    if (!productData.productId) {
      return res.status(400).json({
        success: false,
        error: 'productId is required',
      });
    }

    if (!productData.productName) {
      return res.status(400).json({
        success: false,
        error: 'productName is required',
      });
    }

    if (!productData.npkRatio) {
      return res.status(400).json({
        success: false,
        error: 'npkRatio is required',
      });
    }

    // Create product
    const product = new FertilizerProduct(productData);
    await product.save();

    return res.status(201).json({
      success: true,
      data: product,
      message: 'Fertilizer product created successfully',
    });
  } catch (error) {
    console.error('Error creating fertilizer product:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Product with this ID or registration number already exists',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Update fertilizer product (Admin only)
 * PUT /api/fertilizer-products/:id
 */
exports.updateProduct = async (req, res) => {
  try {
    // TODO: Add admin authentication check

    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating certain fields
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const product = await FertilizerProduct.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Error updating fertilizer product:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Delete fertilizer product (Admin only)
 * DELETE /api/fertilizer-products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    // TODO: Add admin authentication check

    const { id } = req.params;

    // Soft delete - set status to discontinued
    const product = await FertilizerProduct.findByIdAndUpdate(
      id,
      { status: 'discontinued' },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product discontinued successfully',
    });
  } catch (error) {
    console.error('Error deleting fertilizer product:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Add review to product
 * POST /api/fertilizer-products/:id/reviews
 */
exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewData = req.body;

    // TODO: Add user authentication and attach user ID
    // reviewData.userId = req.user._id;

    const product = await FertilizerProduct.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Validate review data
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
      });
    }

    // Add review
    await product.addReview(reviewData);

    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: {
        newRating: product.performance.userSatisfaction.rating,
        numberOfReviews: product.performance.userSatisfaction.numberOfReviews,
      },
    });
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};
