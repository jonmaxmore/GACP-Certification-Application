/**
 * GACP Platform - Simple Start Script
 * Starts server FIRST, then loads heavy modules
 * Ensures graceful degradation when database is unavailable
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
const port = process.env.PORT || 5000; // Backend on 5000, Frontend on 3000

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
    });
});

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server IMMEDIATELY
app.listen(port, '0.0.0.0', () => {
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

            // Connect to Redis (non-blocking)
            const redisService = require('./services/RedisService');
            redisService.connect().catch(err => {
                console.warn('⚠️ Redis unavailable:', err.message);
            });

            console.log('✅ All modules loaded. Server fully ready!');
        } catch (error) {
            console.error('❌ Error loading modules:', error.message);
        }
    });
});

// 404 handler (after routes are loaded)
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});
