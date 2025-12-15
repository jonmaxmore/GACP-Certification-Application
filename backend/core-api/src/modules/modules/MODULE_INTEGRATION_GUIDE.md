# Module Integration Guide

## User Management + Application Workflow Integration

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                              │
│                     (Express Routes)                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼───────┐           ┌───────▼───────┐
│ User Mgmt     │           │ Application   │
│ Module        │◄─────────►│ Workflow      │
│               │           │ Module        │
└───────┬───────┘           └───────┬───────┘
        │                           │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │     Shared Services       │
        │ (Audit, Cache, Notify)    │
        └───────────────────────────┘
```

### Integration Points

#### 1. Authentication Middleware Integration

```javascript
// In Application Workflow routes
const { createUserManagementModule } = require('../user-management');
const { createApplicationWorkflowModule } = require('../application-workflow');

// Initialize modules
const userModule = createUserManagementModule(dependencies);
const workflowModule = createApplicationWorkflowModule(dependencies);

// Get authentication middleware
const auth = userModule.getAuthenticationMiddleware();

// Apply to workflow routes
const applicationRoutes = workflowModule.getApplicationRoutes();

// Protected application endpoints
router.use(
  '/api/applications',
  auth.securityHeaders(),
  auth.rateLimit(),
  auth.extractToken(),
  auth.authenticate(),
  applicationRoutes,
);
```

#### 2. Role-Based Access Control

```javascript
// Application Controller with RBAC
class ApplicationController {
  constructor(dependencies) {
    this.authService = dependencies.userAuthenticationService;
    this.workflowEngine = dependencies.applicationWorkflowEngine;
  }

  async createApplication(req, res) {
    // Authentication already handled by middleware
    const userId = req.userId;
    const userRole = req.userRole;

    // Additional role validation
    if (userRole !== 'FARMER') {
      return res.status(403).json({
        success: false,
        error: 'ROLE_NOT_AUTHORIZED',
        message: 'Only farmers can create applications',
      });
    }

    // Create application
    const application = await this.workflowEngine.createApplication(req.body, userId);

    res.json({ success: true, data: { application } });
  }

  async reviewApplication(req, res) {
    const { applicationId } = req.params;
    const reviewerId = req.userId;
    const userRole = req.userRole;

    // Check reviewer permissions
    if (!['DTAM_REVIEWER', 'DTAM_ADMIN'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Only reviewers can review applications',
      });
    }

    // Process review
    const result = await this.workflowEngine.reviewApplication(applicationId, reviewerId, req.body);

    res.json({ success: true, data: result });
  }
}
```

#### 3. User Context in Workflow Engine

```javascript
// Enhanced WorkflowEngine with user context
class ApplicationWorkflowEngine {
  constructor(dependencies) {
    this.userRepository = dependencies.userRepository;
    this.authService = dependencies.userAuthenticationService;
    // ... other dependencies
  }

  async createApplication(applicationData, farmerId) {
    try {
      // Get farmer details
      const farmer = await this.userRepository.findById(farmerId);
      if (!farmer || farmer.role !== 'FARMER' || !farmer.isActive) {
        throw new Error('Invalid or inactive farmer account');
      }

      // Validate permissions
      const hasPermission = await this.authService.hasPermission(farmerId, 'application:create');

      if (!hasPermission) {
        throw new Error('Insufficient permissions to create application');
      }

      // Create application with farmer context
      const application = await this.applicationRepo.create({
        ...applicationData,
        farmerId,
        farmerEmail: farmer.email,
        farmerProfile: {
          firstName: farmer.firstName,
          lastName: farmer.lastName,
          farmInfo: farmer.profile?.farmInfo,
        },
        status: this.stateMachine.STATES.DRAFT,
      });

      return application;
    } catch (error) {
      console.error('[WorkflowEngine] Create application error:', error);
      throw error;
    }
  }

  async assignInspector(applicationId, province) {
    try {
      // Get available inspectors for province
      const inspectors = await this.userRepository.getInspectorsByProvince(province);

      if (inspectors.length === 0) {
        throw new Error(`No inspectors available for province: ${province}`);
      }

      // Simple assignment logic (round-robin or least busy)
      const assignedInspector = await this._selectOptimalInspector(inspectors);

      // Update application with inspector assignment
      await this.applicationRepo.update(applicationId, {
        inspector: {
          inspectorId: assignedInspector.id,
          inspectorName: assignedInspector.fullName,
          inspectorEmail: assignedInspector.email,
          assignedAt: new Date(),
        },
      });

      return assignedInspector;
    } catch (error) {
      console.error('[WorkflowEngine] Assign inspector error:', error);
      throw error;
    }
  }
}
```

#### 4. Unified Audit Logging

```javascript
// Shared audit service for both modules
class UnifiedAuditService {
  constructor(dependencies) {
    this.database = dependencies.database;
    this.logCollection = 'audit_logs';
  }

  async log(logData) {
    try {
      const auditEntry = {
        ...logData,
        timestamp: new Date(),
        id: require('crypto').randomUUID(),
      };

      // Enrich with user context if available
      if (logData.userId) {
        const user = await this.userRepository.findById(logData.userId, {
          select: 'email role firstName lastName',
        });

        if (user) {
          auditEntry.userContext = {
            email: user.email,
            role: user.role,
            name: user.fullName,
          };
        }
      }

      // Store in database
      await this.database.collection(this.logCollection).insertOne(auditEntry);
    } catch (error) {
      console.error('[AuditService] Logging error:', error);
    }
  }

  async getApplicationAuditTrail(applicationId) {
    try {
      return await this.database
        .collection(this.logCollection)
        .find({
          $or: [{ applicationId }, { 'details.applicationId': applicationId }],
        })
        .sort({ timestamp: 1 })
        .toArray();
    } catch (error) {
      console.error('[AuditService] Get audit trail error:', error);
      throw error;
    }
  }
}
```

#### 5. Notification Integration

```javascript
// Notification service with user preferences
class NotificationService {
  constructor(dependencies) {
    this.userRepository = dependencies.userRepository;
    this.emailService = dependencies.emailService;
    this.smsService = dependencies.smsService;
  }

  async notifyApplicationStatusChange(applicationId, newStatus, userId) {
    try {
      // Get user with notification preferences
      const user = await this.userRepository.findById(userId, {
        select: 'email firstName preferences profile.phone',
      });

      if (!user) return;

      const { notifications } = user.preferences || {};

      // Email notification
      if (notifications?.email !== false) {
        await this.sendEmailNotification(user.email, {
          type: 'APPLICATION_STATUS_CHANGED',
          applicationId,
          newStatus,
          recipientName: user.firstName,
        });
      }

      // SMS notification for critical updates
      if (notifications?.sms && user.profile?.phone) {
        const criticalStatuses = ['APPROVED', 'REJECTED', 'PAYMENT_PENDING'];

        if (criticalStatuses.includes(newStatus)) {
          await this.sendSMSNotification(user.profile.phone, {
            type: 'APPLICATION_STATUS_CHANGED',
            applicationId,
            newStatus,
          });
        }
      }
    } catch (error) {
      console.error('[NotificationService] Notify status change error:', error);
    }
  }
}
```

### Protected Route Examples

#### Complete Application Routes with Authentication

```javascript
const express = require('express');
const router = express.Router();

function createProtectedApplicationRoutes(dependencies) {
  const { auth, applicationController } = dependencies;

  // Farmer routes
  router.post(
    '/applications',
    auth.authenticate(),
    auth.requireRole('FARMER'),
    auth.authorize('application:create'),
    auth.rateLimit({ max: 10 }), // 10 applications per 15 min
    applicationController.createApplication,
  );

  router.get(
    '/applications/my',
    auth.authenticate(),
    auth.requireRole('FARMER'),
    auth.authorize('application:read:own'),
    applicationController.getMyApplications,
  );

  router.put(
    '/applications/:applicationId',
    auth.authenticate(),
    auth.requireRole('FARMER'),
    auth.authorize('application:update:own'),
    auth.validateResourceOwnership('applicationId'),
    applicationController.updateApplication,
  );

  // Reviewer routes
  router.get(
    '/applications/pending-review',
    auth.authenticate(),
    auth.requireRole(['DTAM_REVIEWER', 'DTAM_ADMIN']),
    auth.authorize('application:read:all'),
    applicationController.getPendingReviewApplications,
  );

  router.post(
    '/applications/:applicationId/review',
    auth.authenticate(),
    auth.requireRole(['DTAM_REVIEWER', 'DTAM_ADMIN']),
    auth.authorize('application:review'),
    auth.rateLimit({ max: 20 }), // 20 reviews per 15 min
    applicationController.reviewApplication,
  );

  // Inspector routes
  router.get(
    '/applications/assigned-to-me',
    auth.authenticate(),
    auth.requireRole('DTAM_INSPECTOR'),
    auth.authorize('application:read:assigned'),
    applicationController.getAssignedApplications,
  );

  router.post(
    '/applications/:applicationId/inspection',
    auth.authenticate(),
    auth.requireRole('DTAM_INSPECTOR'),
    auth.authorize('inspection:conduct'),
    applicationController.conductInspection,
  );

  // Admin routes
  router.get(
    '/applications',
    auth.authenticate(),
    auth.requireRole('DTAM_ADMIN'),
    auth.authorize('application:read:all'),
    applicationController.getAllApplications,
  );

  router.patch(
    '/applications/:applicationId/status',
    auth.authenticate(),
    auth.requireRole('DTAM_ADMIN'),
    auth.authorize('application:manage:all'),
    auth.rateLimit({ max: 50 }), // 50 admin actions per 15 min
    applicationController.updateApplicationStatus,
  );

  return router;
}
```

### Error Handling Integration

```javascript
// Unified error handler for both modules
class UnifiedErrorHandler {
  static handleAuthenticationError(error, req, res, next) {
    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_FAILED',
        message: 'Invalid or expired token',
      });
    }

    if (error.name === 'ForbiddenError') {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to perform this action',
      });
    }

    next(error);
  }

  static handleWorkflowError(error, req, res, next) {
    if (error.name === 'WorkflowTransitionError') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_WORKFLOW_TRANSITION',
        message: error.message,
      });
    }

    if (error.name === 'BusinessRuleViolationError') {
      return res.status(400).json({
        success: false,
        error: 'BUSINESS_RULE_VIOLATION',
        message: error.message,
      });
    }

    next(error);
  }

  static handleGenericError(error, req, res, next) {
    console.error('[UnifiedErrorHandler] Unhandled error:', error);

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      ...(isDevelopment && { debug: error.message, stack: error.stack }),
    });
  }
}
```

### Complete Express App Integration

```javascript
// app.js - Main application setup
const express = require('express');
const { createUserManagementModule } = require('./modules/user-management');
const { createApplicationWorkflowModule } = require('./modules/application-workflow');

const app = express();

// Initialize shared services
const dependencies = {
  cacheService: redisClient,
  auditService: auditLogger,
  notificationService: emailService,
  database: mongoConnection,
};

// Initialize modules
const userModule = createUserManagementModule(dependencies);
const workflowModule = createApplicationWorkflowModule({
  ...dependencies,
  userRepository: userModule.getUserRepository(),
  userAuthenticationService: userModule.getAuthenticationService(),
});

// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication routes (public)
app.use('/api/auth', userModule.getAuthRoutes());

// Application workflow routes (protected)
const auth = userModule.getAuthenticationMiddleware();
app.use(
  '/api/applications',
  auth.securityHeaders(),
  auth.rateLimit(),
  workflowModule.getApplicationRoutes(),
);

// Error handling
app.use(UnifiedErrorHandler.handleAuthenticationError);
app.use(UnifiedErrorHandler.handleWorkflowError);
app.use(UnifiedErrorHandler.handleGenericError);

module.exports = app;
```

This integration ensures:

1. **Secure Authentication**: All workflow endpoints protected by JWT
2. **Role-Based Access**: Granular permissions for each user type
3. **Unified Audit Trail**: Complete logging across both modules
4. **Consistent Error Handling**: Standardized error responses
5. **Performance Optimization**: Shared caching and database connections
6. **Maintainable Architecture**: Clean separation with clear interfaces

The integration provides a complete, production-ready authentication and workflow system with clear logic, defined processes, and comprehensive security.
