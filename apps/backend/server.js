/**
 * GACP Platform - Production Server
 * Entry point for the backend application
 * Database: PostgreSQL (Prisma)
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
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
const uploadsRouter = require('./routes/api/uploads');
const pricingRouter = require('./routes/api/pricing');
const plotsRouter = require('./routes/api/plots');

const app = express();
const port = process.env.PORT || 3000; // NOTE: Database and Redis connection moved to after app.listen() for graceful degradation

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: logger.stream }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount Routes
// Mount Routes
app.use('/api/uploads', uploadsRouter); // Generic uploads
app.use('/api/pricing', pricingRouter);
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
            });
        }
    });
}

module.exports = app;

