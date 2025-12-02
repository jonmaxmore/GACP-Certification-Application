/* eslint-disable no-unused-vars */
/**
 * Notification Repository Interface
 *
 * Defines the contract for Notification data persistence.
 * Part of Clean Architecture - Domain Layer (Dependency Inversion Principle)
 *
 * Implementation: Infrastructure/database/MongoDBNotificationRepository.js
 */

class INotificationRepository {
  /**
   * Save a new notification or update existing
   * @param {Notification} notification - Notification entity
   * @returns {Promise<Notification>} Saved notification
   */
  async save(_notification) {
    throw new Error('Method not implemented');
  }

  /**
   * Find notification by ID
   * @param {string} id - Notification ID
   * @returns {Promise<Notification|null>}
   */
  async findById(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find notifications by recipient ID
   * @param {string} recipientId - Recipient user ID
   * @param {Object} filters - Status and type filters
   * @param {Object} options - Pagination options
   * @returns {Promise<{notifications: Notification[], total: number, page: number, limit: number}>}
   */
  async findByRecipientId(recipientId, filters = {}, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find unread notifications by recipient
   * @param {string} recipientId - Recipient user ID
   * @returns {Promise<Notification[]>}
   */
  async findUnreadByRecipient(_recipientId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find notifications by type
   * @param {string} type - Notification type
   * @param {Object} options - Pagination options
   * @returns {Promise<{notifications: Notification[], total: number, page: number, limit: number}>}
   */
  async findByType(type, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find notifications by status
   * @param {string} status - Notification status
   * @param {Object} options - Pagination options
   * @returns {Promise<{notifications: Notification[], total: number, page: number, limit: number}>}
   */
  async findByStatus(status, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find notifications by priority
   * @param {string} priority - Priority level
   * @param {Object} options - Pagination options
   * @returns {Promise<{notifications: Notification[], total: number, page: number, limit: number}>}
   */
  async findByPriority(priority, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find notifications with filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination and sorting
   * @returns {Promise<{notifications: Notification[], total: number, page: number, limit: number}>}
   */
  async findWithFilters(filters = {}, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find broadcast notifications
   * @param {string} recipientType - Recipient type (ALL_FARMERS, ALL_DTAM_STAFF, ROLE)
   * @param {string} role - Role name (if recipientType is ROLE)
   * @param {Object} options - Pagination options
   * @returns {Promise<{notifications: Notification[], total: number, page: number, limit: number}>}
   */
  async findBroadcasts(recipientType, role = null, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Count unread notifications by recipient
   * @param {string} recipientId - Recipient user ID
   * @returns {Promise<number>}
   */
  async countUnread(_recipientId) {
    throw new Error('Method not implemented');
  }

  /**
   * Count notifications by criteria
   * @param {Object} criteria - Count criteria
   * @returns {Promise<number>}
   */
  async count(criteria = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Mark all notifications as read for recipient
   * @param {string} recipientId - Recipient user ID
   * @returns {Promise<number>} Number of notifications marked as read
   */
  async markAllAsRead(_recipientId) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete expired notifications
   * @returns {Promise<number>} Number of deleted notifications
   */
  async deleteExpired() {
    throw new Error('Method not implemented');
  }

  /**
   * Get notification statistics
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>}
   */
  async getStatistics(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete notification
   * @param {string} id - Notification ID
   * @returns {Promise<boolean>}
   */
  async delete(_id) {
    throw new Error('Method not implemented');
  }
}

module.exports = INotificationRepository;
