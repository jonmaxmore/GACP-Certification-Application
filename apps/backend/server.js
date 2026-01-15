/**
 * GACP Platform - Production Server
 * Entry point for the backend application
 * Database: PostgreSQL (Prisma)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('SERVER STARTUP - DATABASE_URL:', process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const logger = require('./shared/logger');
const prismaDatabase = require('./services/prisma-database'); // PostgreSQL
const redisService = require('./services/redis-service');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Import Modules
const apiRoutes = require('./routes/api');
const plotsRouter = require('./routes/api/plots');

const app = express();
const port = process.env.PORT || 3000; // NOTE: Database and Redis connection moved to after app.listen() for graceful degradation

const rateLimit = require('express-rate-limit');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security Hardening
app.use(helmet({
    contentSecurityPolicy: false, // Disable for now if causing frontend issues, or configure strictly
    crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://gacp-platform.dtam.go.th', 'https://admin-gacp.dtam.go.th']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 failed login attempts
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful logins
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);

app.use(compression());
app.use(morgan('combined', { stream: logger.stream }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount Routes
// Mount Routes
app.use('/api', apiRoutes); // Unified API routes (no /v2 prefix)
app.use('/api', plotsRouter); // [NEW] Mount Plot Routes
if (process.env.NODE_ENV !== 'production') {
    app.use('/api/mock-payment', require('./routes/mock-payment'));
}


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check - Both /health and /api/health for compatibility
app.get(['/health', '/api/health'], async (req, res) => {
    try {
        const dbHealth = await prismaDatabase.healthCheck();
        res.json({
            status: 'OK',
            timestamp: new Date(),
            environment: process.env.NODE_ENV,
            database: dbHealth,
            redis: {
                connected: redisService.isAvailable(),
            },
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date(),
            error: error.message,
        });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error(err.stack);
    try {
        const fs = require('fs');
        fs.writeFileSync(path.join(__dirname, 'critical-error.log'), new Date().toISOString() + '\n' + err.stack);
    } catch (e) { console.error('Log write failed', e); }
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message, // ALWAYS SHOW
        stack: err.stack, // ALWAYS SHOW
    });
});

// Start Server
if (require.main === module) {
    app.listen(port, '0.0.0.0', () => {
        logger.info(`✅ GACP Backend running on port ${port}`);
        console.log(`\n🐛 [DEBUG] Backend Server listening on port ${port}`); // Explicit Debug Log
        console.log(`🐛 [DEBUG] Environment: ${process.env.NODE_ENV}\n`);
        logger.info(`📡 Server accepting requests...`);

        // Connect to database AFTER server is already listening
        if (process.env.NODE_ENV !== 'test') {
            setImmediate(async () => {
                // Connect to PostgreSQL (Prisma)
                prismaDatabase.connect()
                    .then(() => logger.info('✅ PostgreSQL connected'))
                    .catch(err => {
                        logger.error('❌ PostgreSQL error:', err.message);
                    });

                // Connect to Redis (Cache)
                redisService.connect().catch(err => {
                    logger.warn('⚠️ Redis unavailable - running without cache:', err.message);
                });

                // Initialize Background Queues (SLA Monitor) [NEW]
                const { initQueues } = require('./services/queue-service');
                initQueues();
            });
        }
    });
}

module.exports = app;
// Force Restart for Prisma Generate

