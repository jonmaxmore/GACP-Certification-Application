/**
 * System health check API
 */
const express = require('express');
const router = express.Router();
const mongoManager = require('../config/mongodb-manager');
const os = require('os');

router.get('/health', async (req, res) => {
  // MongoDB health
  const mongoHealth = await mongoManager.healthCheck();

  // System health
  const systemHealth = {
    uptime: process.uptime(),
    memory: {
      free: os.freemem(),
      total: os.totalmem(),
      usage: (1 - os.freemem() / os.totalmem()) * 100,
    },
    cpu: os.loadavg(),
    hostname: os.hostname(),
  };

  // Determine overall status
  const isHealthy = mongoHealth.status === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    mongodb: mongoHealth,
    system: systemHealth,
  });
});

router.post('/mongodb/reconnect', async (req, res) => {
  const result = await mongoManager.forceReconnect();
  res.json({
    success: result,
    message: result ? 'Reconnection successful' : 'Reconnection failed',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
