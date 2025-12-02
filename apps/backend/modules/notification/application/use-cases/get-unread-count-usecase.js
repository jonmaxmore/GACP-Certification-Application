/**
 * Get Unread Count Use Case
 *
 * Business Logic: Get count of unread notifications
 * Access: User (own count only)
 */

class GetUnreadCountUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(userId) {
    const count = await this.notificationRepository.countUnread(userId);
    return { count };
  }
}

module.exports = GetUnreadCountUseCase;
