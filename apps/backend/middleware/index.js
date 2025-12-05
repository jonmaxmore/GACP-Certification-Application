/**
 * Middleware Index
 *
 * Centralizes all middleware for consistent application and reusability.
 */
const errorMiddleware = require('./ErrorMiddleware');
const authMiddleware = require('./AuthMiddleware');
const adminAuth = require('./AdminAuthMiddleware');
const inspectorAuth = require('./InspectorAuthMiddleware');
const requestValidator = require('./RequestValidatorMiddleware');

module.exports = {
  errorMiddleware,
  auth: authMiddleware,
  adminAuth,
  inspectorAuth,
  requestValidator,
};
