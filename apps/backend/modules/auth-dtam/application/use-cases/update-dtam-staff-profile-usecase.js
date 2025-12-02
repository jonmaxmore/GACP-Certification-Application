/**
 * Update DTAM Staff Profile Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Update staff profile information
 */

class UpdateDTAMStaffProfileUseCase {
  constructor({ staffRepository }) {
    this.staffRepository = staffRepository;
  }

  async execute({ staffId, updates, updatedBy }) {
    const staff = await this.staffRepository.findById(staffId);

    if (!staff) {
      throw new Error('Staff not found');
    }

    if (!staff.isActive()) {
      throw new Error('Cannot update profile. Account is not active.');
    }

    // Update profile
    staff.updateProfile(updates, updatedBy);

    // Validate
    staff.validate();

    // Save
    const updatedStaff = await this.staffRepository.save(staff);

    return updatedStaff.toJSON();
  }
}

module.exports = UpdateDTAMStaffProfileUseCase;
