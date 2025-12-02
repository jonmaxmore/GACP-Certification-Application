// Simple Health Check for GACP Standards System
const express = require('express');
const mongoose = require('mongoose');

// Basic health check service
const createHealthCheck = () => {
  const router = express.Router();

  // Basic ping endpoint
  router.get('/ping', (req, res) => {
    res.json({
      success: true,
      message: 'pong',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Basic health endpoint
  router.get('/', async (req, res) => {
    try {
      // Check MongoDB connection
      const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      const isHealthy = mongoose.connection.readyState === 1;

      const health = {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        node_version: process.version,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          percentage: Math.round(
            (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
          ),
        },
        database: {
          mongodb: {
            status: mongoStatus,
            connected: mongoose.connection.readyState === 1,
          },
        },
      };

      const statusCode = isHealthy ? 200 : 503;

      res.status(statusCode).json({
        success: isHealthy,
        data: health,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Database health check
  router.get('/database', async (req, res) => {
    try {
      const dbHealth = {
        mongodb: {
          status: 'disconnected',
          readyState: mongoose.connection.readyState,
          host: null,
          name: null,
        },
      };

      // Check MongoDB connection
      if (mongoose.connection.readyState === 1) {
        // Test database with a simple ping
        await mongoose.connection.db.admin().ping();

        dbHealth.mongodb = {
          status: 'connected',
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name,
          collections: Object.keys(mongoose.connection.collections).length,
        };
      }

      const isHealthy = dbHealth.mongodb.status === 'connected';

      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        data: dbHealth,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // System info endpoint
  router.get('/system', (req, res) => {
    try {
      const memoryUsage = process.memoryUsage();

      const systemInfo = {
        platform: process.platform,
        arch: process.arch,
        node_version: process.version,
        uptime: process.uptime(),
        pid: process.pid,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB',
          heapUsagePercentage:
            Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100) + '%',
        },
        cpu: process.cpuUsage(),
        env: process.env.NODE_ENV || 'development',
      };

      res.json({
        success: true,
        data: systemInfo,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Readiness probe (Kubernetes style)
  router.get('/ready', async (req, res) => {
    try {
      let isReady = true;
      const reasons = [];

      // Check MongoDB connection
      if (mongoose.connection.readyState !== 1) {
        isReady = false;
        reasons.push('Database not connected');
      }

      // Check if essential environment variables are set
      const requiredEnvVars = ['NODE_ENV'];
      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          isReady = false;
          reasons.push(`Missing environment variable: ${envVar}`);
        }
      }

      const response = {
        success: isReady,
        status: isReady ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
      };

      if (!isReady) {
        response.reasons = reasons;
      }

      res.status(isReady ? 200 : 503).json(response);
    } catch (error) {
      res.status(503).json({
        success: false,
        status: 'not_ready',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Liveness probe (Kubernetes style)
  router.get('/live', (req, res) => {
    res.json({
      success: true,
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  return router;
};

module.exports = createHealthCheck;
