/**
 * GACP Platform - Simple Start Script
 * Loads routes synchronously, then starts server
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
const port = process.env.PORT || 5000;

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

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic health check
app.get(['/health', '/api/health', '/api/v2/health'], (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        database: global.dbReady ? 'connected' : 'connecting...',
        uptime: process.uptime(),
    });
});

// =====================================================
// LOAD ROUTES (synchronously, before server starts)
// =====================================================
try {
    console.log('📦 Loading routes...');

    // V2 Routes (includes auth-staff)
    const v2Routes = require('./routes/v2');
    app.use('/api/v2', v2Routes);
    console.log('✅ V2 Routes loaded (includes auth-staff)');

    // Farmer Auth Routes
    const AuthFarmerRoutes = require('./routes/api/AuthFarmerRoutes');
    app.use('/api/auth-farmer', AuthFarmerRoutes);
    app.use('/api/auth/farmer', AuthFarmerRoutes);
    console.log('✅ Auth Farmer Routes loaded');

    // Establishment Routes
    const EstablishmentRoutes = require('./modules/Establishment');
    app.use('/api/establishments', EstablishmentRoutes);
    app.use('/api/v2/establishments', EstablishmentRoutes);
    console.log('✅ Establishment Routes loaded');

    // Staff Management Routes
    const StaffRoutes = require('./routes/api/StaffRoutes');
    app.use('/api/v2/staff', StaffRoutes);
    console.log('✅ Staff Routes loaded');

    // Accounting Routes
    const AccountingRoutes = require('./routes/api/AccountingRoutes');
    app.use('/api/v2/accounting', AccountingRoutes);
    console.log('✅ Accounting Routes loaded');

    console.log('✅ All routes loaded');
} catch (error) {
    console.error('❌ Error loading routes:', error.message);
    console.error(error.stack);
    process.exit(1);
}

// 404 handler (AFTER all routes)
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler (LAST)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================
const gracefulShutdown = (signal) => {
    console.log(`\n⚠️  ${signal} received. Shutting down...`);
    if (server) {
        server.close(() => {
            console.log('✅ HTTP server closed');
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000);
    } else {
        process.exit(0);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});

// =====================================================
// START SERVER
// =====================================================
server = app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`📡 Health check: http://localhost:${port}/health`);
    console.log(`📡 Staff login: http://localhost:${port}/api/v2/auth-staff/login`);

    // Connect to database in background
    const databaseService = require('./services/ProductionDatabase');
    databaseService.connect()
        .then(() => {
            global.dbReady = true;
            console.log('✅ Database connected');
        })
        .catch(err => {
            console.warn('⚠️ Database unavailable:', err.message);
        });

    // Redis (optional)
    if (process.env.REDIS_ENABLED !== 'false') {
        const redisService = require('./services/RedisService');
        redisService.connect().catch(err => {
            console.warn('⚠️ Redis unavailable:', err.message);
        });
    }
});

module.exports = app;
