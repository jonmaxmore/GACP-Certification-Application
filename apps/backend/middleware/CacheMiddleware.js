/**
 * Cache Middleware
 * Provides HTTP response caching
 */

const cacheService = require('../services/cache/cacheService');
const logger = require('../shared/logger');

/**
 * Cache middleware for GET requests
 * @param {string} keyGenerator - Function to generate cache key from request
 * @param {number} ttl - Time to live in seconds (optional)
 */
const cacheMiddleware = (keyGenerator, ttl = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey =
        typeof keyGenerator === 'function' ? keyGenerator(req) : `gacp:api:${req.originalUrl}`;

      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        logger.debug(`Cache hit for: ${cacheKey}`);

        // Add cache headers
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);

        return res.json(cachedData);
      }

      // Cache miss - continue to route handler
      logger.debug(`Cache miss for: ${cacheKey}`);
      res.set('X-Cache', 'MISS');

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache response
      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode === 200 && data) {
          cacheService.set(cacheKey, data, ttl).catch(err => {
            logger.error('Failed to cache response:', err);
          });
        }

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
};

/**
 * Cache key generators for common patterns
 */
const cacheKeyGenerators = {
  /**
   * Generate key for application list with filters
   */
  applicationList: req => {
    const { status, farmerId, inspectorId, page = 1, limit = 10 } = req.query;
    const filters = { status, farmerId, inspectorId, page, limit };
    const hash = require('crypto').createHash('md5').update(JSON.stringify(filters)).digest('hex');
    return `gacp:api:applications:list:${hash}`;
  },

  /**
   * Generate key for application detail
   */
  applicationDetail: req => {
    const { id } = req.params;
    return `gacp:api:applications:${id}`;
  },

  /**
   * Generate key for inspector availability
   */
  inspectorAvailability: req => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    return `gacp:api:inspectors:${id}:availability:${startDate}_${endDate}`;
  },

  /**
   * Generate key for statistics
   */
  statistics: req => {
    const { type, startDate, endDate } = req.query;
    return `gacp:api:statistics:${type}:${startDate}_${endDate}`;
  },

  /**
   * Generate key for user profile
   */
  userProfile: req => {
    const userId = req.user?.id || req.params.id;
    return `gacp:api:users:${userId}:profile`;
  },
};

/**
 * Invalidate cache middleware
 * Use after POST, PUT, PATCH, DELETE requests
 */
const invalidateCacheMiddleware = patterns => {
  return async (req, res, next) => {
    // Store original response methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Override to invalidate cache after successful response
    const invalidateCache = async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          for (const pattern of patterns) {
            const cachePattern = typeof pattern === 'function' ? pattern(req) : pattern;

            await cacheService.deletePattern(cachePattern);
            logger.debug(`Invalidated cache pattern: ${cachePattern}`);
          }
        } catch (error) {
          logger.error('Cache invalidation error:', error);
        }
      }
    };

    res.json = function (data) {
      invalidateCache();
      return originalJson(data);
    };

    res.send = function (data) {
      invalidateCache();
      return originalSend(data);
    };

    next();
  };
};

/**
 * Cache control headers middleware
 */
const cacheControlMiddleware = (maxAge = 300) => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
    } else {
      res.set('Cache-Control', 'no-store');
    }
    next();
  };
};

/**
 * Conditional cache middleware based on user role
 */
const conditionalCacheMiddleware = (keyGenerator, ttl, condition) => {
  return async (req, res, next) => {
    const shouldCache = typeof condition === 'function' ? condition(req) : true;

    if (shouldCache) {
      return cacheMiddleware(keyGenerator, ttl)(req, res, next);
    }

    next();
  };
};

module.exports = {
  cacheMiddleware,
  cacheKeyGenerators,
  invalidateCacheMiddleware,
  cacheControlMiddleware,
  conditionalCacheMiddleware,
};
