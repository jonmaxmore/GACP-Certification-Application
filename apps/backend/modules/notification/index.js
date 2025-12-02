/**
 * Notification Module - Clean Architecture Implementation
 *
 * Main entry point for the notification module.
 * Exports all public interfaces for use by other modules.
 */

const logger = require('../../shared/logger/logger');
const { createNotificationModule } = require('./integration/container');
const NotificationHelper = require('./integration/NotificationHelper');
const Notification = require('./domain/entities/Notification');

// Legacy support (old monolithic structure - to be removed in Phase 2)
const NotificationService = require('./services/notification.service');
const NotificationController = require('./controllers/notification.controller');
const initializeRoutes = require('./routes/notification.routes');

/**
 * Initialize Notification Module (NEW Clean Architecture)
 *
 * @param {Object} config - Configuration object
 * @param {Object} config.database - MongoDB database instance
 * @param {Object} config.email - Email service configuration
 * @returns {Object} - Module container with all dependencies
 */
function initializeNotificationModule(config = {}) {
  try {
    logger.info('Initializing Notification module (Clean Architecture);...');

    // Create and initialize module container
    const container = createNotificationModule(config);

    logger.info('✓ Notification module initialized');
    return container;
  } catch (error) {
    logger.error('Error initializing notification module:', error);
    throw error;
  }
}

/**
 * Initialize Notification Module (LEGACY - Monolithic)
 *
 * @param {Object} db - MongoDB database instance
 * @param {Function} authMiddleware - Authentication middleware
 * @param {Function} adminMiddleware - Admin authorization middleware (optional)
 * @returns {Object} - Module components (router, service, controller)
 */
async function initializeNotification(db, authMiddleware, adminMiddleware) {
  try {
    logger.info('Initializing Notification module (LEGACY);...');

    // Validate dependencies
    if (!db) {
      throw new Error('Database instance is required');
    }

    if (!authMiddleware) {
      throw new Error('Authentication middleware is required');
    }

    // Create default admin middleware if not provided
    if (!adminMiddleware) {
      adminMiddleware = (req, res, next) => {
        if (req.user && (req.user.role === 'admin' || req.user.role === 'director')) {
          next();
        } else {
          res.status(403).json({
            success: false,
            message: 'Admin access required',
          });
        }
      };
    }

    // Initialize service
    const notificationService = new NotificationService(db);
    await notificationService.initialize();
    logger.info('✓ Notification service initialized (LEGACY);');

    // Initialize controller
    const notificationController = new NotificationController(notificationService);
    logger.info('✓ Notification controller initialized (LEGACY);');

    // Initialize routes
    const router = initializeRoutes(notificationController, authMiddleware, adminMiddleware);
    logger.info('✓ Notification routes initialized (LEGACY);');

    logger.info('✓ Notification module ready (LEGACY);');

    return {
      router,
      service: notificationService,
      controller: notificationController,
    };
  } catch (error) {
    logger.error('Failed to initialize Notification module (LEGACY);:', error);
    throw error;
  }
}

// Export both new and legacy interfaces
module.exports = {
  // NEW Clean Architecture API
  initializeNotificationModule,
  createNotificationModule,
  NotificationHelper,
  Notification,

  // Constants (for use by other modules)
  NOTIFICATION_TYPES: Notification.TYPE,
  NOTIFICATION_STATUS: Notification.STATUS,
  NOTIFICATION_PRIORITY: Notification.PRIORITY,
  NOTIFICATION_CHANNEL: Notification.CHANNEL,
  RECIPIENT_TYPE: Notification.RECIPIENT_TYPE,

  // LEGACY Monolithic API (to be removed in Phase 2)
  initializeNotification,

  // Module information
  getModuleInfo: () => ({
    name: 'notification',
    version: '2.0.0',
    architecture: 'Clean Architecture',
    description: 'Multi-channel notification system with Clean Architecture',
    layers: [
      'Domain (entities, interfaces)',
      'Application (use cases)',
      'Infrastructure (MongoDB, Email)',
      'Presentation (controllers, routes, DTOs)',
      'Integration (DI container, helpers)',
    ],
    features: [
      'Multi-channel delivery (In-app, Email, SMS)',
      'Personal and broadcast notifications',
      '30+ notification types',
      '4 priority levels',
      'Read/unread tracking',
      'Notification expiration',
      'Delivery status per channel',
      'Related entity linking',
      'Action URLs for navigation',
      'Email HTML templates',
      'Statistics and analytics',
    ],
    channels: ['IN_APP (MongoDB)', 'EMAIL (NodeMailer)', 'SMS (future integration)'],
  }),
};
