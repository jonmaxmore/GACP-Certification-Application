/**
 * Connection Health Check Utility
 * Monitors all system connections (Database, Redis, External APIs)
 */

const mongoose = require('mongoose');

class ConnectionHealthChecker {
  constructor(logger) {
    this.logger = logger;
    this.connections = new Map();
  }

  /**
   * Register a connection to monitor
   */
  registerConnection(name, checkFn) {
    this.connections.set(name, checkFn);
  }

  /**
   * Check MongoDB connection
   */
  async checkMongoDB() {
    try {
      if (mongoose.connection.readyState === 1) {
        const result = await mongoose.connection.db.admin().ping();
        return { status: 'healthy', latency: result.ok ? 'low' : 'unknown' };
      }
      return { status: 'disconnected' };
    } catch (error) {
      this.logger.error('MongoDB health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  /**
   * Check all registered connections
   */
  async checkAll() {
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      connections: {},
    };

    // Check MongoDB
    results.connections.mongodb = await this.checkMongoDB();

    // Check other registered connections
    for (const [name, checkFn] of this.connections.entries()) {
      try {
        results.connections[name] = await checkFn();
      } catch (error) {
        this.logger.error(`Health check failed for ${name}:`, error);
        results.connections[name] = { status: 'error', error: error.message };
      }
    }

    // Determine overall health
    const statuses = Object.values(results.connections).map(c => c.status);
    if (statuses.some(s => s === 'unhealthy' || s === 'error')) {
      results.overall = 'unhealthy';
    } else if (statuses.some(s => s === 'degraded')) {
      results.overall = 'degraded';
    }

    return results;
  }

  /**
   * Express middleware for health check endpoint
   */
  middleware() {
    return async (req, res) => {
      const health = await this.checkAll();
      const statusCode = health.overall === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    };
  }
}

module.exports = ConnectionHealthChecker;
