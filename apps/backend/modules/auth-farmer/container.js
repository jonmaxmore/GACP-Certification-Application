/**
 * Auth Farmer Module Container
 * Dependency Injection Container - Clean Architecture
 *
 * Purpose: Wire up all layers and dependencies
 * - Configure database connection
 * - Instantiate infrastructure services
 * - Create use cases with dependencies
 * - Create controller with use cases
 * - Export configured router
 */

/* eslint-disable no-unused-vars */
const path = require('path');
const logger = require('../../shared/logger');
const mongoose = require('mongoose'); // Used in JSDoc type annotations
const IUserRepository = require('./domain/interfaces/IUserRepository'); // Used for interface documentation
/* eslint-enable no-unused-vars */

// Infrastructure
const MongoDBUserRepository = require('./infrastructure/database/user-model');
const BcryptPasswordHasher = require('./infrastructure/security/password');
const JWTService = require('./infrastructure/security/token');
const jwtSecurity = require(path.resolve(__dirname, '../../../../config/jwt-security'));

// Application (Use Cases)
const RegisterUserUseCase = require('./application/use-cases/register-usecase');
const LoginUserUseCase = require('./application/use-cases/login-usecase');
const VerifyEmailUseCase = require('./application/use-cases/verify-email-usecase');
const RequestPasswordResetUseCase = require('./application/use-cases/request-password-reset-usecase');
const ResetPasswordUseCase = require('./application/use-cases/reset-password-usecase');
const GetUserProfileUseCase = require('./application/use-cases/get-profile-usecase');
const UpdateUserProfileUseCase = require('./application/use-cases/update-profile-usecase');

// Presentation
const AuthController = require('./presentation/controllers/auth-controller');
const createAuthRouter = require('./presentation/routes/auth.routes');

/**
 * Simple Event Bus implementation
 */
class SimpleEventBus {
  constructor() {
    this.listeners = new Map();
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  async publish(event) {
    const eventType = event.constructor.name;
    const callbacks = this.listeners.get(eventType) || [];

    for (const callback of callbacks) {
      try {
        await callback(event);
      } catch (error) {
        logger.error(`Error processing event ${eventType}:`, error);
      }
    }
  }
}

/**
 * Simple Token Generator
 */
class TokenGenerator {
  generate() {
    return require('crypto').randomBytes(32).toString('hex');
  }
}

/**
 * Create and configure auth farmer module
 * @param {Object} config - Configuration object
 * @param {mongoose.Connection} config.database - Mongoose database connection
 * @param {string} config.jwtSecret - JWT secret key
 * @param {string} config.jwtExpiresIn - JWT expiration time (default: '24h')
 * @param {number} config.bcryptSaltRounds - Bcrypt salt rounds (default: 12)
 * @returns {express.Router}
 */
function createAuthFarmerModule(config) {
  const {
    database,
    jwtSecret,
    jwtExpiresIn,
    bcryptSaltRounds = 12,
    jwtConfig: explicitJwtConfig,
  } = config;

  // Validate required configuration
  if (!database) {
    throw new Error('Database connection is required');
  }

  const baseJwtConfig =
    explicitJwtConfig || (!jwtSecret ? jwtSecurity.getJWTConfiguration() : null);

  const resolvedJwtSecret = jwtSecret || baseJwtConfig?.public?.secret;
  const resolvedJwtExpiry = jwtExpiresIn || baseJwtConfig?.public?.expiry || '24h';

  if (!resolvedJwtSecret) {
    throw new Error('JWT secret is required');
  }

  if (!process.env.FARMER_JWT_SECRET || process.env.FARMER_JWT_SECRET !== resolvedJwtSecret) {
    process.env.FARMER_JWT_SECRET = resolvedJwtSecret;
  }

  let farmerJwtMetadata = {};
  // Keep shared JWT configuration in sync for middleware verification
  try {
    const sharedJwtConfig = jwtSecurity.getJWTConfiguration();
    if (sharedJwtConfig?.public) {
      sharedJwtConfig.public.secret = resolvedJwtSecret;
      sharedJwtConfig.public.expiry = resolvedJwtExpiry;
      farmerJwtMetadata = {
        issuer: sharedJwtConfig.public.issuer,
        audience: sharedJwtConfig.public.audience,
        algorithm: sharedJwtConfig.public.algorithm,
      };
    }
  } catch (error) {
    logger.warn('Unable to synchronize shared JWT configuration:', error.message);
  }

  // Infrastructure Layer
  const userRepository = new MongoDBUserRepository(database);
  const passwordHasher = new BcryptPasswordHasher(bcryptSaltRounds);
  const jwtService = new JWTService(resolvedJwtSecret, resolvedJwtExpiry, farmerJwtMetadata);
  const tokenGenerator = new TokenGenerator();
  const eventBus = new SimpleEventBus();

  // Subscribe to domain events (for logging, email sending, etc.)
  eventBus.subscribe('UserRegistered', async event => {
    logger.info('User registered:', event.toEventPayload());
    // TODO: Send verification email
  });

  eventBus.subscribe('UserLoggedIn', async event => {
    logger.info('User logged in:', event.toEventPayload());
    // TODO: Log activity, send notification if new device, etc.
  });

  eventBus.subscribe('PasswordResetRequested', async event => {
    logger.info('Password reset requested:', event.toEventPayload());
    // TODO: Send password reset email
  });

  // Application Layer (Use Cases)
  const registerUserUseCase = new RegisterUserUseCase({
    userRepository,
    passwordHasher,
    tokenGenerator,
    eventBus,
  });

  const loginUserUseCase = new LoginUserUseCase({
    userRepository,
    passwordHasher,
    jwtService,
    eventBus,
  });

  const verifyEmailUseCase = new VerifyEmailUseCase({
    userRepository,
  });

  const requestPasswordResetUseCase = new RequestPasswordResetUseCase({
    userRepository,
    tokenGenerator,
    eventBus,
  });

  const resetPasswordUseCase = new ResetPasswordUseCase({
    userRepository,
    passwordHasher,
  });

  const getUserProfileUseCase = new GetUserProfileUseCase({
    userRepository,
  });

  const updateUserProfileUseCase = new UpdateUserProfileUseCase({
    userRepository,
  });

  // Presentation Layer
  const authController = new AuthController({
    registerUserUseCase,
    loginUserUseCase,
    verifyEmailUseCase,
    requestPasswordResetUseCase,
    resetPasswordUseCase,
    getUserProfileUseCase,
    updateUserProfileUseCase,
  });

  // Create and return router
  const router = createAuthRouter(authController);

  return {
    router,
    services: {
      userRepository,
      passwordHasher,
      jwtService,
    },
  };
}

module.exports = createAuthFarmerModule;
