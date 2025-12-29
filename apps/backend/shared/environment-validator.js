const { createLogger } = require('../shared/logger');
const logger = createLogger('EnvironmentValidator');

/**
 * Environment Configuration Validator
 *
 * Validates all required environment variables on application startup
 * to ensure production security and prevent runtime failures.
 *
 * SECURITY: Fail fast if critical environment variables are missing
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

class EnvironmentValidator {
  constructor() {
    this.requiredEnvVars = {
      // Core Security
      JWT_SECRET: {
        required: true,
        minLength: 32,
        description: 'JWT signing secret for authentication tokens',
      },

      // Database Configuration
      MONGODB_URI: {
        required: true,
        pattern: /^mongodb(\+srv)?:\/\/.+/,
        description: 'MongoDB connection string',
      },

      // Government API Integration
      DOA_API_URL: {
        required: true,
        pattern: /^https?:\/\/.+/,
        description: 'Department of Agriculture API endpoint',
      },
      DOA_CLIENT_ID: {
        required: true,
        minLength: 10,
        description: 'DOA API client identifier',
      },
      DOA_CLIENT_SECRET: {
        required: true,
        minLength: 32,
        description: 'DOA API client secret',
      },

      FDA_API_URL: {
        required: true,
        pattern: /^https?:\/\/.+/,
        description: 'Food and Drug Administration API endpoint',
      },
      FDA_API_KEY: {
        required: true,
        minLength: 20,
        description: 'FDA API access key',
      },
      FDA_SECRET_KEY: {
        required: true,
        minLength: 32,
        description: 'FDA API secret key',
      },

      DGA_API_URL: {
        required: true,
        pattern: /^https?:\/\/.+/,
        description: 'Digital Government Agency API endpoint',
      },
      DGA_CERT_ID: {
        required: true,
        description: 'DGA digital certificate ID',
      },
      DGA_PRIVATE_KEY: {
        required: true,
        minLength: 100,
        description: 'DGA private key for digital signing',
      },

      // Payment Integration - DISABLED FOR DEVELOPMENT
      /*
      PROMPTPAY_MERCHANT_ID: {
        required: false, // Change to optional for development
        pattern: /^\d{13}$/,
        description: 'PromptPay merchant identifier (13 digits)'
      },
      */
      PROMPTPAY_WEBHOOK_SECRET: {
        required: true,
        minLength: 32,
        description: 'PromptPay webhook signature secret',
      },

      // Notification Services
      EMAIL_FROM_ADDRESS: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        description: 'Email sender address',
      },
      SMS_SENDER: {
        required: true,
        description: 'SMS sender identifier',
      },

      // Application URLs
      FRONTEND_URL: {
        required: true,
        pattern: /^https?:\/\/.+/,
        description: 'Frontend application URL',
      },
      FRONTEND_BASE_URL: {
        required: true,
        pattern: /^https?:\/\/.+/,
        description: 'Frontend base URL for links',
      },
    };

    this.optionalEnvVars = {
      // Development/Debug
      NODE_ENV: {
        default: 'development',
        allowed: ['development', 'staging', 'production'],
        description: 'Node.js environment mode',
      },
      PORT: {
        default: 3000,
        type: 'number',
        description: 'Application server port',
      },
      LOG_LEVEL: {
        default: 'info',
        allowed: ['error', 'warn', 'info', 'debug'],
        description: 'Logging level',
      },

      // JWT Configuration
      JWT_EXPIRES_IN: {
        default: '24h',
        description: 'JWT token expiration time',
      },
      JWT_REFRESH_EXPIRES_IN: {
        default: '7d',
        description: 'JWT refresh token expiration time',
      },

      // API Configuration
      CORS_ORIGIN: {
        default: '*',
        description: 'CORS allowed origins',
      },

      // External Services (Optional)
      NATIONAL_ID_API_URL: {
        description: 'National ID verification API (optional)',
      },
      NATIONAL_ID_API_KEY: {
        description: 'National ID API key (optional)',
      },
      LAND_DEPT_API_URL: {
        description: 'Land Department API (optional)',
      },
      LAND_DEPT_CLIENT_ID: {
        description: 'Land Department client ID (optional)',
      },
      LAND_DEPT_CLIENT_SECRET: {
        description: 'Land Department client secret (optional)',
      },
      MOAC_API_URL: {
        description: 'Ministry of Agriculture API (optional)',
      },
      MOAC_JWT_SECRET: {
        description: 'MOAC JWT secret (optional)',
      },
    };
  }

  /**
   * Validate all environment variables
   * @returns {Object} Validation results
   */
  validateEnvironment() {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      summary: {
        required: 0,
        missing: 0,
        invalid: 0,
        optional: 0,
      },
    };

    logger.info('🔍 Validating environment configuration...');

    // Validate required environment variables
    Object.entries(this.requiredEnvVars).forEach(([key, config]) => {
      results.summary.required++;
      const validation = this._validateVariable(key, config, true);

      if (!validation.valid) {
        results.valid = false;
        results.errors.push(validation.error);

        if (validation.missing) {
          results.summary.missing++;
        } else {
          results.summary.invalid++;
        }
      }
    });

    // Check optional environment variables
    Object.entries(this.optionalEnvVars).forEach(([key, config]) => {
      results.summary.optional++;
      const validation = this._validateVariable(key, config, false);

      if (!validation.valid && process.env[key]) {
        results.warnings.push(validation.error);
      }
    });

    this._printValidationResults(results);

    return results;
  }

  /**
   * Validate individual environment variable
   * @param {string} key - Environment variable name
   * @param {Object} config - Validation configuration
   * @param {boolean} required - Whether variable is required
   * @returns {Object} Validation result
   */
  _validateVariable(key, config, required) {
    const value = process.env[key];

    // Check if required variable is missing
    if (required && !value) {
      return {
        valid: false,
        missing: true,
        error: `❌ MISSING REQUIRED: ${key} - ${config.description}`,
      };
    }

    // Skip validation if optional and not provided
    if (!required && !value) {
      return { valid: true };
    }

    // Validate minimum length
    if (config.minLength && value.length < config.minLength) {
      return {
        valid: false,
        error: `❌ INVALID LENGTH: ${key} must be at least ${config.minLength} characters (current: ${value.length})`,
      };
    }

    // Validate pattern
    if (config.pattern && !config.pattern.test(value)) {
      return {
        valid: false,
        error: `❌ INVALID FORMAT: ${key} does not match required pattern`,
      };
    }

    // Validate allowed values
    if (config.allowed && !config.allowed.includes(value)) {
      return {
        valid: false,
        error: `❌ INVALID VALUE: ${key} must be one of: ${config.allowed.join(', ')}`,
      };
    }

    // Validate type
    if (config.type === 'number' && isNaN(Number(value))) {
      return {
        valid: false,
        error: `❌ INVALID TYPE: ${key} must be a number`,
      };
    }

    return { valid: true };
  }

  /**
   * Print validation results to console
   * @param {Object} results - Validation results
   */
  _printValidationResults(results) {
    logger.info('\n🔐 Environment Configuration Validation Results:');
    logger.info('================================================');

    if (results.valid) {
      logger.info('✅ ALL REQUIRED ENVIRONMENT VARIABLES ARE VALID');
    } else {
      logger.info('❌ ENVIRONMENT VALIDATION FAILED:');
      results.errors.forEach(error => logger.info(`   ${error}`));
    }

    if (results.warnings.length > 0) {
      logger.info('\n⚠️  WARNINGS:');
      results.warnings.forEach(warning => logger.info(`   ${warning}`));
    }

    logger.info('\n📊 Summary:');
    logger.info(`   Required variables: ${results.summary.required}`);
    logger.info(`   Missing: ${results.summary.missing}`);
    logger.info(`   Invalid: ${results.summary.invalid}`);
    logger.info(`   Optional checked: ${results.summary.optional}`);

    if (results.valid) {
      logger.info('\n🚀 Environment is ready for production deployment!');
    } else {
      console.log(
        '\n🚨 FIX REQUIRED: Cannot start application with invalid environment configuration',
      );
    }

    logger.info('================================================\n');
  }

  /**
   * Validate environment and exit if invalid (for production)
   */
  validateAndExit() {
    const results = this.validateEnvironment();

    if (!results.valid) {
      logger.error('💥 Application startup aborted due to environment validation errors');
      process.exit(1);
    }

    return results;
  }

  /**
   * Get environment configuration summary
   * @returns {Object} Configuration summary
   */
  getConfigurationSummary() {
    const summary = {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000,
      jwtConfigured: !!process.env.JWT_SECRET,
      databaseConfigured: !!process.env.MONGODB_URI,
      governmentApisConfigured: {
        doa: !!(process.env.DOA_API_URL && process.env.DOA_CLIENT_ID),
        fda: !!(process.env.FDA_API_URL && process.env.FDA_API_KEY),
        dga: !!(process.env.DGA_API_URL && process.env.DGA_CERT_ID),
      },
      paymentConfigured: !!(
        process.env.PROMPTPAY_MERCHANT_ID && process.env.PROMPTPAY_WEBHOOK_SECRET
      ),
      notificationConfigured: !!(process.env.EMAIL_FROM_ADDRESS && process.env.SMS_SENDER),
    };

    return summary;
  }
}

module.exports = EnvironmentValidator;
