// 🚀 GACP Platform - Performance Optimization Engine
// ระบบเพิ่มประสิทธิภาพแบบ Enterprise-grade

const NodeCache = require('node-cache');
const winston = require('winston');
const Redis = require('ioredis');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

class PerformanceOptimizer {
  constructor() {
    this.memoryCache = new NodeCache({
      stdTTL: 300, // 5 minutes default
      checkperiod: 60,
      useClones: false,
    });

    this.redisClient = null;
    this.metrics = new Map();
    this.activeConnections = 0;
    this.setupLogger();
    this.initializeRedis();
  }

  setupLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({
          filename: 'logs/performance.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
  }

  async initializeRedis() {
    try {
      this.redisClient = Redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
        retry_unfulfilled_commands: true,
        retry_strategy: options => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('Redis server refused connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        },
      });

      await this.redisClient.connect();
      this.logger.info('Redis connected successfully for performance optimization');
    } catch (error) {
      this.logger.error('Redis connection failed:', error);
    }
  }

  // ================= CACHING STRATEGIES =================

  // Multi-layer caching system
  async getWithMultiLayerCache(key, dataFunction, options = {}) {
    const startTime = performance.now();

    try {
      // Layer 1: Memory Cache (fastest)
      let data = this.memoryCache.get(key);
      if (data) {
        this.recordMetric('cache_hit_memory', performance.now() - startTime);
        return data;
      }

      // Layer 2: Redis Cache (fast)
      if (this.redisClient) {
        const redisData = await this.redisClient.get(key);
        if (redisData) {
          data = JSON.parse(redisData);
          // Store in memory cache for next time
          this.memoryCache.set(key, data, options.memoryTTL || 300);
          this.recordMetric('cache_hit_redis', performance.now() - startTime);
          return data;
        }
      }

      // Layer 3: Database/API (slowest)
      data = await dataFunction();

      // Store in both caches
      if (data) {
        this.memoryCache.set(key, data, options.memoryTTL || 300);
        if (this.redisClient) {
          await this.redisClient.setEx(key, options.redisTTL || 1800, JSON.stringify(data));
        }
      }

      this.recordMetric('cache_miss', performance.now() - startTime);
      return data;
    } catch (error) {
      this.logger.error('Multi-layer cache error:', error);
      // Fallback to direct data function
      return await dataFunction();
    }
  }

  // Smart cache invalidation
  async invalidateCache(pattern) {
    try {
      // Clear memory cache
      if (pattern === '*') {
        this.memoryCache.flushAll();
      } else {
        const keys = this.memoryCache.keys();
        keys.forEach(key => {
          if (key.includes(pattern)) {
            this.memoryCache.del(key);
          }
        });
      }

      // Clear Redis cache
      if (this.redisClient) {
        const keys = await this.redisClient.keys(`*${pattern}*`);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      }

      this.logger.info(`Cache invalidated for pattern: ${pattern}`);
    } catch (error) {
      this.logger.error('Cache invalidation error:', error);
    }
  }

  // ================= DATABASE OPTIMIZATION =================

  // Query optimization middleware
  optimizeQuery(query, collection) {
    const optimized = { ...query };

    // Add common indexes
    const commonIndexes = {
      users: ['email', 'username', 'role'],
      applications: ['status', 'farmerId', 'applicationNumber'],
      certificates: ['certificateNumber', 'isActive', 'expiryDate'],
      farms: ['farmerId', 'isActive', 'location.province'],
    };

    if (commonIndexes[collection]) {
      // Ensure indexed fields are used efficiently
      const indexedFields = commonIndexes[collection];
      for (const field of indexedFields) {
        if (optimized[field]) {
          // Move indexed fields to front of query
          const value = optimized[field];
          delete optimized[field];
          optimized[field] = value;
          break;
        }
      }
    }

    // Limit results if not specified
    if (!optimized.limit && !optimized.count) {
      optimized.limit = 100;
    }

    return optimized;
  }

  // Connection pooling optimization
  async optimizeDBConnections() {
    const mongoose = require('mongoose');

    // Optimize MongoDB connection
    mongoose.set('maxPoolSize', 20);
    mongoose.set('minPoolSize', 5);
    mongoose.set('maxIdleTimeMS', 30000);
    mongoose.set('serverSelectionTimeoutMS', 5000);
    mongoose.set('bufferMaxEntries', 0);
    mongoose.set('bufferCommands', false);

    this.logger.info('Database connections optimized');
  }

  // ================= API OPTIMIZATION =================

  // Smart rate limiting based on user type
  createSmartRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: req => {
        // Different limits for different user types
        if (req.user?.role === 'admin') {
          return 1000;
        }
        if (req.user?.role === 'inspector') {
          return 500;
        }
        if (req.user?.role === 'farmer') {
          return 200;
        }
        return 100; // Public/unauthenticated
      },
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        this.recordMetric('rate_limit_exceeded', 1);
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.round(15 * 60), // 15 minutes
        });
      },
    });
  }

  // Response compression optimization
  createCompressionMiddleware() {
    return compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6, // Good balance between speed and compression
      threshold: 1024, // Only compress responses > 1KB
      chunkSize: 16 * 1024, // 16KB chunks
    });
  }

  // Security headers optimization
  createSecurityMiddleware() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", 'https://api.gacp.go.th'],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    });
  }

  // ================= MONITORING & METRICS =================

  recordMetric(name, value) {
    const timestamp = Date.now();

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name);
    metrics.push({ value, timestamp });

    // Keep only last 1000 entries
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }

  getPerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      activeConnections: this.activeConnections,
      cacheStats: {
        memory: {
          keys: this.memoryCache.keys().length,
          stats: this.memoryCache.getStats(),
        },
      },
      metrics: {},
    };

    // Calculate metric averages
    for (const [name, values] of this.metrics.entries()) {
      if (values.length > 0) {
        const recentValues = values.filter(
          v => Date.now() - v.timestamp < 60000, // Last minute
        );

        if (recentValues.length > 0) {
          const sum = recentValues.reduce((acc, v) => acc + v.value, 0);
          report.metrics[name] = {
            count: recentValues.length,
            average: sum / recentValues.length,
            latest: recentValues[recentValues.length - 1].value,
          };
        }
      }
    }

    return report;
  }

  // ================= AUTO-SCALING OPTIMIZATION =================

  async autoOptimize() {
    const report = this.getPerformanceReport();

    // Memory optimization
    if (report.memory.heapUsed / report.memory.heapTotal > 0.8) {
      this.logger.warn('High memory usage detected, clearing caches');
      this.memoryCache.flushAll();
      if (global.gc) {
        global.gc();
      }
    }

    // Cache optimization
    const cacheHitRate = this.calculateCacheHitRate();
    if (cacheHitRate < 0.5) {
      this.logger.warn('Low cache hit rate, adjusting TTL');
      // Increase TTL for better hit rates
      this.memoryCache.options.stdTTL = Math.min(this.memoryCache.options.stdTTL * 1.2, 600);
    }

    // Connection optimization
    if (this.activeConnections > 100) {
      this.logger.warn('High connection count detected');
      // Could implement connection throttling here
    }

    this.logger.info('Auto-optimization completed', report);
  }

  calculateCacheHitRate() {
    const memoryHits = this.metrics.get('cache_hit_memory') || [];
    const redisHits = this.metrics.get('cache_hit_redis') || [];
    const misses = this.metrics.get('cache_miss') || [];

    const totalHits = memoryHits.length + redisHits.length;
    const totalRequests = totalHits + misses.length;

    return totalRequests > 0 ? totalHits / totalRequests : 0;
  }

  // ================= CLEANUP & SHUTDOWN =================

  async gracefulShutdown() {
    this.logger.info('Starting graceful shutdown...');

    try {
      // Close Redis connection
      if (this.redisClient) {
        await this.redisClient.quit();
      }

      // Clear caches
      this.memoryCache.flushAll();
      this.memoryCache.close();

      // Final performance report
      const finalReport = this.getPerformanceReport();
      this.logger.info('Final performance report:', finalReport);

      this.logger.info('Graceful shutdown completed');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }
}

// ================= USAGE EXAMPLES =================

// Initialize performance optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Example usage in Express app
function setupPerformanceMiddleware(app) {
  // Apply compression
  app.use(performanceOptimizer.createCompressionMiddleware());

  // Apply security headers
  app.use(performanceOptimizer.createSecurityMiddleware());

  // Apply rate limiting
  app.use('/api/', performanceOptimizer.createSmartRateLimit());

  // Performance monitoring middleware
  app.use((req, res, next) => {
    const start = performance.now();

    res.on('finish', () => {
      const duration = performance.now() - start;
      performanceOptimizer.recordMetric('request_duration', duration);
      performanceOptimizer.recordMetric('status_' + res.statusCode, 1);
    });

    next();
  });
}

// Auto-optimization scheduler
setInterval(() => {
  performanceOptimizer.autoOptimize();
}, 60000); // Every minute

// Graceful shutdown handling
process.on('SIGTERM', () => performanceOptimizer.gracefulShutdown());
process.on('SIGINT', () => performanceOptimizer.gracefulShutdown());

module.exports = {
  PerformanceOptimizer,
  performanceOptimizer,
  setupPerformanceMiddleware,
};
