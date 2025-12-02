/**
 * Notification Data Transfer Objects (DTOs)
 *
 * Format notification data for API responses.
 * Part of Clean Architecture - Presentation Layer
 */

class NotificationDTO {
  static toResponse(notification) {
    if (!notification) {
      return null;
    }

    return {
      id: notification.id,
      recipientId: notification.recipientId,
      recipientType: notification.recipientType,
      recipientRole: notification.recipientRole,

      type: notification.type,
      title: notification.title,
      message: notification.message,
      messageEn: notification.messageEn,

      priority: notification.priority,
      status: notification.status,

      channels: notification.channels,
      deliveryStatus: notification.deliveryStatus,

      actionUrl: notification.actionUrl,
      actionLabel: notification.actionLabel,

      relatedEntity: notification.relatedEntity,

      metadata: notification.metadata,
      imageUrl: notification.imageUrl,

      sentAt: notification.sentAt,
      readAt: notification.readAt,
      archivedAt: notification.archivedAt,
      expiresAt: notification.expiresAt,

      sentBy: notification.sentBy,

      // Computed fields
      isUnread: notification.isUnread(),
      isUrgent: notification.isUrgent(),
      isExpired: notification.isExpired(),
      isBroadcast: notification.isBroadcast(),
      timeSinceSent: notification.getTimeSinceSent(),
    };
  }

  static toListResponse(notifications) {
    return notifications.map(notification => this.toResponse(notification));
  }

  static toPaginatedResponse(result) {
    return {
      notifications: this.toListResponse(result.notifications),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  static toUnreadCountResponse(count) {
    return {
      count,
      hasUnread: count > 0,
    };
  }

  static toStatisticsResponse(statistics) {
    return {
      totalNotifications: statistics.totalNotifications,
      unreadCount: statistics.unreadCount,
      readCount: statistics.readCount,
      archivedCount: statistics.archivedCount,

      byType: statistics.byType,
      byPriority: statistics.byPriority,
      byChannel: statistics.byChannel,

      readRate:
        statistics.totalNotifications > 0
          ? ((statistics.readCount / statistics.totalNotifications) * 100).toFixed(2) + '%'
          : '0%',
    };
  }
}

module.exports = NotificationDTO;
