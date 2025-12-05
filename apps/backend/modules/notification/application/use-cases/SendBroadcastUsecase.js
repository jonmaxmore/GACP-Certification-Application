/**
 * Send Broadcast Notification Use Case
 *
 * Business Logic: Send notification to all users in a group/role
 * Access: DTAM staff only
 */

class SendBroadcastNotificationUseCase {
  constructor(notificationRepository, notificationService) {
    this.notificationRepository = notificationRepository;
    this.notificationService = notificationService;
  }

  async execute(broadcastData) {
    // Create broadcast notification entity
    const Notification = require('../../domain/entities/Notification');
    const notification = Notification.createBroadcast(broadcastData);

    // Validate
    const validation = notification.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Save broadcast notification (will be visible to all matching users)
    notification.markChannelDelivered('IN_APP');
    const savedNotification = await this.notificationRepository.save(notification);

    // Note: Email/SMS broadcast delivery would require fetching all matching users
    // and sending individually. This is typically done via a background job.
    // For now, we only support in-app broadcasts.

    return savedNotification;
  }
}

module.exports = SendBroadcastNotificationUseCase;
