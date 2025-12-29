/**
 * V2 Notification Routes - Prisma Version
 * In-app notification system using PostgreSQL
 */

const express = require('express');
const router = express.Router();
const prismaDatabase = require('../../services/prisma-database');
const { authenticate, checkPermission } = require('../../middleware/auth-middleware');

// Prisma-based notification controller
const notificationController = {
    getNotifications: async (req, res) => {
        try {
            const prisma = prismaDatabase.getClient();
            const notifications = await prisma.notification.findMany({
                where: { userId: req.user.userId },
                orderBy: { createdAt: 'desc' },
                take: 50
            });

            res.json({ success: true, data: notifications });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getUnreadCount: async (req, res) => {
        try {
            const prisma = prismaDatabase.getClient();
            const count = await prisma.notification.count({
                where: {
                    userId: req.user.userId,
                    isRead: false
                }
            });
            res.json({ success: true, count });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    markAsRead: async (req, res) => {
        try {
            const prisma = prismaDatabase.getClient();
            const notification = await prisma.notification.updateMany({
                where: {
                    id: req.params.id,
                    userId: req.user.userId
                },
                data: {
                    isRead: true,
                    readAt: new Date()
                }
            });

            if (notification.count === 0) {
                return res.status(404).json({ success: false, message: 'Notification not found' });
            }

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    markAllAsRead: async (req, res) => {
        try {
            const prisma = prismaDatabase.getClient();
            await prisma.notification.updateMany({
                where: {
                    userId: req.user.userId,
                    isRead: false
                },
                data: {
                    isRead: true,
                    readAt: new Date()
                }
            });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createNotification: async (req, res) => {
        try {
            const prisma = prismaDatabase.getClient();
            const { recipient, title, message, type, data } = req.body;

            const notification = await prisma.notification.create({
                data: {
                    userId: recipient,
                    title,
                    message,
                    type: type || 'INFO',
                    metadata: data || {}
                }
            });

            res.status(201).json({ success: true, data: notification });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};

// All routes require authentication
router.use(authenticate);

// GET /api/v2/notifications
router.get('/', checkPermission('dashboard.view'), notificationController.getNotifications);

// GET /api/v2/notifications/unread-count
router.get('/unread-count', checkPermission('dashboard.view'), notificationController.getUnreadCount);

// PUT /api/v2/notifications/:id/read
router.put('/:id/read', checkPermission('dashboard.view'), notificationController.markAsRead);

// PUT /api/v2/notifications/mark-all-read
router.put('/mark-all-read', checkPermission('dashboard.view'), notificationController.markAllAsRead);

// POST /api/v2/notifications (Admin/Staff only)
router.post('/', checkPermission('system.admin'), notificationController.createNotification);

module.exports = router;
