/**
 * Auth DTAM Module
 * Handles DTAM staff authentication and management
 * Separate from farmer authentication for security
 *
 * Entry point for the DTAM authentication module
 */

// Import routes
const dtamAuthRoutes = require('./routes/dtam-auth-middleware');

// Import models
const DTAMStaff = require('./models/DTAMStaff');

// Import middleware
const dtamAuthMiddleware = require('./middleware/dtam-auth-middleware');

// Import services
const logger = require('../../shared/logger');

/**
 * Module exports
 */
module.exports = {
  // Routes
  routes: {
    dtamAuth: dtamAuthRoutes,
  },

  // Models
  models: {
    DTAMStaff,
  },

  // Middleware
  middleware: {
    dtamAuth: dtamAuthMiddleware.verifyDTAMToken,
    requireDTAMRole: dtamAuthMiddleware.requireDTAMRole,
    requireDTAMAdmin: dtamAuthMiddleware.requireDTAMAdmin,
    requireDTAMManagerOrAdmin: dtamAuthMiddleware.requireDTAMManagerOrAdmin,
  },

  // Services
  services: {
    logger,
  },

  // Convenience method to mount routes
  mountRoutes: (app, basePath = '/api/auth-dtam') => {
    app.use(basePath, dtamAuthRoutes);
    logger.info(`Auth DTAM routes mounted at ${basePath}`);
  },
};
