/**
 * Secure Cookies Middleware
 *
 * Enforces secure cookie settings for production environments.
 * Applies httpOnly, secure, and sameSite attributes to all cookies.
 *
 * @module middleware/secure-cookies
 * @author GACP Platform Team
 * @date 2025-10-26
 */

const logger = require('../shared/logger');

/**
 * Configure secure cookie defaults
 * @param {Object} options - Cookie security options
 * @returns {Function} Express middleware
 */
function secureCookies(options = {}) {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    ...options,
  };

  return (req, res, next) => {
    // Override res.cookie to apply secure defaults
    const originalCookie = res.cookie.bind(res);

    res.cookie = function (name, value, cookieOptions = {}) {
      // Merge with secure defaults
      const secureOptions = {
        ...defaultOptions,
        ...cookieOptions,
      };

      // Force secure in production
      if (process.env.NODE_ENV === 'production') {
        secureOptions.secure = true;
      }

      // Log cookie creation in development
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('[SecureCookies] Setting cookie:', {
          name,
          options: secureOptions,
        });
      }

      return originalCookie(name, value, secureOptions);
    };

    next();
  };
}

/**
 * Middleware to clear all cookies securely
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function clearAllCookies(req, res, next) {
  const cookies = req.cookies || {};

  Object.keys(cookies).forEach(cookieName => {
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  });

  next();
}

module.exports = {
  secureCookies,
  clearAllCookies,
};
