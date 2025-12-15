/**
 * DTAM Staff Entity
 * Domain Layer - Clean Architecture
 *
 * Purpose: Core business entity for DTAM staff users
 * - Staff information management
 * - Role-based access control
 * - Account status management
 * - Authentication tracking
 * - Business rules enforcement
 */

class DTAMStaff {
  constructor({
    id = null,
    email,
    password, // Hashed password
    firstName,
    lastName,
    employeeId,
    department,
    position,
    role, // ADMIN, MANAGER, REVIEWER, AUDITOR
    permissions = [],
    phoneNumber = null,
    status = DTAMStaff.STATUS.ACTIVE,
    isEmailVerified = false,
    emailVerificationToken = null,
    emailVerifiedAt = null,
    passwordResetToken = null,
    passwordResetTokenExpiresAt = null,
    failedLoginAttempts = 0,
    lastFailedLoginAt = null,
    accountLockedUntil = null,
    lastLoginAt = null,
    lastLoginIp = null,
    lastLoginUserAgent = null,
    createdBy = null,
    updatedBy = null,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.employeeId = employeeId;
    this.department = department;
    this.position = position;
    this.role = role; // ADMIN, REVIEWER, INSPECTOR, APPROVER
    this.permissions = permissions;
    this.phoneNumber = phoneNumber;
    this.status = status;
    this.isEmailVerified = isEmailVerified;
    this.emailVerificationToken = emailVerificationToken;
    this.emailVerifiedAt = emailVerifiedAt;
    this.passwordResetToken = passwordResetToken;
    this.passwordResetTokenExpiresAt = passwordResetTokenExpiresAt;
    this.failedLoginAttempts = failedLoginAttempts;
    this.lastFailedLoginAt = lastFailedLoginAt;
    this.accountLockedUntil = accountLockedUntil;
    this.lastLoginAt = lastLoginAt;
    this.lastLoginIp = lastLoginIp;
    this.lastLoginUserAgent = lastLoginUserAgent;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Status constants
  static STATUS = {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    INACTIVE: 'INACTIVE',
  };

  // Role constants
  static ROLES = {
    ADMIN: 'ADMIN',
    REVIEWER: 'REVIEWER',
    INSPECTOR: 'INSPECTOR',
    APPROVER: 'APPROVER',
  };

  // Permission constants
  static PERMISSIONS = {
    // Application permissions
    VIEW_APPLICATIONS: 'view_applications',
    REVIEW_APPLICATIONS: 'review_applications',
    APPROVE_APPLICATIONS: 'approve_applications',
    REJECT_APPLICATIONS: 'reject_applications',

    // Inspection permissions
    VIEW_INSPECTIONS: 'view_inspections',
    SCHEDULE_INSPECTION: 'schedule_inspection',
    CONDUCT_INSPECTION: 'conduct_inspection',
    COMPLETE_INSPECTION: 'complete_inspection',
    UPLOAD_INSPECTION_EVIDENCE: 'upload_inspection_evidence',

    // Approval permissions
    VIEW_PENDING_APPROVALS: 'view_pending_approvals',
    FINAL_APPROVAL: 'final_approval',
    SEND_BACK_FOR_REVIEW: 'send_back_for_review',

    // Certificate permissions
    VIEW_CERTIFICATES: 'view_certificates',
    ISSUE_CERTIFICATES: 'issue_certificates',
    REVOKE_CERTIFICATES: 'revoke_certificates',

    // Audit permissions
    VIEW_AUDITS: 'view_audits',
    CREATE_AUDITS: 'create_audits',
    APPROVE_AUDITS: 'approve_audits',

    // Staff management permissions
    VIEW_STAFF: 'view_staff',
    CREATE_STAFF: 'create_staff',
    UPDATE_STAFF: 'update_staff',
    DELETE_STAFF: 'delete_staff',

    // System permissions
    VIEW_REPORTS: 'view_reports',
    EXPORT_DATA: 'export_data',
    MANAGE_SETTINGS: 'manage_settings',
  };

  // Default permissions by role
  static getDefaultPermissions(role) {
    const permissions = {
      ADMIN: [
        DTAMStaff.PERMISSIONS.VIEW_APPLICATIONS,
        DTAMStaff.PERMISSIONS.REVIEW_APPLICATIONS,
        DTAMStaff.PERMISSIONS.APPROVE_APPLICATIONS,
        DTAMStaff.PERMISSIONS.REJECT_APPLICATIONS,
        DTAMStaff.PERMISSIONS.VIEW_INSPECTIONS,
        DTAMStaff.PERMISSIONS.SCHEDULE_INSPECTION,
        DTAMStaff.PERMISSIONS.CONDUCT_INSPECTION,
        DTAMStaff.PERMISSIONS.COMPLETE_INSPECTION,
        DTAMStaff.PERMISSIONS.UPLOAD_INSPECTION_EVIDENCE,
        DTAMStaff.PERMISSIONS.VIEW_PENDING_APPROVALS,
        DTAMStaff.PERMISSIONS.FINAL_APPROVAL,
        DTAMStaff.PERMISSIONS.SEND_BACK_FOR_REVIEW,
        DTAMStaff.PERMISSIONS.VIEW_CERTIFICATES,
        DTAMStaff.PERMISSIONS.ISSUE_CERTIFICATES,
        DTAMStaff.PERMISSIONS.REVOKE_CERTIFICATES,
        DTAMStaff.PERMISSIONS.VIEW_AUDITS,
        DTAMStaff.PERMISSIONS.CREATE_AUDITS,
        DTAMStaff.PERMISSIONS.APPROVE_AUDITS,
        DTAMStaff.PERMISSIONS.VIEW_STAFF,
        DTAMStaff.PERMISSIONS.CREATE_STAFF,
        DTAMStaff.PERMISSIONS.UPDATE_STAFF,
        DTAMStaff.PERMISSIONS.DELETE_STAFF,
        DTAMStaff.PERMISSIONS.VIEW_REPORTS,
        DTAMStaff.PERMISSIONS.EXPORT_DATA,
        DTAMStaff.PERMISSIONS.MANAGE_SETTINGS,
      ],
      REVIEWER: [
        DTAMStaff.PERMISSIONS.VIEW_APPLICATIONS,
        DTAMStaff.PERMISSIONS.REVIEW_APPLICATIONS,
        DTAMStaff.PERMISSIONS.VIEW_CERTIFICATES,
        DTAMStaff.PERMISSIONS.VIEW_AUDITS,
        DTAMStaff.PERMISSIONS.VIEW_REPORTS,
      ],
      INSPECTOR: [
        DTAMStaff.PERMISSIONS.VIEW_APPLICATIONS,
        DTAMStaff.PERMISSIONS.VIEW_INSPECTIONS,
        DTAMStaff.PERMISSIONS.SCHEDULE_INSPECTION,
        DTAMStaff.PERMISSIONS.CONDUCT_INSPECTION,
        DTAMStaff.PERMISSIONS.COMPLETE_INSPECTION,
        DTAMStaff.PERMISSIONS.UPLOAD_INSPECTION_EVIDENCE,
        DTAMStaff.PERMISSIONS.VIEW_CERTIFICATES,
        DTAMStaff.PERMISSIONS.VIEW_REPORTS,
      ],
      APPROVER: [
        DTAMStaff.PERMISSIONS.VIEW_APPLICATIONS,
        DTAMStaff.PERMISSIONS.VIEW_PENDING_APPROVALS,
        DTAMStaff.PERMISSIONS.FINAL_APPROVAL,
        DTAMStaff.PERMISSIONS.SEND_BACK_FOR_REVIEW,
        DTAMStaff.PERMISSIONS.VIEW_CERTIFICATES,
        DTAMStaff.PERMISSIONS.ISSUE_CERTIFICATES,
        DTAMStaff.PERMISSIONS.VIEW_REPORTS,
        DTAMStaff.PERMISSIONS.EXPORT_DATA,
      ],
    };

    return permissions[role] || [];
  }

  /**
   * Get full name
   */
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Check if staff is active
   */
  isActive() {
    return this.status === DTAMStaff.STATUS.ACTIVE;
  }

  /**
   * Check if account is locked
   */
  isAccountLocked() {
    if (!this.accountLockedUntil) {
      return false;
    }
    return new Date() < this.accountLockedUntil;
  }

  /**
   * Verify email
   */
  verifyEmail() {
    this.isEmailVerified = true;
    this.emailVerifiedAt = new Date();
    this.emailVerificationToken = null;
    this.updatedAt = new Date();
  }

  /**
   * Record successful login
   */
  recordSuccessfulLogin(ipAddress, userAgent) {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ipAddress;
    this.lastLoginUserAgent = userAgent;
    this.failedLoginAttempts = 0;
    this.lastFailedLoginAt = null;
    this.accountLockedUntil = null;
    this.updatedAt = new Date();
  }

  /**
   * Record failed login attempt
   */
  recordFailedLogin() {
    this.failedLoginAttempts += 1;
    this.lastFailedLoginAt = new Date();
    this.updatedAt = new Date();

    // Lock account after 5 failed attempts
    if (this.failedLoginAttempts >= 5) {
      this.lock();
    }
  }

  /**
   * Lock account
   */
  lock() {
    // Lock for 30 minutes
    this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    this.updatedAt = new Date();
  }

  /**
   * Unlock account
   */
  unlock() {
    this.accountLockedUntil = null;
    this.failedLoginAttempts = 0;
    this.lastFailedLoginAt = null;
    this.updatedAt = new Date();
  }

  /**
   * Activate account
   */
  activate() {
    this.status = DTAMStaff.STATUS.ACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Suspend account
   */
  suspend() {
    this.status = DTAMStaff.STATUS.SUSPENDED;
    this.updatedAt = new Date();
  }

  /**
   * Deactivate account
   */
  deactivate() {
    this.status = DTAMStaff.STATUS.INACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Update profile
   */
  updateProfile(updates, updatedBy) {
    const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'department', 'position'];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        this[field] = updates[field];
      }
    });

    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  /**
   * Update role and permissions (admin only)
   */
  updateRoleAndPermissions(role, permissions, updatedBy) {
    this.role = role;
    this.permissions = permissions;
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  /**
   * Set password reset token
   */
  setPasswordResetToken(token, expiresInMinutes = 60) {
    this.passwordResetToken = token;
    this.passwordResetTokenExpiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    this.updatedAt = new Date();
  }

  /**
   * Clear password reset token
   */
  clearPasswordResetToken() {
    this.passwordResetToken = null;
    this.passwordResetTokenExpiresAt = null;
    this.updatedAt = new Date();
  }

  /**
   * Check if staff has permission
   */
  hasPermission(permission) {
    return this.permissions.includes(permission);
  }

  /**
   * Check if staff has role
   */
  hasRole(role) {
    return this.role === role;
  }

  /**
   * Check if staff is admin
   */
  isAdmin() {
    return this.role === DTAMStaff.ROLES.ADMIN;
  }

  /**
   * Validate entity
   */
  validate() {
    const errors = [];

    if (!this.email) {
      errors.push('Email is required');
    }

    if (!this.password) {
      errors.push('Password is required');
    }

    if (!this.firstName || this.firstName.trim().length === 0) {
      errors.push('First name is required');
    }

    if (!this.lastName || this.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }

    if (!this.employeeId || this.employeeId.trim().length === 0) {
      errors.push('Employee ID is required');
    }

    if (!this.role || !Object.values(DTAMStaff.ROLES).includes(this.role)) {
      errors.push('Valid role is required');
    }

    if (!this.status || !Object.values(DTAMStaff.STATUS).includes(this.status)) {
      errors.push('Valid status is required');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      employeeId: this.employeeId,
      department: this.department,
      position: this.position,
      role: this.role,
      permissions: this.permissions,
      phoneNumber: this.phoneNumber,
      status: this.status,
      isEmailVerified: this.isEmailVerified,
      emailVerifiedAt: this.emailVerifiedAt,
      lastLoginAt: this.lastLoginAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert to public profile (exclude sensitive data)
   */
  toPublicProfile() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      employeeId: this.employeeId,
      department: this.department,
      position: this.position,
      role: this.role,
      status: this.status,
    };
  }
}

module.exports = DTAMStaff;
