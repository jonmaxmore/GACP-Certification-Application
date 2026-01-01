/**
 * Auth DTAM Module
 * DTAM staff authentication using Prisma (PostgreSQL)
 */

// Import routes (Prisma-based)
const dtamAuthRoutes = require('./routes/dtam-auth');
const logger = require('../../shared/logger');

/**
 * Module exports
 */
module.exports = {
  // Routes
  routes: dtamAuthRoutes,

  // Convenience method to mount routes
  mountRoutes: (app, basePath = '/api/auth-dtam') => {
    app.use(basePath, dtamAuthRoutes);
    logger.info(`Auth DTAM routes mounted at ${basePath}`);
  },
};
