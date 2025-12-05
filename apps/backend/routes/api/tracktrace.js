const express = require('express');
const router = express.Router();
const ProductBatch = require('../../models/ProductBatchModel');
const { authenticate } = require('../../middleware/AuthMiddleware');

/**
 * @route GET /api/track-trace/lookup/:productCode
 * @desc Lookup product by QR code or batch code
 * @access Public
 */
router.get('/lookup/:productCode', async (req, res) => {
  try {
    const { productCode } = req.params;

    // Find product details with populated fields
    const product = await ProductBatch.findOne({ batchCode: productCode })
      .populate('farmer', 'name')
      .populate('farm', 'name location'); // Assuming Farm has these fields or adjusting based on model

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code: productCode,
      });
    }

    // Format response to match expected public API structure with nested objects if needed
    // Assuming simple mapping is sufficient or FE can handle the flat structure

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/track-trace/farmer/products
 * @desc Get all products for farmer dashboard
 * @access Private (authenticated farmer)
 */
router.get('/farmer/products', authenticate, async (req, res) => {
  try {
    const products = await ProductBatch.find({ farmer: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route POST /api/track-trace/farmer/products
 * @desc Create new product batch
 * @access Private (authenticated farmer)
 */
router.post('/farmer/products', authenticate, async (req, res) => {
  try {
    const { productName, variety, quantity, unit, farmId } = req.body;

    // Generate new batch code
    const count = await ProductBatch.countDocuments();
    const batchCode = `${productName.substr(0, 2).toUpperCase()}${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const newProduct = new ProductBatch({
      batchCode,
      productName,
      variety,
      quantity: Number(quantity),
      unit,
      farmer: req.user.userId,
      farm: farmId,
      currentStage: 'Planting',
      certificationStatus: 'PENDING',
      timeline: [{
        stage: 'Planting',
        description: 'Initial planting',
        date: new Date()
      }]
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product batch created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/track-trace/farmer/products/:id
 * @desc Update product batch
 * @access Private (authenticated farmer)
 */
router.put('/farmer/products/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the product belongs to the farmer
    const product = await ProductBatch.findOne({ _id: id, farmer: req.user.userId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update allowed fields
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      // Prevent updating critical fields like batchCode, farmer
      if (!['batchCode', 'farmer', '_id', 'createdAt'].includes(key)) {
        product[key] = updates[key];
      }
    });

    // If stage changed, add to timeline
    if (updates.currentStage && updates.currentStage !== product.currentStage) {
      product.timeline.push({
        stage: updates.currentStage,
        date: new Date(),
        description: `Stage updated to ${updates.currentStage}`
      });
    }

    await product.save();

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/track-trace/farmer/products/:id
 * @desc Delete product batch
 * @access Private (authenticated farmer)
 */
router.delete('/farmer/products/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await ProductBatch.findOneAndDelete({ _id: id, farmer: req.user.userId });

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: deletedProduct,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/track-trace/farmer/stats
 * @desc Get farmer dashboard statistics
 * @access Private (authenticated farmer)
 */
router.get('/farmer/stats', authenticate, async (req, res) => {
  try {
    const stats = {
      totalProducts: await ProductBatch.countDocuments({ farmer: req.user.userId }),
      certified: await ProductBatch.countDocuments({ farmer: req.user.userId, certificationStatus: 'CERTIFIED' }),
      pending: await ProductBatch.countDocuments({ farmer: req.user.userId, certificationStatus: 'PENDING' }),
      inProgress: await ProductBatch.countDocuments({
        farmer: req.user.userId,
        currentStage: { $in: ['Planting', 'Harvesting', 'Processing'] }
      }),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/track-trace/health
 * @desc Health check for Track & Trace API
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'track-trace',
    timestamp: new Date().toISOString(),
    dbConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: [
      'GET /api/track-trace/lookup/:productCode',
      'GET /api/track-trace/farmer/products',
      'POST /api/track-trace/farmer/products',
      'PUT /api/track-trace/farmer/products/:id',
      'DELETE /api/track-trace/farmer/products/:id',
      'GET /api/track-trace/farmer/stats',
    ],
  });
});

module.exports = router;
