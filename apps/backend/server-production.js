/**
 * GACP Platform - Production Server (MongoDB Only)
 * Optimized for AWS EC2 deployment
 * Database: MongoDB Atlas
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gacp-premierprime:PremierPrime2025@thai-gacp.re1651p.mongodb.net/gacp-production?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// CORS Configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            return callback(null, true);
        }
        const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3001').split(',');
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
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
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'GACP Backend',
        version: '2.0.0',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/v2/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'GACP Backend API v2',
        version: '2.0.0',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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
loadRoute('./routes/v2', '/api/v2');

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
app.get('/api/v2/plants', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, name: 'กัญชา', thaiName: 'Cannabis', permittedUse: 'medical' },
            { id: 2, name: 'กระท่อม', thaiName: 'Kratom', permittedUse: 'medical' },
            { id: 3, name: 'ขมิ้นชัน', thaiName: 'Turmeric', permittedUse: 'general' },
        ]
    });
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
app.listen(PORT, () => {
    console.log(`
========================================
🚀 GACP Backend Server Started
========================================
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📚 API Docs: http://localhost:${PORT}/api-docs
❤️ Health: http://localhost:${PORT}/health
========================================
    `);
});

module.exports = app;
