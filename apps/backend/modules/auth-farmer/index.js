/**
 * Auth Farmer Module
 * Handles farmer authentication and user management
 *
 * Entry point for the farmer authentication module
 */

// Import Clean Architecture container
const createAuthFarmerModule = require('./container');

// Import legacy models for backward compatibility (will be deprecated)
const User = require('./models/user-model');

// Import services
const logger = require('../../shared/logger');

// Import validators
const validators = require('./validators/auth-validators');

/**
 * Module exports
 */
module.exports = {
  // Clean Architecture factory (RECOMMENDED)
  createModule: createAuthFarmerModule,

  // Legacy exports (DEPRECATED - for backward compatibility only)
  models: {
    User,
  },

  services: {
    logger,
  },

  validators,

  // Convenience method to mount routes (DEPRECATED)
  mountRoutes: (app, basePath = '/api/auth-farmer') => {
    logger.warn('DEPRECATED: Use createModule() with container pattern instead');
    const farmerAuthModule = createAuthFarmerModule({
      database: require('mongoose').connection,
      jwtSecret: process.env.FARMER_JWT_SECRET || process.env.JWT_SECRET,
      jwtExpiresIn: '24h',
      bcryptSaltRounds: 12,
    });
    app.use(basePath, farmerAuthModule.router);
    logger.info(`Auth Farmer routes mounted at ${basePath} (via deprecated method)`);
  },
};
