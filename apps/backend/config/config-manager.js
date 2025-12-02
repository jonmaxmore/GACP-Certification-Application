/**
 * Configuration Manager
 *
 * Centralized configuration management with support for:
 * - Multiple environments (dev, test, staging, prod)
 * - Environment variable overrides
 * - Remote configuration (feature flags)
 * - Config validation
 * - Secret management
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Joi = require('joi');
const logger = require('../shared/logger');
const configLogger = logger.createLogger('config');

// Load environment variables
dotenv.config();

// Determine environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuration schema for validation
const configSchema = Joi.object({
  app: Joi.object({
    name: Joi.string().required(),
    version: Joi.string().required(),
    environment: Joi.string().valid('development', 'test', 'staging', 'production').required(),
  }).required(),
  server: Joi.object({
    port: Joi.number().default(5000),
    host: Joi.string().default('localhost'),
    shutdownTimeout: Joi.number().default(30000),
    cors: Joi.object({
      allowedOrigins: Joi.array().items(Joi.string()).default(['*']),
      allowedMethods: Joi.array()
        .items(Joi.string())
        .default(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    }),
    rateLimiting: Joi.object({
      enabled: Joi.boolean().default(true),
      maxRequests: Joi.number().default(100),
      timeWindow: Joi.number().default(60000),
    }),
  }).required(),
  mongodb: Joi.object({
    uri: Joi.string().required(),
    options: Joi.object({
      useNewUrlParser: Joi.boolean().default(true),
      useUnifiedTopology: Joi.boolean().default(true),
    }).default(),
    reconnectInterval: Joi.number().default(5000),
    reconnectAttempts: Joi.number().default(5),
  }).required(),
  redis: Joi.object({
    enabled: Joi.boolean().default(false),
    host: Joi.string().when('enabled', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    port: Joi.number().when('enabled', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    password: Joi.string().optional().allow(''),
    ttl: Joi.number().default(86400),
  }).default(),
  logging: Joi.object({
    level: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    format: Joi.string().valid('simple', 'json', 'combined').default('combined'),
    errorLogPath: Joi.string().default('./logs/error.log'),
    combinedLogPath: Joi.string().default('./logs/combined.log'),
  }).default(),
  auth: Joi.object({
    jwtSecret: Joi.string().required(),
    jwtExpiration: Joi.string().default('24h'),
    refreshTokenExpiration: Joi.string().default('7d'),
  }).required(),
  storage: Joi.object({
    type: Joi.string().valid('local', 's3', 'azure').default('local'),
    localPath: Joi.string().when('type', {
      is: 'local',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    s3: Joi.object({
      bucket: Joi.string(),
      region: Joi.string(),
      accessKeyId: Joi.string(),
      secretAccessKey: Joi.string(),
    }).optional(),
    azure: Joi.object({
      accountName: Joi.string(),
      accountKey: Joi.string(),
      containerName: Joi.string(),
    }).optional(),
    maxFileSize: Joi.number().default(10485760),
  }).default(),
  performance: Joi.object({
    slowRequestThreshold: Joi.number().default(1000),
    cacheEnabled: Joi.boolean().default(true),
    compressionThreshold: Joi.number().default(1024),
  }).default(),
  features: Joi.object({
    enableSocketNotifications: Joi.boolean().default(true),
    enableQuestionnaires: Joi.boolean().default(true),
    enableTraceability: Joi.boolean().default(true),
    enableStandardsComparison: Joi.boolean().default(true),
    enableReporting: Joi.boolean().default(true),
    enableAI: Joi.boolean().default(false),
  }).default(),
  modules: Joi.object({
    farmManagement: Joi.object().default(),
    questionnaires: Joi.object().default(),
    traceability: Joi.object().default(),
    standards: Joi.object().default(),
    reporting: Joi.object().default(),
    analytics: Joi.object().default(),
  }).default(),
}).unknown();

// Load base config
function loadConfig() {
  try {
    // Start with default configuration
    let config = {
      app: {
        name: 'Botanical Audit Framework',
        version: '1.0.0',
        environment: NODE_ENV,
      },
      server: {
        port: parseInt(process.env.PORT) || 5000,
        host: process.env.HOST || 'localhost',
      },
      mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/botanical-audit',
      },
      auth: {
        jwtSecret: process.env.JWT_SECRET || 'development_secret_change_in_production',
      },
    };

    // Try to load environment-specific config file
    const configPath = path.join(__dirname, `config.${NODE_ENV}.json`);
    if (fs.existsSync(configPath)) {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config = deepMerge(config, fileConfig);
      configLogger.info(`Loaded configuration from ${configPath}`);
    } else {
      configLogger.warn(
        `No config file found at ${configPath}, using defaults and environment variables`,
      );
    }

    // Override with environment variables
    config = overrideWithEnvVars(config);
    console.log('Config after env override:', JSON.stringify(config, null, 2));

    // Validate config
    const { error, value } = configSchema.validate(config);
    if (error) {
      configLogger.error(`Configuration validation error: ${error.message}`);
      throw new Error(`Invalid configuration: ${error.message}`);
    }

    // Mask sensitive information in logs
    const maskedConfig = maskSensitiveData(value);
    configLogger.info('Configuration loaded successfully', { config: maskedConfig });

    return value;
  } catch (err) {
    configLogger.error(`Failed to load configuration: ${err.message}`);
    throw err;
  }
}

// Helper: Deep merge objects
function deepMerge(target, source) {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Override config with environment variables
function overrideWithEnvVars(config) {
  // Example: MONGODB_URI environment variable overrides config.mongodb.uri
  if (process.env.MONGODB_URI) {
    config.mongodb.uri = process.env.MONGODB_URI;
  }

  // Storage configuration
  if (!config.storage) {
    config.storage = {};
  }
  if (process.env.STORAGE_TYPE) {
    config.storage.type = process.env.STORAGE_TYPE;
  }
  if (process.env.STORAGE_LOCAL_PATH) {
    config.storage.localPath = process.env.STORAGE_LOCAL_PATH;
  }

  // Add more environment variable overrides as needed

  return config;
}

// Mask sensitive data like passwords and keys before logging
function maskSensitiveData(config) {
  const maskedConfig = JSON.parse(JSON.stringify(config));

  // Mask MongoDB URI password
  if (maskedConfig.mongodb && maskedConfig.mongodb.uri) {
    maskedConfig.mongodb.uri = maskedConfig.mongodb.uri.replace(
      /mongodb:\/\/([^:]+):([^@]+)@/,
      'mongodb://$1:********@',
    );
  }

  // Mask JWT secret
  if (maskedConfig.auth && maskedConfig.auth.jwtSecret) {
    maskedConfig.auth.jwtSecret = '********';
  }

  // Mask Redis password
  if (maskedConfig.redis && maskedConfig.redis.password) {
    maskedConfig.redis.password = '********';
  }

  // Mask S3 credentials
  if (maskedConfig.storage && maskedConfig.storage.s3) {
    if (maskedConfig.storage.s3.secretAccessKey) {
      maskedConfig.storage.s3.secretAccessKey = '********';
    }
  }

  return maskedConfig;
}

// Config singleton
let configInstance;

module.exports = {
  getConfig: function () {
    if (!configInstance) {
      configInstance = loadConfig();
    }
    return configInstance;
  },

  reload: function () {
    configLogger.info('Reloading configuration...');
    configInstance = loadConfig();
    return configInstance;
  },

  getFeatureFlag: function (flagName, defaultValue = false) {
    if (!configInstance) {
      configInstance = loadConfig();
    }

    return configInstance.features && typeof configInstance.features[flagName] !== 'undefined'
      ? configInstance.features[flagName]
      : defaultValue;
  },
};
