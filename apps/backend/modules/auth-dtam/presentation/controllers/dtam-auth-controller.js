const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('auth-dtam-dtam-auth');

/**
 * DTAM Staff Auth Controller
 * Presentation Layer - Clean Architecture
 *
 * Purpose: HTTP request handlers for DTAM staff authentication
 * - Create staff (admin only)
 * - Login staff
 * - Password reset flow
 * - Profile management
 * - Staff list and management
 */

class DTAMStaffAuthController {
  constructor({
    createDTAMStaffUseCase,
    loginDTAMStaffUseCase,
    requestPasswordResetUseCase,
    resetPasswordUseCase,
    getProfileUseCase,
    updateProfileUseCase,
    listStaffUseCase,
    updateRoleUseCase,
  }) {
    this.createDTAMStaffUseCase = createDTAMStaffUseCase;
    this.loginDTAMStaffUseCase = loginDTAMStaffUseCase;
    this.requestPasswordResetUseCase = requestPasswordResetUseCase;
    this.resetPasswordUseCase = resetPasswordUseCase;
    this.getProfileUseCase = getProfileUseCase;
    this.updateProfileUseCase = updateProfileUseCase;
    this.listStaffUseCase = listStaffUseCase;
    this.updateRoleUseCase = updateRoleUseCase;
  }

  /**
   * Create new DTAM staff (admin only)
   * POST /api/auth/dtam/staff
   */
  async createStaff(req, res) {
    try {
      const result = await this.createDTAMStaffUseCase.execute({
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        employeeId: req.body.employeeId,
        department: req.body.department,
        position: req.body.position,
        role: req.body.role,
        permissions: req.body.permissions,
        phoneNumber: req.body.phoneNumber,
        createdBy: req.staff.staffId, // From auth middleware
      });

      return res.status(201).json({
        success: true,
        message: 'DTAM staff created successfully',
        data: {
          staffId: result.staff.id,
          email: result.staff.email,
          role: result.staff.role,
        },
      });
    } catch (error) {
      logger.error('Create staff error:', error);

      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to create staff. Please try again.',
      });
    }
  }

  /**
   * Login DTAM staff
   * POST /api/auth/dtam/login
   */
  async login(req, res) {
    try {
      const result = await this.loginDTAMStaffUseCase.execute({
        email: req.body.email,
        password: req.body.password,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: result.token,
          staff: {
            id: result.staff.id,
            email: result.staff.email,
            firstName: result.staff.firstName,
            lastName: result.staff.lastName,
            employeeId: result.staff.employeeId,
            department: result.staff.department,
            position: result.staff.position,
            role: result.staff.role,
            permissions: result.staff.permissions,
            status: result.staff.status,
          },
        },
      });
    } catch (error) {
      logger.error('Login error:', error);

      if (error.message.includes('Invalid credentials')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      if (error.message.includes('locked')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('not active')) {
        return res.status(403).json({
          success: false,
          message: 'Your account is not active. Please contact administrator.',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.',
      });
    }
  }

  /**
   * Request password reset
   * POST /api/auth/dtam/request-password-reset
   */
  async requestPasswordReset(req, res) {
    try {
      await this.requestPasswordResetUseCase.execute({
        email: req.body.email,
      });

      // Always return success (prevent email enumeration)
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      logger.error('Password reset request error:', error);

      // Always return success (prevent email enumeration)
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }
  }

  /**
   * Reset password
   * POST /api/auth/dtam/reset-password
   */
  async resetPassword(req, res) {
    try {
      await this.resetPasswordUseCase.execute({
        token: req.body.token,
        newPassword: req.body.newPassword,
      });

      return res.status(200).json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.',
      });
    } catch (error) {
      logger.error('Password reset error:', error);

      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return res.status(404).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
      }

      if (error.message.includes('weak') || error.message.includes('requirements')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Password reset failed. Please try again.',
      });
    }
  }

  /**
   * Get staff profile
   * GET /api/auth/dtam/profile
   */
  async getProfile(req, res) {
    try {
      const staffId = req.staff.staffId; // From auth middleware

      const staff = await this.getProfileUseCase.execute({ staffId });

      return res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      logger.error('Get profile error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
      });
    }
  }

  /**
   * Update staff profile
   * PUT /api/auth/dtam/profile
   */
  async updateProfile(req, res) {
    try {
      const staffId = req.staff.staffId; // From auth middleware

      const staff = await this.updateProfileUseCase.execute({
        staffId,
        updates: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          department: req.body.department,
          position: req.body.position,
        },
        updatedBy: staffId,
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: staff,
      });
    } catch (error) {
      logger.error('Update profile error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found',
        });
      }

      if (error.message.includes('not active')) {
        return res.status(403).json({
          success: false,
          message: 'Cannot update profile. Account is not active.',
        });
      }

      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Profile update failed. Please try again.',
      });
    }
  }

  /**
   * List staff (with filters)
   * GET /api/auth/dtam/staff
   */
  async listStaff(req, res) {
    try {
      const filters = {
        role: req.query.role,
        status: req.query.status,
        department: req.query.department,
        search: req.query.search,
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      };

      const result = await this.listStaffUseCase.execute({ filters, pagination });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('List staff error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve staff list',
      });
    }
  }

  /**
   * Update staff role (admin only)
   * PUT /api/auth/dtam/staff/:id/role
   */
  async updateStaffRole(req, res) {
    try {
      const staffId = req.params.id;
      const updatedBy = req.staff.staffId; // From auth middleware

      const staff = await this.updateRoleUseCase.execute({
        staffId,
        role: req.body.role,
        permissions: req.body.permissions,
        updatedBy,
      });

      return res.status(200).json({
        success: true,
        message: 'Staff role updated successfully',
        data: staff,
      });
    } catch (error) {
      logger.error('Update role error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found',
        });
      }

      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to update staff role',
      });
    }
  }
}

module.exports = DTAMStaffAuthController;
