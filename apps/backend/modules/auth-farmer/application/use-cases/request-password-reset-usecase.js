/**
 * Request Password Reset Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Handle password reset request
 * - Find user by email
 * - Generate reset token
 * - Save token with expiry
 * - Publish PasswordResetRequested event
 */

const Email = require('../../domain/value-objects/Email');
const PasswordResetRequested = require('../../domain/events/PasswordResetRequested');

class RequestPasswordResetUseCase {
  constructor({ userRepository, tokenGenerator, eventBus }) {
    this.userRepository = userRepository;
    this.tokenGenerator = tokenGenerator;
    this.eventBus = eventBus;
  }

  /**
   * Execute request password reset use case
   * @param {Object} request - { email }
   * @returns {Promise<Object>} - Success message
   */
  async execute(request) {
    const { email } = request;

    // 1. Validate email format
    const emailVO = new Email(email);

    // 2. Find user by email
    const user = await this.userRepository.findByEmail(emailVO.value);

    // Note: For security, always return success even if user not found
    if (!user) {
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // 3. Check if account is suspended
    if (user.status === 'SUSPENDED') {
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // 4. Generate reset token
    const resetToken = await this.tokenGenerator.generate();

    // 5. Set reset token with expiry (60 minutes)
    user.setPasswordResetToken(resetToken, 60);

    // 6. Save user
    await this.userRepository.save(user);

    // 7. Publish PasswordResetRequested event
    if (this.eventBus) {
      const event = new PasswordResetRequested({
        userId: user.id,
        email: user.email,
        resetToken: resetToken,
        expiresAt: user.passwordResetExpiry,
      });

      await this.eventBus.publish(event.toEventPayload());
    }

    return {
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    };
  }
}

module.exports = RequestPasswordResetUseCase;
