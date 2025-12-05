/**
 * Get User Profile Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Retrieve user profile information
 * - Find user by ID
 * - Return profile data
 */

class GetUserProfileUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  /**
   * Execute get user profile use case
   * @param {Object} request - { userId }
   * @returns {Promise<Object>} - User profile
   */
  async execute(request) {
    const { userId } = request;

    if (!userId) {
      throw new Error('User ID is required');
    }

    // 1. Find user by ID
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Return user profile
    return user.toJSON();
  }
}

module.exports = GetUserProfileUseCase;
