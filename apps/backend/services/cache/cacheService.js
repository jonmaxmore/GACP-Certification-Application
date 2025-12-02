/**
 * Redis Cache Service
 * Provides caching layer for frequently accessed data
 */

const redisManager = require('../../config/redis-manager');
const logger = require('../../shared/logger');

class CacheService {
  constructor() {
    this.redis = null;
    this.enabled = process.env.ENABLE_CACHE !== 'false'; // Default enabled
    this.defaultTTL = 3600; // 1 hour default

    // TTL configurations for different data types (in seconds)
    this.ttl = {
      AI_QC_RESULT: 3600, // 1 hour
      INSPECTOR_AVAILABILITY: 900, // 15 minutes
      APPLICATION_LIST: 300, // 5 minutes
      APPLICATION_DETAIL: 1800, // 30 minutes
      FARM_INFO: 7200, // 2 hours
      CERTIFICATE: 86400, // 24 hours
      USER_PROFILE: 3600, // 1 hour
      STATISTICS: 600, // 10 minutes
      CALENDAR_EVENTS: 1800, // 30 minutes
      NOTIFICATIONS: 300, // 5 minutes
    };

    this.initialize();
  }

  /**
   * Initialize Redis connection
   */
  async initialize() {
    try {
      if (!this.enabled) {
        logger.warn('Cache service disabled');
        return;
      }

      this.redis = redisManager.getClient();

      if (this.redis) {
        logger.info('Cache service initialized with Redis');
      } else {
        logger.warn('Redis not available, cache service disabled');
        this.enabled = false;
      }
    } catch (error) {
      logger.error('Failed to initialize cache service:', error);
      this.enabled = false;
    }
  }

  /**
   * Generate cache key with prefix
   */
  generateKey(type, identifier) {
    return `gacp:${type.toLowerCase()}:${identifier}`;
  }

  /**
   * Get data from cache
   */
  async get(key) {
    if (!this.enabled || !this.redis) {
      return null;
    }

    try {
      const data = await this.redis.get(key);

      if (data) {
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(data);
      }

      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache get error for ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async set(key, data, ttl = null) {
    if (!this.enabled || !this.redis) {
      return false;
    }

    try {
      const serialized = JSON.stringify(data);
      const expiry = ttl || this.defaultTTL;

      await this.redis.setex(key, expiry, serialized);
      logger.debug(`Cache set: ${key} (TTL: ${expiry}s)`);

      return true;
    } catch (error) {
      logger.error(`Cache set error for ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete data from cache
   */
  async delete(key) {
    if (!this.enabled || !this.redis) {
      return false;
    }

    try {
      await this.redis.del(key);
      logger.debug(`Cache deleted: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern) {
    if (!this.enabled || !this.redis) {
      return false;
    }

    try {
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(`Cache deleted ${keys.length} keys matching: ${pattern}`);
      }

      return true;
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.enabled || !this.redis) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for ${key}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for key
   */
  async ttl(key) {
    if (!this.enabled || !this.redis) {
      return -1;
    }

    try {
      return await this.redis.ttl(key);
    } catch (error) {
      logger.error(`Cache TTL error for ${key}:`, error);
      return -1;
    }
  }

  /**
   * Cache AI QC result
   */
  async cacheAIQCResult(applicationId, qcResult) {
    const key = this.generateKey('ai_qc', applicationId);
    return await this.set(key, qcResult, this.ttl.AI_QC_RESULT);
  }

  /**
   * Get cached AI QC result
   */
  async getAIQCResult(applicationId) {
    const key = this.generateKey('ai_qc', applicationId);
    return await this.get(key);
  }

  /**
   * Invalidate AI QC result cache
   */
  async invalidateAIQCResult(applicationId) {
    const key = this.generateKey('ai_qc', applicationId);
    return await this.delete(key);
  }

  /**
   * Cache inspector availability
   */
  async cacheInspectorAvailability(inspectorId, availability) {
    const key = this.generateKey('inspector_availability', inspectorId);
    return await this.set(key, availability, this.ttl.INSPECTOR_AVAILABILITY);
  }

  /**
   * Get cached inspector availability
   */
  async getInspectorAvailability(inspectorId) {
    const key = this.generateKey('inspector_availability', inspectorId);
    return await this.get(key);
  }

  /**
   * Cache application list
   */
  async cacheApplicationList(filters, applications) {
    const filterKey = JSON.stringify(filters);
    const hash = require('crypto').createHash('md5').update(filterKey).digest('hex');
    const key = this.generateKey('application_list', hash);

    return await this.set(key, applications, this.ttl.APPLICATION_LIST);
  }

  /**
   * Get cached application list
   */
  async getApplicationList(filters) {
    const filterKey = JSON.stringify(filters);
    const hash = require('crypto').createHash('md5').update(filterKey).digest('hex');
    const key = this.generateKey('application_list', hash);

    return await this.get(key);
  }

  /**
   * Cache application detail
   */
  async cacheApplication(applicationId, application) {
    const key = this.generateKey('application', applicationId);
    return await this.set(key, application, this.ttl.APPLICATION_DETAIL);
  }

  /**
   * Get cached application
   */
  async getApplication(applicationId) {
    const key = this.generateKey('application', applicationId);
    return await this.get(key);
  }

  /**
   * Invalidate application caches
   */
  async invalidateApplication(applicationId) {
    // Delete specific application
    const appKey = this.generateKey('application', applicationId);
    await this.delete(appKey);

    // Delete all application lists (since they might include this application)
    await this.deletePattern('gacp:application_list:*');

    logger.info(`Invalidated cache for application: ${applicationId}`);
  }

  /**
   * Cache farm information
   */
  async cacheFarmInfo(farmId, farmInfo) {
    const key = this.generateKey('farm', farmId);
    return await this.set(key, farmInfo, this.ttl.FARM_INFO);
  }

  /**
   * Get cached farm information
   */
  async getFarmInfo(farmId) {
    const key = this.generateKey('farm', farmId);
    return await this.get(key);
  }

  /**
   * Cache certificate
   */
  async cacheCertificate(certificateId, certificate) {
    const key = this.generateKey('certificate', certificateId);
    return await this.set(key, certificate, this.ttl.CERTIFICATE);
  }

  /**
   * Get cached certificate
   */
  async getCertificate(certificateId) {
    const key = this.generateKey('certificate', certificateId);
    return await this.get(key);
  }

  /**
   * Cache user profile
   */
  async cacheUserProfile(userId, profile) {
    const key = this.generateKey('user', userId);
    return await this.set(key, profile, this.ttl.USER_PROFILE);
  }

  /**
   * Get cached user profile
   */
  async getUserProfile(userId) {
    const key = this.generateKey('user', userId);
    return await this.get(key);
  }

  /**
   * Invalidate user profile
   */
  async invalidateUserProfile(userId) {
    const key = this.generateKey('user', userId);
    return await this.delete(key);
  }

  /**
   * Cache statistics
   */
  async cacheStatistics(type, data) {
    const key = this.generateKey('statistics', type);
    return await this.set(key, data, this.ttl.STATISTICS);
  }

  /**
   * Get cached statistics
   */
  async getStatistics(type) {
    const key = this.generateKey('statistics', type);
    return await this.get(key);
  }

  /**
   * Cache calendar events
   */
  async cacheCalendarEvents(inspectorId, startDate, endDate, events) {
    const dateKey = `${inspectorId}_${startDate}_${endDate}`;
    const key = this.generateKey('calendar', dateKey);
    return await this.set(key, events, this.ttl.CALENDAR_EVENTS);
  }

  /**
   * Get cached calendar events
   */
  async getCalendarEvents(inspectorId, startDate, endDate) {
    const dateKey = `${inspectorId}_${startDate}_${endDate}`;
    const key = this.generateKey('calendar', dateKey);
    return await this.get(key);
  }

  /**
   * Cache notifications
   */
  async cacheNotifications(userId, notifications) {
    const key = this.generateKey('notifications', userId);
    return await this.set(key, notifications, this.ttl.NOTIFICATIONS);
  }

  /**
   * Get cached notifications
   */
  async getNotifications(userId) {
    const key = this.generateKey('notifications', userId);
    return await this.get(key);
  }

  /**
   * Invalidate notifications
   */
  async invalidateNotifications(userId) {
    const key = this.generateKey('notifications', userId);
    return await this.delete(key);
  }

  /**
   * Cache warming - Pre-load frequently accessed data
   */
  async warmCache() {
    if (!this.enabled) {
      return;
    }

    try {
      logger.info('Starting cache warming...');

      // Warm frequently accessed statistics
      // This would be called during server startup or scheduled job

      logger.info('Cache warming completed');
    } catch (error) {
      logger.error('Cache warming error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    if (!this.enabled || !this.redis) {
      return {
        enabled: false,
        keys: 0,
        memory: 0,
      };
    }

    try {
      // Get number of keys matching our prefix
      const keys = await this.redis.keys('gacp:*');

      // Get Redis memory info
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memory = memoryMatch ? parseInt(memoryMatch[1]) : 0;

      return {
        enabled: true,
        keys: keys.length,
        memory: Math.round((memory / 1024 / 1024) * 100) / 100, // MB
        patterns: {
          ai_qc: (await this.redis.keys('gacp:ai_qc:*')).length,
          applications: (await this.redis.keys('gacp:application*')).length,
          inspectors: (await this.redis.keys('gacp:inspector*')).length,
          users: (await this.redis.keys('gacp:user:*')).length,
          statistics: (await this.redis.keys('gacp:statistics:*')).length,
          calendar: (await this.redis.keys('gacp:calendar:*')).length,
        },
      };
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      return {
        enabled: true,
        keys: 0,
        memory: 0,
        error: error.message,
      };
    }
  }

  /**
   * Clear all cache
   */
  async clearAll() {
    if (!this.enabled || !this.redis) {
      return false;
    }

    try {
      const keys = await this.redis.keys('gacp:*');

      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.info(`Cleared ${keys.length} cache entries`);
      }

      return true;
    } catch (error) {
      logger.error('Clear cache error:', error);
      return false;
    }
  }

  /**
   * Clear expired cache entries (maintenance)
   */
  async clearExpired() {
    // Redis automatically handles TTL expiration
    // This is just for logging/monitoring
    logger.info('Redis automatically handles expired keys');
  }
}

// Export singleton instance
module.exports = new CacheService();
