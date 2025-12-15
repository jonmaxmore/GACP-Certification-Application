/**
 * DTAM Staff Logged In Domain Event
 * Domain Layer - Clean Architecture
 *
 * Purpose: Event published when DTAM staff logs in
 */

class DTAMStaffLoggedIn {
  constructor(staff, ipAddress, userAgent) {
    this.staffId = staff.id;
    this.email = staff.email;
    this.role = staff.role;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.timestamp = new Date();
  }

  toEventPayload() {
    return {
      eventType: 'DTAMStaffLoggedIn',
      staffId: this.staffId,
      email: this.email,
      role: this.role,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      timestamp: this.timestamp,
    };
  }
}

module.exports = DTAMStaffLoggedIn;
