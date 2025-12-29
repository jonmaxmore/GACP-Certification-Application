const logger = require('../shared').logger;
const authLogger = logger.createLogger('admin-auth');

/**
 * Middleware to check if the authenticated user is an admin
 * Must be used after the regular auth middleware
 */
module.exports = function (req, res, next) {
  try {
    // User should already be available from auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has admin role
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // User is an admin, proceed
    next();
  } catch (err) {
    authLogger.error('Admin auth error:', err);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};
