/**
 * Health Check Endpoint
 * Provides system health status including database connectivity
 */

/**
 * Mount health check endpoint
 * @param {Object} app - Express application
 * @param {Object} mongoManager - MongoDB manager instance
 */
function mountHealth(app, mongoManager) {
  app.get('/health', async (req, res) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      checks: {},
    };

    try {
      // Check MongoDB connection
      if (mongoManager && mongoManager.isConnected()) {
        const db = mongoManager.getDb();
        await db.admin().ping();
        health.checks.mongodb = { status: 'ok', connected: true };
      } else {
        health.checks.mongodb = { status: 'error', connected: false };
        health.status = 'degraded';
      }
    } catch (error) {
      health.checks.mongodb = {
        status: 'error',
        connected: false,
        error: error.message,
      };
      health.status = 'error';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    health.checks.memory = {
      status: 'ok',
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    };

    // Overall status code
    const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 503 : 500;

    res.status(statusCode).json(health);
  });

  // Readiness probe (for Kubernetes/container orchestration)
  app.get('/ready', async (req, res) => {
    try {
      if (mongoManager && mongoManager.isConnected()) {
        const db = mongoManager.getDb();
        await db.admin().ping();
        res.status(200).json({ ready: true });
      } else {
        res.status(503).json({ ready: false, reason: 'database_not_connected' });
      }
    } catch (error) {
      res.status(503).json({ ready: false, reason: error.message });
    }
  });

  // Liveness probe
  app.get('/live', (req, res) => {
    res.status(200).json({ alive: true, uptime: process.uptime() });
  });

  console.log('✅ Health endpoints mounted: /health, /ready, /live');
}

module.exports = { mountHealth };
