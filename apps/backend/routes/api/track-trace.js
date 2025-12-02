const express = require('express');
const router = express.Router();

// Mock data for Track & Trace functionality
const mockTrackingData = {
  'OR2024-001': {
    serial: 'OR2024-001',
    product: {
      name: 'Organic Rice',
      type: 'GACP Certified',
      batch: 'OR2024-001',
      variety: 'Jasmine Rice',
      grade: 'Grade A',
      quantity: 1000,
      unit: 'kg',
    },
    origin: {
      farm: 'สวนข้าวอินทรีย์ บ้านนา',
      farmer: 'นายสมชาย ใจดี',
      location: 'ตำบลบ้านนา อำเภอเมือง จังหวัดเชียงใหม่',
      coordinates: { lat: 18.7883, lng: 98.9853 },
      certification: 'GACP-TH-2024-001',
    },
    timeline: [
      {
        date: '2024-01-15',
        stage: 'Planting',
        location: 'Farm Field A1',
        description: 'Rice seeds planted according to GACP standards',
        verifiedBy: 'Farm Manager',
      },
      {
        date: '2024-04-15',
        stage: 'Harvesting',
        location: 'Farm Field A1',
        description: 'Rice harvested at optimal maturity',
        verifiedBy: 'Quality Inspector',
      },
      {
        date: '2024-04-20',
        stage: 'Processing',
        location: 'Processing Facility',
        description: 'Rice processed and packaged',
        verifiedBy: 'Processing Manager',
      },
      {
        date: '2024-04-25',
        stage: 'Distribution',
        location: 'Distribution Center',
        description: 'Ready for distribution',
        verifiedBy: 'Distribution Manager',
      },
    ],
    certification: {
      status: 'CERTIFIED',
      number: 'GACP-TH-2024-001',
      issuedDate: '2024-04-25',
      expiryDate: '2025-04-25',
      authority: 'GACP Thailand Authority',
    },
    qrData: {
      url: 'https://gacp-platform.com/verify/OR2024-001',
      generatedAt: '2024-04-25T10:00:00Z',
    },
  },
  'TM2024-002': {
    serial: 'TM2024-002',
    product: {
      name: 'Turmeric Powder',
      type: 'GACP Certified',
      batch: 'TM2024-002',
      variety: 'Curcuma longa',
      grade: 'Premium',
      quantity: 500,
      unit: 'kg',
    },
    origin: {
      farm: 'สวนขมิ้นอินทรีย์ บ้านดอย',
      farmer: 'นางสาวมณี ใจงาม',
      location: 'ตำบลดอยสะเก็ด อำเภอดอยสะเก็ด จังหวัดเชียงใหม่',
      coordinates: { lat: 18.8956, lng: 99.1234 },
      certification: 'GACP-TH-2024-002',
    },
    timeline: [
      {
        date: '2024-01-10',
        stage: 'Planting',
        location: 'Farm Field B2',
        description: 'Turmeric rhizomes planted in organic soil',
        verifiedBy: 'Farm Manager',
      },
      {
        date: '2024-10-10',
        stage: 'Harvesting',
        location: 'Farm Field B2',
        description: 'Turmeric harvested after 9 months',
        verifiedBy: 'Quality Inspector',
      },
      {
        date: '2024-10-15',
        stage: 'Processing',
        location: 'Processing Facility',
        description: 'Turmeric cleaned, dried, and ground to powder',
        verifiedBy: 'Processing Manager',
      },
    ],
    certification: {
      status: 'CERTIFIED',
      number: 'GACP-TH-2024-002',
      issuedDate: '2024-10-15',
      expiryDate: '2025-10-15',
      authority: 'GACP Thailand Authority',
    },
    qrData: {
      url: 'https://gacp-platform.com/verify/TM2024-002',
      generatedAt: '2024-10-15T10:00:00Z',
    },
  },
};

// Mock farmer products data for dashboard
const mockFarmerProducts = [
  {
    id: '1',
    batchCode: 'OR2024-001',
    productName: 'Organic Rice',
    variety: 'Jasmine Rice',
    quantity: 1000,
    unit: 'kg',
    stage: 'Distribution',
    certificationStatus: 'CERTIFIED',
    createdDate: '2024-01-15',
    lastUpdated: '2024-04-25',
  },
  {
    id: '2',
    batchCode: 'TM2024-002',
    productName: 'Turmeric Powder',
    variety: 'Curcuma longa',
    quantity: 500,
    unit: 'kg',
    stage: 'Processing',
    certificationStatus: 'CERTIFIED',
    createdDate: '2024-01-10',
    lastUpdated: '2024-10-15',
  },
  {
    id: '3',
    batchCode: 'GB2024-003',
    productName: 'Ginger Extract',
    variety: 'Zingiber officinale',
    quantity: 200,
    unit: 'kg',
    stage: 'Harvesting',
    certificationStatus: 'PENDING',
    createdDate: '2024-02-01',
    lastUpdated: '2024-08-15',
  },
];

/**
 * @route GET /api/track-trace/lookup/:productCode
 * @desc Lookup product by QR code or batch code
 * @access Public
 */
router.get('/lookup/:productCode', (req, res) => {
  try {
    const { productCode } = req.params;
    const product = mockTrackingData[productCode];

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code: productCode,
      });
    }

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
router.get('/farmer/products', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockFarmerProducts,
      total: mockFarmerProducts.length,
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
router.post('/farmer/products', (req, res) => {
  try {
    const { productName, variety, quantity, unit } = req.body;

    // Generate new batch code
    const batchCode = `${productName.substr(0, 2).toUpperCase()}${new Date().getFullYear()}-${String(mockFarmerProducts.length + 1).padStart(3, '0')}`;

    const newProduct = {
      id: String(mockFarmerProducts.length + 1),
      batchCode,
      productName,
      variety,
      quantity: Number(quantity),
      unit,
      stage: 'Planting',
      certificationStatus: 'PENDING',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    mockFarmerProducts.push(newProduct);

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
router.put('/farmer/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = mockFarmerProducts.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const updatedProduct = {
      ...mockFarmerProducts[productIndex],
      ...req.body,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    mockFarmerProducts[productIndex] = updatedProduct;

    res.json({
      success: true,
      data: updatedProduct,
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
router.delete('/farmer/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = mockFarmerProducts.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const deletedProduct = mockFarmerProducts.splice(productIndex, 1)[0];

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
router.get('/farmer/stats', (req, res) => {
  try {
    const stats = {
      totalProducts: mockFarmerProducts.length,
      certified: mockFarmerProducts.filter(p => p.certificationStatus === 'CERTIFIED').length,
      pending: mockFarmerProducts.filter(p => p.certificationStatus === 'PENDING').length,
      inProgress: mockFarmerProducts.filter(p =>
        ['Planting', 'Harvesting', 'Processing'].includes(p.stage),
      ).length,
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
