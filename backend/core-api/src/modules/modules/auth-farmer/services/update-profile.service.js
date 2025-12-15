/**
 * Update User Profile Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Update user profile information
 * - Find user by ID
 * - Validate updates
 * - Update allowed fields only
 * - Save changes
 */

class UpdateUserProfileUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  /**
   * Execute update user profile use case
   * @param {Object} request - { userId, profileData }
   * @returns {Promise<Object>} - Updated user profile
   */
  async execute(request) {
    const { userId, profileData } = request;

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!profileData || Object.keys(profileData).length === 0) {
      throw new Error('Profile data is required');
    }

    // 1. Find user by ID
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Check if user is active
    if (!user.isActive()) {
      throw new Error('Cannot update profile of inactive user');
    }

    // 3. Update profile using domain method
    user.updateProfile(profileData);

    // 4. Validate updated user
    const validationErrors = user.validate();
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // 5. Save changes
    const updatedUser = await this.userRepository.save(user);

    // 6. Return updated profile
    return updatedUser.toJSON();
  }
}

module.exports = UpdateUserProfileUseCase;
