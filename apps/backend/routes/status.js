// Create or modify this file:

const express = require('express');
const router = express.Router();
const mongoManager = require('../config/mongodb-manager');

// Simple status endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Botanical Audit Framework API is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoManager.getStatus(),
  });
});

module.exports = router;
