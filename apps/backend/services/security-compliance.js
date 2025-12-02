/**
 * GACP Platform Security & Encryption Policy
 *
 * Implements encryption standards for:
 * - Data at rest (database encryption)
 * - Data in transit (TLS/SSL)
 * - Sensitive field encryption (PII, PHI)
 * - Key management and rotation
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { createLogger } = require('../shared/logger');
const logger = createLogger('security-compliance');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
    this.saltRounds = 12; // bcrypt salt rounds

    // Master keys (should be stored in secure key management service)
    this.masterKey = process.env.MASTER_ENCRYPTION_KEY || this.generateKey();
    this.hmacKey = process.env.HMAC_KEY || this.generateKey();
  }

  /**
   * Encrypt sensitive data (PII/PHI)
   */
  encryptSensitiveData(plaintext, context = '') {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.masterKey, { iv });

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: this.algorithm,
        context,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  decryptSensitiveData(encryptedData) {
    try {
      const { encrypted, iv, tag, algorithm } = encryptedData;

      if (algorithm !== this.algorithm) {
        throw new Error('Unsupported encryption algorithm');
      }

      const decipher = crypto.createDecipher(algorithm, this.masterKey, {
        iv: Buffer.from(iv, 'hex'),
      });

      decipher.setAuthTag(Buffer.from(tag, 'hex'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Hash passwords securely
   */
  async hashPassword(password) {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify password hash
   */
  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate secure random key
   */
  generateKey() {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Generate HMAC for data integrity
   */
  generateHMAC(data) {
    return crypto.createHmac('sha256', this.hmacKey).update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Verify HMAC
   */
  verifyHMAC(data, hmac) {
    const computedHMAC = this.generateHMAC(data);
    return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(computedHMAC, 'hex'));
  }
}

/**
 * Role-Based Access Control (RBAC) Service
 *
 * Implements granular permissions for:
 * - User roles and permissions
 * - Resource-based access control
 * - Action-based permissions
 * - Context-aware access decisions
 */

class RBACService {
  constructor() {
    this.roles = new Map();
    this.permissions = new Map();
    this.resourceTypes = new Set();

    this.initializeDefaultRoles();
  }

  /**
   * Initialize default roles and permissions
   */
  initializeDefaultRoles() {
    // Define permissions
    const permissions = {
      // User management
      'user.create': 'Create new users',
      'user.read': 'View user information',
      'user.update': 'Update user information',
      'user.delete': 'Delete users',
      'user.list': 'List all users',

      // Application management
      'application.create': 'Submit new applications',
      'application.read': 'View applications',
      'application.update': 'Update applications',
      'application.delete': 'Delete applications',
      'application.review': 'Review applications',
      'application.approve': 'Approve applications',
      'application.reject': 'Reject applications',

      // Certificate management
      'certificate.issue': 'Issue certificates',
      'certificate.read': 'View certificates',
      'certificate.revoke': 'Revoke certificates',
      'certificate.renew': 'Renew certificates',

      // Inspection management
      'inspection.schedule': 'Schedule inspections',
      'inspection.conduct': 'Conduct inspections',
      'inspection.review': 'Review inspection results',
      'inspection.approve': 'Approve inspection reports',

      // Payment management
      'payment.process': 'Process payments',
      'payment.refund': 'Process refunds',
      'payment.view': 'View payment information',

      // System administration
      'system.admin': 'System administration',
      'system.config': 'System configuration',
      'audit.read': 'View audit logs',
      'audit.export': 'Export audit data',

      // Reporting
      'report.generate': 'Generate reports',
      'report.export': 'Export reports',
      'dashboard.view': 'View dashboard',
    };

    permissions.forEach((description, permission) => {
      this.permissions.set(permission, { permission, description });
    });

    // Define roles with permissions
    const roles = {
      super_admin: {
        name: 'Super Administrator',
        description: 'Full system access',
        permissions: Array.from(this.permissions.keys()),
        inheritFrom: [],
      },

      admin: {
        name: 'Administrator',
        description: 'Administrative access',
        permissions: [
          'user.create',
          'user.read',
          'user.update',
          'user.list',
          'application.read',
          'application.review',
          'application.approve',
          'application.reject',
          'certificate.issue',
          'certificate.read',
          'certificate.revoke',
          'certificate.renew',
          'inspection.schedule',
          'inspection.review',
          'inspection.approve',
          'payment.view',
          'audit.read',
          'report.generate',
          'dashboard.view',
        ],
        inheritFrom: [],
      },

      reviewer: {
        name: 'Application Reviewer',
        description: 'Review and process applications',
        permissions: [
          'application.read',
          'application.review',
          'application.approve',
          'application.reject',
          'certificate.read',
          'inspection.review',
          'dashboard.view',
          'report.generate',
        ],
        inheritFrom: [],
      },

      inspector: {
        name: 'Inspector',
        description: 'Conduct inspections and site visits',
        permissions: [
          'application.read',
          'inspection.schedule',
          'inspection.conduct',
          'certificate.read',
          'dashboard.view',
        ],
        inheritFrom: [],
      },

      farmer: {
        name: 'Farmer/Applicant',
        description: 'Submit applications and view own data',
        permissions: [
          'application.create',
          'application.read',
          'application.update',
          'certificate.read',
          'payment.process',
          'dashboard.view',
        ],
        inheritFrom: [],
        resourceRestrictions: {
          application: 'own', // Can only access own applications
          certificate: 'own', // Can only access own certificates
        },
      },

      auditor: {
        name: 'Auditor',
        description: 'View audit trails and generate compliance reports',
        permissions: ['audit.read', 'audit.export', 'report.generate', 'report.export'],
        inheritFrom: [],
      },
    };

    roles.forEach((role, roleName) => {
      this.roles.set(roleName, role);
    });

    // Define resource types
    this.resourceTypes = new Set([
      'user',
      'application',
      'certificate',
      'inspection',
      'payment',
      'audit',
      'report',
      'system',
    ]);
  }

  /**
   * Check if user has permission to perform action on resource
   */
  async hasPermission(user, action, resource = null, context = {}) {
    try {
      // Get user role
      const userRole = this.roles.get(user.role);
      if (!userRole) {
        return false;
      }

      // Check if role has the required permission
      if (!userRole.permissions.includes(action)) {
        return false;
      }

      // Check resource-specific restrictions
      if (resource && userRole.resourceRestrictions) {
        const restriction = userRole.resourceRestrictions[resource.type];

        if (restriction === 'own') {
          // User can only access their own resources
          if (resource.ownerId !== user.id) {
            return false;
          }
        }
      }

      // Context-aware checks
      if (context.requiresApprovalWorkflow && action.includes('approve')) {
        // Additional checks for approval workflows
        if (!this.canApproveInWorkflow(user, resource, context)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Permission check failed:', error);
      return false; // Fail closed
    }
  }

  /**
   * Get all permissions for a user role
   */
  getUserPermissions(userRole) {
    const role = this.roles.get(userRole);
    if (!role) {
      return [];
    }

    return role.permissions.map(permission => ({
      permission,
      description: this.permissions.get(permission)?.description || permission,
    }));
  }

  /**
   * Check workflow-specific approval permissions
   */
  canApproveInWorkflow(user, resource, context) {
    // Prevent self-approval
    if (resource.submitterId === user.id) {
      return false;
    }

    // Check if user has already reviewed this resource
    if (context.previousReviewers && context.previousReviewers.includes(user.id)) {
      return false;
    }

    return true;
  }

  /**
   * Express.js middleware for RBAC enforcement
   */
  rbacMiddleware(requiredPermission, resourceType = null) {
    return async (req, res, next) => {
      try {
        const user = req.user;
        if (!user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        let resource = null;
        if (resourceType && req.params.id) {
          // Load resource for permission check
          resource = {
            type: resourceType,
            id: req.params.id,
            ownerId: req.resource?.ownerId || req.resource?.userId,
          };
        }

        const hasPermission = await this.hasPermission(user, requiredPermission, resource, {
          method: req.method,
          path: req.path,
          body: req.body,
        });

        if (!hasPermission) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            required: requiredPermission,
            userRole: user.role,
          });
        }

        next();
      } catch (error) {
        logger.error('RBAC middleware error:', error);
        res.status(500).json({ error: 'Authorization check failed' });
      }
    };
  }
}

/**
 * Data Classification Service
 *
 * Implements data classification and handling requirements
 */
class DataClassificationService {
  constructor() {
    this.classifications = {
      PUBLIC: {
        level: 0,
        description: 'Information that can be shared publicly',
        encryptionRequired: false,
        auditLevel: 'BASIC',
      },
      INTERNAL: {
        level: 1,
        description: 'Internal business information',
        encryptionRequired: false,
        auditLevel: 'STANDARD',
      },
      CONFIDENTIAL: {
        level: 2,
        description: 'Sensitive business or personal information',
        encryptionRequired: true,
        auditLevel: 'DETAILED',
      },
      RESTRICTED: {
        level: 3,
        description: 'Highly sensitive information requiring special handling',
        encryptionRequired: true,
        auditLevel: 'COMPREHENSIVE',
      },
    };
  }

  /**
   * Classify data based on content and context
   */
  classifyData(data, context = {}) {
    // Detect PII/PHI patterns
    const piiPatterns = [
      /\b\d{13}\b/g, // Thai National ID
      /\b\d{4}-\d{4}-\d{4}-\d{4}\b/g, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{3}-\d{3}-\d{4}\b/g, // Phone number
    ];

    const dataString = JSON.stringify(data);
    const containsPII = piiPatterns.some(pattern => pattern.test(dataString));

    if (containsPII || context.containsHealthData) {
      return 'RESTRICTED';
    }

    if (context.businessCritical || context.financialData) {
      return 'CONFIDENTIAL';
    }

    if (context.internal) {
      return 'INTERNAL';
    }

    return 'PUBLIC';
  }

  /**
   * Get handling requirements for classification level
   */
  getHandlingRequirements(classification) {
    return this.classifications[classification] || this.classifications['INTERNAL'];
  }
}

module.exports = {
  EncryptionService,
  RBACService,
  DataClassificationService,
};
