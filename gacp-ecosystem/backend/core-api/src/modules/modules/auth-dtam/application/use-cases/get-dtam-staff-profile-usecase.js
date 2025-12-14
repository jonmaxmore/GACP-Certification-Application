/**
 * Get DTAM Staff Profile Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Get staff profile by ID
 */

class GetDTAMStaffProfileUseCase {
  constructor({ staffRepository }) {
    this.staffRepository = staffRepository;
  }

  async execute({ staffId }) {
    const staff = await this.staffRepository.findById(staffId);

    if (!staff) {
      throw new Error('Staff not found');
    }

    return staff.toJSON();
  }
}

module.exports = GetDTAMStaffProfileUseCase;
