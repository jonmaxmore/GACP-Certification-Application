/**
 * Shared Module
 *
 * Purpose: ทรัพยากรและ utilities ที่ใช้ร่วมกันทุก module
 *
 * Exports:
 * - config: Configuration files
 * - middleware: Express middleware
 * - utils: Utility functions
 * - constants: Application constants
 * - database: Database connection
 */

// Config
const environment = require('./config/environment');
// Database - disabled after MongoDB removal
let database = null;
try {
  database = require('../../config/MongodbManager');
} catch (e) {
  // MongoDB manager no longer exists - use Prisma instead
}
// Middleware
const errorHandler = require('./middleware/error-handler-middleware');
const authMiddleware = require('./middleware/auth-middleware');
const securityMiddleware = require('./middleware/security-middleware');

// Utils
const responseUtils = require('./utils/response-utils');
const validationUtils = require('./utils/validation-utils');
const cryptoUtils = require('./utils/crypto-utils');
const dateUtils = require('./utils/date-utils');

// Constants
const statusCodes = require('./constants/status-codes');
const userRoles = require('./constants/user-roles');
const errorMessages = require('./constants/error-messages');

// Database
const dbConnection = require('./database/connection');
let mongoosePlugins = null;
try {
  mongoosePlugins = require('./database/MongoosePlugins');
} catch (e) {
  // Mongoose plugins removed after MongoDB cleanup
}
module.exports = {
  name: 'shared',
  version: '1.0.0',
  description: 'Shared resources and utilities for all modules',

  // Config exports
  config: {
    environment,
    database,
  },

  // Middleware exports
  middleware: {
    errorHandler,
    auth: authMiddleware,
    security: securityMiddleware,
  },

  // Utils exports
  utils: {
    response: responseUtils,
    validation: validationUtils,
    crypto: cryptoUtils,
    date: dateUtils,
  },

  // Backward compatibility aliases (for auth routes that use shared.response directly)
  response: responseUtils,

  // Constants exports
  constants: {
    statusCodes,
    userRoles,
    errorMessages,
  },

  // Database exports
  database: {
    connection: dbConnection,
    plugins: mongoosePlugins,
  },

  // Health check
  healthCheck: () => {
    return {
      status: 'healthy',
      module: 'shared',
      database: dbConnection.getStatus(),
    };
  },
};

