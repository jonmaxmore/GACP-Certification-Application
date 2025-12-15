/**
 * PasswordResetRequested Domain Event
 * Domain Layer - Clean Architecture
 *
 * Purpose: Event triggered when user requests password reset
 * - Send reset email
 * - Security logging
 */

class PasswordResetRequested {
  constructor({ userId, email, resetToken, expiresAt }) {
    this.type = 'PasswordResetRequested';
    this.userId = userId;
    this.email = email;
    this.resetToken = resetToken;
    this.expiresAt = expiresAt;
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
        resetToken: this.resetToken,
        expiresAt: this.expiresAt,
      },
      metadata: {
        occurredAt: this.occurredAt,
        version: '1.0',
      },
    };
  }
}

module.exports = PasswordResetRequested;
