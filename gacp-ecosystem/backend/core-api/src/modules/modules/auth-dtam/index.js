/**
 * Auth DTAM Module
 * Handles DTAM staff authentication and management
 * Separate from farmer authentication for security
 *
 * Entry point for the DTAM authentication module
 */

// Import routes
const dtamAuthRoutes = require('./routes/Dtamauth-middleware');

// Import models
const DTAMStaff = require('./models/d-t-a-m-staff');

// Import middleware
const dtamauth-middleware = require('./middleware/Dtamauth-middleware');

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
    dtamAuth: dtamauth-middleware.verifyDTAMToken,
    requireDTAMRole: dtamauth-middleware.requireDTAMRole,
    requireDTAMAdmin: dtamauth-middleware.requireDTAMAdmin,
    requireDTAMManagerOrAdmin: dtamauth-middleware.requireDTAMManagerOrAdmin,
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
