/**
 * Simple Compliance Routes for GACP System
 */

const express = require('express');
const router = express.Router();

// Compliance standards
router.get('/standards', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'GACP Basic Standards',
        version: '1.0',
        status: 'active',
      },
    ],
  });
});

// Parameters
router.get('/parameters', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Soil Quality',
        category: 'environmental',
        required: true,
      },
    ],
  });
});

// Comparison
router.post('/comparison', (req, res) => {
  res.json({
    success: true,
    data: {
      comparisonId: Date.now(),
      status: 'completed',
      results: [],
    },
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    service: 'compliance-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
