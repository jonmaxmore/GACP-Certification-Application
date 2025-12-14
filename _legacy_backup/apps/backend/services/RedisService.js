/**
 * Redis Service - Cache Layer for GACP Backend
 * 
 * Features:
 * - Connection pooling with ioredis
 * - Auto-reconnect and error handling
 * - JSON serialization support
 * - Cache patterns (get, set, invalidate)
 * - Graceful degradation when Redis is unavailable
 * 
 * Usage:
 *   const cache = require('./services/RedisService');
 *   await cache.set('user:123', userData, 300); // 5 min TTL
 *   const data = await cache.get('user:123');
 */

const Redis = require('ioredis');
const { createLogger } = require('../shared/logger');
const logger = createLogger('redis-service');

class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxRetries = 3;
    }

    /**
     * Initialize Redis connection
     */
    async connect() {
        if (this.client && this.isConnected) {
            return this.client;
        }

        const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

        try {
            this.client = new Redis(redisUrl, {
                maxRetriesPerRequest: 3,
                retryDelayOnFailover: 100,
                enableReadyCheck: true,
                lazyConnect: true,
                showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
            });

            // Event handlers
            this.client.on('connect', () => {
                this.isConnected = true;
                this.connectionAttempts = 0;
                logger.info('✅ Redis connected successfully');
            });

            this.client.on('error', (err) => {
                this.isConnected = false;
                logger.warn('⚠️ Redis connection error (graceful degradation active):', err.message);
            });

            this.client.on('close', () => {
                this.isConnected = false;
                logger.info('📡 Redis connection closed');
            });

            await this.client.connect();
            return this.client;
        } catch (error) {
            this.isConnected = false;
            logger.warn('⚠️ Redis unavailable, running without cache:', error.message);
            return null;
        }
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {any} - Parsed value or null
     */
    async get(key) {
        if (!this.isConnected) return null;

        try {
            const value = await this.client.get(key);
            if (value) {
                logger.debug(`Cache HIT: ${key}`);
                return JSON.parse(value);
            }
            logger.debug(`Cache MISS: ${key}`);
            return null;
        } catch (error) {
            logger.warn(`Cache GET error for ${key}:`, error.message);
            return null;
        }
    }

    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache (will be JSON stringified)
     * @param {number} ttlSeconds - Time to live in seconds (default: 300 = 5 min)
     */
    async set(key, value, ttlSeconds = 300) {
        if (!this.isConnected) return false;

        try {
            const serialized = JSON.stringify(value);
            await this.client.setex(key, ttlSeconds, serialized);
            logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
            return true;
        } catch (error) {
            logger.warn(`Cache SET error for ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Delete a specific key
     * @param {string} key - Cache key to delete
     */
    async del(key) {
        if (!this.isConnected) return false;

        try {
            await this.client.del(key);
            logger.debug(`Cache DEL: ${key}`);
            return true;
        } catch (error) {
            logger.warn(`Cache DEL error for ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Invalidate all keys matching a pattern
     * @param {string} pattern - Redis pattern (e.g., "user:*")
     */
    async invalidatePattern(pattern) {
        if (!this.isConnected) return false;

        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(...keys);
                logger.debug(`Cache INVALIDATE: ${pattern} (${keys.length} keys)`);
            }
            return true;
        } catch (error) {
            logger.warn(`Cache INVALIDATE error for ${pattern}:`, error.message);
            return false;
        }
    }

    /**
     * Get or set pattern (cache-aside)
     * @param {string} key - Cache key
     * @param {Function} fetchFn - Function to fetch data if not cached
     * @param {number} ttlSeconds - TTL for cached data
     */
    async getOrSet(key, fetchFn, ttlSeconds = 300) {
        // Try cache first
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }

        // Fetch fresh data
        const fresh = await fetchFn();

        // Cache the result
        await this.set(key, fresh, ttlSeconds);

        return fresh;
    }

    /**
     * Check if Redis is available
     */
    isAvailable() {
        return this.isConnected;
    }

    /**
     * Get cache statistics
     */
    async getStats() {
        if (!this.isConnected) {
            return { connected: false };
        }

        try {
            const info = await this.client.info('stats');
            const keyspace = await this.client.info('keyspace');
            return {
                connected: true,
                info: info.substring(0, 500),
                keyspace
            };
        } catch {
            return { connected: false };
        }
    }

    /**
     * Graceful shutdown
     */
    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
            logger.info('🔌 Redis disconnected gracefully');
        }
    }
}

// Singleton instance
const redisService = new RedisService();

// Cache key generators for consistent naming
const CacheKeys = {
    userSession: (userId) => `session:${userId}`,
    userApplications: (userId) => `apps:user:${userId}`,
    applicationDetail: (appId) => `apps:detail:${appId}`,
    jwtDecoded: (tokenHash) => `jwt:${tokenHash}`,
};

module.exports = redisService;
module.exports.CacheKeys = CacheKeys;
