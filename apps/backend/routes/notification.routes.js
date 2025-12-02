/**
 * Notification API Routes
 * REST endpoints for notification operations
 *
 * @module routes/notification
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * Initialize notification routes with dependencies
 * @param {Object} dependencies - Service dependencies
 * @param {NotificationService} dependencies.notificationService - Notification service instance
 * @param {Object} dependencies.authMiddleware - Authentication middleware
 */
function initializeNotificationRoutes(dependencies) {
  const { notificationService, authMiddleware } = dependencies;

  /**
   * @route   GET /api/notifications
   * @desc    Get user notifications with pagination
   * @access  Private
   * @query   {read, type, priority, limit, skip}
   */
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { read, type, priority, limit = 50, skip = 0 } = req.query;

      const options = {
        limit: Number(limit),
        skip: Number(skip),
      };

      if (read !== undefined) {
        options.read = read === 'true';
      }

      if (type) {
        options.type = type;
      }
      if (priority) {
        options.priority = priority;
      }

      const notifications = await notificationService.getUserNotifications(userId, options);

      res.json({
        success: true,
        count: notifications.length,
        data: notifications,
      });
    } catch (error) {
      logger.error('[Notification API] Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get notifications',
      });
    }
  });

  /**
   * @route   POST /api/notifications
   * @desc    Create new notification (Admin or System)
   * @access  Private (Admin)
   * @body    {userId, type, title, message, priority, data}
   */
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const { userId, type, title, message, priority, data, actionUrl, actionLabel } = req.body;

      // Validate required fields
      if (!userId || !type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, type, title, message',
        });
      }

      const notification = await notificationService.sendNotification({
        userId,
        type,
        title,
        message,
        priority: priority || 'medium',
        data: data || {},
        actionUrl,
        actionLabel,
      });

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification,
      });
    } catch (error) {
      logger.error('[Notification API] Create notification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create notification',
      });
    }
  });

  /**
   * @route   GET /api/notifications/unread-count
   * @desc    Get unread notification count
   * @access  Private
   */
  router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;

      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      logger.error('[Notification API] Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get unread count',
      });
    }
  });

  /**
   * @route   PUT /api/notifications/:id/read
   * @desc    Mark notification as read
   * @access  Private
   */
  router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await notificationService.markAsRead(id, userId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found or unauthorized',
        });
      }

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      logger.error('[Notification API] Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark notification as read',
      });
    }
  });

  /**
   * @route   PUT /api/notifications/read-all
   * @desc    Mark all notifications as read
   * @access  Private
   */
  router.put('/read-all', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;

      const count = await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: `Marked ${count} notifications as read`,
        data: { count },
      });
    } catch (error) {
      logger.error('[Notification API] Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark all as read',
      });
    }
  });

  /**
   * @route   DELETE /api/notifications/:id
   * @desc    Delete notification
   * @access  Private
   */
  router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const deleted = await notificationService.deleteNotification(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found or unauthorized',
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      logger.error('[Notification API] Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete notification',
      });
    }
  });

  /**
   * @route   POST /api/notifications/broadcast
   * @desc    Broadcast notification to role (Admin only)
   * @access  Private (Admin)
   * @body    {role, type, title, message, priority}
   */
  router.post('/broadcast', authMiddleware, async (req, res) => {
    try {
      const { role, type, title, message, priority, data } = req.body;

      if (!role || !type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: role, type, title, message',
        });
      }

      const notifications = await notificationService.broadcastToRole(role, {
        type,
        title,
        message,
        priority: priority || 'medium',
        data: data || {},
      });

      res.status(201).json({
        success: true,
        message: `Broadcast sent to role: ${role}`,
        count: notifications.length,
        data: notifications,
      });
    } catch (error) {
      logger.error('[Notification API] Broadcast notification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to broadcast notification',
      });
    }
  });

  /**
   * @route   POST /api/notifications/job-assignment
   * @desc    Send job assignment notification
   * @access  Private
   * @body    {userId, jobData}
   */
  router.post('/job-assignment', authMiddleware, async (req, res) => {
    try {
      const { userId, jobData } = req.body;

      if (!userId || !jobData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, jobData',
        });
      }

      const notification = await notificationService.notifyJobAssignment(userId, jobData);

      res.status(201).json({
        success: true,
        message: 'Job assignment notification sent',
        data: notification,
      });
    } catch (error) {
      logger.error('[Notification API] Job assignment notification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send job assignment notification',
      });
    }
  });

  /**
   * @route   POST /api/notifications/delay-alert
   * @desc    Send delay alert notification
   * @access  Private
   * @body    {userId, taskData}
   */
  router.post('/delay-alert', authMiddleware, async (req, res) => {
    try {
      const { userId, taskData } = req.body;

      if (!userId || !taskData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, taskData',
        });
      }

      const notification = await notificationService.notifyDelayAlert(userId, taskData);

      res.status(201).json({
        success: true,
        message: 'Delay alert notification sent',
        data: notification,
      });
    } catch (error) {
      logger.error('[Notification API] Delay alert notification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send delay alert notification',
      });
    }
  });

  /**
   * @route   POST /api/notifications/payment-alert
   * @desc    Send payment alert notification
   * @access  Private
   * @body    {userId, paymentData}
   */
  router.post('/payment-alert', authMiddleware, async (req, res) => {
    try {
      const { userId, paymentData } = req.body;

      if (!userId || !paymentData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, paymentData',
        });
      }

      const notification = await notificationService.notifyPaymentAlert(userId, paymentData);

      res.status(201).json({
        success: true,
        message: 'Payment alert notification sent',
        data: notification,
      });
    } catch (error) {
      logger.error('[Notification API] Payment alert notification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send payment alert notification',
      });
    }
  });

  /**
   * @route   DELETE /api/notifications/cleanup
   * @desc    Cleanup old read notifications (Admin only)
   * @access  Private (Admin)
   * @query   {days}
   */
  router.delete('/cleanup', authMiddleware, async (req, res) => {
    try {
      const { days = 30 } = req.query;

      const count = await notificationService.cleanupOldNotifications(Number(days));

      res.json({
        success: true,
        message: `Cleaned up ${count} old notifications`,
        data: { count },
      });
    } catch (error) {
      logger.error('[Notification API] Cleanup notifications error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to cleanup notifications',
      });
    }
  });

  return router;
}

module.exports = initializeNotificationRoutes;
