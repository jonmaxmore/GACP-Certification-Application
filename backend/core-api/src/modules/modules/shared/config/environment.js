/**
 * Environment Configuration
 * Centralized configuration management for all environments
 */

require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // Database Configuration
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_platform',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      db: process.env.REDIS_DB || 0,
    },
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiry: process.env.JWT_EXPIRY || '24h',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  },

  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },

  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    from: process.env.EMAIL_FROM || 'noreply@gacpplatform.com',
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: process.env.LOG_FILE_ENABLED === 'true',
      filename: process.env.LOG_FILENAME || 'logs/app.log',
      maxsize: parseInt(process.env.LOG_MAX_SIZE) || 5242880, // 5MB
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    },
    console: {
      enabled: process.env.LOG_CONSOLE_ENABLED !== 'false',
    },
  },

  // API Configuration
  api: {
    version: '2.0.0',
    prefix: '/api/v1',
    documentation: {
      enabled: process.env.API_DOCS_ENABLED !== 'false',
      path: '/api/v1/docs',
    },
  },

  // External Services
  external: {
    // Payment gateway configuration
    payment: {
      provider: process.env.PAYMENT_PROVIDER || 'stripe',
      apiKey: process.env.PAYMENT_API_KEY,
      webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET,
    },

    // SMS service configuration
    sms: {
      provider: process.env.SMS_PROVIDER || 'twilio',
      accountSid: process.env.SMS_ACCOUNT_SID,
      authToken: process.env.SMS_AUTH_TOKEN,
      fromNumber: process.env.SMS_FROM_NUMBER,
    },

    // Cloud storage configuration
    storage: {
      provider: process.env.STORAGE_PROVIDER || 'local',
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
        bucket: process.env.AWS_S3_BUCKET,
      },
    },
  },

  // Application Specific Configuration
  application: {
    name: 'GACP Digital Platform',
    description: 'Good Agricultural and Collection Practices Digital Platform',
    version: '2.0.0',
    author: 'GACP Development Team',
    support: {
      email: process.env.SUPPORT_EMAIL || 'support@gacpplatform.com',
      phone: process.env.SUPPORT_PHONE || '+66-xxx-xxx-xxxx',
    },
  },

  // Feature Flags
  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
    enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
    enableTwoFactorAuth: process.env.ENABLE_2FA === 'true',
    enableFileUpload: process.env.ENABLE_FILE_UPLOAD !== 'false',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS !== 'false',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    enableCaching: process.env.ENABLE_CACHING !== 'false',
  },
};

// Environment-specific overrides
if (config.environment === 'production') {
  // Production-specific configurations
  config.logging.level = 'warn';
  config.logging.console.enabled = false;
  config.logging.file.enabled = true;
  config.rateLimit.max = 50; // Stricter rate limiting in production
} else if (config.environment === 'test') {
  // Test-specific configurations
  config.database.mongodb.uri =
    process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/gacp_test';
  config.logging.level = 'error';
  config.logging.console.enabled = false;
  config.logging.file.enabled = false;
}

// Validate required environment variables
const requiredEnvVars = [];

if (config.environment === 'production') {
  requiredEnvVars.push('MONGODB_URI', 'JWT_SECRET', 'SESSION_SECRET');
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}

module.exports = config;
