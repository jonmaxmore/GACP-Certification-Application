/**
 * Environment Configuration with Validation
 * Apple-style configuration management
 */

const fs = require('fs');
const path = require('path');

class EnvironmentConfig {
  constructor() {
    this.required = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET'];

    this.optional = {
      REDIS_URL: 'redis://localhost:6379',
      LOG_LEVEL: 'info',
      API_TIMEOUT: '30000',
    };
  }

  /**
   * Validate required environment variables
   */
  validate() {
    const missing = [];

    for (const key of this.required) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
          'Please check your .env file or environment configuration.',
      );
    }

    return true;
  }

  /**
   * Get configuration value with fallback
   */
  get(key, defaultValue = null) {
    return process.env[key] || this.optional[key] || defaultValue;
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig() {
    const timeout = {
      server: parseInt(this.get('DB_TIMEOUT', '5000')),
      socket: parseInt(this.get('DB_SOCKET_TIMEOUT', '45000')),
    };

    const pool = {
      max: parseInt(this.get('DB_POOL_SIZE', '10')),
      min: parseInt(this.get('DB_MIN_POOL_SIZE', '2')),
    };

    return {
      uri: this.get('MONGODB_URI'),
      options: {
        serverSelectionTimeoutMS: timeout.server,
        socketTimeoutMS: timeout.socket,
        maxPoolSize: pool.max,
        minPoolSize: pool.min,
      },
    };
  }

  /**
   * Get Redis configuration
   */
  getRedisConfig() {
    const redisUrl = this.get('REDIS_URL');
    if (!redisUrl) {
      return null;
    }

    return {
      url: redisUrl,
      options: {
        connectTimeout: parseInt(this.get('REDIS_TIMEOUT', '5000')),
        maxRetriesPerRequest: 3,
      },
    };
  }

  /**
   * Check if in production mode
   */
  isProduction() {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if in development mode
   */
  isDevelopment() {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Generate example .env file
   */
  generateExample() {
    const example = [
      '# Application',
      'NODE_ENV=development',
      'PORT=5000',
      '',
      '# Database',
      'MONGODB_URI=mongodb://localhost:27017/gacp-platform',
      'DB_TIMEOUT=5000',
      '',
      '# Authentication',
      'JWT_SECRET=your-secret-key-here',
      'JWT_EXPIRES_IN=7d',
      '',
      '# Redis (Optional)',
      'REDIS_URL=redis://localhost:6379',
      '',
      '# Logging',
      'LOG_LEVEL=info',
      '',
    ].join('\n');

    fs.writeFileSync(path.join(__dirname, '.env.example'), example, 'utf-8');
  }
}

module.exports = new EnvironmentConfig();
