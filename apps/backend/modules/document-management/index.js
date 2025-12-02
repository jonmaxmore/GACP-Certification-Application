/**
 * Document Management Module Index
 *
 * Main entry point for the Document Management Module.
 * Configures and exports all document management functionality including
 * services, controllers, routes, and repository patterns.
 *
 * This module provides:
 * - Secure file upload and storage
 * - Document metadata management
 * - Access control and permissions
 * - File validation and virus scanning
 * - Document search and filtering
 * - Thumbnail generation
 * - Document sharing capabilities
 * - Audit logging for all operations
 *
 * Architecture Pattern: Clean Architecture
 * - Domain Layer: Document entity and business rules
 * - Application Layer: DocumentManagementService and use cases
 * - Infrastructure Layer: File storage, database repositories
 * - Presentation Layer: Controllers and routes
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../shared/logger/logger');
const DocumentManagementService = require('./application/services/DocumentManagementService');
const DocumentController = require('./presentation/controllers/DocumentController');
const DocumentRoutes = require('./presentation/routes/document-routes.routes');
const Document = require('./domain/entities/Document');

class DocumentManagementModule {
  constructor(dependencies = {}) {
    this.dependencies = dependencies;
    this.service = null;
    this.controller = null;
    this.routes = null;

    this._initializeModule();
    logger.info('[DocumentManagementModule] Initialized successfully');
  }

  /**
   * Initialize the document management module
   * @private
   */
  _initializeModule() {
    try {
      // Validate required dependencies
      this._validateDependencies();

      // Initialize service layer
      this.service = new DocumentManagementService(this.dependencies);

      // Initialize presentation layer
      const controllerDependencies = {
        ...this.dependencies,
        documentManagementService: this.service,
      };

      this.controller = new DocumentController(controllerDependencies);
      this.routes = new DocumentRoutes(controllerDependencies);

      logger.info('[DocumentManagementModule] All components initialized');
    } catch (error) {
      logger.error('[DocumentManagementModule] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Validate required dependencies
   * @private
   */
  _validateDependencies() {
    const required = ['mongooseConnection', 'awsS3Config', 'redisConnection'];

    const missing = required.filter(dep => !this.dependencies[dep]);

    if (missing.length > 0) {
      throw new Error(`Missing required dependencies: ${missing.join(', ')}`);
    }

    // Optional dependencies with warnings
    const optional = ['virusScanService', 'ocrService', 'auditService', 'notificationService'];

    optional.forEach(dep => {
      if (!this.dependencies[dep]) {
        console.warn(
          `[DocumentManagementModule] Optional dependency '${dep}' not provided - related features will be disabled`,
        );
      }
    });
  }

  /**
   * Get the document management service
   */
  getService() {
    return this.service;
  }

  /**
   * Get the document controller
   */
  getController() {
    return this.controller;
  }

  /**
   * Get the document routes
   */
  getRoutes() {
    return this.routes.getRouter();
  }

  /**
   * Get the Document model/entity
   */
  getDocumentModel() {
    return Document;
  }

  /**
   * Health check for the module
   */
  async healthCheck() {
    try {
      const health = {
        module: 'DocumentManagement',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        components: {},
      };

      // Check service health
      if (this.service) {
        health.components.service = await this.service.healthCheck();
      }

      // Check database connection
      if (this.dependencies.mongooseConnection) {
        health.components.database = {
          status:
            this.dependencies.mongooseConnection.readyState === 1 ? 'connected' : 'disconnected',
          readyState: this.dependencies.mongooseConnection.readyState,
        };
      }

      // Check S3 connection
      if (this.dependencies.awsS3Config) {
        try {
          // Simple S3 health check would go here
          health.components.s3Storage = { status: 'configured' };
        } catch (error) {
          health.components.s3Storage = {
            status: 'error',
            error: error.message,
          };
        }
      }

      // Check Redis connection
      if (this.dependencies.redisConnection) {
        health.components.redis = {
          status: this.dependencies.redisConnection.status || 'unknown',
        };
      }

      // Overall health status
      const componentStatuses = Object.values(health.components).map(c => c.status);
      if (componentStatuses.includes('error')) {
        health.status = 'degraded';
      } else if (componentStatuses.includes('disconnected')) {
        health.status = 'degraded';
      }

      return health;
    } catch (error) {
      return {
        module: 'DocumentManagement',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Get module configuration
   */
  getConfig() {
    return {
      module: 'DocumentManagement',
      version: '1.0.0',
      features: {
        fileUpload: true,
        virusScanning: !!this.dependencies.virusScanService,
        ocrProcessing: !!this.dependencies.ocrService,
        thumbnailGeneration: true,
        documentSharing: true,
        auditLogging: !!this.dependencies.auditService,
        notifications: !!this.dependencies.notificationService,
      },
      limits: {
        maxFileSize: '50MB',
        allowedFileTypes: [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        maxDocumentsPerApplication: 50,
      },
      security: {
        encryptionAtRest: true,
        encryptionInTransit: true,
        accessControl: 'role-based',
        auditLogging: !!this.dependencies.auditService,
      },
    };
  }

  /**
   * Clean shutdown of the module
   */
  async shutdown() {
    logger.info('[DocumentManagementModule] Shutting down...');

    try {
      // Close any open connections or cleanup resources
      if (this.service && typeof this.service.shutdown === 'function') {
        await this.service.shutdown();
      }

      logger.info('[DocumentManagementModule] Shutdown completed');
    } catch (error) {
      logger.error('[DocumentManagementModule] Error during shutdown:', error);
      throw error;
    }
  }
}

// Export both the class and a factory function
module.exports = DocumentManagementModule;

/**
 * Factory function to create a new document management module instance
 * @param {Object} dependencies - Required and optional dependencies
 * @returns {DocumentManagementModule} Configured module instance
 */
module.exports.createModule = dependencies => {
  return new DocumentManagementModule(dependencies);
};

/**
 * Module metadata
 */
module.exports.metadata = {
  name: 'DocumentManagement',
  version: '1.0.0',
  description: 'Comprehensive document management module for GACP platform',
  author: 'GACP Platform Team',
  dependencies: {
    required: ['mongooseConnection', 'awsS3Config', 'redisConnection'],
    optional: ['virusScanService', 'ocrService', 'auditService', 'notificationService'],
  },
  features: [
    'file-upload',
    'virus-scanning',
    'ocr-processing',
    'thumbnail-generation',
    'document-sharing',
    'audit-logging',
    'access-control',
    'search-filtering',
  ],
};
