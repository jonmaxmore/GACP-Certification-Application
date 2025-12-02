/**
 * GACP Platform - Development Server (No MongoDB Dependencies)
 * Simplified server for development without database complexity
 *
 * Features:
 * - Mock business logic services
 * - REST API endpoints
 * - JWT authentication
 * - File upload support
 * - Health monitoring
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-19
 */

const logger = require('./shared/logger');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Import mock services
const MockDatabaseService = require('./services/mock-database');

const app = express();
const port = process.env.PORT || 3004;

// Initialize mock database
const mockDb = new MockDatabaseService();

logger.info('🚀 GACP Development Server Starting...');
logger.info('📊 Using Mock Database Mode');

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3005'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// Simple JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // Simple token validation for development
  if (token === 'dev_token' || token.startsWith('mock_')) {
    let userId = 'user001';
    let role = 'farmer';
    let email = 'farmer@example.com';

    // Try to extract user ID from token (format: mock_USERID_TIMESTAMP)
    const parts = token.split('_');
    if (parts.length >= 3) {
      userId = parts[1];
      // Look up user details from mockDb if possible, or infer
      // For simplicity, we'll just use the ID and try to find it in mockDb
      // But we can't access mockDb easily here without making this async
      // So let's just set the ID and let the controllers handle the rest
    }

    req.user = {
      id: userId,
      email: email, // Placeholder
      role: role,   // Placeholder
    };
    next();
  } else {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0-dev',
    environment: 'development',
    database: {
      type: 'mock',
      status: 'connected',
      collections: await mockDb.listCollections(),
      stats: await mockDb.stats(),
    },
  };

  res.json(health);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'GACP Certification System API (Development)',
    version: '1.0.0-dev',
    description: 'Mock backend API for GACP certification system development',
    database: 'Mock Database (In-Memory)',
    endpoints: {
      health: '/health - System health check',
      auth: '/api/auth - Authentication endpoints',
      applications: '/api/applications - Application management',
      dashboard: '/api/dashboard - Dashboard data',
    },
    message: 'Development server ready! Frontend: http://localhost:3001',
  });
});

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'GACP Development API',
    version: '1.0.0-dev',
    mode: 'mock',
    endpoints: {
      'GET /health': 'Health check',
      'GET /api/auth/me': 'Get current user',
      'POST /api/auth/login': 'User login',
      'GET /api/applications': 'List applications',
      'POST /api/applications': 'Create application',
      'GET /api/applications/:id': 'Get application details',
      'GET /api/dashboard/stats': 'Dashboard statistics',
    },
  });
});

// Mock Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const users = await mockDb.collection('users');

    // Check if user exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const newUser = {
      email,
      password, // In real app, hash this!
      name: name || 'New User',
      role: role || 'farmer',
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: { ...newUser, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await mockDb.collection('users');
    const user = await users.findOne({ email });

    if (user && password === 'password') {
      // Simple password for dev
      res.json({
        success: true,
        message: 'Login successful',
        token: `mock_${user._id}_${Date.now()}`,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Mock Applications Routes
app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await mockDb.collection('applications');
    const docs = await applications.find({});
    const results = await docs.toArray();

    res.json({
      success: true,
      data: results,
      total: results.length,
      message: 'Applications retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications',
      error: error.message,
    });
  }
});

app.post('/api/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await mockDb.collection('applications');
    const newApplication = {
      ...req.body,
      applicantId: req.user.id,
      status: 'draft',
      applicationNumber: `GACP${Date.now()}`,
      createdAt: new Date(),
      submittedAt: null,
    };

    const result = await applications.insertOne(newApplication);

    res.status(201).json({
      success: true,
      data: { ...newApplication, _id: result.insertedId },
      message: 'Application created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create application',
      error: error.message,
    });
  }
});

app.get('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const applications = await mockDb.collection('applications');
    const application = await applications.findOne({ _id: req.params.id });

    if (application) {
      res.json({
        success: true,
        data: application,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve application',
      error: error.message,
    });
  }
});

// Mock Dashboard Routes
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await mockDb.stats();

    res.json({
      success: true,
      data: {
        totalApplications: stats.applications || 0,
        totalUsers: stats.users || 0,
        totalInspections: stats.inspections || 0,
        totalCertificates: stats.certificates || 0,
        recentActivity: [
          {
            type: 'application_submitted',
            message: 'New application submitted',
            timestamp: new Date(),
          },
          {
            type: 'inspection_scheduled',
            message: 'Inspection scheduled',
            timestamp: new Date(Date.now() - 60000),
          },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard stats',
      error: error.message,
    });
  }
});

// Mock Certificates Routes
app.get('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const certificates = await mockDb.collection('certificates');
    const docs = await certificates.find({});
    const results = await docs.toArray();

    res.json({
      success: true,
      data: results,
      total: results.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificates',
      error: error.message,
    });
  }
});

// ===== V2 Routes (Closed-loop Ecosystem) =====
// Mount V2 router for new notification and ticket system
try {
  const v2Router = require('./routes/v2');
  app.use('/api/v2', authenticateToken, v2Router);
  logger.info('✅ V2 Routes mounted at /api/v2');
} catch (error) {
  logger.warn('⚠️  V2 Routes not available:', error.message);
}

// Job Assignment Routes
// Job Assignment Routes
try {
  const MockJobAssignmentController = require('./controllers/MockJobAssignmentController');
  const mockJobController = new MockJobAssignmentController(mockDb);
  const jobRouter = express.Router();

  // Officer routes
  jobRouter.get('/unassigned', authenticateToken, mockJobController.getUnassignedJobs);
  jobRouter.post('/assign', authenticateToken, mockJobController.assignJob);

  // Auditor routes
  jobRouter.get('/my-assignments', authenticateToken, mockJobController.getMyAssignments);
  jobRouter.post('/:id/accept', authenticateToken, mockJobController.acceptAssignment);
  jobRouter.post('/:id/start', authenticateToken, mockJobController.startAssignment);
  jobRouter.post('/:id/complete', authenticateToken, mockJobController.completeAssignment);

  app.use('/api/job-assignment', authenticateToken, jobRouter);
  logger.info('✅ Job Assignment Routes mounted at /api/job-assignment (Mock Mode)');
} catch (error) {
  logger.warn('⚠️  Job Assignment Routes not available:', error.message);
}

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

app.use((err, req, res, _next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
app.listen(port, () => {
  logger.info('✅ GACP Development Server started successfully');
  logger.info(`🌐 Server: http://localhost:${port}`);
  logger.info(`📋 API Documentation: http://localhost:${port}/api`);
  logger.info(`❤️  Health Check: http://localhost:${port}/health`);
  logger.info('📊 Database: Mock Database (In-Memory);');
  logger.info("🔑 Dev Token: 'dev_token' for authentication");
  logger.info('');
  logger.info('Ready for frontend development! 🚀');
});

module.exports = app;
