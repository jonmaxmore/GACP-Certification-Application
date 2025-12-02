/**
 * Reset Password Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Handle password reset with token
 * - Find user by reset token
 * - Validate token
 * - Hash new password
 * - Update password
 * - Clear reset token
 */

const Password = require('../../domain/value-objects/Password');

class ResetPasswordUseCase {
  constructor({ userRepository, passwordHasher }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  /**
   * Execute reset password use case
   * @param {Object} request - { token, newPassword }
   * @returns {Promise<Object>} - Success message
   */
  async execute(request) {
    const { token, newPassword } = request;

    if (!token) {
      throw new Error('Reset token is required');
    }

    if (!newPassword) {
      throw new Error('New password is required');
    }

    // 1. Find user by reset token
    const user = await this.userRepository.findByPasswordResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // 2. Check if token is still valid
    if (!user.isPasswordResetValid()) {
      throw new Error('Reset token has expired. Please request a new one');
    }

    // 3. Validate new password strength
    const passwordVO = new Password(newPassword);

    // 4. Hash new password
    const hashedPassword = await this.passwordHasher.hash(passwordVO.getPlainValue());

    // 5. Update password
    user.password = hashedPassword;

    // 6. Clear reset token
    user.clearPasswordResetToken();

    // 7. Unlock account if locked
    if (user.isAccountLocked()) {
      user.unlock();
    }

    // 8. Save user
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Password has been reset successfully',
    };
  }
}

module.exports = ResetPasswordUseCase;
