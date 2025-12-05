/**
 * V2 Notification Routes
 * In-app notification system for closed-loop communication
 *
 * Architecture: Router → Controller → Service → Model
 */

const express = require('express');
const router = express.Router();
// Mock controller for cleanup
const notificationController = {
    getNotifications: (req, res) => res.json({ success: true, data: [] }),
    getUnreadCount: (req, res) => res.json({ success: true, count: 0 }),
    markAsRead: (req, res) => res.json({ success: true }),
    markAllAsRead: (req, res) => res.json({ success: true }),
    createNotification: (req, res) => res.status(201).json({ success: true }),
};
const { authenticate, checkPermission } = require('../../middleware/AuthMiddleware');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v2/notifications
 * Get user's notifications
 */
router.get('/', checkPermission('dashboard.view'), notificationController.getNotifications);

/**
 * GET /api/v2/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', checkPermission('dashboard.view'), notificationController.getUnreadCount);

/**
 * PUT /api/v2/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', checkPermission('dashboard.view'), notificationController.markAsRead);

/**
 * PUT /api/v2/notifications/mark-all-read
 * Mark all notifications as read
 */
router.put('/mark-all-read', checkPermission('dashboard.view'), notificationController.markAllAsRead);

/**
 * POST /api/v2/notifications (Admin/Staff only)
 * Create a new notification
 */
router.post('/', checkPermission('system.admin'), notificationController.createNotification);

module.exports = router;
