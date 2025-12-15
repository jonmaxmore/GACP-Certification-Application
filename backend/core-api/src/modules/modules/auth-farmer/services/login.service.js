/**
 * Login User Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Handle user login business logic
 * - Validate credentials
 * - Check account status
 * - Verify password
 * - Generate JWT token
 * - Record login
 * - Publish UserLoggedIn event
 */

const Email = require('../domain/value-objects/Email');
const UserLoggedIn = require('../domain/events/user-logged-in');
const { AuthenticationError, AuthorizationError } = require('../../../shared/errors');

class LoginUserUseCase {
  constructor({ userRepository, passwordHasher, jwtService, eventBus }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.jwtService = jwtService;
    this.eventBus = eventBus;
  }

  /**
   * Execute login use case
   * @param {Object} request - Login credentials
   * @param {string} request.email - User email
   * @param {string} request.password - User password
   * @param {string} [request.ipAddress] - Client IP address
   * @param {string} [request.userAgent] - Client User Agent
   * @returns {Promise<Object>} - { user, token }
   * @throws {AuthenticationError} If credentials are invalid
   * @throws {AuthorizationError} If account is locked or inactive
   */
  async execute(request) {
    const { email, password, ipAddress, userAgent } = request;

    // 1. Validate email format
    const emailVO = new Email(email);

    // 2. Find user by email
    const user = await this.userRepository.findByEmail(emailVO.value);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // 3. Check if account is locked
    if (user.isAccountLocked()) {
      const lockDuration = Math.ceil((user.lockedUntil - new Date()) / 1000 / 60);
      throw new AuthorizationError(`Account is locked. Please try again in ${lockDuration} minutes`);
    }

    // 4. Check if account is active
    if (!user.isActive()) {
      if (user.status === 'PENDING_VERIFICATION') {
        throw new AuthorizationError('Please verify your email before logging in');
      }
      if (user.status === 'SUSPENDED') {
        throw new AuthorizationError('Your account has been suspended. Please contact support');
      }
      throw new AuthorizationError('Account is inactive');
    }

    // 5. Verify password
    const isPasswordValid = await this.passwordHasher.compare(password, user.password);

    if (!isPasswordValid) {
      // Record failed login attempt
      user.recordFailedLogin();
      await this.userRepository.save(user);

      throw new AuthenticationError('Invalid email or password');
    }

    // 6. Record successful login
    user.recordSuccessfulLogin();
    await this.userRepository.save(user);

    // 7. Generate JWT token
    const token = await this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    // 8. Publish UserLoggedIn event
    if (this.eventBus) {
      const event = new UserLoggedIn({
        userId: user.id,
        email: user.email,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        loggedInAt: new Date(),
      });

      await this.eventBus.publish(event.toEventPayload());
    }

    // 9. Return user and token
    return {
      user: user.toJSON(),
      token,
    };
  }
}

module.exports = LoginUserUseCase;
