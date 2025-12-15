/**
 * V2 Notification Routes
 * In-app notification system for closed-loop communication
 *
 * Architecture: Router → Controller → Service → Model
 */

const express = require('express');
const router = express.Router();
const Notification = require('../../../database/models/notification-model');
const { authenticate, checkPermission } = require('../../../middleware/auth-middleware');

// Real implementation
const notificationController = {
    getNotifications: async (req, res) => {
        try {
            const notifications = await Notification.find({ recipient: req.user.userId })
                .sort({ createdAt: -1 })
                .limit(50); // Limit to last 50 notifications

            res.json({ success: true, data: notifications });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getUnreadCount: async (req, res) => {
        try {
            const count = await Notification.countDocuments({
                recipient: req.user.userId,
                read: false
            });
            res.json({ success: true, count });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    markAsRead: async (req, res) => {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: req.params.id, recipient: req.user.userId },
                { read: true },
                { new: true }
            );

            if (!notification) {
                return res.status(404).json({ success: false, message: 'Notification not found' });
            }

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    markAllAsRead: async (req, res) => {
        try {
            await Notification.updateMany(
                { recipient: req.user.userId, read: false },
                { read: true }
            );
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createNotification: async (req, res) => {
        try {
            const { recipient, title, message, type, data } = req.body;

            const notification = new Notification({
                recipient,
                title,
                message,
                type: type || 'info', // 'info', 'success', 'warning', 'error'
                data
            });

            await notification.save();
            res.status(201).json({ success: true, data: notification });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};

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
