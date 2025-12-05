/**
 * DTAM Staff Created Domain Event
 * Domain Layer - Clean Architecture
 *
 * Purpose: Event published when new DTAM staff is created
 */

class DTAMStaffCreated {
  constructor(staff, createdBy) {
    this.staffId = staff.id;
    this.email = staff.email;
    this.firstName = staff.firstName;
    this.lastName = staff.lastName;
    this.employeeId = staff.employeeId;
    this.role = staff.role;
    this.createdBy = createdBy;
    this.timestamp = new Date();
  }

  toEventPayload() {
    return {
      eventType: 'DTAMStaffCreated',
      staffId: this.staffId,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      employeeId: this.employeeId,
      role: this.role,
      createdBy: this.createdBy,
      timestamp: this.timestamp,
    };
  }
}

module.exports = DTAMStaffCreated;
