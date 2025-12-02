/**
 * Simple Dashboard Routes for GACP System
 */

const express = require('express');
const router = express.Router();

// Dashboard overview
router.get('/', (req, res) => {
  res.json({
    message: 'GACP Dashboard Service',
    status: 'operational',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    statistics: {
      totalApplications: 0,
      activeCertificates: 0,
      pendingReviews: 0,
      registeredFarmers: 0,
    },
  });
});

// Dashboard stats
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      applications: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
      certificates: {
        active: 0,
        expired: 0,
        revoked: 0,
      },
      users: {
        farmers: 0,
        inspectors: 0,
        admins: 0,
      },
    },
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    service: 'dashboard-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
