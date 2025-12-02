const { createLogger } = require('../shared/logger');
const logger = createLogger('audit');
const { AuditLog } = require('../modules/audit/domain/entities/AuditLog');

/**
 * Audit Middleware for GACP Platform
 * Automatically logs all user actions for PDPA/ISO27001 compliance
 */

class AuditMiddleware {
  /**
   * Create audit log entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async logActivity(req, res, next) {
    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Capture response data
    let responseData = null;
    let responseStatus = null;

    // Override response methods to capture data
    res.send = function (data) {
      responseData = data;
      responseStatus = res.statusCode;
      return originalSend.call(this, data);
    };

    res.json = function (data) {
      responseData = data;
      responseStatus = res.statusCode;
      return originalJson.call(this, data);
    };

    // Continue processing
    next();

    // Log after response is sent
    res.on('finish', async () => {
      try {
        await AuditMiddleware.createAuditLog(req, res, responseData, responseStatus);
      } catch (error) {
        logger.error('Audit logging error:', error);
      }
    });
  }

  /**
   * Create comprehensive audit log
   */
  static async createAuditLog(req, res, responseData, responseStatus) {
    try {
      // Extract user information
      const user = req.user || {};
      const userId = user._id || user.id || 'anonymous';
      const userRole = user.role || 'guest';
      const userEmail = user.email || 'unknown';

      // Determine action type
      const actionType = AuditMiddleware.determineActionType(req);

      // Check if PII is involved
      const piiInvolved = AuditMiddleware.checkPIIInvolvement(req, responseData);

      // Determine risk level
      const riskLevel = AuditMiddleware.assessRiskLevel(actionType, userRole, req);

      // Create audit log entry
      const auditLogData = {
        actor: {
          userId: userId !== 'anonymous' ? userId : null,
          role: userRole,
          email: userEmail,
          ipAddress: AuditMiddleware.getClientIP(req),
          userAgent: req.get('User-Agent') || '',
          sessionId: req.sessionID || req.get('X-Session-ID') || '',
        },

        action: {
          type: actionType,
          description: AuditMiddleware.generateActionDescription(actionType, req),
          category: AuditMiddleware.categorizeAction(actionType),
        },

        target: {
          resourceType: AuditMiddleware.determineResourceType(req),
          resourceId: req.params.id || req.body?.id || null,
          resourceName: AuditMiddleware.extractResourceName(req),
          collection: AuditMiddleware.determineCollection(req),
        },

        request: {
          method: req.method,
          endpoint: req.originalUrl || req.url,
          headers: AuditMiddleware.sanitizeHeaders(req.headers),
          query: req.query,
          body: AuditMiddleware.sanitizeRequestBody(req.body),
          responseStatus: responseStatus,
          responseTime: res.get('X-Response-Time') || null,
        },

        changes: AuditMiddleware.extractChanges(req, responseData),

        pdpa: {
          isPiiInvolved: piiInvolved.involved,
          dataType: piiInvolved.dataType,
          legalBasis: AuditMiddleware.determineLegalBasis(actionType, userRole),
          retentionPeriod: AuditMiddleware.getRetentionPeriod(actionType, piiInvolved.dataType),
        },

        security: {
          riskLevel: riskLevel,
          anomalies: AuditMiddleware.detectAnomalies(req, user),
          tlsVersion: req.connection?.tlsVersion || null,
          encryptionUsed: req.secure || false,
          mfaVerified: user.mfaVerified || false,
        },

        location: AuditMiddleware.extractLocation(req),
        device: AuditMiddleware.extractDeviceInfo(req),

        correlation: {
          sessionId: req.sessionID || req.get('X-Session-ID') || '',
          requestId: req.get('X-Request-ID') || '',
          traceId: req.get('X-Trace-ID') || '',
        },

        compliance: {
          complianceFrameworks: ['pdpa', 'iso27001'],
          retentionPolicy: AuditMiddleware.getRetentionPolicy(actionType, piiInvolved.dataType),
        },

        metadata: {
          systemVersion: process.env.APP_VERSION || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          serverInstance: process.env.SERVER_INSTANCE || 'default',
        },
      };

      // Create audit log
      await AuditLog.createLog(auditLogData);
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      // Don't throw error to avoid breaking the main request
    }
  }

  /**
   * Determine action type based on request
   */
  static determineActionType(req) {
    const method = req.method;
    const path = req.path.toLowerCase();

    // Authentication actions
    if (path.includes('/login')) {
      return 'login';
    }
    if (path.includes('/logout')) {
      return 'logout';
    }
    if (path.includes('/register')) {
      return 'user_created';
    }
    if (path.includes('/password')) {
      return 'password_change';
    }

    // Application actions
    if (path.includes('/application')) {
      if (method === 'POST') {
        return 'application_created';
      }
      if (method === 'PUT' || method === 'PATCH') {
        return 'application_modified';
      }
      if (method === 'DELETE') {
        return 'application_deleted';
      }
      if (method === 'GET') {
        return 'application_viewed';
      }
    }

    // Document actions
    if (path.includes('/document') || path.includes('/upload')) {
      if (method === 'POST') {
        return 'document_uploaded';
      }
      if (method === 'GET') {
        return 'document_viewed';
      }
      if (method === 'DELETE') {
        return 'document_deleted';
      }
    }

    // User management
    if (path.includes('/user')) {
      if (method === 'POST') {
        return 'user_created';
      }
      if (method === 'PUT' || method === 'PATCH') {
        return 'user_modified';
      }
      if (method === 'DELETE') {
        return 'user_deleted';
      }
      if (method === 'GET') {
        return 'pii_viewed';
      }
    }

    // CMS actions
    if (path.includes('/cms')) {
      if (method === 'POST') {
        return 'content_created';
      }
      if (method === 'PUT' || method === 'PATCH') {
        return 'content_modified';
      }
      if (method === 'DELETE') {
        return 'content_deleted';
      }
    }

    // Payment actions
    if (path.includes('/payment')) {
      if (method === 'POST') {
        return 'payment_initiated';
      }
      if (method === 'GET') {
        return 'payment_viewed';
      }
    }

    // Default based on HTTP method
    switch (method) {
      case 'GET':
        return 'data_accessed';
      case 'POST':
        return 'data_created';
      case 'PUT':
      case 'PATCH':
        return 'data_modified';
      case 'DELETE':
        return 'data_deleted';
      default:
        return 'unknown_action';
    }
  }

  /**
   * Generate human-readable action description
   */
  static generateActionDescription(actionType, req) {
    const user = req.user?.email || 'Anonymous user';
    const resource = req.path;

    const descriptions = {
      login: `${user} logged in`,
      logout: `${user} logged out`,
      user_created: 'New user registered',
      application_created: `${user} created new application`,
      application_viewed: `${user} viewed application`,
      application_modified: `${user} modified application`,
      document_uploaded: `${user} uploaded document`,
      pii_viewed: `${user} accessed personal information`,
      payment_initiated: `${user} initiated payment`,
    };

    return descriptions[actionType] || `${user} performed ${actionType} on ${resource}`;
  }

  /**
   * Categorize action for reporting
   */
  static categorizeAction(actionType) {
    const categories = {
      login: 'authentication',
      logout: 'authentication',
      password_change: 'authentication',
      user_created: 'admin',
      user_modified: 'admin',
      user_deleted: 'admin',
      application_created: 'application',
      application_viewed: 'application',
      application_modified: 'application',
      document_uploaded: 'document',
      document_viewed: 'document',
      pii_viewed: 'data_access',
      pii_exported: 'data_access',
      payment_initiated: 'payment',
    };

    return categories[actionType] || 'system';
  }

  /**
   * Check if request involves PII
   */
  static checkPIIInvolvement(req, responseData) {
    const piiFields = [
      'email',
      'phone',
      'phoneNumber',
      'nationalId',
      'taxId',
      'bankAccount',
      'address',
      'firstName',
      'lastName',
      'name',
    ];

    // Check request body
    const requestPII = AuditMiddleware.containsPII(req.body, piiFields);

    // Check response data
    const responsePII = AuditMiddleware.containsPII(responseData, piiFields);

    const involved = requestPII.found || responsePII.found;
    const dataType = AuditMiddleware.determineDataType(req, responseData);

    return { involved, dataType };
  }

  /**
   * Check if object contains PII
   */
  static containsPII(obj, piiFields) {
    if (!obj || typeof obj !== 'object') {
      return { found: false, fields: [] };
    }

    const foundFields = [];
    const checkObject = (object, path = '') => {
      for (const key in object) {
        const currentPath = path ? `${path}.${key}` : key;

        if (piiFields.includes(key.toLowerCase())) {
          foundFields.push(currentPath);
        }

        if (typeof object[key] === 'object' && object[key] !== null) {
          checkObject(object[key], currentPath);
        }
      }
    };

    checkObject(obj);

    return { found: foundFields.length > 0, fields: foundFields };
  }

  /**
   * Determine data type for PDPA compliance
   */
  static determineDataType(req, responseData) {
    const sensitiveFields = ['nationalId', 'taxId', 'bankAccount', 'medicalInfo'];
    const financialFields = ['payment', 'bankAccount', 'creditCard', 'transaction'];

    const hasSensitive =
      AuditMiddleware.containsPII(req.body, sensitiveFields).found ||
      AuditMiddleware.containsPII(responseData, sensitiveFields).found;

    const hasFinancial =
      AuditMiddleware.containsPII(req.body, financialFields).found ||
      AuditMiddleware.containsPII(responseData, financialFields).found;

    if (hasSensitive) {
      return 'sensitive';
    }
    if (hasFinancial) {
      return 'financial';
    }

    const personalFields = ['email', 'phone', 'firstName', 'lastName', 'address'];
    const hasPersonal =
      AuditMiddleware.containsPII(req.body, personalFields).found ||
      AuditMiddleware.containsPII(responseData, personalFields).found;

    if (hasPersonal) {
      return 'personal';
    }

    return 'public';
  }

  /**
   * Assess risk level of the action
   */
  static assessRiskLevel(actionType, userRole, req) {
    // High-risk actions
    const highRiskActions = [
      'user_deleted',
      'pii_exported',
      'system_admin',
      'data_deleted',
      'certificate_revoked',
      'payment_refunded',
    ];

    // Medium-risk actions
    const mediumRiskActions = [
      'user_modified',
      'pii_viewed',
      'application_approved',
      'certificate_issued',
      'payment_initiated',
    ];

    // Check for suspicious patterns
    const suspiciousPatterns = [
      req.get('User-Agent')?.includes('bot'),
      req.path.includes('admin') && userRole !== 'admin',
      req.method === 'DELETE' && userRole === 'guest',
    ];

    if (highRiskActions.includes(actionType) || suspiciousPatterns.some(Boolean)) {
      return 'high';
    }

    if (mediumRiskActions.includes(actionType)) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Detect anomalies in user behavior
   */
  static detectAnomalies(req, user) {
    const anomalies = [];

    // Check for unusual time patterns
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 22) {
      anomalies.push({
        type: 'unusual_time',
        severity: 'medium',
        details: `Access at unusual hour: ${currentHour}:00`,
        flaggedAt: new Date(),
      });
    }

    // Check for privilege escalation attempts
    if (req.path.includes('admin') && user.role !== 'admin') {
      anomalies.push({
        type: 'privilege_escalation',
        severity: 'high',
        details: 'Non-admin user accessing admin endpoint',
        flaggedAt: new Date(),
      });
    }

    // Check for suspicious user agents
    const userAgent = req.get('User-Agent') || '';
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
      anomalies.push({
        type: 'suspicious_pattern',
        severity: 'medium',
        details: `Suspicious user agent: ${userAgent}`,
        flaggedAt: new Date(),
      });
    }

    return anomalies;
  }

  /**
   * Get client IP address
   */
  static getClientIP(req) {
    return (
      req.get('X-Forwarded-For') ||
      req.get('X-Real-IP') ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }

  /**
   * Sanitize request headers (remove sensitive data)
   */
  static sanitizeHeaders(headers) {
    const sanitized = { ...headers };

    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    delete sanitized['x-auth-token'];

    return sanitized;
  }

  /**
   * Sanitize request body (remove sensitive data)
   */
  static sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'confirmPassword',
      'token',
      'secret',
      'creditCard',
      'cvv',
      'pin',
      'ssn',
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Extract location information
   */
  static extractLocation(req) {
    // This would typically integrate with IP geolocation service
    return {
      country: req.get('CF-IPCountry') || 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: req.get('X-Timezone') || 'Unknown',
    };
  }

  /**
   * Extract device information
   */
  static extractDeviceInfo(req) {
    const userAgent = req.get('User-Agent') || '';

    let deviceType = 'desktop';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/Tablet|iPad/.test(userAgent)) {
      deviceType = 'tablet';
    }

    return {
      type: deviceType,
      os: AuditMiddleware.extractOS(userAgent),
      browser: AuditMiddleware.extractBrowser(userAgent),
      deviceId: req.get('X-Device-ID') || null,
    };
  }

  /**
   * Extract OS from user agent
   */
  static extractOS(userAgent) {
    if (/Windows/.test(userAgent)) {
      return 'Windows';
    }
    if (/Mac OS/.test(userAgent)) {
      return 'macOS';
    }
    if (/Linux/.test(userAgent)) {
      return 'Linux';
    }
    if (/Android/.test(userAgent)) {
      return 'Android';
    }
    if (/iOS|iPhone|iPad/.test(userAgent)) {
      return 'iOS';
    }
    return 'Unknown';
  }

  /**
   * Extract browser from user agent
   */
  static extractBrowser(userAgent) {
    if (/Chrome/.test(userAgent)) {
      return 'Chrome';
    }
    if (/Firefox/.test(userAgent)) {
      return 'Firefox';
    }
    if (/Safari/.test(userAgent)) {
      return 'Safari';
    }
    if (/Edge/.test(userAgent)) {
      return 'Edge';
    }
    return 'Unknown';
  }

  /**
   * Determine resource type
   */
  static determineResourceType(req) {
    const path = req.path.toLowerCase();

    if (path.includes('/user')) {
      return 'user';
    }
    if (path.includes('/application')) {
      return 'application';
    }
    if (path.includes('/document')) {
      return 'document';
    }
    if (path.includes('/cms')) {
      return 'cms_content';
    }
    if (path.includes('/track')) {
      return 'track_trace';
    }
    if (path.includes('/payment')) {
      return 'payment';
    }
    if (path.includes('/certificate')) {
      return 'certificate';
    }

    return 'system';
  }

  /**
   * Determine collection name
   */
  static determineCollection(req) {
    const resourceType = AuditMiddleware.determineResourceType(req);

    const collectionMap = {
      user: 'users',
      application: 'applications',
      document: 'documents',
      cms_content: 'cmscontents',
      track_trace: 'tracktraces',
      payment: 'payments',
      certificate: 'certificates',
    };

    return collectionMap[resourceType] || null;
  }

  /**
   * Extract resource name
   */
  static extractResourceName(req) {
    return (
      req.body?.name || req.body?.title || req.body?.applicationNumber || req.params?.id || null
    );
  }

  /**
   * Extract changes for modification actions
   */
  static extractChanges(req, _responseData) {
    if (req.method === 'PUT' || req.method === 'PATCH') {
      return {
        modifiedFields: Object.keys(req.body || {}),
        changeReason: req.body?.changeReason || 'User modification',
      };
    }

    return {};
  }

  /**
   * Determine legal basis for PDPA compliance
   */
  static determineLegalBasis(actionType, _userRole) {
    // Map actions to legal basis
    const legalBasisMap = {
      login: 'contract',
      user_created: 'consent',
      application_created: 'contract',
      pii_viewed: 'legitimate_interests',
      audit_conducted: 'legal_obligation',
    };

    return legalBasisMap[actionType] || 'legitimate_interests';
  }

  /**
   * Get retention period in days
   */
  static getRetentionPeriod(actionType, dataType) {
    // PDPA retention periods
    const retentionMap = {
      sensitive: 2555, // 7 years
      financial: 2555, // 7 years
      personal: 1095, // 3 years
      public: 365, // 1 year
    };

    return retentionMap[dataType] || 365;
  }

  /**
   * Get retention policy
   */
  static getRetentionPolicy(actionType, dataType) {
    const policyMap = {
      sensitive: '7_years',
      financial: '7_years',
      personal: '3_years',
      public: '1_year',
    };

    return policyMap[dataType] || '1_year';
  }
}

module.exports = AuditMiddleware;
