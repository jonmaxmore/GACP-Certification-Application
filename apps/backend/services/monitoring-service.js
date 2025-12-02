/**
 * System Monitoring Service
 * Tracks system health and performance metrics
 */

const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../shared').logger;
const mongoManager = require('../config/mongodb-manager');

const monitorLogger = logger.createLogger('monitor-service');

class MonitoringService {
  constructor() {
    this.metricsInterval = null;
    this.healthCheckInterval = null;
    this.metrics = {
      system: {
        startTime: Date.now(),
        lastMetricTime: Date.now(),
        cpuUsage: [],
        memoryUsage: [],
        activeConnections: 0,
      },
      mongodb: {
        isConnected: false,
        reconnectAttempts: 0,
        lastReconnectTime: null,
      },
      errors: {
        count: 0,
        last: null,
      },
    };
  }

  start() {
    monitorLogger.info('Starting monitoring service');

    // Collect metrics every minute
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 60000);

    // Check system health every 5 minutes
    this.healthCheckInterval = setInterval(() => {
      this.checkSystemHealth();
    }, 300000);

    // Capture uncaught errors
    process.on('uncaughtException', error => {
      this.logError('uncaughtException', error);
    });

    process.on('unhandledRejection', reason => {
      this.logError('unhandledRejection', reason);
    });

    // Initial collection
    this.collectMetrics();
    this.checkSystemHealth();

    return this;
  }

  async collectMetrics() {
    try {
      const now = Date.now();

      // System metrics
      const cpuLoad = os.loadavg()[0]; // 1 minute average
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memUsage = ((totalMem - freeMem) / totalMem) * 100;

      // MongoDB status
      const mongoStatus = mongoManager.getStatus();

      // Update metrics
      this.metrics.system.lastMetricTime = now;
      this.metrics.system.cpuUsage.push({ timestamp: now, value: cpuLoad });
      this.metrics.system.memoryUsage.push({ timestamp: now, value: memUsage });

      this.metrics.mongodb.isConnected = mongoStatus.isConnected;

      // Keep only last 24 hours of metrics
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      this.metrics.system.cpuUsage = this.metrics.system.cpuUsage.filter(
        m => m.timestamp > oneDayAgo,
      );
      this.metrics.system.memoryUsage = this.metrics.system.memoryUsage.filter(
        m => m.timestamp > oneDayAgo,
      );

      // Log current status
      monitorLogger.debug(
        `Metrics collected: CPU: ${cpuLoad.toFixed(2)}, Memory: ${memUsage.toFixed(2)}%, MongoDB: ${
          mongoStatus.isConnected ? 'connected' : 'disconnected'
        }`,
      );

      // Save metrics to file periodically (every hour)
      if (now % (60 * 60 * 1000) < 60000) {
        await this.saveMetricsToFile();
      }
    } catch (error) {
      monitorLogger.error('Error collecting metrics:', error);
    }
  }

  async saveMetricsToFile() {
    try {
      const metricsDir = path.join(__dirname, '../logs/metrics');

      // Create directory if it doesn't exist
      await fs.mkdir(metricsDir, { recursive: true });

      const date = new Date().toISOString().split('T')[0];
      const filePath = path.join(metricsDir, `metrics-${date}.json`);

      await fs.writeFile(filePath, JSON.stringify(this.metrics, null, 2));

      monitorLogger.info(`Metrics saved to ${filePath}`);
    } catch (error) {
      monitorLogger.error('Error saving metrics to file:', error);
    }
  }

  async checkSystemHealth() {
    try {
      // Check MongoDB health
      const mongoHealth = await mongoManager.healthCheck();

      // Check disk space
      const diskInfo = await this.checkDiskSpace();

      // Log health status
      monitorLogger.info(`Health check: MongoDB: ${mongoHealth.status}, Disk: ${diskInfo.status}`);

      // Take action if necessary
      if (mongoHealth.status !== 'healthy') {
        monitorLogger.warn('MongoDB health check failed, attempting reconnect');
        await mongoManager.forceReconnect();
      }

      if (diskInfo.status !== 'healthy') {
        monitorLogger.warn(`Low disk space: ${diskInfo.freeSpace}% available`);
        // You could add notification logic here
      }

      return {
        timestamp: new Date().toISOString(),
        mongodb: mongoHealth,
        disk: diskInfo,
        memory: {
          usage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
          free: os.freemem(),
          total: os.totalmem(),
        },
      };
    } catch (error) {
      monitorLogger.error('Error checking system health:', error);
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  async checkDiskSpace() {
    // This is a simplified version - you might want to use a library like 'diskusage'
    try {
      const rootDir = path.parse(process.cwd()).root;
      const stats = await fs.statfs(rootDir);

      const totalSpace = stats.blocks * stats.bsize;
      const freeSpace = stats.bfree * stats.bsize;
      const percentFree = (freeSpace / totalSpace) * 100;

      return {
        status: percentFree > 10 ? 'healthy' : 'warning',
        freeSpace: percentFree.toFixed(2),
        totalBytes: totalSpace,
        freeBytes: freeSpace,
      };
    } catch (error) {
      // Fallback for environments where statfs isn't available
      return {
        status: 'unknown',
        error: error.message,
      };
    }
  }

  logError(type, error) {
    this.metrics.errors.count++;
    this.metrics.errors.last = {
      type,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    monitorLogger.error(`${type}: ${error.message}`);
  }

  getMetrics() {
    return {
      ...this.metrics,
      system: {
        ...this.metrics.system,
        uptime: process.uptime(),
        totalUptime: (Date.now() - this.metrics.system.startTime) / 1000,
      },
    };
  }

  stop() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    monitorLogger.info('Monitoring service stopped');
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

module.exports = monitoringService;
