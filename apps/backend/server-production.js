/**
 * GACP Platform - Production Server (PostgreSQL + Redis)
 * Optimized for AWS EC2 deployment
 * Database: PostgreSQL (Prisma ORM)
 * Cache: Redis
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma
const prisma = new PrismaClient();

// Test database connection
async function testDatabaseConnection() {
    try {
        await prisma.$connect();
        console.log('✅ PostgreSQL Connected');
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL Connection Error:', error.message);
        return false;
    }
}

// Redis connection (optional)
let redisClient = null;
async function connectRedis() {
    try {
        const Redis = require('ioredis');
        redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
        });
        redisClient.on('connect', () => console.log('✅ Redis Connected'));
        redisClient.on('error', (err) => console.log('⚠️ Redis Error:', err.message));
    } catch (e) {
        console.log('⚠️ Redis not available');
    }
}

// CORS Configuration - Apple ATS Compliant
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);

        // Development mode - allow all origins
        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            return callback(null, true);
        }

        // Production allowed origins
        const allowedOrigins = (process.env.CORS_ORIGINS ||
            'http://localhost:3001,http://47.129.167.71,https://47.129.167.71'
        ).split(',');

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Log blocked origins for debugging
        console.log(`[CORS] Blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};


// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('combined'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check
app.get('/health', async (req, res) => {
    let dbStatus = 'unknown';
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
    } catch (e) {
        dbStatus = 'disconnected';
    }

    res.json({
        status: 'ok',
        service: 'GACP Backend',
        version: '2.0.0',
        database: dbStatus,
        cache: redisClient?.status === 'ready' ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/v2/health', async (req, res) => {
    let dbStatus = 'unknown';
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
    } catch (e) {
        dbStatus = 'disconnected';
    }

    res.json({
        status: 'ok',
        service: 'GACP Backend API v2',
        version: '2.0.0',
        database: dbStatus,
        cache: redisClient?.status === 'ready' ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'GACP Certification Platform API',
        version: '2.0.0',
        docs: '/api-docs',
        health: '/health',
    });
});

// Swagger API Docs
try {
    const swaggerSpec = require('./config/swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} catch (e) {
    console.log('Swagger not available');
}

// Load Routes with error handling
const loadRoute = (path, mountPath) => {
    try {
        const route = require(path);
        app.use(mountPath, route);
        console.log(`✅ Route loaded: ${mountPath}`);
    } catch (e) {
        console.log(`⚠️ Route not available: ${mountPath} - ${e.message}`);
    }
};

// Auth Routes
loadRoute('./routes/api/auth-farmer-routes', '/api/auth-farmer');

// V2 API Routes
loadRoute('./routes/api', '/api');

// Config Routes
app.get('/api/v2/config/document-slots', (req, res) => {
    res.json({
        success: true,
        data: {
            slots: [
                { id: 'id-card', name: 'บัตรประชาชน', required: true },
                { id: 'house-reg', name: 'ทะเบียนบ้าน', required: true },
                { id: 'land-doc', name: 'เอกสารที่ดิน', required: true },
            ]
        }
    });
});

app.get('/api/v2/config/fee-structure', (req, res) => {
    res.json({
        success: true,
        data: {
            applicationFee: 500,
            inspectionFee: 1500,
            certificateFee: 1000,
        }
    });
});

// Plants API
app.get('/api/v2/plants', async (req, res) => {
    try {
        const plants = await prisma.plantSpecies.findMany();
        res.json({ success: true, data: plants });
    } catch (e) {
        // Fallback data if DB not connected
        res.json({
            success: true,
            data: [
                { id: 1, name: 'กัญชา', thaiName: 'Cannabis', permittedUse: 'medical' },
                { id: 2, name: 'กระท่อม', thaiName: 'Kratom', permittedUse: 'medical' },
                { id: 3, name: 'ขมิ้นชัน', thaiName: 'Turmeric', permittedUse: 'general' },
            ]
        });
    }
});

// Validation API
app.get('/api/v2/validation/checklist', (req, res) => {
    res.json({
        success: true,
        data: {
            items: [
                { id: 1, name: 'เอกสารครบถ้วน', required: true },
                { id: 2, name: 'รูปถ่ายสถานที่', required: true },
                { id: 3, name: 'แผนที่ตำแหน่ง', required: true },
            ]
        }
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});

// Start Server
async function startServer() {
    await testDatabaseConnection();
    await connectRedis();

    app.listen(PORT, () => {
        console.log(`
========================================
🚀 GACP Backend Server Started
========================================
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🗄️ Database: PostgreSQL (Prisma)
⚡ Cache: Redis
📚 API Docs: http://localhost:${PORT}/api-docs
❤️ Health: http://localhost:${PORT}/health
========================================
        `);
    });
}

startServer();

module.exports = app;
