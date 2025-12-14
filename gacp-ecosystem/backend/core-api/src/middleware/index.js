/**
 * Middleware Index
 *
 * Centralizes all middleware for consistent application and reusability.
 */
const errorMiddleware = require('./error-middleware');
const auth-middleware = require('./auth-middleware');
const adminAuth = require('./Adminauth-middleware');
const inspectorAuth = require('./Inspectorauth-middleware');
const requestValidator = require('./request-validator-middleware');

module.exports = {
  errorMiddleware,
  auth: auth-middleware,
  adminAuth,
  inspectorAuth,
  requestValidator,
};
