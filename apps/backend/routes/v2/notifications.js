/**
 * V2 Notification Routes
 * In-app notification system for closed-loop communication
 *
 * Architecture: Router → Controller → Service → Model
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../../src/controllers/notificationController');
const { farmerOrStaff } = require('../../middleware/roleMiddleware');

// All routes require authentication
router.use(farmerOrStaff);

/**
 * GET /api/v2/notifications
 * Get user's notifications
 */
router.get('/', notificationController.getNotifications);

/**
 * GET /api/v2/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * PUT /api/v2/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * PUT /api/v2/notifications/mark-all-read
 * Mark all notifications as read
 */
router.put('/mark-all-read', notificationController.markAllAsRead);

/**
 * POST /api/v2/notifications (Admin/Staff only)
 * Create a new notification
 */
router.post('/', notificationController.createNotification);

module.exports = router;
