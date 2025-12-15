/**
 * Middleware Index
 *
 * Centralizes all middleware for consistent application and reusability.
 */
const ErrorMiddleware = require('./error-middleware');
const AuthMiddleware = require('./auth-middleware');
const adminAuth = require('./Adminauth-middleware');
const inspectorAuth = require('./Inspectorauth-middleware');
const RequestValidator = require('./request-validator-middleware');

module.exports = {
  error-middleware,
  auth: auth-middleware,
  adminAuth,
  inspectorAuth,
  request-validator-middleware,
};
