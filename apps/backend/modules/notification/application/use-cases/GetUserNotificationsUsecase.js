/**
 * Get User Notifications Use Case
 *
 * Business Logic: Get notifications for a specific user
 * Access: User (own notifications only), DTAM (any user)
 */

class GetUserNotificationsUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(userId, filters = {}, options = {}) {
    // Get personal notifications
    const personalNotifications = await this.notificationRepository.findByRecipientId(
      userId,
      filters,
      options,
    );

    // Note: Broadcast notifications would be fetched separately based on user's role
    // and merged with personal notifications. This requires user role information.

    return personalNotifications;
  }
}

module.exports = GetUserNotificationsUseCase;
