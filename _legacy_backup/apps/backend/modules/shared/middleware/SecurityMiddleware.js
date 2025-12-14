// Enhanced Security Configuration for GACP Standards System
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize'); // Temporarily disabled
// const xss = require('xss-clean'); // Temporarily disabled
// const hpp = require('hpp'); // Temporarily disabled
const bcrypt = require('bcrypt');
// const validator = require('validator'); // Temporarily disabled
const crypto = require('crypto');

// Security Configuration Object
const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
    refreshSecret: process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex'),
    accessTokenExpiry: process.env.JWT_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: 'gacp-standards-system',
    audience: 'gacp-users',
  },

  // Rate Limiting Configuration
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP',
      retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // API Rate Limiting (more restrictive)
  apiRateLimiting: {
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
      error: 'API rate limit exceeded',
      retryAfter: '15 minutes',
    },
  },

  // Authentication Rate Limiting (very restrictive)
  authRateLimiting: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
      error: 'Too many authentication attempts',
      retryAfter: '15 minutes',
    },
  },

  // CORS Configuration
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:5173'];

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  },

  // Helmet Configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for development
  },

  // File Upload Security
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json',
      'image/jpeg',
      'image/png',
      'image/gif',
    ],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    virusScanEnabled: process.env.VIRUS_SCAN_ENABLED === 'true',
  },
};

// Input Validation Schemas
const validationSchemas = {
  // User Registration
  userRegistration: {
    email: {
      validator: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Invalid email format',
    },
    password: {
      validator: value => {
        return (
          value.length >= 8 &&
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)
        );
      },
      message:
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    },
    name: {
      validator: value => value.length >= 2 && value.length <= 50,
      message: 'Name must be between 2 and 50 characters',
    },
  },

  // Standards Creation
  standardsCreation: {
    standard_code: {
      validator: value => /^[A-Z0-9-]{3,20}$/.test(value),
      message:
        'Standard code must be 3-20 characters, uppercase letters, numbers, and hyphens only',
    },
    source: {
      validator: value => ['WHO', 'Thai FDA', 'ASEAN', 'GMP', 'ISO'].includes(value),
      message: 'Invalid source',
    },
    title: {
      validator: value => value.length >= 5 && value.length <= 200,
      message: 'Title must be between 5 and 200 characters',
    },
    category: {
      validator: value =>
        [
          'cultivation',
          'harvesting',
          'post-harvest',
          'processing',
          'storage',
          'quality-control',
          'documentation',
          'facility',
          'personnel',
          'traceability',
        ].includes(value),
      message: 'Invalid category',
    },
  },

  // Assessment Creation
  assessmentCreation: {
    assessment_type: {
      validator: value =>
        ['self-assessment', 'third-party', 'internal-audit', 'external-audit'].includes(value),
      message: 'Invalid assessment type',
    },
    facility_name: {
      validator: value => value.length >= 2 && value.length <= 100,
      message: 'Facility name must be between 2 and 100 characters',
    },
  },
};

// Security Middleware Functions
const securityMiddleware = {
  // Input Validation Middleware
  validateInput: schema => {
    return (req, res, next) => {
      const errors = [];

      for (const [field, rules] of Object.entries(schema)) {
        const value = req.body[field];

        if (value === undefined || value === null || value === '') {
          errors.push(`${field} is required`);
          continue;
        }

        if (!rules.validator(value)) {
          errors.push(rules.message);
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors,
        });
      }

      next();
    };
  },

  // Sanitize MongoDB queries
  sanitizeQuery: (req, res, next) => {
    // Remove any keys that start with '$' or contain '.'
    const sanitizeObject = obj => {
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (key.startsWith('$') || key.includes('.')) {
            delete obj[key];
          } else if (typeof obj[key] === 'object') {
            sanitizeObject(obj[key]);
          }
        }
      }
    };

    sanitizeObject(req.query);
    sanitizeObject(req.body);
    sanitizeObject(req.params);
    next();
  },

  // Password Hashing Utility
  hashPassword: async password => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  },

  // Password Verification
  verifyPassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  // JWT Token Generation
  generateTokens: payload => {
    const jwt = require('jsonwebtoken');

    const accessToken = jwt.sign(payload, securityConfig.jwt.secret, {
      expiresIn: securityConfig.jwt.accessTokenExpiry,
      issuer: securityConfig.jwt.issuer,
      audience: securityConfig.jwt.audience,
    });

    const refreshToken = jwt.sign({ userId: payload.userId }, securityConfig.jwt.refreshSecret, {
      expiresIn: securityConfig.jwt.refreshTokenExpiry,
      issuer: securityConfig.jwt.issuer,
      audience: securityConfig.jwt.audience,
    });

    return { accessToken, refreshToken };
  },

  // JWT Token Verification
  verifyToken: (req, res, next) => {
    const jwt = require('jsonwebtoken');
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, securityConfig.jwt.secret, {
        issuer: securityConfig.jwt.issuer,
        audience: securityConfig.jwt.audience,
      });
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access token has expired',
          code: 'TOKEN_EXPIRED',
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid access token',
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Token verification failed',
        });
      }
    }
  },

  // File Upload Security
  secureFileUpload: (_req, _res, _next) => {
    const multer = require('multer');
    const path = require('path');
    const fs = require('fs');

    // Ensure upload directory exists
    if (!fs.existsSync(securityConfig.fileUpload.uploadPath)) {
      fs.mkdirSync(securityConfig.fileUpload.uploadPath, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, securityConfig.fileUpload.uploadPath);
      },
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
        cb(null, `${uniqueSuffix}-${sanitizedName}`);
      },
    });

    const fileFilter = (req, file, cb) => {
      // Check file type
      if (securityConfig.fileUpload.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File type not allowed'), false);
      }
    };

    const upload = multer({
      storage: storage,
      limits: {
        fileSize: securityConfig.fileUpload.maxFileSize,
        files: 5, // Maximum 5 files
      },
      fileFilter: fileFilter,
    });

    return upload;
  },

  // API Key Validation (for external integrations)
  validateApiKey: (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKeys = process.env.VALID_API_KEYS ? process.env.VALID_API_KEYS.split(',') : [];

    if (!apiKey || !validApiKeys.includes(apiKey)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or missing API key',
      });
    }

    next();
  },

  // Request ID for tracing
  requestId: (req, res, next) => {
    req.id = crypto.randomUUID();
    res.setHeader('X-Request-ID', req.id);
    next();
  },

  // Security Headers
  securityHeaders: (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.removeHeader('X-Powered-By');
    next();
  },
};

// Rate Limiting Setup
const createRateLimiters = () => {
  return {
    general: rateLimit(securityConfig.rateLimiting),
    api: rateLimit(securityConfig.apiRateLimiting),
    auth: rateLimit(securityConfig.authRateLimiting),
  };
};

// Express App Security Setup
const setupAppSecurity = app => {
  const cors = require('cors');
  const rateLimiters = createRateLimiters();

  // Basic security middleware
  app.use(securityMiddleware.requestId);
  app.use(helmet(securityConfig.helmet));
  app.use(securityMiddleware.securityHeaders);
  app.use(cors(securityConfig.cors));

  // Data sanitization
  // app.use(mongoSanitize()); // Temporarily disabled
  // app.use(xss()); // Temporarily disabled
  // app.use(hpp()); // Temporarily disabled
  app.use(securityMiddleware.sanitizeQuery);

  // Rate limiting
  app.use('/api/', rateLimiters.api);
  app.use('/api/auth/', rateLimiters.auth);
  app.use(rateLimiters.general);

  // Request size limiting
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '10mb' }));

  return app;
};

module.exports = {
  securityConfig,
  validationSchemas,
  securityMiddleware,
  setupAppSecurity,
  createRateLimiters,
};
