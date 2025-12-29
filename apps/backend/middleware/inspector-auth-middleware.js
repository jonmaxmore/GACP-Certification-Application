const logger = require('../shared').logger;
const authLogger = logger.createLogger('inspector-auth');

/**
 * Middleware to check if the authenticated user is an inspector
 * Must be used after the regular auth middleware
 */
module.exports = function (req, res, next) {
  try {
    // User should already be available from auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has inspector role
    if (!req.user.roles || !req.user.roles.includes('inspector')) {
      return res.status(403).json({ message: 'Access denied. Inspector role required.' });
    }

    // User is an inspector, proceed
    next();
  } catch (err) {
    authLogger.error('Inspector auth error:', err);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};
