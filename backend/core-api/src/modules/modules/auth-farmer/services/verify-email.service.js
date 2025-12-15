/**
 * Verify Email Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Handle email verification
 * - Find user by verification token
 * - Check token validity
 * - Mark email as verified
 * - Activate account
 */

class VerifyEmailUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  /**
   * Execute verify email use case
   * @param {Object} request - { token }
   * @returns {Promise<User>}
   */
  async execute(request) {
    const { token } = request;

    if (!token) {
      throw new Error('Verification token is required');
    }

    // 1. Find user by verification token
    const user = await this.userRepository.findByEmailVerificationToken(token);
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    // 2. Check if token is still valid
    if (!user.isEmailVerificationValid()) {
      throw new Error('Verification token has expired. Please request a new one');
    }

    // 3. Check if already verified
    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }

    // 4. Verify email
    user.verifyEmail();

    // 5. Activate account if all requirements met
    if (user.status === 'PENDING_VERIFICATION') {
      user.activate();
    }

    // 6. Save user
    const updatedUser = await this.userRepository.save(user);

    return updatedUser.toJSON();
  }
}

module.exports = VerifyEmailUseCase;
