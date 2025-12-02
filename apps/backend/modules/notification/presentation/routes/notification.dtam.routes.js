/**
 * Notification Routes - DTAM Staff
 *
 * Routes for DTAM staff to send and manage notifications.
 * Part of Clean Architecture - Presentation Layer
 */

const express = require('express');
const router = express.Router();

module.exports = (notificationController, authenticateDTAM) => {
  // Get all notifications for logged-in DTAM staff
  // GET /api/dtam/notifications?page=1&limit=20&status=unread
  router.get('/', authenticateDTAM, (req, res) =>
    notificationController.getUserNotifications(req, res),
  );

  // Get unread count
  // GET /api/dtam/notifications/unread-count
  router.get('/unread-count', authenticateDTAM, (req, res) =>
    notificationController.getUnreadCount(req, res),
  );

  // Get notification statistics
  // GET /api/dtam/notifications/statistics?startDate=2024-01-01&endDate=2024-12-31
  router.get('/statistics', authenticateDTAM, (req, res) =>
    notificationController.getStatistics(req, res),
  );

  // Send notification to specific user
  // POST /api/dtam/notifications/send
  // Body: { recipientId, type, title, message, priority, channels, actionUrl }
  router.post('/send', authenticateDTAM, (req, res) =>
    notificationController.sendNotification(req, res),
  );

  // Send broadcast notification to group/role
  // POST /api/dtam/notifications/broadcast
  // Body: { recipientType, recipientRole, type, title, message, priority, channels }
  router.post('/broadcast', authenticateDTAM, (req, res) =>
    notificationController.sendBroadcast(req, res),
  );

  // Mark notification as read
  // PUT /api/dtam/notifications/:id/read
  router.put('/:id/read', authenticateDTAM, (req, res) =>
    notificationController.markAsRead(req, res),
  );

  // Mark all notifications as read
  // PUT /api/dtam/notifications/read-all
  router.put('/read-all', authenticateDTAM, (req, res) =>
    notificationController.markAllAsRead(req, res),
  );

  // Archive (delete) notification
  // DELETE /api/dtam/notifications/:id
  router.delete('/:id', authenticateDTAM, (req, res) =>
    notificationController.deleteNotification(req, res),
  );

  return router;
};
