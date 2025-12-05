/**
 * Delete Notification Use Case
 *
 * Business Logic: Delete (archive) a notification
 * Access: Notification recipient only
 */

class DeleteNotificationUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(notificationId, userId) {
    // Find notification
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    // Check ownership
    if (notification.recipientId && notification.recipientId !== userId) {
      throw new Error('Unauthorized: You can only delete your own notifications');
    }

    // Archive instead of hard delete
    notification.archive();

    // Save
    return await this.notificationRepository.save(notification);
  }
}

module.exports = DeleteNotificationUseCase;
