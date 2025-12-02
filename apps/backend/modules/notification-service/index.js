/**
 * Notification Service Module Index
 *
 * Main entry point for the Notification Service Module in the GACP platform.
 * This module provides comprehensive notification management capabilities including
 * multi-channel delivery (email, SMS, in-app), template management, analytics,
 * and integration with all platform workflows.
 *
 * Features:
 * - Multi-channel notification delivery (Email via SES, SMS via Thai gateway, In-app)
 * - Template management with Handlebars templating engine
 * - Real-time delivery tracking and analytics
 * - User preference management and quiet hours
 * - Workflow integration for application status updates
 * - Payment notification system integration
 * - Bulk notification capabilities for admin users
 * - Rate limiting and spam prevention
 * - Comprehensive audit logging
 * - Health monitoring and error tracking
 *
 * Business Integration:
 * - Application workflow status notifications
 * - Payment confirmation and receipt delivery
 * - Inspection scheduling and reminders
 * - Document submission alerts
 * - Compliance deadline reminders
 * - System maintenance notifications
 * - User engagement communications
 *
 * Security Features:
 * - JWT authentication on all endpoints
 * - Role-based authorization for admin operations
 * - Input validation and sanitization
 * - Rate limiting by user and operation type
 * - Delivery tracking with privacy protection
 * - Secure template rendering
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../shared/logger/logger');
const NotificationService = require('./application/services/NotificationService');
const NotificationController = require('./presentation/controllers/NotificationController');
const NotificationRoutes = require('./presentation/routes/notification-routes.routes');
const Notification = require('./domain/entities/Notification');

class NotificationModule {
  constructor(dependencies = {}) {
    this.dependencies = dependencies;
    this.service = null;
    this.controller = null;
    this.routes = null;
    this.isInitialized = false;

    logger.info('[NotificationModule] Initializing...');
  }

  /**
   * Initialize the notification module with dependencies
   * @param {Object} dependencies - External dependencies
   * @param {Object} dependencies.database - MongoDB connection
   * @param {Object} dependencies.redis - Redis connection for caching
   * @param {Object} dependencies.userRepository - User data access
   * @param {Object} dependencies.auditService - Audit logging service
   * @param {Object} dependencies.emailService - Email delivery service (SES)
   * @param {Object} dependencies.smsService - SMS delivery service
   * @param {Object} dependencies.templateEngine - Handlebars template engine
   * @param {Object} dependencies.config - Configuration settings
   * @returns {Promise<void>}
   */
  async initialize(dependencies = {}) {
    try {
      // Merge provided dependencies with existing ones
      this.dependencies = { ...this.dependencies, ...dependencies };

      // Validate required dependencies
      this._validateDependencies();

      // Initialize core service
      this.service = new NotificationService(this.dependencies);
      await this.service.initialize();

      // Initialize controller
      this.controller = new NotificationController({
        ...this.dependencies,
        notificationService: this.service,
      });

      // Initialize routes
      this.routes = new NotificationRoutes({
        ...this.dependencies,
        notificationController: this.controller,
      });

      this.isInitialized = true;

      logger.info('[NotificationModule] Initialized successfully');

      // Log module capabilities
      this._logModuleCapabilities();

      return this;
    } catch (error) {
      logger.error('[NotificationModule] Initialization failed:', error);
      throw new Error(`NotificationModule initialization failed: ${error.message}`);
    }
  }

  /**
   * Validate required dependencies
   * @private
   */
  _validateDependencies() {
    const required = ['database', 'userRepository', 'config'];

    const missing = required.filter(dep => !this.dependencies[dep]);

    if (missing.length > 0) {
      throw new Error(`Missing required dependencies: ${missing.join(', ')}`);
    }

    // Validate configuration
    const config = this.dependencies.config;
    if (!config.notification) {
      throw new Error('Notification configuration is required');
    }

    const notificationConfig = config.notification;
    const requiredConfig = ['email', 'sms', 'templates'];
    const missingConfig = requiredConfig.filter(key => !notificationConfig[key]);

    if (missingConfig.length > 0) {
      logger.warn(`[NotificationModule] Missing notification config: ${missingConfig.join(', ')}`);
    }
  }

  /**
   * Log module capabilities for debugging and documentation
   * @private
   */
  _logModuleCapabilities() {
    const capabilities = {
      channels: ['email', 'sms', 'in-app'],
      features: [
        'Template management',
        'Multi-channel delivery',
        'Real-time tracking',
        'User preferences',
        'Bulk notifications',
        'Analytics and reporting',
        'Rate limiting',
        'Audit logging',
      ],
      integration: [
        'Application workflow',
        'Payment system',
        'Document management',
        'User management',
        'Audit system',
      ],
      endpoints: this.routes ? this.routes.getRouteInfo().endpoints.length : 0,
    };

    logger.info('[NotificationModule] Capabilities:', JSON.stringify(capabilities, null, 2));
  }

  /**
   * Get the notification service instance
   * @returns {NotificationService}
   */
  getService() {
    if (!this.isInitialized) {
      throw new Error('NotificationModule must be initialized before accessing service');
    }
    return this.service;
  }

  /**
   * Get the notification controller instance
   * @returns {NotificationController}
   */
  getController() {
    if (!this.isInitialized) {
      throw new Error('NotificationModule must be initialized before accessing controller');
    }
    return this.controller;
  }

  /**
   * Get the Express router for notification routes
   * @returns {express.Router}
   */
  getRoutes() {
    if (!this.isInitialized) {
      throw new Error('NotificationModule must be initialized before accessing routes');
    }
    return this.routes.getRouter();
  }

  /**
   * Send a notification (convenience method)
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>}
   */
  async sendNotification(notificationData) {
    if (!this.isInitialized) {
      throw new Error('NotificationModule must be initialized before sending notifications');
    }
    return await this.service.sendNotification(notificationData);
  }

  /**
   * Send a workflow notification (convenience method)
   * @param {Object} workflowData - Workflow notification data
   * @returns {Promise<Object>}
   */
  async sendWorkflowNotification(workflowData) {
    if (!this.isInitialized) {
      throw new Error(
        'NotificationModule must be initialized before sending workflow notifications',
      );
    }
    return await this.service.sendWorkflowNotification(workflowData);
  }

  /**
   * Send a payment notification (convenience method)
   * @param {Object} paymentData - Payment notification data
   * @returns {Promise<Object>}
   */
  async sendPaymentNotification(paymentData) {
    if (!this.isInitialized) {
      throw new Error(
        'NotificationModule must be initialized before sending payment notifications',
      );
    }
    return await this.service.sendPaymentNotification(paymentData);
  }

  /**
   * Get notification statistics
   * @param {Object} criteria - Statistics criteria
   * @returns {Promise<Object>}
   */
  async getStatistics(criteria = {}) {
    if (!this.isInitialized) {
      throw new Error('NotificationModule must be initialized before accessing statistics');
    }
    return await this.service.getStatistics(criteria);
  }

  /**
   * Get user notifications
   * @param {string} userId - User ID
   * @param {Object} criteria - Filter criteria
   * @returns {Promise<Array>}
   */
  async getUserNotifications(userId, criteria = {}) {
    if (!this.isInitialized) {
      throw new Error('NotificationModule must be initialized before accessing user notifications');
    }
    return await this.service.getUserNotifications(userId, criteria);
  }

  /**
   * Test notification delivery
   * @param {Object} testData - Test configuration
   * @returns {Promise<Object>}
   */
  async testNotification(testData) {
    if (!this.isInitialized) {
      throw new Error('NotificationModule must be initialized before testing notifications');
    }
    return await this.service.testNotification(testData);
  }

  /**
   * Get module health status
   * @returns {Promise<Object>}
   */
  async getHealthStatus() {
    if (!this.isInitialized) {
      return {
        status: 'unhealthy',
        reason: 'Module not initialized',
        timestamp: new Date(),
      };
    }

    return await this.service.healthCheck();
  }

  /**
   * Get module information
   * @returns {Object}
   */
  getModuleInfo() {
    return {
      name: 'NotificationModule',
      version: '1.0.0',
      description: 'Comprehensive notification management for GACP platform',
      status: this.isInitialized ? 'initialized' : 'not_initialized',
      capabilities: {
        channels: ['email', 'sms', 'in-app'],
        features: [
          'Multi-channel delivery',
          'Template management',
          'Real-time tracking',
          'User preferences',
          'Bulk notifications',
          'Analytics and reporting',
          'Rate limiting',
          'Audit logging',
        ],
        integrations: [
          'Application workflow',
          'Payment system',
          'Document management',
          'User management',
          'Audit system',
        ],
      },
      routes: this.routes ? this.routes.getRouteInfo() : null,
      dependencies: Object.keys(this.dependencies),
    };
  }

  /**
   * Shutdown the module gracefully
   * @returns {Promise<void>}
   */
  async shutdown() {
    try {
      logger.info('[NotificationModule] Shutting down...');

      if (this.service) {
        await this.service.shutdown();
      }

      this.isInitialized = false;
      logger.info('[NotificationModule] Shutdown completed');
    } catch (error) {
      logger.error('[NotificationModule] Shutdown error:', error);
      throw error;
    }
  }
}

// Static factory method for easy instantiation
NotificationModule.create = function (dependencies = {}) {
  return new NotificationModule(dependencies);
};

// Export both the class and a default instance creator
module.exports = NotificationModule;
