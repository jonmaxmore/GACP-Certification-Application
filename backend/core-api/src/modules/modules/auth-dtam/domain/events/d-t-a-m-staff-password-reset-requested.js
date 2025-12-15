/**
 * DTAM Staff Password Reset Requested Domain Event
 * Domain Layer - Clean Architecture
 *
 * Purpose: Event published when password reset is requested
 */

class DTAMStaffPasswordResetRequested {
  constructor(staff, resetToken, expiresAt) {
    this.staffId = staff.id;
    this.email = staff.email;
    this.resetToken = resetToken;
    this.expiresAt = expiresAt;
    this.timestamp = new Date();
  }

  toEventPayload() {
    return {
      eventType: 'DTAMStaffPasswordResetRequested',
      staffId: this.staffId,
      email: this.email,
      resetToken: this.resetToken,
      expiresAt: this.expiresAt,
      timestamp: this.timestamp,
    };
  }
}

module.exports = DTAMStaffPasswordResetRequested;
