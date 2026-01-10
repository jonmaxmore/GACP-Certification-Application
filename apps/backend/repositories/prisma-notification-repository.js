/**
 * Notification Repository - Prisma (PostgreSQL)
 */

const { prisma } = require('../services/prisma-database');
const { v4: uuidv4 } = require('uuid');

class NotificationRepository {
    /**
     * Create notification
     */
    async create(notificationData) {
        return prisma.notification.create({
            data: {
                ...notificationData,
                uuid: uuidv4(),
            },
        });
    }

    /**
     * Find by user ID
     */
    async findByUserId(userId, { isRead, limit = 50 } = {}) {
        const where = { userId };
        if (typeof isRead === 'boolean') {where.isRead = isRead;}

        return prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Mark as read
     */
    async markAsRead(id) {
        return prisma.notification.update({
            where: { id },
            data: { isRead: true, readAt: new Date() },
        });
    }

    /**
     * Mark all as read for user
     */
    async markAllAsRead(userId) {
        return prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }

    /**
     * Count unread
     */
    async countUnread(userId) {
        return prisma.notification.count({
            where: { userId, isRead: false },
        });
    }

    /**
     * Delete old notifications (older than 30 days)
     */
    async deleteOld(days = 30) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return prisma.notification.deleteMany({
            where: { createdAt: { lt: cutoff }, isRead: true },
        });
    }
}

module.exports = new NotificationRepository();

