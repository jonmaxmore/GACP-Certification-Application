/**
 * Update DTAM Staff Role Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Update staff role and permissions (admin only)
 */

const DTAMStaff = require('../../domain/entities/DTAMStaff');

class UpdateDTAMStaffRoleUseCase {
  constructor({ staffRepository }) {
    this.staffRepository = staffRepository;
  }

  async execute({ staffId, role, permissions, updatedBy }) {
    const staff = await this.staffRepository.findById(staffId);

    if (!staff) {
      throw new Error('Staff not found');
    }

    // Validate role
    if (!Object.values(DTAMStaff.ROLES).includes(role)) {
      throw new Error('Invalid role');
    }

    // Get default permissions if not provided
    const staffPermissions =
      permissions && permissions.length > 0 ? permissions : DTAMStaff.getDefaultPermissions(role);

    // Update role and permissions
    staff.updateRoleAndPermissions(role, staffPermissions, updatedBy);

    // Validate
    staff.validate();

    // Save
    const updatedStaff = await this.staffRepository.save(staff);

    return updatedStaff.toJSON();
  }
}

module.exports = UpdateDTAMStaffRoleUseCase;
