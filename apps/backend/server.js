/**
 * GACP Platform - Production Server
 * Entry point for the backend application
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const logger = require('./shared/logger');
const databaseService = require('./services/production-database');

// Import Modules
const AuthFarmerRoutes = require('./routes/api/AuthFarmerRoutes');
const v2Routes = require('./routes/v2');

const app = express();
const port = process.env.PORT || 3000;

// Security & Performance Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true
}));
app.use(compression());
app.use(morgan('combined'));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to Database
// Connect to Database
if (process.env.NODE_ENV !== 'test') {
    databaseService.connect().catch(err => {
        logger.error('Failed to connect to database', err);
        process.exit(1);
    });
}

// Mount Routes
app.use('/api/auth-farmer', AuthFarmerRoutes);
app.use('/api/v2', v2Routes);

// Health Check
app.get('/health', async (req, res) => {
    try {
        const dbHealth = await databaseService.healthCheck();
        res.json({
            status: 'OK',
            timestamp: new Date(),
            environment: process.env.NODE_ENV,
            database: dbHealth
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date(),
            error: error.message
        });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server
if (require.main === module) {
    app.listen(port, () => {
        logger.info(`✅ Production Server running on port ${port}`);
    });
}

module.exports = app;
