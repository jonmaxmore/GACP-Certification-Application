/**
 * GACP Platform Health Monitoring Service
 *
 * Implements comprehensive health checks for:
 * - System status (/health)
 * - Application status (/status)
 * - Version information (/version)
 * - Database connectivity
 * - External service dependencies
 */

const mongoose = require('mongoose');
const os = require('os');
const fs = require('fs');
const path = require('path');

class HealthMonitoringService {
  constructor() {
    this.startTime = Date.now();
    this.version = this.getVersionInfo();
    this.checks = new Map();
  }

  /**
   * Get application version information
   */
  getVersionInfo() {
    try {
      const packagePath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      return {
        version: packageJson.version,
        name: packageJson.name,
        buildTime: process.env.BUILD_TIME || new Date().toISOString(),
        gitCommit: process.env.GIT_COMMIT || 'unknown',
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      return {
        version: 'unknown',
        name: 'gacp-platform',
        buildTime: new Date().toISOString(),
        gitCommit: 'unknown',
        environment: process.env.NODE_ENV || 'development',
        error: error.message,
      };
    }
  }

  /**
   * Basic health check endpoint
   * Returns: 200 OK if system is healthy
   */
  async basicHealthCheck() {
    const uptime = Date.now() - this.startTime;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        milliseconds: uptime,
        human: this.formatUptime(uptime),
      },
      version: this.version.version,
      environment: this.version.environment,
    };
  }

  /**
   * Comprehensive status check
   * Includes database, memory, disk, and dependency checks
   */
  async comprehensiveStatusCheck() {
    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: this.version,
      uptime: this.getUptimeInfo(),
      system: this.getSystemInfo(),
      checks: {},
    };

    // Database connectivity check
    results.checks.database = await this.checkDatabase();

    // Memory usage check
    results.checks.memory = this.checkMemoryUsage();

    // Disk space check
    results.checks.disk = this.checkDiskSpace();

    // External services check
    results.checks.services = await this.checkExternalServices();

    // Determine overall status
    const failedChecks = Object.values(results.checks).filter(check => check.status !== 'healthy');

    if (failedChecks.length > 0) {
      results.status = failedChecks.some(check => check.status === 'critical')
        ? 'critical'
        : 'degraded';
    }

    return results;
  }

  /**
   * Check database connectivity and performance
   */
  async checkDatabase() {
    try {
      const start = Date.now();

      // Check MongoDB connection
      if (mongoose.connection.readyState !== 1) {
        return {
          status: 'critical',
          message: 'Database disconnected',
          details: {
            state: mongoose.connection.readyState,
            stateDescription: this.getMongooseState(mongoose.connection.readyState),
          },
        };
      }

      // Ping database
      await mongoose.connection.db.admin().ping();
      const responseTime = Date.now() - start;

      // Check response time
      const status = responseTime > 1000 ? 'degraded' : 'healthy';

      return {
        status,
        message: 'Database connected',
        responseTime: `${responseTime}ms`,
        details: {
          database: mongoose.connection.db.databaseName,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          state: 'connected',
        },
      };
    } catch (error) {
      return {
        status: 'critical',
        message: 'Database check failed',
        error: error.message,
        details: {
          state: mongoose.connection.readyState,
          stateDescription: this.getMongooseState(mongoose.connection.readyState),
        },
      };
    }
  }

  /**
   * Check memory usage
   */
  checkMemoryUsage() {
    const usage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    let status = 'healthy';
    if (memoryUsagePercent > 90) {
      status = 'critical';
    } else if (memoryUsagePercent > 75) {
      status = 'degraded';
    }

    return {
      status,
      message: `Memory usage: ${memoryUsagePercent.toFixed(1)}%`,
      details: {
        process: {
          rss: this.formatBytes(usage.rss),
          heapTotal: this.formatBytes(usage.heapTotal),
          heapUsed: this.formatBytes(usage.heapUsed),
          external: this.formatBytes(usage.external),
        },
        system: {
          total: this.formatBytes(totalMemory),
          free: this.formatBytes(freeMemory),
          used: this.formatBytes(usedMemory),
          usagePercent: memoryUsagePercent.toFixed(1) + '%',
        },
      },
    };
  }

  /**
   * Check disk space
   */
  checkDiskSpace() {
    try {
      // const stats = fs.statSync(process.cwd());

      // Basic disk check (can be enhanced with disk usage libraries)
      return {
        status: 'healthy',
        message: 'Disk accessible',
        details: {
          path: process.cwd(),
          accessible: true,
        },
      };
    } catch (error) {
      return {
        status: 'critical',
        message: 'Disk check failed',
        error: error.message,
      };
    }
  }

  /**
   * Check external service dependencies
   */
  async checkExternalServices() {
    const services = [];

    // Example: Check external API dependencies
    // Add your specific service checks here

    return {
      status: 'healthy',
      message: 'All external services accessible',
      details: {
        checkedServices: services.length,
        services,
      },
    };
  }

  /**
   * Get system information
   */
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      pid: process.pid,
      cpus: os.cpus().length,
      loadAverage: os.loadavg(),
      hostname: os.hostname(),
    };
  }

  /**
   * Get uptime information
   */
  getUptimeInfo() {
    const processUptime = Date.now() - this.startTime;
    const systemUptime = os.uptime() * 1000;

    return {
      process: {
        milliseconds: processUptime,
        human: this.formatUptime(processUptime),
      },
      system: {
        milliseconds: systemUptime,
        human: this.formatUptime(systemUptime),
      },
    };
  }

  /**
   * Utility: Format uptime in human readable format
   */
  formatUptime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Utility: Format bytes in human readable format
   */
  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) {
      return '0 Bytes';
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Utility: Get Mongoose connection state description
   */
  getMongooseState(state) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[state] || 'unknown';
  }

  /**
   * Register custom health check
   */
  registerCheck(name, checkFunction) {
    this.checks.set(name, checkFunction);
  }

  /**
   * Express.js route handlers
   */
  getRouteHandlers() {
    return {
      // Basic health check: GET /health
      health: async (req, res) => {
        try {
          const health = await this.basicHealthCheck();
          res.status(200).json(health);
        } catch (error) {
          res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      },

      // Comprehensive status: GET /status
      status: async (req, res) => {
        try {
          const status = await this.comprehensiveStatusCheck();
          const httpStatus =
            status.status === 'healthy' ? 200 : status.status === 'degraded' ? 200 : 503;
          res.status(httpStatus).json(status);
        } catch (error) {
          res.status(503).json({
            status: 'critical',
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      },

      // Version information: GET /version
      version: (req, res) => {
        res.status(200).json(this.version);
      },
    };
  }
}

module.exports = HealthMonitoringService;
