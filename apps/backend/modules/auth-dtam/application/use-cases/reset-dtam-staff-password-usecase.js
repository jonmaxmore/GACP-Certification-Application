/**
 * Reset DTAM Staff Password Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Reset password with token
 * - Find staff by token
 * - Validate token expiry
 * - Hash new password
 * - Update password
 * - Clear token
 * - Unlock account
 */

const Password = require('../../../auth-farmer/domain/value-objects/Password');

class ResetDTAMStaffPasswordUseCase {
  constructor({ staffRepository, passwordHasher }) {
    this.staffRepository = staffRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute({ token, newPassword }) {
    // Find staff by reset token
    const staff = await this.staffRepository.findByPasswordResetToken(token);

    if (!staff) {
      throw new Error('Invalid or expired reset token');
    }

    // Check if token is expired
    if (staff.passwordResetTokenExpiresAt < new Date()) {
      throw new Error('Reset token has expired');
    }

    // Validate new password
    const passwordVO = new Password(newPassword);
    passwordVO.validate();

    // Hash new password
    const hashedPassword = await this.passwordHasher.hash(newPassword);

    // Update password
    staff.password = hashedPassword;

    // Clear reset token
    staff.clearPasswordResetToken();

    // Unlock account if locked
    if (staff.isAccountLocked()) {
      staff.unlock();
    }

    // Save staff
    await this.staffRepository.save(staff);

    return {
      staff,
    };
  }
}

module.exports = ResetDTAMStaffPasswordUseCase;
