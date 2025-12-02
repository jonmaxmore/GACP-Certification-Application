/**
 * Notification Service Interface
 *
 * Defines the contract for external notification delivery services.
 * Used for sending emails, SMS, push notifications, etc.
 * Part of Clean Architecture - Domain Layer
 */

class INotificationService {
  /**
   * Send email notification
   * @param {Object} emailData - Email data
   * @param {string} emailData.to - Recipient email
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.html - HTML content
   * @param {string} emailData.text - Plain text content
   * @returns {Promise<boolean>}
   */
  async sendEmail(_emailData) {
    throw new Error('Method not implemented');
  }

  /**
   * Send SMS notification
   * @param {Object} smsData - SMS data
   * @param {string} smsData.to - Recipient phone number
   * @param {string} smsData.message - SMS message
   * @returns {Promise<boolean>}
   */
  async sendSMS(_smsData) {
    throw new Error('Method not implemented');
  }

  /**
   * Send push notification (future)
   * @param {Object} pushData - Push notification data
   * @returns {Promise<boolean>}
   */
  async sendPush(_pushData) {
    throw new Error('Method not implemented');
  }
}

module.exports = INotificationService;
