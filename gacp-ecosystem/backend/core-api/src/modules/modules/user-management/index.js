/**
 * User Management Module
 *
 * Complete user authentication and management system for GACP platform.
 * Implements clean architecture with domain-driven design principles.
 *
 * Module Components:
 * - UserAuthenticationService: Core authentication business logic
 * - AuthenticationMiddleware: JWT and permission validation
 * - UserAuthenticationController: RESTful API endpoints
 * - UserRepository: Data access layer with caching
 * - User Model: Mongoose schema with validation
 * - Authentication Routes: Express route configuration
 *
 * Features:
 * - Multi-role authentication (FARMER, DTAM_REVIEWER, DTAM_INSPECTOR, DTAM_ADMIN)
 * - JWT token management with refresh capability
 * - Role-based access control (RBAC)
 * - Password security and complexity validation
 * - Account lockout and security monitoring
 * - Rate limiting and DDoS protection
 * - Comprehensive audit logging
 * - Session management with Redis
 *
 * Security Features:
 * - bcrypt password hashing (12 rounds)
 * - JWT with secure secret rotation
 * - Account lockout after failed attempts
 * - Password expiry and complexity rules
 * - IP-based access monitoring
 * - Rate limiting per endpoint
 * - CSRF protection headers
 * - Session invalidation on security events
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../shared/shared/logger/logger');
const UserAuthenticationService = require('./domain/user-authentication-service');
const AuthenticationMiddleware = require('./presentation/middleware/authentication-middleware-middleware');
const UserAuthenticationController = require('./presentation/controllers/user-authentication-controller');
const UserRepository = require('./infrastructure/repositories/user-repository');
const User = require('./infrastructure/models/User');
const createAuthRoutes = require('./presentation/routes/AuthRoutes.routes');
const { JWTTokenManager } = require('../../middleware/jwt-token-manager-middleware');

class UserManagementModule {
  constructor(dependencies = {}) {
    // External dependencies
    this.cache-service = dependencies.cache-service; // Redis client
    this.auditService = dependencies.auditService;
    this.notification-service = dependencies.notification-service;
    this.database = dependencies.database; // MongoDB connection
    this.redisClient = dependencies.redisClient; // Redis client for rate limiting

    // Initialize module components
    this._initializeComponents();

    logger.info('[UserManagementModule] Initialized successfully');
  }

  /**
   * Initialize all module components with dependency injection
   * @private
   */
  _initializeComponents() {
    // Initialize token manager
    this.tokenManager = new JWTTokenManager(this.cache-service);

    // Initialize repository
    this.userRepository = new UserRepository({
      cache-service: this.cache-service,
      auditService: this.auditService,
    });

    // Initialize authentication service
    this.authenticationService = new UserAuthenticationService({
      userRepository: this.userRepository,
      auditService: this.auditService,
      notification-service: this.notification-service,
      cache-service: this.cache-service,
    });

    // Initialize middleware
    this.authenticationMiddleware = new AuthenticationMiddleware({
      userAuthenticationService: this.authenticationService,
      auditService: this.auditService,
    });

    // Initialize controller
    this.authenticationController = new UserAuthenticationController({
      userAuthenticationService: this.authenticationService,
      userRepository: this.userRepository,
      auditService: this.auditService,
      notification-service: this.notification-service,
    });

    // Create routes
    this.authRoutes = createAuthRoutes({
      userAuthenticationController: this.authenticationController,
      authenticationMiddleware: this.authenticationMiddleware,
      tokenManager: this.tokenManager,
      redisClient: this.redisClient,
    });
  }

  /**
   * Get authentication middleware for use in other modules
   * @returns {Object} - Authentication middleware functions
   */
  getAuthenticationMiddleware() {
    return {
      extractToken: this.authenticationMiddleware.extractToken.bind(this.authenticationMiddleware),
      authenticate: this.authenticationMiddleware.authenticate.bind(this.authenticationMiddleware),
      authorize: this.authenticationMiddleware.authorize.bind(this.authenticationMiddleware),
      requireRole: this.authenticationMiddleware.requireRole.bind(this.authenticationMiddleware),
      validateResourceOwnership: this.authenticationMiddleware.validateResourceOwnership.bind(
        this.authenticationMiddleware,
      ),
      rateLimit: this.authenticationMiddleware.rateLimit.bind(this.authenticationMiddleware),
      optionalAuth: this.authenticationMiddleware.optionalAuth.bind(this.authenticationMiddleware),
      securityHeaders: this.authenticationMiddleware.securityHeaders.bind(
        this.authenticationMiddleware,
      ),
    };
  }

  /**
   * Get authentication service for use in other modules
   * @returns {UserAuthenticationService} - Authentication service instance
   */
  getAuthenticationService() {
    return this.authenticationService;
  }

  /**
   * Get user repository for use in other modules
   * @returns {UserRepository} - User repository instance
   */
  getUserRepository() {
    return this.userRepository;
  }

  /**
   * Get authentication routes for Express app
   * @returns {Router} - Express router with auth routes
   */
  getAuthRoutes() {
    return this.authRoutes;
  }

  /**
   * Get User model for use in other modules
   * @returns {Model} - Mongoose User model
   */
  getuser-model() {
    return User;
  }

  /**
   * Create initial admin user (for system setup)
   * @param {Object} adminData - Admin user data
   * @returns {Promise<Object>} - Created admin user
   */
  async createInitialAdmin(adminData) {
    try {
      // Check if admin already exists
      const existingAdmin = await this.userRepository.findByRole('DTAM_ADMIN');
      if (existingAdmin.length > 0) {
        throw new Error('Admin user already exists');
      }

      // Create admin user
      const adminUser = await this.userRepository.create({
        ...adminData,
        role: 'DTAM_ADMIN',
        isActive: true,
        isVerified: true,
        requirePasswordChange: true, // Force password change on first login
      });

      logger.info('[UserManagementModule] Initial admin user created:', adminUser.email);
      return adminUser;
    } catch (error) {
      logger.error('[UserManagementModule] Create initial admin error:', error);
      throw error;
    }
  }

  /**
   * Validate module configuration
   * @returns {Object} - Validation result
   */
  validateConfiguration() {
    const issues = [];

    // Check required environment variables
    if (!process.env.JWT_SECRET) {
      issues.push('JWT_SECRET environment variable is not set');
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      issues.push('JWT_SECRET should be at least 32 characters long');
    }

    // Check dependencies
    if (!this.cache-service) {
      issues.push('Cache service (Redis) is not configured');
    }

    if (!this.database) {
      issues.push('Database connection is not configured');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get module health status
   * @returns {Promise<Object>} - Health status
   */
  async getHealthStatus() {
    try {
      const health = {
        module: 'UserManagement',
        status: 'healthy',
        timestamp: new Date(),
        components: {},
      };

      // Check database connectivity
      try {
        await User.findOne({}).limit(1);
        health.components.database = 'healthy';
      } catch (error) {
        health.components.database = 'unhealthy';
        health.status = 'degraded';
      }

      // Check cache service
      if (this.cache-service) {
        try {
          await this.CacheService.ping();
          health.components.cache = 'healthy';
        } catch (error) {
          health.components.cache = 'unhealthy';
          health.status = 'degraded';
        }
      } else {
        health.components.cache = 'not_configured';
      }

      // Check configuration
      const configValidation = this.validateConfiguration();
      health.components.configuration = configValidation.valid ? 'healthy' : 'issues';
      if (!configValidation.valid) {
        health.status = 'unhealthy';
        health.configurationIssues = configValidation.issues;
      }

      return health;
    } catch (error) {
      return {
        module: 'UserManagement',
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * Clean up resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    try {
      logger.info('[UserManagementModule] Cleaning up resources...');

      // Close any open connections or cleanup resources
      // This would be called during application shutdown

      logger.info('[UserManagementModule] Cleanup completed');
    } catch (error) {
      logger.error('[UserManagementModule] Cleanup error:', error);
    }
  }
}

/**
 * Factory function to create and initialize User Management Module
 * @param {Object} dependencies - External dependencies
 * @returns {UserManagementModule} - Initialized module instance
 */
function createUserManagementModule(dependencies = {}) {
  return new UserManagementModule(dependencies);
}

module.exports = {
  UserManagementModule,
  createUserManagementModule,

  // Export individual components for direct access if needed
  UserAuthenticationService,
  AuthenticationMiddleware,
  UserAuthenticationController,
  UserRepository,
  User,
  createAuthRoutes,
};

/**
 * Usage Example:
 *
 * const { createUserManagementModule } = require('./modules/user-management');
 *
 * const userModule = createUserManagementModule({
 *   cache-service: redisClient,
 *   auditService: auditLogger,
 *   notification-service: email-service,
 *   database: mongoConnection
 * });
 *
 * // Use in Express app
 * app.use('/api/auth', userModule.getAuthRoutes());
 *
 * // Use middleware in other routes
 * const auth = userModule.getAuthenticationMiddleware();
 * app.use('/api/protected', auth.authenticate(), auth.authorize('some:permission'));
 *
 * // Use authentication service in other modules
 * const AuthService = userModule.getAuthenticationService();
 * const isValid = await auth-service.validateToken(token);
 */
