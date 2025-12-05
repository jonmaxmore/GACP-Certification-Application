/**
 * Mark Notification As Read Use Case
 *
 * Business Logic: Mark a notification as read
 * Access: Notification recipient only
 */

class MarkNotificationAsReadUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(notificationId, userId) {
    // Find notification
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    // Check ownership (unless broadcast)
    if (notification.recipientId && notification.recipientId !== userId) {
      throw new Error('Unauthorized: You can only mark your own notifications as read');
    }

    // Mark as read
    notification.markAsRead();

    // Save
    return await this.notificationRepository.save(notification);
  }
}

module.exports = MarkNotificationAsReadUseCase;
