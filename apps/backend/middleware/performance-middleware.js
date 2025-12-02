// Performance Optimization Configuration for GACP Standards System
const logger = require('../shared/logger');
const compression = require('compression');
const helmet = require('helmet');

/**
 * Performance optimization middleware and configurations
 */
class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.maxCacheSize = 1000;
  }

  // Memory cache with TTL
  memoize(fn, keyGenerator, ttl = this.cacheTimeout) {
    return async (...args) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

      if (this.cache.has(key)) {
        const cached = this.cache.get(key);
        if (Date.now() - cached.timestamp < ttl) {
          return cached.value;
        }
        this.cache.delete(key);
      }

      // Clean cache if too large
      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      const result = await fn(...args);
      this.cache.set(key, {
        value: result,
        timestamp: Date.now(),
      });

      return result;
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
    };
  }
}

// Response compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses > 1KB
  level: 6, // Compression level (1-9, 6 is good balance)
  memLevel: 8,
});

// Static file caching headers
const staticCacheMiddleware = (req, res, next) => {
  if (
    req.method === 'GET' &&
    req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
  ) {
    // Cache static files for 1 year
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
  } else if (req.method === 'GET') {
    // Cache API responses for 5 minutes
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
  next();
};

// Request timeout middleware
const timeoutMiddleware = (timeout = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      const error = new Error('Request timeout');
      error.statusCode = 408;
      error.code = 'REQUEST_TIMEOUT';
      next(error);
    });
    next();
  };
};

// Response time tracking
const responseTimeMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);

    // Log slow responses
    if (duration > 2000) {
      logger.warn(`Slow response: ${req.method} ${req.url} took ${duration}ms`);
    }
  });

  next();
};

// Database query optimization helpers
const optimizeQuery = {
  // Add lean() to queries that don't need full mongoose documents
  lean: query => query.lean(),

  // Select only needed fields
  select: (query, fields) => query.select(fields),

  // Add pagination
  paginate: (query, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  },

  // Add sorting with index
  sort: (query, sortField = 'createdAt', order = -1) => {
    return query.sort({ [sortField]: order });
  },
};

// Image optimization middleware
const imageOptimization = {
  // Resize and compress images
  processImage: async (buffer, options = {}) => {
    const sharp = require('sharp');

    const { width = 800, height = 600, quality = 80 } = options;

    try {
      const processed = await sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .png({ quality })
        .toBuffer();

      return processed;
    } catch (error) {
      logger.error('Image processing error:', error);
      return buffer; // Return original if processing fails
    }
  },

  // Generate multiple sizes
  generateSizes: async (buffer, sizes = []) => {
    const defaultSizes = [
      { name: 'thumbnail', width: 150, height: 150 },
      { name: 'medium', width: 400, height: 300 },
      { name: 'large', width: 800, height: 600 },
    ];

    const sizesToProcess = sizes.length ? sizes : defaultSizes;
    const results = {};

    for (const size of sizesToProcess) {
      results[size.name] = await imageOptimization.processImage(buffer, size);
    }

    return results;
  },
};

// Bundle optimization for React
const bundleOptimization = {
  // Code splitting configuration
  codeSplitting: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
      },
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        enforce: true,
      },
    },
  },

  // Tree shaking configuration
  treeShaking: {
    usedExports: true,
    sideEffects: false,
  },

  // Minification options
  minification: {
    removeComments: true,
    collapseWhitespace: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyCSS: true,
    minifyJS: true,
  },
};

// API response optimization
const optimizeApiResponse = {
  // Remove unnecessary fields from response
  sanitizeResponse: (data, fields = []) => {
    if (Array.isArray(data)) {
      return data.map(item => optimizeApiResponse.pickFields(item, fields));
    }
    return optimizeApiResponse.pickFields(data, fields);
  },

  // Pick only specified fields
  pickFields: (obj, fields) => {
    if (!fields.length) {
      return obj;
    }

    const result = {};
    fields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(obj, field)) {
        result[field] = obj[field];
      }
    });
    return result;
  },

  // Paginated response _format
  paginatedResponse: (data, page, limit, total) => {
    return {
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },
};

// Memory usage monitoring
const memoryMonitor = {
  checkMemoryUsage: () => {
    const usage = process.memoryUsage();
    const formatBytes = bytes => Math.round(bytes / 1024 / 1024);

    return {
      rss: formatBytes(usage.rss),
      heapTotal: formatBytes(usage.heapTotal),
      heapUsed: formatBytes(usage.heapUsed),
      external: formatBytes(usage.external),
    };
  },

  logMemoryUsage: () => {
    const usage = memoryMonitor.checkMemoryUsage();
    logger.info('Memory Usage:', usage);

    // Warn if memory usage is high
    if (usage.heapUsed > 500) {
      // 500MB
      logger.warn('⚠️  High memory usage detected:', usage.heapUsed, 'MB');
    }
  },

  startMemoryMonitoring: (interval = 60000) => {
    setInterval(() => {
      memoryMonitor.logMemoryUsage();
    }, interval);
  },
};

// Performance metrics collection
const performanceMetrics = {
  metrics: {
    requestCount: 0,
    errorCount: 0,
    responseTimeSum: 0,
    slowQueries: 0,
  },

  incrementRequestCount: () => {
    performanceMetrics.metrics.requestCount++;
  },

  incrementErrorCount: () => {
    performanceMetrics.metrics.errorCount++;
  },

  addResponseTime: time => {
    performanceMetrics.metrics.responseTimeSum += time;
  },

  incrementSlowQueries: () => {
    performanceMetrics.metrics.slowQueries++;
  },

  getMetrics: () => {
    const metrics = performanceMetrics.metrics;
    return {
      ...metrics,
      averageResponseTime:
        metrics.requestCount > 0 ? Math.round(metrics.responseTimeSum / metrics.requestCount) : 0,
      errorRate:
        metrics.requestCount > 0
          ? Math.round((metrics.errorCount / metrics.requestCount) * 100)
          : 0,
    };
  },

  resetMetrics: () => {
    performanceMetrics.metrics = {
      requestCount: 0,
      errorCount: 0,
      responseTimeSum: 0,
      slowQueries: 0,
    };
  },
};

// Setup performance middleware
const setupPerformanceMiddleware = app => {
  // Compression
  app.use(compressionMiddleware);

  // Response time tracking
  app.use(responseTimeMiddleware);

  // Request timeout
  app.use(timeoutMiddleware(30000));

  // Static file caching
  app.use(staticCacheMiddleware);

  // Security headers (performance-related)
  app.use(
    helmet({
      dnsPrefetchControl: { allow: true },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // Metrics tracking
  app.use((req, res, next) => {
    performanceMetrics.incrementRequestCount();

    const startTime = Date.now();
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      performanceMetrics.addResponseTime(responseTime);

      if (res.statusCode >= 400) {
        performanceMetrics.incrementErrorCount();
      }
    });

    next();
  });

  return app;
};

module.exports = {
  PerformanceOptimizer,
  compressionMiddleware,
  staticCacheMiddleware,
  timeoutMiddleware,
  responseTimeMiddleware,
  optimizeQuery,
  imageOptimization,
  bundleOptimization,
  optimizeApiResponse,
  memoryMonitor,
  performanceMetrics,
  setupPerformanceMiddleware,
};
