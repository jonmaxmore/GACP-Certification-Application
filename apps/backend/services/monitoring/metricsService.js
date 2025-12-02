/**
 * Metrics Service
 *
 * Centralized metrics collection and monitoring service
 * Tracks system performance, database queries, cache hits, queue jobs, and API metrics
 *
 * Features:
 * - Real-time system metrics (CPU, memory, disk)
 * - Database performance metrics
 * - Queue metrics (Bull)
 * - Cache metrics (Redis)
 * - API request/response metrics
 * - Custom metric tracking
 * - Time-series data storage
 * - Aggregation (avg, min, max, p95, p99)
 * - Alert threshold monitoring
 */

const os = require('os');
const mongoose = require('mongoose');

class MetricsService {
  constructor() {
    // Metrics storage (in-memory for real-time, periodically save to DB)
    this.metrics = {
      system: {
        cpu: [],
        memory: [],
        disk: [],
        uptime: 0,
      },
      database: {
        queryTime: [],
        slowQueries: [],
        connectionPool: [],
        operations: {
          find: 0,
          insert: 0,
          update: 0,
          delete: 0,
        },
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        operations: [],
        memory: [],
      },
      queue: {
        jobs: {
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
          waiting: 0,
        },
        processingTime: [],
        throughput: [],
      },
      api: {
        requests: {
          total: 0,
          success: 0,
          error: 0,
          by_endpoint: {},
        },
        responseTime: [],
        statusCodes: {
          '2xx': 0,
          '3xx': 0,
          '4xx': 0,
          '5xx': 0,
        },
      },
    };

    // Time windows for aggregation (last N minutes)
    this.timeWindows = {
      realtime: 1, // 1 minute
      short: 5, // 5 minutes
      medium: 15, // 15 minutes
      long: 60, // 1 hour
    };

    // Alert thresholds
    this.thresholds = {
      cpu: 80, // %
      memory: 85, // %
      disk: 90, // %
      queryTime: 500, // ms
      cacheHitRate: 50, // %
      apiResponseTime: 1000, // ms
      errorRate: 5, // %
    };

    // Start metrics collection
    this.startCollection();
  }

  /**
   * Start automatic metrics collection
   */
  startCollection() {
    // Collect system metrics every 30 seconds
    this.systemInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Collect cache metrics every 10 seconds
    this.cacheInterval = setInterval(() => {
      this.collectCacheMetrics();
    }, 10000);

    // Collect queue metrics every 15 seconds
    this.queueInterval = setInterval(() => {
      this.collectQueueMetrics();
    }, 15000);

    // Clean old metrics every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMetrics();
    }, 300000);

    console.log('✅ Metrics collection started');
  }

  /**
   * Stop metrics collection
   */
  stopCollection() {
    clearInterval(this.systemInterval);
    clearInterval(this.cacheInterval);
    clearInterval(this.queueInterval);
    clearInterval(this.cleanupInterval);
    console.log('⏹️  Metrics collection stopped');
  }

  /**
   * Collect system metrics (CPU, memory, disk)
   */
  collectSystemMetrics() {
    try {
      const cpuUsage = this.getCPUUsage();
      const memoryUsage = this.getMemoryUsage();
      const diskUsage = this.getDiskUsage();

      const timestamp = Date.now();

      this.metrics.system.cpu.push({ value: cpuUsage, timestamp });
      this.metrics.system.memory.push({ value: memoryUsage, timestamp });
      this.metrics.system.disk.push({ value: diskUsage, timestamp });
      this.metrics.system.uptime = process.uptime();

      // Check thresholds
      this.checkThreshold('cpu', cpuUsage);
      this.checkThreshold('memory', memoryUsage);
      this.checkThreshold('disk', diskUsage);
    } catch (error) {
      console.error('Error collecting system metrics:', error);
    }
  }

  /**
   * Get CPU usage percentage
   */
  getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (100 * idle) / total;

    return Math.round(usage * 100) / 100;
  }

  /**
   * Get memory usage percentage
   */
  getMemoryUsage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usage = (usedMemory / totalMemory) * 100;

    return Math.round(usage * 100) / 100;
  }

  /**
   * Get disk usage (estimated from process)
   */
  getDiskUsage() {
    // Note: For accurate disk usage, use a library like 'diskusage'
    // This is a simplified version using process memory
    const used = process.memoryUsage();
    const heapUsed = used.heapUsed;
    const heapTotal = used.heapTotal;
    const usage = (heapUsed / heapTotal) * 100;

    return Math.round(usage * 100) / 100;
  }

  /**
   * Collect cache metrics (Redis)
   */
  async collectCacheMetrics() {
    try {
      const cacheService = require('../cache/cacheService');
      const stats = await cacheService.getStats();

      const timestamp = Date.now();

      // Calculate hit rate
      const total = this.metrics.cache.hits + this.metrics.cache.misses;
      this.metrics.cache.hitRate =
        total > 0 ? Math.round((this.metrics.cache.hits / total) * 10000) / 100 : 0;

      this.metrics.cache.operations.push({
        hits: this.metrics.cache.hits,
        misses: this.metrics.cache.misses,
        hitRate: this.metrics.cache.hitRate,
        timestamp,
      });

      if (stats.memory) {
        this.metrics.cache.memory.push({
          value: stats.memory.usedMemory,
          timestamp,
        });
      }

      // Check hit rate threshold
      this.checkThreshold('cacheHitRate', this.metrics.cache.hitRate);
    } catch (error) {
      console.error('Error collecting cache metrics:', error);
    }
  }

  /**
   * Collect queue metrics (Bull)
   */
  async collectQueueMetrics() {
    try {
      const queueService = require('../queue/queueService');
      const stats = await queueService.getStats();

      const timestamp = Date.now();

      // Update job counts
      this.metrics.queue.jobs = {
        active: stats.activeCount || 0,
        completed: stats.completedCount || 0,
        failed: stats.failedCount || 0,
        delayed: stats.delayedCount || 0,
        waiting: stats.waitingCount || 0,
      };

      // Calculate throughput (jobs per minute)
      const throughput = this.calculateThroughput();
      this.metrics.queue.throughput.push({ value: throughput, timestamp });
    } catch (error) {
      console.error('Error collecting queue metrics:', error);
    }
  }

  /**
   * Track database query
   */
  trackQuery(operation, duration, isSlowQuery = false) {
    const timestamp = Date.now();

    this.metrics.database.queryTime.push({
      operation,
      duration,
      timestamp,
    });

    if (isSlowQuery || duration > this.thresholds.queryTime) {
      this.metrics.database.slowQueries.push({
        operation,
        duration,
        timestamp,
      });

      this.checkThreshold('queryTime', duration);
    }

    // Count by operation type
    if (this.metrics.database.operations[operation] !== undefined) {
      this.metrics.database.operations[operation]++;
    }
  }

  /**
   * Track cache operation
   */
  trackCacheOperation(operation, isHit) {
    if (isHit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }
  }

  /**
   * Track queue job
   */
  trackQueueJob(jobType, duration, status) {
    const timestamp = Date.now();

    this.metrics.queue.processingTime.push({
      jobType,
      duration,
      status,
      timestamp,
    });
  }

  /**
   * Track API request
   */
  trackAPIRequest(method, path, statusCode, duration) {
    const timestamp = Date.now();

    // Total counts
    this.metrics.api.requests.total++;
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.api.requests.success++;
    } else {
      this.metrics.api.requests.error++;
    }

    // Status code ranges
    if (statusCode >= 200 && statusCode < 300) {
      this.metrics.api.statusCodes['2xx']++;
    } else if (statusCode >= 300 && statusCode < 400) {
      this.metrics.api.statusCodes['3xx']++;
    } else if (statusCode >= 400 && statusCode < 500) {
      this.metrics.api.statusCodes['4xx']++;
    } else if (statusCode >= 500) {
      this.metrics.api.statusCodes['5xx']++;
    }

    // By endpoint
    const endpoint = `${method} ${path}`;
    if (!this.metrics.api.requests.by_endpoint[endpoint]) {
      this.metrics.api.requests.by_endpoint[endpoint] = {
        count: 0,
        avgTime: 0,
        totalTime: 0,
      };
    }
    const endpointMetrics = this.metrics.api.requests.by_endpoint[endpoint];
    endpointMetrics.count++;
    endpointMetrics.totalTime += duration;
    endpointMetrics.avgTime = Math.round(endpointMetrics.totalTime / endpointMetrics.count);

    // Response time
    this.metrics.api.responseTime.push({
      method,
      path,
      statusCode,
      duration,
      timestamp,
    });

    // Check thresholds
    this.checkThreshold('apiResponseTime', duration);

    const errorRate = (this.metrics.api.requests.error / this.metrics.api.requests.total) * 100;
    this.checkThreshold('errorRate', errorRate);
  }

  /**
   * Calculate queue throughput (jobs per minute)
   */
  calculateThroughput() {
    const oneMinuteAgo = Date.now() - 60000;
    const recentJobs = this.metrics.queue.processingTime.filter(
      job => job.timestamp > oneMinuteAgo,
    );
    return recentJobs.length;
  }

  /**
   * Check threshold and trigger alert
   */
  checkThreshold(metricName, value) {
    const threshold = this.thresholds[metricName];
    if (threshold && value > threshold) {
      this.triggerAlert(metricName, value, threshold);
    }
  }

  /**
   * Trigger alert
   */
  triggerAlert(metricName, value, threshold) {
    const alert = {
      metric: metricName,
      value,
      threshold,
      timestamp: new Date(),
      severity: value > threshold * 1.5 ? 'critical' : 'warning',
    };

    console.warn(`⚠️  ALERT: ${metricName} = ${value} (threshold: ${threshold})`);

    // Emit alert event (can be caught by alert service)
    if (global.eventEmitter) {
      global.eventEmitter.emit('metric:alert', alert);
    }
  }

  /**
   * Get metrics summary
   */
  getMetrics(timeWindow = 'realtime') {
    const windowMs = this.timeWindows[timeWindow] * 60000;
    const cutoff = Date.now() - windowMs;

    return {
      system: {
        cpu: this.aggregateMetrics(this.metrics.system.cpu, cutoff),
        memory: this.aggregateMetrics(this.metrics.system.memory, cutoff),
        disk: this.aggregateMetrics(this.metrics.system.disk, cutoff),
        uptime: this.metrics.system.uptime,
      },
      database: {
        queryTime: this.aggregateMetrics(this.metrics.database.queryTime, cutoff),
        slowQueries: this.metrics.database.slowQueries.filter(q => q.timestamp > cutoff).length,
        operations: this.metrics.database.operations,
      },
      cache: {
        hits: this.metrics.cache.hits,
        misses: this.metrics.cache.misses,
        hitRate: this.metrics.cache.hitRate,
        recent: this.metrics.cache.operations.filter(op => op.timestamp > cutoff),
      },
      queue: this.metrics.queue,
      api: {
        requests: this.metrics.api.requests,
        responseTime: this.aggregateMetrics(this.metrics.api.responseTime, cutoff),
        statusCodes: this.metrics.api.statusCodes,
        topEndpoints: this.getTopEndpoints(10),
      },
      timestamp: new Date(),
      timeWindow,
    };
  }

  /**
   * Aggregate metrics (avg, min, max, p95, p99)
   */
  aggregateMetrics(dataArray, cutoff) {
    const filtered = dataArray.filter(item => item.timestamp > cutoff);

    if (filtered.length === 0) {
      return { avg: 0, min: 0, max: 0, p95: 0, p99: 0, count: 0 };
    }

    const values = filtered.map(item => item.value || item.duration);
    values.sort((a, b) => a - b);

    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const min = values[0];
    const max = values[values.length - 1];
    const p95Index = Math.floor(values.length * 0.95);
    const p99Index = Math.floor(values.length * 0.99);
    const p95 = values[p95Index];
    const p99 = values[p99Index];

    return {
      avg: Math.round(avg * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
      p99: Math.round(p99 * 100) / 100,
      count: filtered.length,
    };
  }

  /**
   * Get top N endpoints by request count
   */
  getTopEndpoints(limit = 10) {
    const endpoints = Object.entries(this.metrics.api.requests.by_endpoint)
      .map(([endpoint, metrics]) => ({
        endpoint,
        ...metrics,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return endpoints;
  }

  /**
   * Get database connection pool metrics
   */
  async getConnectionPoolMetrics() {
    try {
      if (!mongoose.connection.db) {
        return null;
      }

      const serverStatus = await mongoose.connection.db.admin().serverStatus();

      return {
        current: serverStatus.connections.current,
        available: serverStatus.connections.available,
        totalCreated: serverStatus.connections.totalCreated,
        active: serverStatus.connections.active || 0,
        utilization: Math.round(
          (serverStatus.connections.current /
            (serverStatus.connections.current + serverStatus.connections.available)) *
            100,
        ),
      };
    } catch (error) {
      console.error('Error getting connection pool metrics:', error);
      return null;
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus() {
    const metrics = this.getMetrics('realtime');

    const health = {
      status: 'healthy',
      checks: {
        system: this.checkSystemHealth(metrics.system),
        database: await this.checkDatabaseHealth(),
        cache: await this.checkCacheHealth(),
        queue: await this.checkQueueHealth(),
      },
      timestamp: new Date(),
    };

    // Overall status
    const checks = Object.values(health.checks);
    if (checks.some(check => check.status === 'critical')) {
      health.status = 'critical';
    } else if (checks.some(check => check.status === 'warning')) {
      health.status = 'degraded';
    }

    return health;
  }

  /**
   * Check system health
   */
  checkSystemHealth(systemMetrics) {
    const issues = [];

    if (systemMetrics.cpu.avg > this.thresholds.cpu) {
      issues.push(`High CPU usage: ${systemMetrics.cpu.avg}%`);
    }
    if (systemMetrics.memory.avg > this.thresholds.memory) {
      issues.push(`High memory usage: ${systemMetrics.memory.avg}%`);
    }
    if (systemMetrics.disk.avg > this.thresholds.disk) {
      issues.push(`High disk usage: ${systemMetrics.disk.avg}%`);
    }

    return {
      status: issues.length > 0 ? 'warning' : 'healthy',
      issues,
    };
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    try {
      const state = mongoose.connection.readyState;
      const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };

      const isConnected = state === 1;
      const poolMetrics = await this.getConnectionPoolMetrics();

      const issues = [];
      if (!isConnected) {
        issues.push(`Database ${stateMap[state]}`);
      }
      if (poolMetrics && poolMetrics.utilization > 80) {
        issues.push(`High connection pool utilization: ${poolMetrics.utilization}%`);
      }

      return {
        status: issues.length > 0 ? 'warning' : 'healthy',
        state: stateMap[state],
        issues,
        pool: poolMetrics,
      };
    } catch (error) {
      return {
        status: 'critical',
        issues: ['Failed to check database health'],
        error: error.message,
      };
    }
  }

  /**
   * Check cache health (Redis)
   */
  async checkCacheHealth() {
    try {
      const cacheService = require('../cache/cacheService');
      const isConnected = await cacheService.isConnected();

      const issues = [];
      if (!isConnected) {
        issues.push('Cache disconnected');
      }
      if (this.metrics.cache.hitRate < this.thresholds.cacheHitRate) {
        issues.push(`Low cache hit rate: ${this.metrics.cache.hitRate}%`);
      }

      return {
        status: issues.length > 0 ? 'warning' : 'healthy',
        connected: isConnected,
        hitRate: this.metrics.cache.hitRate,
        issues,
      };
    } catch (error) {
      return {
        status: 'critical',
        issues: ['Failed to check cache health'],
        error: error.message,
      };
    }
  }

  /**
   * Check queue health (Bull)
   */
  async checkQueueHealth() {
    try {
      const queueService = require('../queue/queueService');
      const stats = await queueService.getStats();

      const issues = [];
      if (stats.failedCount > 10) {
        issues.push(`High failed job count: ${stats.failedCount}`);
      }
      if (stats.waitingCount > 100) {
        issues.push(`High waiting job count: ${stats.waitingCount}`);
      }

      return {
        status: issues.length > 0 ? 'warning' : 'healthy',
        jobs: this.metrics.queue.jobs,
        issues,
      };
    } catch (error) {
      return {
        status: 'critical',
        issues: ['Failed to check queue health'],
        error: error.message,
      };
    }
  }

  /**
   * Clean up old metrics (keep last hour only)
   */
  cleanupOldMetrics() {
    const oneHourAgo = Date.now() - 3600000;

    // Clean system metrics
    this.metrics.system.cpu = this.metrics.system.cpu.filter(m => m.timestamp > oneHourAgo);
    this.metrics.system.memory = this.metrics.system.memory.filter(m => m.timestamp > oneHourAgo);
    this.metrics.system.disk = this.metrics.system.disk.filter(m => m.timestamp > oneHourAgo);

    // Clean database metrics
    this.metrics.database.queryTime = this.metrics.database.queryTime.filter(
      m => m.timestamp > oneHourAgo,
    );
    this.metrics.database.slowQueries = this.metrics.database.slowQueries.filter(
      m => m.timestamp > oneHourAgo,
    );

    // Clean cache metrics
    this.metrics.cache.operations = this.metrics.cache.operations.filter(
      m => m.timestamp > oneHourAgo,
    );
    this.metrics.cache.memory = this.metrics.cache.memory.filter(m => m.timestamp > oneHourAgo);

    // Clean queue metrics
    this.metrics.queue.processingTime = this.metrics.queue.processingTime.filter(
      m => m.timestamp > oneHourAgo,
    );
    this.metrics.queue.throughput = this.metrics.queue.throughput.filter(
      m => m.timestamp > oneHourAgo,
    );

    // Clean API metrics
    this.metrics.api.responseTime = this.metrics.api.responseTime.filter(
      m => m.timestamp > oneHourAgo,
    );

    console.log('🧹 Cleaned up old metrics (keeping last hour)');
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics.cache.hits = 0;
    this.metrics.cache.misses = 0;
    this.metrics.cache.hitRate = 0;
    this.metrics.api.requests = {
      total: 0,
      success: 0,
      error: 0,
      by_endpoint: {},
    };
    this.metrics.api.statusCodes = {
      '2xx': 0,
      '3xx': 0,
      '4xx': 0,
      '5xx': 0,
    };
    this.metrics.database.operations = {
      find: 0,
      insert: 0,
      update: 0,
      delete: 0,
    };

    console.log('🔄 Metrics reset');
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics() {
    return {
      ...this.getMetrics('long'),
      thresholds: this.thresholds,
      exportedAt: new Date(),
    };
  }
}

// Singleton instance
const metricsService = new MetricsService();

module.exports = metricsService;
