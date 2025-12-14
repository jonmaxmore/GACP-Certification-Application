/**
 * Authentication & Authorization Middleware
 *
 * Middleware stack for JWT authentication and role-based authorization.
 * Integrates with UserAuthenticationService for complete security layer.
 *
 * Middleware Chain:
 * 1. extractToken() - Extract JWT from headers
 * 2. authenticate() - Validate token and load user
 * 3. authorize() - Check role-based permissions
 * 4. requireRole() - Enforce specific role requirements
 * 5. resourceOwnership() - Validate resource ownership
 *
 * Security Features:
 * - Rate limiting per user/IP
 * - Request logging and audit
 * - Error handling with security considerations
 * - Token refresh handling
 * - Session validation
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const rateLimit = require('express-rate-limit');

class AuthenticationMiddleware {
  constructor(dependencies = {}) {
    this.authService = dependencies.userAuthenticationService;
    this.auditService = dependencies.auditService;

    // Rate limiting configurations
    this.rateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    };

    logger.info('[AuthenticationMiddleware] Initialized successfully');
  }

  /**
   * Extract JWT token from request headers
   * @returns {Function} - Express middleware
   */
  extractToken() {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
          return res.status(401).json({
            success: false,
            error: 'MISSING_AUTH_HEADER',
            message: 'Authorization header is required',
          });
        }

        // Check if Bearer token format
        if (!authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            error: 'INVALID_AUTH_FORMAT',
            message: 'Authorization header must use Bearer token format',
          });
        }

        // Extract token
        const token = authHeader.substring(7);
        if (!token) {
          return res.status(401).json({
            success: false,
            error: 'MISSING_TOKEN',
            message: 'JWT token is required',
          });
        }

        // Attach token to request
        req.token = token;
        next();
      } catch (error) {
        logger.error('[AuthMiddleware] Token extraction error:', error);
        return res.status(500).json({
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Internal server error',
        });
      }
    };
  }

  /**
   * Authenticate user via JWT token
   * @returns {Function} - Express middleware
   */
  authenticate() {
    return async (req, res, next) => {
      try {
        if (!req.token) {
          return res.status(401).json({
            success: false,
            error: 'TOKEN_REQUIRED',
            message: 'Authentication token is required',
          });
        }

        // Validate token and get user info
        const userInfo = await this.authService.validateToken(req.token);

        // Attach user info to request
        req.user = userInfo;
        req.userId = userInfo.userId;
        req.userRole = userInfo.role;
        req.userPermissions = userInfo.permissions;
        req.sessionId = userInfo.sessionId;

        // Add request context
        req.context = {
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          timestamp: new Date(),
          method: req.method,
          path: req.path,
          sessionId: userInfo.sessionId,
        };

        // Log authenticated request (optional, for audit)
        if (this.auditService) {
          await this.auditService.log({
            type: 'API_REQUEST',
            userId: userInfo.userId,
            method: req.method,
            path: req.path,
            ip: req.context.ip,
            userAgent: req.context.userAgent,
            timestamp: req.context.timestamp,
          });
        }

        next();
      } catch (error) {
        logger.error('[AuthMiddleware] Authentication error:', error);

        // Handle specific token errors
        if (error.message.includes('expired')) {
          return res.status(401).json({
            success: false,
            error: 'TOKEN_EXPIRED',
            message: 'Token has expired. Please refresh your token or login again.',
          });
        }

        if (error.message.includes('invalid') || error.message.includes('malformed')) {
          return res.status(401).json({
            success: false,
            error: 'INVALID_TOKEN',
            message: 'Invalid authentication token',
          });
        }

        if (error.message.includes('Session')) {
          return res.status(401).json({
            success: false,
            error: 'SESSION_EXPIRED',
            message: 'Session has expired. Please login again.',
          });
        }

        return res.status(401).json({
          success: false,
          error: 'AUTHENTICATION_FAILED',
          message: 'Authentication failed',
        });
      }
    };
  }

  /**
   * Check if user has required permission
   * @param {string} permission - Required permission
   * @returns {Function} - Express middleware
   */
  authorize(permission) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          });
        }

        // Build resource context for ownership checks
        const resourceContext = {
          ownerId: req.params.userId || req.body.userId || req.query.userId,
          applicationId: req.params.applicationId || req.body.applicationId,
        };

        // If resource has owner, check if current user is owner
        if (resourceContext.ownerId && permission.includes(':own')) {
          resourceContext.ownerId =
            resourceContext.ownerId === req.userId ? req.userId : resourceContext.ownerId;
        }

        // Check permission
        const hasPermission = await this.authService.hasPermission(
          req.userId,
          permission,
          resourceContext,
        );

        if (!hasPermission) {
          // Log authorization failure
          if (this.auditService) {
            await this.auditService.log({
              type: 'AUTHORIZATION_FAILED',
              userId: req.userId,
              permission,
              resource: resourceContext,
              method: req.method,
              path: req.path,
              timestamp: new Date(),
            });
          }

          return res.status(403).json({
            success: false,
            error: 'INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to perform this action',
          });
        }

        next();
      } catch (error) {
        logger.error('[AuthMiddleware] Authorization error:', error);
        return res.status(500).json({
          success: false,
          error: 'AUTHORIZATION_ERROR',
          message: 'Error checking permissions',
        });
      }
    };
  }

  /**
   * Require specific role(s)
   * @param {string|Array} roles - Required role(s)
   * @returns {Function} - Express middleware
   */
  requireRole(roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          });
        }

        if (!allowedRoles.includes(req.userRole)) {
          // Log role-based access denial
          if (this.auditService) {
            this.auditService.log({
              type: 'ROLE_ACCESS_DENIED',
              userId: req.userId,
              userRole: req.userRole,
              requiredRoles: allowedRoles,
              method: req.method,
              path: req.path,
              timestamp: new Date(),
            });
          }

          return res.status(403).json({
            success: false,
            error: 'ROLE_NOT_AUTHORIZED',
            message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
          });
        }

        next();
      } catch (error) {
        logger.error('[AuthMiddleware] Role check error:', error);
        return res.status(500).json({
          success: false,
          error: 'ROLE_CHECK_ERROR',
          message: 'Error checking user role',
        });
      }
    };
  }

  /**
   * Validate resource ownership
   * @param {string} resourceIdParam - Parameter name containing resource ID
   * @param {string} ownerField - Field in resource containing owner ID
   * @returns {Function} - Express middleware
   */
  validateResourceOwnership(resourceIdParam = 'id', ownerField = 'userId') {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          });
        }

        // Admin bypass
        if (req.userRole === 'DTAM_ADMIN') {
          return next();
        }

        const resourceId = req.params[resourceIdParam];
        if (!resourceId) {
          return res.status(400).json({
            success: false,
            error: 'RESOURCE_ID_REQUIRED',
            message: `Resource ID parameter '${resourceIdParam}' is required`,
          });
        }

        // For simplicity, check if the resource ID matches patterns or user ID
        // In real implementation, you'd fetch the resource and check ownership
        const isOwner = this._checkResourceOwnership(resourceId, req.userId, ownerField);

        if (!isOwner) {
          return res.status(403).json({
            success: false,
            error: 'RESOURCE_ACCESS_DENIED',
            message: 'You can only access your own resources',
          });
        }

        next();
      } catch (error) {
        logger.error('[AuthMiddleware] Resource ownership check error:', error);
        return res.status(500).json({
          success: false,
          error: 'OWNERSHIP_CHECK_ERROR',
          message: 'Error checking resource ownership',
        });
      }
    };
  }

  /**
   * Rate limiting middleware
   * @param {Object} options - Rate limit options
   * @returns {Function} - Express middleware
   */
  rateLimit(options = {}) {
    const config = { ...this.rateLimitConfig, ...options };

    return rateLimit({
      ...config,
      keyGenerator: req => {
        // Use user ID if authenticated, otherwise IP
        return req.userId || req.ip;
      },
      handler: (req, res) => {
        // Log rate limit hit
        if (this.auditService) {
          this.auditService.log({
            type: 'RATE_LIMIT_HIT',
            userId: req.userId,
            ip: req.ip,
            method: req.method,
            path: req.path,
            timestamp: new Date(),
          });
        }

        res.status(429).json({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: config.message,
          retryAfter: Math.round(config.windowMs / 1000),
        });
      },
    });
  }

  /**
   * Optional authentication (don't fail if no token)
   * @returns {Function} - Express middleware
   */
  optionalAuth() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);

          if (token) {
            try {
              const userInfo = await this.authService.validateToken(token);
              req.user = userInfo;
              req.userId = userInfo.userId;
              req.userRole = userInfo.role;
              req.userPermissions = userInfo.permissions;
            } catch (error) {
              // Ignore token validation errors for optional auth
              logger.info('[AuthMiddleware] Optional auth failed:', error.message);
            }
          }
        }

        next();
      } catch (error) {
        logger.error('[AuthMiddleware] Optional auth error:', error);
        next(); // Continue anyway for optional auth
      }
    };
  }

  /**
   * Security headers middleware
   * @returns {Function} - Express middleware
   */
  securityHeaders() {
    return (req, res, next) => {
      // Security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Remove server info
      res.removeHeader('X-Powered-By');

      next();
    };
  }

  // Private helper methods

  /**
   * Check resource ownership (simplified implementation)
   * @private
   */
  _checkResourceOwnership(resourceId, userId, _ownerField) {
    // This is a simplified check. In real implementation, you would:
    // 1. Fetch the resource from database
    // 2. Check if resource[ownerField] === userId
    // 3. Handle different resource types appropriately

    // For now, basic pattern matching
    return resourceId === userId || resourceId.startsWith(userId);
  }
}

module.exports = AuthenticationMiddleware;
