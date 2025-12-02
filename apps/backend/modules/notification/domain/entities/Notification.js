/**
 * Notification Entity - Domain Model for System Notifications
 *
 * Represents a notification/alert sent to users (farmers or DTAM staff).
 * Supports various notification types and delivery channels.
 * Part of Clean Architecture - Domain Layer (Business Logic)
 *
 * Business Rules:
 * - Notification must have recipient, type, and title
 * - Notification can be UNREAD, READ, or ARCHIVED
 * - Notification has priority levels (LOW, MEDIUM, HIGH, URGENT)
 * - Notification can be delivered via multiple channels (IN_APP, EMAIL, SMS)
 * - System notifications sent to all users in a role
 * - Personal notifications sent to specific users
 */

class Notification {
  // Notification Status Constants
  static STATUS = {
    UNREAD: 'UNREAD', // Not yet read
    READ: 'READ', // Read by recipient
    ARCHIVED: 'ARCHIVED', // Archived by recipient
  };

  // Notification Type Constants
  static TYPE = {
    // Farm-related
    FARM_APPROVED: 'FARM_APPROVED',
    FARM_REJECTED: 'FARM_REJECTED',
    FARM_VERIFICATION_REQUIRED: 'FARM_VERIFICATION_REQUIRED',

    // Survey-related
    SURVEY_APPROVED: 'SURVEY_APPROVED',
    SURVEY_REJECTED: 'SURVEY_REJECTED',
    SURVEY_REVISION_REQUIRED: 'SURVEY_REVISION_REQUIRED',
    SURVEY_SUBMITTED: 'SURVEY_SUBMITTED',

    // Certificate-related
    CERTIFICATE_ISSUED: 'CERTIFICATE_ISSUED',
    CERTIFICATE_EXPIRING: 'CERTIFICATE_EXPIRING',
    CERTIFICATE_EXPIRED: 'CERTIFICATE_EXPIRED',
    CERTIFICATE_RENEWED: 'CERTIFICATE_RENEWED',

    // Training-related
    TRAINING_ENROLLED: 'TRAINING_ENROLLED',
    TRAINING_COMPLETED: 'TRAINING_COMPLETED',
    TRAINING_FAILED: 'TRAINING_FAILED',
    TRAINING_CERTIFICATE_ISSUED: 'TRAINING_CERTIFICATE_ISSUED',
    COURSE_PUBLISHED: 'COURSE_PUBLISHED',

    // Document-related
    DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
    DOCUMENT_APPROVED: 'DOCUMENT_APPROVED',
    DOCUMENT_REJECTED: 'DOCUMENT_REJECTED',

    // System
    SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
    SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
    SYSTEM_UPDATE: 'SYSTEM_UPDATE',

    // Account
    ACCOUNT_CREATED: 'ACCOUNT_CREATED',
    ACCOUNT_VERIFIED: 'ACCOUNT_VERIFIED',
    PASSWORD_CHANGED: 'PASSWORD_CHANGED',

    // Generic
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
  };

  // Priority Level Constants
  static PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  };

  // Delivery Channel Constants
  static CHANNEL = {
    IN_APP: 'IN_APP', // In-app notification
    EMAIL: 'EMAIL', // Email notification
    SMS: 'SMS', // SMS notification (future)
  };

  // Recipient Type Constants
  static RECIPIENT_TYPE = {
    FARMER: 'FARMER',
    DTAM_STAFF: 'DTAM_STAFF',
    ALL_FARMERS: 'ALL_FARMERS', // Broadcast to all farmers
    ALL_DTAM_STAFF: 'ALL_DTAM_STAFF', // Broadcast to all staff
    ROLE: 'ROLE', // Broadcast to specific role
  };

  constructor(data = {}) {
    this.id = data.id || null;

    // Recipient Information
    this.recipientId = data.recipientId || null; // User ID (null for broadcasts)
    this.recipientType = data.recipientType || Notification.RECIPIENT_TYPE.FARMER;
    this.recipientRole = data.recipientRole || null; // For role-based broadcasts

    // Notification Content
    this.type = data.type || Notification.TYPE.INFO;
    this.title = data.title || '';
    this.message = data.message || '';
    this.messageEn = data.messageEn || null;

    // Priority and Status
    this.priority = data.priority || Notification.PRIORITY.MEDIUM;
    this.status = data.status || Notification.STATUS.UNREAD;

    // Delivery Channels
    this.channels = data.channels || [Notification.CHANNEL.IN_APP];
    this.deliveryStatus = data.deliveryStatus || {
      inApp: { sent: false, sentAt: null },
      email: { sent: false, sentAt: null, error: null },
      sms: { sent: false, sentAt: null, error: null },
    };

    // Action/Link
    this.actionUrl = data.actionUrl || null; // Link to related resource
    this.actionLabel = data.actionLabel || null; // Button text (e.g., "View Farm")

    // Related Entity
    this.relatedEntity = data.relatedEntity || null; // { type: 'FARM', id: 'xxx' }

    // Additional Data
    this.metadata = data.metadata || {}; // Extra data for rendering
    this.imageUrl = data.imageUrl || null;

    // Timestamps
    this.sentAt = data.sentAt || new Date();
    this.readAt = data.readAt || null;
    this.archivedAt = data.archivedAt || null;
    this.expiresAt = data.expiresAt || null; // Auto-delete after expiry

    // Audit
    this.sentBy = data.sentBy || null; // Who sent (system or staff ID)
    this.createdAt = data.createdAt || new Date();
  }

  // Factory Method
  static create({
    recipientId,
    recipientType,
    type,
    title,
    message,
    priority,
    channels,
    actionUrl,
    relatedEntity,
    sentBy,
  }) {
    if (!title || !message) {
      throw new Error('Title and message are required');
    }

    return new Notification({
      recipientId,
      recipientType: recipientType || Notification.RECIPIENT_TYPE.FARMER,
      type: type || Notification.TYPE.INFO,
      title,
      message,
      priority: priority || Notification.PRIORITY.MEDIUM,
      channels: channels || [Notification.CHANNEL.IN_APP],
      actionUrl,
      relatedEntity,
      sentBy,
      sentAt: new Date(),
      createdAt: new Date(),
    });
  }

  // Factory for system broadcasts
  static createBroadcast({
    recipientType,
    recipientRole,
    type,
    title,
    message,
    priority,
    channels,
    sentBy,
  }) {
    if (!title || !message) {
      throw new Error('Title and message are required');
    }

    if (!recipientType || !['ALL_FARMERS', 'ALL_DTAM_STAFF', 'ROLE'].includes(recipientType)) {
      throw new Error('Invalid recipient type for broadcast');
    }

    return new Notification({
      recipientId: null, // No specific recipient
      recipientType,
      recipientRole,
      type: type || Notification.TYPE.SYSTEM_ANNOUNCEMENT,
      title,
      message,
      priority: priority || Notification.PRIORITY.MEDIUM,
      channels: channels || [Notification.CHANNEL.IN_APP],
      sentBy,
      sentAt: new Date(),
      createdAt: new Date(),
    });
  }

  // Business Logic Methods

  /**
   * Mark notification as read
   */
  markAsRead() {
    if (this.status === Notification.STATUS.READ) {
      return; // Already read
    }

    this.status = Notification.STATUS.READ;
    this.readAt = new Date();
  }

  /**
   * Mark notification as unread
   */
  markAsUnread() {
    if (this.status === Notification.STATUS.UNREAD) {
      return; // Already unread
    }

    this.status = Notification.STATUS.UNREAD;
    this.readAt = null;
  }

  /**
   * Archive notification
   */
  archive() {
    this.status = Notification.STATUS.ARCHIVED;
    this.archivedAt = new Date();
  }

  /**
   * Unarchive notification
   */
  unarchive() {
    if (this.status !== Notification.STATUS.ARCHIVED) {
      throw new Error('Notification is not archived');
    }

    this.status = this.readAt ? Notification.STATUS.READ : Notification.STATUS.UNREAD;
    this.archivedAt = null;
  }

  /**
   * Set expiration date
   */
  setExpiration(daysFromNow) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysFromNow);
    this.expiresAt = expiryDate;
  }

  /**
   * Mark as delivered via channel
   */
  markChannelDelivered(channel, error = null) {
    const channelKey = channel.toLowerCase().replace('_', '');
    if (this.deliveryStatus[channelKey]) {
      this.deliveryStatus[channelKey].sent = !error;
      this.deliveryStatus[channelKey].sentAt = new Date();
      if (error) {
        this.deliveryStatus[channelKey].error = error;
      }
    }
  }

  /**
   * Add metadata
   */
  addMetadata(key, value) {
    this.metadata[key] = value;
  }

  /**
   * Update action
   */
  setAction(url, label) {
    this.actionUrl = url;
    this.actionLabel = label;
  }

  // Query Methods

  /**
   * Check if notification is unread
   */
  isUnread() {
    return this.status === Notification.STATUS.UNREAD;
  }

  /**
   * Check if notification is read
   */
  isRead() {
    return this.status === Notification.STATUS.READ;
  }

  /**
   * Check if notification is archived
   */
  isArchived() {
    return this.status === Notification.STATUS.ARCHIVED;
  }

  /**
   * Check if notification is urgent
   */
  isUrgent() {
    return this.priority === Notification.PRIORITY.URGENT;
  }

  /**
   * Check if notification is high priority
   */
  isHighPriority() {
    return this.priority === Notification.PRIORITY.HIGH || this.isUrgent();
  }

  /**
   * Check if notification is expired
   */
  isExpired() {
    if (!this.expiresAt) {
      return false;
    }
    return new Date() > this.expiresAt;
  }

  /**
   * Check if notification is a broadcast
   */
  isBroadcast() {
    return this.recipientId === null;
  }

  /**
   * Check if delivered via channel
   */
  isDeliveredVia(channel) {
    const channelKey = channel.toLowerCase().replace('_', '');
    return this.deliveryStatus[channelKey]?.sent || false;
  }

  /**
   * Get time since sent
   */
  getTimeSinceSent() {
    const now = new Date();
    const diffMs = now - this.sentAt;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    }
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  /**
   * Get summary
   */
  getSummary() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      priority: this.priority,
      status: this.status,
      isUnread: this.isUnread(),
      isUrgent: this.isUrgent(),
      hasAction: !!this.actionUrl,
      sentAt: this.sentAt,
      timeSince: this.getTimeSinceSent(),
    };
  }

  /**
   * Validate notification data
   */
  validate() {
    const errors = [];

    if (!this.title) {
      errors.push('Title is required');
    }
    if (!this.message) {
      errors.push('Message is required');
    }
    if (!this.type) {
      errors.push('Type is required');
    }
    if (!this.recipientType) {
      errors.push('Recipient type is required');
    }

    if (this.recipientType === Notification.RECIPIENT_TYPE.ROLE && !this.recipientRole) {
      errors.push('Recipient role is required for role-based notifications');
    }

    if (!this.channels || this.channels.length === 0) {
      errors.push('At least one delivery channel is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Notification;
