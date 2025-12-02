/**
 * Notification Routes - Farmer
 *
 * Routes for farmers to view and manage their notifications.
 * Part of Clean Architecture - Presentation Layer
 */

const express = require('express');
const router = express.Router();

module.exports = (notificationController, authenticateFarmer) => {
  // Get all notifications for logged-in farmer
  // GET /api/farmer/notifications?page=1&limit=20&status=unread
  router.get('/', authenticateFarmer, (req, res) =>
    notificationController.getUserNotifications(req, res),
  );

  // Get unread count
  // GET /api/farmer/notifications/unread-count
  router.get('/unread-count', authenticateFarmer, (req, res) =>
    notificationController.getUnreadCount(req, res),
  );

  // Mark notification as read
  // PUT /api/farmer/notifications/:id/read
  router.put('/:id/read', authenticateFarmer, (req, res) =>
    notificationController.markAsRead(req, res),
  );

  // Mark all notifications as read
  // PUT /api/farmer/notifications/read-all
  router.put('/read-all', authenticateFarmer, (req, res) =>
    notificationController.markAllAsRead(req, res),
  );

  // Archive (delete) notification
  // DELETE /api/farmer/notifications/:id
  router.delete('/:id', authenticateFarmer, (req, res) =>
    notificationController.deleteNotification(req, res),
  );

  return router;
};
