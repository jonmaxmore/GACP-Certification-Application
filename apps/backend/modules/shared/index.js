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
const errorHandler = require('./middleware/ErrorHandlerMiddleware');
const authMiddleware = require('./middleware/auth-middleware');
const securityMiddleware = require('./middleware/SecurityMiddleware');

// Utils
const responseUtils = require('./utils/ResponseUtils');
const validationUtils = require('./utils/ValidationUtils');
const cryptoUtils = require('./utils/CryptoUtils');
const dateUtils = require('./utils/DateUtils');

// Constants
const statusCodes = require('./constants/StatusCodes');
const userRoles = require('./constants/UserRoles');
const errorMessages = require('./constants/ErrorMessages');

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

