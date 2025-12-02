/**
 * Send Notification Use Case
 *
 * Business Logic: Send a notification to a specific recipient
 * Access: System or DTAM staff
 */

class SendNotificationUseCase {
  constructor(notificationRepository, notificationService) {
    this.notificationRepository = notificationRepository;
    this.notificationService = notificationService;
  }

  async execute(notificationData) {
    // Create notification entity
    const Notification = require('../../domain/entities/Notification');
    const notification = Notification.create(notificationData);

    // Validate
    const validation = notification.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Save to repository (in-app delivery)
    const savedNotification = await this.notificationRepository.save(notification);
    savedNotification.markChannelDelivered('IN_APP');

    // Deliver via other channels if specified
    const deliveryPromises = [];

    if (notification.channels.includes('EMAIL') && notificationData.recipientEmail) {
      deliveryPromises.push(
        this.notificationService
          .sendEmail({
            to: notificationData.recipientEmail,
            subject: notification.title,
            html: this._generateEmailHTML(notification),
            text: notification.message,
          })
          .then(() => savedNotification.markChannelDelivered('EMAIL'))
          .catch(error => savedNotification.markChannelDelivered('EMAIL', error.message)),
      );
    }

    if (notification.channels.includes('SMS') && notificationData.recipientPhone) {
      deliveryPromises.push(
        this.notificationService
          .sendSMS({
            to: notificationData.recipientPhone,
            message: `${notification.title}: ${notification.message}`,
          })
          .then(() => savedNotification.markChannelDelivered('SMS'))
          .catch(error => savedNotification.markChannelDelivered('SMS', error.message)),
      );
    }

    // Wait for all deliveries
    if (deliveryPromises.length > 0) {
      await Promise.allSettled(deliveryPromises);
      await this.notificationRepository.save(savedNotification);
    }

    return savedNotification;
  }

  _generateEmailHTML(notification) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
        ${
          notification.actionUrl
            ? `
          <p>
            <a href="${notification.actionUrl}" 
               style="background: #4CAF50; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              ${notification.actionLabel || 'View Details'}
            </a>
          </p>
        `
            : ''
        }
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          GACP Certification System - Department of Thai Traditional and Alternative Medicine
        </p>
      </div>
    `;
  }
}

module.exports = SendNotificationUseCase;
