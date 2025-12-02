/**
 * Notification Module Container
 *
 * Dependency Injection container for the notification module.
 * Wires together all layers: Domain, Application, Infrastructure, Presentation.
 * Part of Clean Architecture - Integration Layer
 */

const mongoose = require('mongoose');

// Domain
// (No dependencies from domain - pure business logic)

// Application - Use Cases
const SendNotificationUseCase = require('../application/use-cases/send-notification-usecase');
const SendBroadcastNotificationUseCase = require('../application/use-cases/send-broadcast-usecase');
const GetUserNotificationsUseCase = require('../application/use-cases/get-user-notifications-usecase');
const MarkNotificationAsReadUseCase = require('../application/use-cases/mark-as-read-usecase');
const MarkAllAsReadUseCase = require('../application/use-cases/mark-all-read-usecase');
const GetUnreadCountUseCase = require('../application/use-cases/get-unread-count-usecase');
const DeleteNotificationUseCase = require('../application/use-cases/delete-notification-usecase');
const GetNotificationStatisticsUseCase = require('../application/use-cases/get-notification-stats-usecase');

// Infrastructure
const MongoDBNotificationRepository = require('../infrastructure/database/notification-model');
const EmailNotificationService = require('../infrastructure/services/email-service');

// Presentation
const NotificationController = require('../presentation/controllers/notification-controller');
const createFarmerRoutes = require('../presentation/routes/notification.farmer.routes');
const createDTAMRoutes = require('../presentation/routes/notification.dtam.routes');

class NotificationModuleContainer {
  constructor(config = {}) {
    this.config = config;
    this.instances = {};
  }

  // Initialize all dependencies
  initialize() {
    // Infrastructure Layer
    this.instances.notificationRepository = new MongoDBNotificationRepository(
      this.config.database || mongoose,
    );

    this.instances.notificationService = new EmailNotificationService(this.config.email || {});

    // Application Layer - Use Cases
    this.instances.sendNotificationUseCase = new SendNotificationUseCase(
      this.instances.notificationRepository,
      this.instances.notificationService,
    );

    this.instances.sendBroadcastNotificationUseCase = new SendBroadcastNotificationUseCase(
      this.instances.notificationRepository,
    );

    this.instances.getUserNotificationsUseCase = new GetUserNotificationsUseCase(
      this.instances.notificationRepository,
    );

    this.instances.markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(
      this.instances.notificationRepository,
    );

    this.instances.markAllAsReadUseCase = new MarkAllAsReadUseCase(
      this.instances.notificationRepository,
    );

    this.instances.getUnreadCountUseCase = new GetUnreadCountUseCase(
      this.instances.notificationRepository,
    );

    this.instances.deleteNotificationUseCase = new DeleteNotificationUseCase(
      this.instances.notificationRepository,
    );

    this.instances.getNotificationStatisticsUseCase = new GetNotificationStatisticsUseCase(
      this.instances.notificationRepository,
    );

    // Presentation Layer - Controller
    this.instances.notificationController = new NotificationController({
      sendNotificationUseCase: this.instances.sendNotificationUseCase,
      sendBroadcastNotificationUseCase: this.instances.sendBroadcastNotificationUseCase,
      getUserNotificationsUseCase: this.instances.getUserNotificationsUseCase,
      markNotificationAsReadUseCase: this.instances.markNotificationAsReadUseCase,
      markAllAsReadUseCase: this.instances.markAllAsReadUseCase,
      getUnreadCountUseCase: this.instances.getUnreadCountUseCase,
      deleteNotificationUseCase: this.instances.deleteNotificationUseCase,
      getNotificationStatisticsUseCase: this.instances.getNotificationStatisticsUseCase,
    });

    return this;
  }

  // Get routes for Farmer
  getFarmerRoutes(authenticateFarmer) {
    if (!this.instances.notificationController) {
      throw new Error('Container not initialized. Call initialize() first.');
    }
    return createFarmerRoutes(this.instances.notificationController, authenticateFarmer);
  }

  // Get routes for DTAM
  getDTAMRoutes(authenticateDTAM) {
    if (!this.instances.notificationController) {
      throw new Error('Container not initialized. Call initialize() first.');
    }
    return createDTAMRoutes(this.instances.notificationController, authenticateDTAM);
  }

  // Get notification controller
  getController() {
    return this.instances.notificationController;
  }

  // Get notification repository (for other modules to use)
  getRepository() {
    return this.instances.notificationRepository;
  }

  // Get notification service (for other modules to use)
  getService() {
    return this.instances.notificationService;
  }

  // Get use cases (for other modules to use)
  getUseCases() {
    return {
      sendNotification: this.instances.sendNotificationUseCase,
      sendBroadcast: this.instances.sendBroadcastNotificationUseCase,
      getUserNotifications: this.instances.getUserNotificationsUseCase,
      markAsRead: this.instances.markNotificationAsReadUseCase,
      markAllAsRead: this.instances.markAllAsReadUseCase,
      getUnreadCount: this.instances.getUnreadCountUseCase,
      deleteNotification: this.instances.deleteNotificationUseCase,
      getStatistics: this.instances.getNotificationStatisticsUseCase,
    };
  }
}

// Helper function to create and initialize container
function createNotificationModule(config = {}) {
  const container = new NotificationModuleContainer(config);
  return container.initialize();
}

module.exports = {
  NotificationModuleContainer,
  createNotificationModule,
};
