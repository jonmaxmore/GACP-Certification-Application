/**
 * Middleware Index
 *
 * Centralizes all middleware for consistent application and reusability.
 */
const errorMiddleware = require('./error-middleware');
const authMiddleware = require('./auth-middleware');
const adminAuth = require('./admin-auth-middleware');
const inspectorAuth = require('./inspector-auth-middleware');
const requestValidator = require('./request-validator-middleware');

module.exports = {
  errorMiddleware,
  auth: authMiddleware,
  adminAuth,
  inspectorAuth,
  requestValidator,
};
