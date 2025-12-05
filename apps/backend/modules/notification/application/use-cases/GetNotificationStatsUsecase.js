/**
 * Get Notification Statistics Use Case
 *
 * Business Logic: Get notification system statistics
 * Access: DTAM staff only
 */

class GetNotificationStatisticsUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(filters = {}) {
    return await this.notificationRepository.getStatistics(filters);
  }
}

module.exports = GetNotificationStatisticsUseCase;
