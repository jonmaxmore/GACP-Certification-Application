/**
 * GACP Platform - Simple Start Script
 * Starts server FIRST, then loads heavy modules
 * Ensures graceful degradation when database is unavailable
 * 
 * Features:
 * - Immediate server start for health checks
 * - Background loading of heavy modules
 * - Graceful shutdown handling
 * - Uncaught exception recovery
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || process.env.BACKEND_PORT || 5000;

// Store server reference for graceful shutdown
let server = null;

// Basic middleware
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Basic health check (available immediately)
app.get(['/health', '/api/health', '/api/v2/health'], (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        message: 'Server is running',
        database: global.dbReady ? 'connected' : 'connecting...',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid,
    });
});

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================================
// GRACEFUL SHUTDOWN HANDLING
// =====================================================
const gracefulShutdown = (signal) => {
    console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

    if (server) {
        server.close((err) => {
            if (err) {
                console.error('❌ Error during shutdown:', err);
                process.exit(1);
            }
            console.log('✅ HTTP server closed');

            // Close database connections
            if (global.dbConnection) {
                global.dbConnection.close(false, () => {
                    console.log('✅ Database connection closed');
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        });

        // Force close after 10 seconds
        setTimeout(() => {
            console.error('⚠️  Forcing shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    console.error(err.stack);
    // Don't exit immediately - log and continue if possible
    // In production, you might want to restart the process
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
});

// =====================================================
// START SERVER
// =====================================================
server = app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`📡 Health check: http://localhost:${port}/health`);
    console.log(`📡 Loading modules in background...`);

    // Load heavy modules AFTER server is running
    setImmediate(async () => {
        try {
            // Load routes
            const v2Routes = require('./routes/v2');
            app.use('/api/v2', v2Routes);
            console.log('✅ V2 Routes loaded');

            const AuthFarmerRoutes = require('./routes/api/AuthFarmerRoutes');
            app.use('/api/auth-farmer', AuthFarmerRoutes);
            // Mobile App Compatibility - uses /api/auth/farmer instead of /api/auth-farmer
            app.use('/api/auth/farmer', AuthFarmerRoutes);
            console.log('✅ Auth Routes loaded (with mobile compatibility)');

            const EstablishmentRoutes = require('./modules/Establishment');
            app.use('/api/establishments', EstablishmentRoutes);
            app.use('/api/v2/establishments', EstablishmentRoutes);
            console.log('✅ Establishment Routes loaded');

            // Load Swagger
            const swaggerUi = require('swagger-ui-express');
            const swaggerSpec = require('./config/swagger');
            app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
            console.log('✅ Swagger UI loaded');

            // Connect to database (non-blocking)
            const databaseService = require('./services/ProductionDatabase');
            databaseService.connect()
                .then(() => {
                    global.dbReady = true;
                    console.log('✅ Database connected');
                })
                .catch(err => {
                    console.warn('⚠️ Database unavailable:', err.message);
                });

            // Connect to Redis (non-blocking, can be disabled via REDIS_ENABLED=false)
            const redisEnabled = process.env.REDIS_ENABLED !== 'false';
            if (redisEnabled) {
                const redisService = require('./services/RedisService');
                redisService.connect().catch(err => {
                    console.warn('⚠️ Redis unavailable:', err.message);
                });
            } else {
                console.log('ℹ️ Redis disabled (REDIS_ENABLED=false)');
            }

            console.log('✅ All modules loaded. Server fully ready!');

            // 404 handler MUST be AFTER all routes are loaded
            app.use((req, res) => {
                res.status(404).json({ success: false, message: 'Endpoint not found' });
            });

            // Error handler MUST be LAST
            app.use((err, req, res, next) => {
                console.error(err.stack);
                res.status(500).json({ success: false, message: 'Internal Server Error' });
            });
            console.log('✅ Error handlers registered');
        } catch (error) {
            console.error('❌ Error loading modules:', error.message);
        }
    });
});

module.exports = app;

