/**
 * Request DTAM Staff Password Reset Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Request password reset for DTAM staff
 * - Find staff by email
 * - Generate reset token
 * - Save token with expiry
 * - Publish domain event
 */

const DTAMStaffPasswordResetRequested = require('../../domain/events/DTAMStaffPasswordResetRequested');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('auth-dtam-request-dtam-staff-password-reset');

class RequestDTAMStaffPasswordResetUseCase {
  constructor({ staffRepository, tokenGenerator, eventBus }) {
    this.staffRepository = staffRepository;
    this.tokenGenerator = tokenGenerator;
    this.eventBus = eventBus;
  }

  async execute({ email }) {
    try {
      // Find staff by email
      const staff = await this.staffRepository.findByEmail(email);

      if (!staff) {
        // Return success even if staff not found (prevent email enumeration)
        return { success: true };
      }

      // Generate reset token
      const resetToken = this.tokenGenerator.generate();

      // Set token with 60-minute expiry
      staff.setPasswordResetToken(resetToken, 60);

      // Save staff
      await this.staffRepository.save(staff);

      // Publish domain event
      const event = new DTAMStaffPasswordResetRequested(
        staff,
        resetToken,
        staff.passwordResetTokenExpiresAt,
      );
      await this.eventBus.publish(event);

      return {
        success: true,
        resetToken, // Only for testing/development
      };
    } catch (error) {
      logger.error('Password reset request error:', error);
      // Always return success (prevent email enumeration)
      return { success: true };
    }
  }
}

module.exports = RequestDTAMStaffPasswordResetUseCase;
