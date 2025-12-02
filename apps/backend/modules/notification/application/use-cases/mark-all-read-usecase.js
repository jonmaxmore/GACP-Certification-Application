/**
 * Mark All Notifications As Read Use Case
 *
 * Business Logic: Mark all notifications as read for a user
 * Access: User (own notifications only)
 */

class MarkAllAsReadUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(userId) {
    // Mark all as read
    const count = await this.notificationRepository.markAllAsRead(userId);
    return { count };
  }
}

module.exports = MarkAllAsReadUseCase;
