/**
 * Notification Routes
 *
 * API endpoints for notification management
 */

const express = require('express');
const router = express.Router();

/**
 * Initialize routes with controller and middleware
 */
function initializeRoutes(controller, authMiddleware, adminMiddleware) {
  // Middleware to check if service is initialized
  const checkInitialized = (req, res, next) => {
    if (!controller.service.initialized) {
      return res.status(503).json({
        success: false,
        message: 'Notification service is not initialized yet',
      });
    }
    next();
  };

  // Apply initialization check to all routes
  router.use(checkInitialized);

  /**
   * @route   GET /api/notifications/user/:userId
   * @desc    Get user notifications with pagination
   * @access  Private (User or Admin)
   */
  router.get('/user/:userId', authMiddleware, (req, res) =>
    controller.getUserNotifications(req, res),
  );

  /**
   * @route   GET /api/notifications/user/:userId/unread-count
   * @desc    Get unread notification count
   * @access  Private (User or Admin)
   */
  router.get('/user/:userId/unread-count', authMiddleware, (req, res) =>
    controller.getUnreadCount(req, res),
  );

  /**
   * @route   GET /api/notifications/user/:userId/stats
   * @desc    Get notification statistics for user
   * @access  Private (User or Admin)
   */
  router.get('/user/:userId/stats', authMiddleware, (req, res) =>
    controller.getNotificationStats(req, res),
  );

  /**
   * @route   GET /api/notifications/user/:userId/preferences
   * @desc    Get notification preferences
   * @access  Private (User or Admin)
   */
  router.get('/user/:userId/preferences', authMiddleware, (req, res) =>
    controller.getPreferences(req, res),
  );

  /**
   * @route   PATCH /api/notifications/:notificationId/read
   * @desc    Mark notification as read
   * @access  Private (User)
   */
  router.patch('/:notificationId/read', authMiddleware, (req, res) =>
    controller.markAsRead(req, res),
  );

  /**
   * @route   PATCH /api/notifications/user/:userId/read-all
   * @desc    Mark all notifications as read
   * @access  Private (User or Admin)
   */
  router.patch('/user/:userId/read-all', authMiddleware, (req, res) =>
    controller.markAllAsRead(req, res),
  );

  /**
   * @route   DELETE /api/notifications/:notificationId
   * @desc    Delete notification
   * @access  Private (User)
   */
  router.delete('/:notificationId', authMiddleware, (req, res) =>
    controller.deleteNotification(req, res),
  );

  /**
   * @route   PUT /api/notifications/user/:userId/preferences
   * @desc    Update notification preferences
   * @access  Private (User or Admin)
   */
  router.put('/user/:userId/preferences', authMiddleware, (req, res) =>
    controller.updatePreferences(req, res),
  );

  /**
   * @route   POST /api/notifications/send
   * @desc    Send custom notification
   * @access  Private (Admin only)
   */
  router.post('/send', authMiddleware, adminMiddleware, (req, res) =>
    controller.sendCustomNotification(req, res),
  );

  /**
   * @route   POST /api/notifications/broadcast
   * @desc    Broadcast announcement to all or specific roles
   * @access  Private (Admin only)
   */
  router.post('/broadcast', authMiddleware, adminMiddleware, (req, res) =>
    controller.broadcastAnnouncement(req, res),
  );

  /**
   * @route   POST /api/notifications/test
   * @desc    Send test notification (development)
   * @access  Private (Admin only)
   */
  router.post('/test', authMiddleware, adminMiddleware, (req, res) =>
    controller.sendTestNotification(req, res),
  );

  /**
   * @route   GET /api/notifications/templates
   * @desc    Get notification templates
   * @access  Private (Admin only)
   */
  router.get('/templates', authMiddleware, adminMiddleware, (req, res) =>
    controller.getTemplates(req, res),
  );

  /**
   * @route   POST /api/notifications/webhook/:service
   * @desc    Webhook endpoint for external services
   * @access  Public (with validation)
   */
  router.post('/webhook/:service', (req, res) => controller.handleWebhook(req, res));

  return router;
}

module.exports = initializeRoutes;
