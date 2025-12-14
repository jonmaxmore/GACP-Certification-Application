/**
 * Updated Auth Middleware - Uses Shared Auth Module
 *
 * This file now imports from the shared auth module for consistency.
 * Original file backed up with .backup extension.
 */

// Import shared auth module
const auth = require('../../../shared/auth');

// Re-export all auth functions for backward compatibility
module.exports = {
  authenticateToken: auth.authenticateToken,
  generateToken: auth.generateToken,
  refreshAccessToken: auth.refreshAccessToken,
  requireRole: auth.requireRole,
  requirePermission: auth.requirePermission,
  hashPassword: auth.hashPassword,
  comparePassword: auth.comparePassword,
  extractUserIdFromToken: auth.extractUserIdFromToken,
  JWT_CONFIG: auth.JWT_CONFIG,
};

// Export individual functions for convenience
module.exports.authenticateToken = auth.authenticateToken;
module.exports.generateToken = auth.generateToken;
module.exports.requireRole = auth.requireRole;
module.exports.requirePermission = auth.requirePermission;
