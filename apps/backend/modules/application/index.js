/**
 * Enhanced Application Module - Main Index
 *
 * Central orchestration and export point for the enhanced GACP application processing system.
 * This module provides a unified interface to all application processing functionality,
 * comprehensive service initialization, and complete system integration capabilities.
 *
 * Module Architecture & Business Logic:
 * 1. Service Layer Integration - Advanced processing, document management, government APIs
 * 2. Presentation Layer Setup - Enhanced controllers and comprehensive route management
 * 3. Infrastructure Layer - Database models, external integrations, and configuration
 * 4. Testing Suite Integration - Complete integration and unit test capabilities
 * 5. Configuration Management - Environment-aware settings and validation
 * 6. Monitoring and Analytics - Performance tracking and system health monitoring
 *
 * Workflow & Process Integration:
 * All components are orchestrated through this index to provide seamless
 * application lifecycle management with comprehensive audit trails, real-time
 * monitoring, and government system integration.
 *
 * System Enhancement Features:
 * - Complete 12-state FSM workflow management
 * - Multi-ministry government integration with circuit breakers
 * - Intelligent document processing with OCR and AI validation
 * - Real-time analytics and performance monitoring
 * - Enterprise-grade security and compliance features
 * - Comprehensive error handling and resilience patterns
 */

// Core Node.js modules
const logger = require('../../shared/logger/logger');
const EventEmitter = require('events');

// External dependencies
const mongoose = require('mongoose');

// ============================================================================
// CONFIGURATION AND SETUP
// ============================================================================

// Import enhanced application configuration
const { config, getConfig, getSection, getConfigValue } = require('./config-utils');

logger.info('[EnhancedApplicationModule] Loading enhanced application processing system...');

// ============================================================================
// DOMAIN LAYER IMPORTS
// ============================================================================

// Enhanced application processing service with FSM workflow
const AdvancedApplicationProcessingService = require('./domain/services/AdvancedApplicationProcessingService');

// Application entity models and value objects
// Note: These would typically be in separate files
const ApplicationEntity = require('./domain/entities/ApplicationEntity');
const ApplicationStateValueObject = require('./domain/value-objects/ApplicationStateValueObject');
const FarmDetailsValueObject = require('./domain/value-objects/FarmDetailsValueObject');

// Domain events for application processing
const ApplicationEvents = {
  APPLICATION_CREATED: 'application.created',
  APPLICATION_SUBMITTED: 'application.submitted',
  STATE_TRANSITION: 'application.state_transition',
  DOCUMENT_UPLOADED: 'application.document_uploaded',
  GOVERNMENT_VERIFICATION: 'application.government_verification',
  INSPECTION_SCHEDULED: 'application.inspection_scheduled',
  APPROVAL_GRANTED: 'application.approval_granted',
  CERTIFICATE_ISSUED: 'application.certificate_issued',
  APPLICATION_REJECTED: 'application.rejection',
  APPEAL_SUBMITTED: 'application.appeal_submitted',
  ERROR_OCCURRED: 'application.error',
};

// ============================================================================
// APPLICATION LAYER IMPORTS
// ============================================================================

// Enhanced application processing controller
const EnhancedApplicationProcessingController = require('./application/controllers/EnhancedApplicationProcessingController');

// Application use cases and command handlers
// Note: These would typically be implemented in separate files
const ApplicationUseCases = {
  CreateApplicationUseCase: require('./application/use-cases/CreateApplicationUseCase'),
  ProcessStateTransitionUseCase: require('./application/use-cases/ProcessStateTransitionUseCase'),
  UploadDocumentUseCase: require('./application/use-cases/UploadDocumentUseCase'),
  VerifyGovernmentDataUseCase: require('./application/use-cases/VerifyGovernmentDataUseCase'),
  GenerateAnalyticsUseCase: require('./application/use-cases/GenerateAnalyticsUseCase'),
};

// ============================================================================
// INFRASTRUCTURE LAYER IMPORTS
// ============================================================================

// Enhanced integration systems
const DocumentManagementIntegrationSystem = require('./infrastructure/integrations/DocumentManagementIntegrationSystem');
const GovernmentApiIntegrationService = require('./infrastructure/integrations/GovernmentApiIntegrationService');

// Database repositories
// Note: These would typically be implemented in separate files
const ApplicationRepository = require('./infrastructure/repositories/ApplicationRepository');
const DocumentRepository = require('./infrastructure/repositories/DocumentRepository');
const AuditLogRepository = require('./infrastructure/repositories/AuditLogRepository');
const AnalyticsRepository = require('./infrastructure/repositories/AnalyticsRepository');

// External service adapters
const EmailServiceAdapter = require('./infrastructure/adapters/EmailServiceAdapter');
const SMSServiceAdapter = require('./infrastructure/adapters/SMSServiceAdapter');
const NotificationServiceAdapter = require('./infrastructure/adapters/NotificationServiceAdapter');

// ============================================================================
// PRESENTATION LAYER IMPORTS
// ============================================================================

// Enhanced routing system
const {
  createEnhancedApplicationRoutes,
  getRouteDocumentation,
} = require('./presentation/routes/enhanced-application.routes');

// API middleware and validators
const ApplicationMiddleware = require('./presentation/middleware/ApplicationMiddleware-middleware');
const ValidationMiddleware = require('./presentation/middleware/ValidationMiddleware-middleware');
const AuthorizationMiddleware = require('./presentation/middleware/AuthorizationMiddleware-middleware');

// ============================================================================
// TESTING SUITE IMPORTS
// ============================================================================

// Integration test suite
const ApplicationIntegrationTestSuite = require('./tests/integration/ApplicationIntegrationTestSuite');

// Unit test utilities
// Note: These would typically be implemented in separate files
const TestUtilities = {
  ApplicationTestFactory: require('./tests/factories/ApplicationTestFactory'),
  MockGovernmentServices: require('./tests/mocks/MockGovernmentServices'),
  TestDataGenerator: require('./tests/helpers/TestDataGenerator'),
};

// ============================================================================
// ENHANCED APPLICATION MODULE CLASS
// ============================================================================

/**
 * Enhanced Application Processing Module
 *
 * Comprehensive orchestration class that manages the complete lifecycle
 * of GACP application processing with advanced features and integrations.
 */
class EnhancedApplicationModule extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = config;
    this.options = {
      enableAnalytics: true,
      enableGovernmentIntegration: true,
      enableDocumentProcessing: true,
      enableRealTimeUpdates: true,
      enableHealthChecks: true,
      ...options,
    };

    // Service instances
    this.services = {};
    this.controllers = {};
    this.repositories = {};
    this.integrations = {};

    // Module state
    this.isInitialized = false;
    this.isHealthy = true;
    this.startupTime = null;
    this.metrics = {
      applicationsProcessed: 0,
      documentsUploaded: 0,
      governmentVerifications: 0,
      stateTransitions: 0,
      errors: 0,
    };

    logger.info('[EnhancedApplicationModule] Module instance created');
  }

  /**
   * Initialize the enhanced application module
   */
  async initialize(app = null) {
    if (this.isInitialized) {
      logger.info('[EnhancedApplicationModule] Already initialized');
      return this;
    }

    logger.info('[EnhancedApplicationModule] Starting initialization...');
    this.startupTime = Date.now();

    try {
      // Step 1: Initialize database repositories
      await this.initializeRepositories();

      // Step 2: Initialize infrastructure services
      await this.initializeInfrastructureServices();

      // Step 3: Initialize domain services
      await this.initializeDomainServices();

      // Step 4: Initialize application controllers
      await this.initializeControllers();

      // Step 5: Setup Express routes (if app provided)
      if (app && typeof app.use === 'function') {
        await this.setupRoutes(app);
      }

      // Step 6: Initialize monitoring and health checks
      if (this.options.enableHealthChecks) {
        await this.initializeHealthChecks();
      }

      // Step 7: Setup event listeners
      await this.setupEventListeners();

      this.isInitialized = true;
      const initTime = Date.now() - this.startupTime;

      logger.info(`[EnhancedApplicationModule] Initialization completed in ${initTime}ms`);
      this.emit('module.initialized', { initTime });

      return this;
    } catch (error) {
      logger.error('[EnhancedApplicationModule] Initialization failed:', error);
      this.isHealthy = false;
      this.emit('module.initialization_failed', { error });
      throw error;
    }
  }

  /**
   * Initialize database repositories
   */
  async initializeRepositories() {
    logger.info('[EnhancedApplicationModule] Initializing repositories...');

    const dbConfig = getSection('database').mongodb;

    // Initialize application repository
    this.repositories.application = new ApplicationRepository({
      connectionUri: dbConfig.uri,
      collectionName: dbConfig.collections.applications.name,
      indexes: dbConfig.collections.applications.indexes,
    });

    // Initialize document repository
    this.repositories.document = new DocumentRepository({
      connectionUri: dbConfig.uri,
      collectionName: dbConfig.collections.documents.name,
      indexes: dbConfig.collections.documents.indexes,
    });

    // Initialize audit log repository
    this.repositories.auditLog = new AuditLogRepository({
      connectionUri: dbConfig.uri,
      collectionName: dbConfig.collections.auditLogs.name,
      indexes: dbConfig.collections.auditLogs.indexes,
    });

    // Initialize analytics repository
    if (this.options.enableAnalytics) {
      this.repositories.analytics = new AnalyticsRepository({
        connectionUri: dbConfig.uri,
        collectionName: dbConfig.collections.analytics.name,
        indexes: dbConfig.collections.analytics.indexes,
      });
    }

    // Wait for repositories to be ready
    await Promise.all(
      Object.values(this.repositories).map(repo =>
        repo.initialize ? repo.initialize() : Promise.resolve(),
      ),
    );

    logger.info('[EnhancedApplicationModule] Repositories initialized successfully');
  }

  /**
   * Initialize infrastructure services
   */
  async initializeInfrastructureServices() {
    logger.info('[EnhancedApplicationModule] Initializing infrastructure services...');

    // Initialize document management system
    if (this.options.enableDocumentProcessing) {
      const documentConfig = getSection('documentManagement');
      this.integrations.documentManagement = new DocumentManagementIntegrationSystem(
        documentConfig,
      );
      await this.integrations.documentManagement.initialize();
    }

    // Initialize government API integration
    if (this.options.enableGovernmentIntegration) {
      const govConfig = getSection('governmentIntegration');
      this.integrations.government = new GovernmentApiIntegrationService(govConfig);
      await this.integrations.government.initialize();
    }

    // Initialize notification services
    const securityConfig = getSection('security');
    this.integrations.email = new EmailServiceAdapter(securityConfig.email || {});
    this.integrations.sms = new SMSServiceAdapter(securityConfig.sms || {});
    this.integrations.notification = new NotificationServiceAdapter({
      email: this.integrations.email,
      sms: this.integrations.sms,
    });

    logger.info('[EnhancedApplicationModule] Infrastructure services initialized successfully');
  }

  /**
   * Initialize domain services
   */
  async initializeDomainServices() {
    logger.info('[EnhancedApplicationModule] Initializing domain services...');

    // Initialize advanced application processing service
    this.services.applicationProcessing = new AdvancedApplicationProcessingService({
      applicationRepository: this.repositories.application,
      documentRepository: this.repositories.document,
      auditLogRepository: this.repositories.auditLog,
      analyticsRepository: this.repositories.analytics,
      documentManagement: this.integrations.documentManagement,
      governmentIntegration: this.integrations.government,
      notificationService: this.integrations.notification,
      config: getSection('workflow'),
      enableRealTime: this.options.enableRealTimeUpdates,
    });

    await this.services.applicationProcessing.initialize();

    logger.info('[EnhancedApplicationModule] Domain services initialized successfully');
  }

  /**
   * Initialize application controllers
   */
  async initializeControllers() {
    logger.info('[EnhancedApplicationModule] Initializing controllers...');

    // Initialize enhanced application processing controller
    this.controllers.applicationProcessing = new EnhancedApplicationProcessingController({
      applicationService: this.services.applicationProcessing,
      documentService: this.integrations.documentManagement,
      governmentService: this.integrations.government,
      config: {
        security: getSection('security'),
        performance: getSection('analytics').performance || {},
      },
    });

    await this.controllers.applicationProcessing.initialize();

    logger.info('[EnhancedApplicationModule] Controllers initialized successfully');
  }

  /**
   * Setup Express routes
   */
  async setupRoutes(app) {
    logger.info('[EnhancedApplicationModule] Setting up routes...');

    // Create authentication middleware
    const authMiddleware = {
      requireAuth: AuthorizationMiddleware.requireAuth,
      requireRole: AuthorizationMiddleware.requireRole,
    };

    // Create enhanced application routes
    const { dtamRouter, farmerRouter, adminRouter } = createEnhancedApplicationRoutes(
      this.controllers.applicationProcessing,
      authMiddleware,
    );

    // Apply global middleware
    app.use(
      '/api/dtam/applications',
      ApplicationMiddleware.requestLogging,
      ApplicationMiddleware.rateLimiting,
      ValidationMiddleware.validateRequest,
      dtamRouter,
    );

    app.use(
      '/api/farmer/applications',
      ApplicationMiddleware.requestLogging,
      ApplicationMiddleware.rateLimiting,
      ValidationMiddleware.validateRequest,
      farmerRouter,
    );

    app.use(
      '/api/admin/applications',
      ApplicationMiddleware.requestLogging,
      ApplicationMiddleware.rateLimiting,
      ValidationMiddleware.validateRequest,
      adminRouter,
    );

    // Add API documentation endpoint
    app.get('/api/applications/docs', (req, res) => {
      res.json(getRouteDocumentation());
    });

    // Add module health endpoint
    app.get('/api/applications/health', (req, res) => {
      res.json(this.getHealthStatus());
    });

    logger.info('[EnhancedApplicationModule] Routes setup completed');
  }

  /**
   * Initialize health checks and monitoring
   */
  async initializeHealthChecks() {
    logger.info('[EnhancedApplicationModule] Initializing health checks...');

    // Setup periodic health checks
    this.healthCheckInterval = setInterval(
      () => {
        this.performHealthCheck();
      },
      getConfigValue('application.healthCheck.interval') || 30000,
    );

    // Setup metrics collection
    if (this.options.enableAnalytics) {
      this.metricsInterval = setInterval(
        () => {
          this.collectMetrics();
        },
        getConfigValue('analytics.performance.realtime.updateInterval') || 5000,
      );
    }

    logger.info('[EnhancedApplicationModule] Health checks initialized');
  }

  /**
   * Setup event listeners for module coordination
   */
  async setupEventListeners() {
    logger.info('[EnhancedApplicationModule] Setting up event listeners...');

    // Listen to application processing events
    if (this.services.applicationProcessing) {
      this.services.applicationProcessing.on('application.created', data => {
        this.metrics.applicationsProcessed++;
        this.emit(ApplicationEvents.APPLICATION_CREATED, data);
      });

      this.services.applicationProcessing.on('state.transition', data => {
        this.metrics.stateTransitions++;
        this.emit(ApplicationEvents.STATE_TRANSITION, data);
      });

      this.services.applicationProcessing.on('error', error => {
        this.metrics.errors++;
        this.emit(ApplicationEvents.ERROR_OCCURRED, error);
        logger.error('[EnhancedApplicationModule] Application processing error:', error);
      });
    }

    // Listen to document management events
    if (this.integrations.documentManagement) {
      this.integrations.documentManagement.on('document.uploaded', data => {
        this.metrics.documentsUploaded++;
        this.emit(ApplicationEvents.DOCUMENT_UPLOADED, data);
      });

      this.integrations.documentManagement.on('document.processed', data => {
        this.emit('document.processed', data);
      });
    }

    // Listen to government integration events
    if (this.integrations.government) {
      this.integrations.government.on('verification.completed', data => {
        this.metrics.governmentVerifications++;
        this.emit(ApplicationEvents.GOVERNMENT_VERIFICATION, data);
      });

      this.integrations.government.on('api.error', error => {
        this.emit('government.api.error', error);
        logger.warn('[EnhancedApplicationModule] Government API error:', error);
      });
    }

    logger.info('[EnhancedApplicationModule] Event listeners setup completed');
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const healthStatus = {
      timestamp: new Date(),
      overall: 'healthy',
      services: {},
      metrics: this.metrics,
    };

    try {
      // Check database connection
      if (mongoose.connection.readyState === 1) {
        healthStatus.services.database = 'healthy';
      } else {
        healthStatus.services.database = 'unhealthy';
        healthStatus.overall = 'degraded';
      }

      // Check application processing service
      if (this.services.applicationProcessing && this.services.applicationProcessing.isHealthy()) {
        healthStatus.services.applicationProcessing = 'healthy';
      } else {
        healthStatus.services.applicationProcessing = 'unhealthy';
        healthStatus.overall = 'degraded';
      }

      // Check document management
      if (
        this.integrations.documentManagement &&
        (await this.integrations.documentManagement.healthCheck())
      ) {
        healthStatus.services.documentManagement = 'healthy';
      } else {
        healthStatus.services.documentManagement = 'unhealthy';
        healthStatus.overall = 'degraded';
      }

      // Check government integration
      if (this.integrations.government && (await this.integrations.government.healthCheck())) {
        healthStatus.services.governmentIntegration = 'healthy';
      } else {
        healthStatus.services.governmentIntegration = 'unhealthy';
        healthStatus.overall = 'degraded';
      }

      // Update module health status
      this.isHealthy = healthStatus.overall !== 'critical';
      this.lastHealthCheck = healthStatus;
    } catch (error) {
      healthStatus.overall = 'critical';
      healthStatus.error = error.message;
      this.isHealthy = false;
      logger.error('[EnhancedApplicationModule] Health check failed:', error);
    }

    return healthStatus;
  }

  /**
   * Collect performance metrics
   */
  async collectMetrics() {
    try {
      const currentMetrics = {
        timestamp: new Date(),
        processId: process.pid,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
        moduleMetrics: { ...this.metrics },
      };

      // Store metrics if analytics repository is available
      if (this.repositories.analytics) {
        await this.repositories.analytics.storeMetrics(currentMetrics);
      }

      this.emit('metrics.collected', currentMetrics);
    } catch (error) {
      logger.error('[EnhancedApplicationModule] Metrics collection failed:', error);
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      isHealthy: this.isHealthy,
      startupTime: this.startupTime,
      uptime: this.startupTime ? Date.now() - this.startupTime : 0,
      metrics: this.metrics,
      lastHealthCheck: this.lastHealthCheck,
      services: Object.keys(this.services).length,
      integrations: Object.keys(this.integrations).length,
      repositories: Object.keys(this.repositories).length,
    };
  }

  /**
   * Get module information and capabilities
   */
  getModuleInfo() {
    return {
      name: 'Enhanced Application Processing Module',
      version: '2.0.0',
      description:
        'Advanced GACP application processing with FSM workflow and government integration',
      capabilities: [
        'Advanced 12-state FSM workflow management',
        'Multi-ministry government integration',
        'Intelligent document processing with OCR',
        'Real-time analytics and monitoring',
        'Enterprise security and compliance',
        'Comprehensive audit trails',
        'Performance optimization',
        'Circuit breaker patterns',
        'Automated testing suite',
      ],

      endpoints: {
        farmer: '/api/farmer/applications/*',
        dtam: '/api/dtam/applications/*',
        admin: '/api/admin/applications/*',
        health: '/api/applications/health',
        docs: '/api/applications/docs',
      },

      events: Object.values(ApplicationEvents),

      integrations: [
        'National ID Verification Service',
        'Department of Lands API',
        'Ministry of Agriculture (MOAC)',
        'Department of Agriculture (DOA)',
        'Food and Drug Administration (FDA)',
        'Document Management System',
        'Email Service',
        'SMS Service',
      ],
    };
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests() {
    logger.info('[EnhancedApplicationModule] Running integration tests...');

    const testSuite = new ApplicationIntegrationTestSuite();
    const results = await testSuite.runCompleteTestSuite();

    this.emit('integration_tests.completed', results);
    return results;
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    logger.info('[EnhancedApplicationModule] Initiating graceful shutdown...');

    try {
      // Clear intervals
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
      }

      // Shutdown services
      const shutdownPromises = [];

      if (this.services.applicationProcessing && this.services.applicationProcessing.shutdown) {
        shutdownPromises.push(this.services.applicationProcessing.shutdown());
      }

      if (this.integrations.documentManagement && this.integrations.documentManagement.shutdown) {
        shutdownPromises.push(this.integrations.documentManagement.shutdown());
      }

      if (this.integrations.government && this.integrations.government.shutdown) {
        shutdownPromises.push(this.integrations.government.shutdown());
      }

      await Promise.all(shutdownPromises);

      // Close database connections
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }

      this.isInitialized = false;
      this.isHealthy = false;

      logger.info('[EnhancedApplicationModule] Shutdown completed successfully');
      this.emit('module.shutdown');
    } catch (error) {
      logger.error('[EnhancedApplicationModule] Shutdown error:', error);
      throw error;
    }
  }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Create singleton instance
const enhancedApplicationModule = new EnhancedApplicationModule();

// Export module components
module.exports = {
  // Main module instance
  EnhancedApplicationModule,
  enhancedApplicationModule,

  // Configuration
  config,
  getConfig,
  getSection,
  getConfigValue,

  // Domain layer
  AdvancedApplicationProcessingService,
  ApplicationEntity,
  ApplicationStateValueObject,
  FarmDetailsValueObject,
  ApplicationEvents,

  // Application layer
  EnhancedApplicationProcessingController,
  ApplicationUseCases,

  // Infrastructure layer
  DocumentManagementIntegrationSystem,
  GovernmentApiIntegrationService,
  ApplicationRepository,
  DocumentRepository,
  AuditLogRepository,
  AnalyticsRepository,

  // Presentation layer
  createEnhancedApplicationRoutes,
  getRouteDocumentation,
  ApplicationMiddleware,
  ValidationMiddleware,
  AuthorizationMiddleware,

  // Testing suite
  ApplicationIntegrationTestSuite,
  TestUtilities,

  // Utility functions
  initialize: app => enhancedApplicationModule.initialize(app),
  getHealthStatus: () => enhancedApplicationModule.getHealthStatus(),
  getModuleInfo: () => enhancedApplicationModule.getModuleInfo(),
  runTests: () => enhancedApplicationModule.runIntegrationTests(),
  shutdown: () => enhancedApplicationModule.shutdown(),
};

// Log successful module loading
logger.info('[EnhancedApplicationModule] Module loaded successfully');
console.log(
  '[EnhancedApplicationModule] Available components:',
  Object.keys(module.exports).length,
);
