/**
 * UserLoggedIn Domain Event
 * Domain Layer - Clean Architecture
 *
 * Purpose: Event triggered when user successfully logs in
 * - Audit trail
 * - Security monitoring
 * - Analytics
 */

class UserLoggedIn {
  constructor({ userId, email, ipAddress, userAgent, loggedInAt }) {
    this.type = 'UserLoggedIn';
    this.userId = userId;
    this.email = email;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.loggedInAt = loggedInAt || new Date();
    this.occurredAt = new Date();
  }

  /**
   * Convert to event payload for event bus
   * @returns {Object}
   */
  toEventPayload() {
    return {
      type: this.type,
      payload: {
        userId: this.userId,
        email: this.email,
        ipAddress: this.ipAddress,
        userAgent: this.userAgent,
        loggedInAt: this.loggedInAt,
      },
      metadata: {
        occurredAt: this.occurredAt,
        version: '1.0',
      },
    };
  }
}

module.exports = UserLoggedIn;
