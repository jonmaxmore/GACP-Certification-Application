/**
 * UserRegistered Domain Event
 * Domain Layer - Clean Architecture
 *
 * Purpose: Event triggered when a new user registers
 * - Used for event-driven architecture
 * - Can trigger email verification, welcome email, etc.
 */

class UserRegistered {
  constructor({ userId, email, firstName, lastName, registeredAt }) {
    this.type = 'UserRegistered';
    this.userId = userId;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.registeredAt = registeredAt || new Date();
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
        firstName: this.firstName,
        lastName: this.lastName,
        registeredAt: this.registeredAt,
      },
      metadata: {
        occurredAt: this.occurredAt,
        version: '1.0',
      },
    };
  }
}

module.exports = UserRegistered;
