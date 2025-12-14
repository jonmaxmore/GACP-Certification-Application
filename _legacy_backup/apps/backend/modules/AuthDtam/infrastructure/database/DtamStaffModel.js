/**
 * MongoDB DTAM Staff Repository
 * Infrastructure Layer - Clean Architecture
 *
 * Purpose: MongoDB implementation of IDTAMStaffRepository
 * - Mongoose schema and model
 * - CRUD operations
 * - Query methods
 * - Domain/MongoDB conversion
 */

const mongoose = require('mongoose');
const DTAMStaff = require('../../domain/entities/DTAMStaff');
const IDTAMStaffRepository = require('../../domain/interfaces/IDTAMStaffRepository');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('auth-dtam-dtam-staff');

// Mongoose Schema
const dtamStaffSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(DTAMStaff.ROLES),
      index: true,
    },
    permissions: [
      {
        type: String,
      },
    ],
    phoneNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(DTAMStaff.STATUS),
      default: DTAMStaff.STATUS.ACTIVE,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerifiedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      index: true,
    },
    passwordResetTokenExpiresAt: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lastFailedLoginAt: {
      type: Date,
    },
    accountLockedUntil: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
    },
    lastLoginUserAgent: {
      type: String,
    },
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'dtam_staff',
  },
);

// Indexes
dtamStaffSchema.index({ email: 1, status: 1 });
dtamStaffSchema.index({ role: 1, status: 1 });
dtamStaffSchema.index({ department: 1 });
dtamStaffSchema.index({ createdAt: -1 });

class MongoDBDTAMStaffRepository extends IDTAMStaffRepository {
  constructor(database) {
    super();
    this.database = database;
    this.model = database.model('DTAMStaff', dtamStaffSchema);
  }

  /**
   * Convert MongoDB document to Domain entity
   */
  toDomain(doc) {
    if (!doc) {
      return null;
    }

    return new DTAMStaff({
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      employeeId: doc.employeeId,
      department: doc.department,
      position: doc.position,
      role: doc.role,
      permissions: doc.permissions,
      phoneNumber: doc.phoneNumber,
      status: doc.status,
      isEmailVerified: doc.isEmailVerified,
      emailVerificationToken: doc.emailVerificationToken,
      emailVerifiedAt: doc.emailVerifiedAt,
      passwordResetToken: doc.passwordResetToken,
      passwordResetTokenExpiresAt: doc.passwordResetTokenExpiresAt,
      failedLoginAttempts: doc.failedLoginAttempts,
      lastFailedLoginAt: doc.lastFailedLoginAt,
      accountLockedUntil: doc.accountLockedUntil,
      lastLoginAt: doc.lastLoginAt,
      lastLoginIp: doc.lastLoginIp,
      lastLoginUserAgent: doc.lastLoginUserAgent,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /**
   * Convert Domain entity to MongoDB document
   */
  toMongoDB(staff) {
    return {
      email: staff.email,
      password: staff.password,
      firstName: staff.firstName,
      lastName: staff.lastName,
      employeeId: staff.employeeId,
      department: staff.department,
      position: staff.position,
      role: staff.role,
      permissions: staff.permissions,
      phoneNumber: staff.phoneNumber,
      status: staff.status,
      isEmailVerified: staff.isEmailVerified,
      emailVerificationToken: staff.emailVerificationToken,
      emailVerifiedAt: staff.emailVerifiedAt,
      passwordResetToken: staff.passwordResetToken,
      passwordResetTokenExpiresAt: staff.passwordResetTokenExpiresAt,
      failedLoginAttempts: staff.failedLoginAttempts,
      lastFailedLoginAt: staff.lastFailedLoginAt,
      accountLockedUntil: staff.accountLockedUntil,
      lastLoginAt: staff.lastLoginAt,
      lastLoginIp: staff.lastLoginIp,
      lastLoginUserAgent: staff.lastLoginUserAgent,
      createdBy: staff.createdBy,
      updatedBy: staff.updatedBy,
    };
  }

  async findById(id) {
    try {
      const doc = await this.model.findById(id);
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding staff by ID:', error);
      return null;
    }
  }

  async findByEmail(email) {
    try {
      const doc = await this.model.findOne({ email: email.toLowerCase() });
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding staff by email:', error);
      return null;
    }
  }

  async findByEmployeeId(employeeId) {
    try {
      const doc = await this.model.findOne({ employeeId });
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding staff by employee ID:', error);
      return null;
    }
  }

  async findByPasswordResetToken(token) {
    try {
      const doc = await this.model.findOne({
        passwordResetToken: token,
        passwordResetTokenExpiresAt: { $gt: new Date() },
      });
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding staff by reset token:', error);
      return null;
    }
  }

  async save(staff) {
    try {
      const mongoData = this.toMongoDB(staff);

      let doc;
      if (staff.id) {
        // Update existing
        doc = await this.model.findByIdAndUpdate(staff.id, mongoData, {
          new: true,
          runValidators: true,
        });
      } else {
        // Create new
        doc = await this.model.create(mongoData);
      }

      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error saving staff:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      logger.error('Error deleting staff:', error);
      return false;
    }
  }

  async findWithFilters(filters, pagination) {
    try {
      const query = {};

      if (filters.role) {
        query.role = filters.role;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.department) {
        query.department = filters.department;
      }

      if (filters.search) {
        query.$or = [
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { employeeId: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const skip = (pagination.page - 1) * pagination.limit;

      const [docs, total] = await Promise.all([
        this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
        this.model.countDocuments(query),
      ]);

      return {
        items: docs.map(doc => this.toDomain(doc)),
        total,
      };
    } catch (error) {
      logger.error('Error finding staff with filters:', error);
      return { items: [], total: 0 };
    }
  }

  async countByStatus(status) {
    try {
      return await this.model.countDocuments({ status });
    } catch (error) {
      logger.error('Error counting staff by status:', error);
      return 0;
    }
  }

  async countByRole(role) {
    try {
      return await this.model.countDocuments({ role });
    } catch (error) {
      logger.error('Error counting staff by role:', error);
      return 0;
    }
  }

  async emailExists(email, excludeId = null) {
    try {
      const query = { email: email.toLowerCase() };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const count = await this.model.countDocuments(query);
      return count > 0;
    } catch (error) {
      logger.error('Error checking email exists:', error);
      return false;
    }
  }

  async employeeIdExists(employeeId, excludeId = null) {
    try {
      const query = { employeeId };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const count = await this.model.countDocuments(query);
      return count > 0;
    } catch (error) {
      logger.error('Error checking employee ID exists:', error);
      return false;
    }
  }

  async findRecentlyCreated(limit = 10) {
    try {
      const docs = await this.model.find().sort({ createdAt: -1 }).limit(limit);
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding recently created staff:', error);
      return [];
    }
  }

  async findByRole(role) {
    try {
      const docs = await this.model.find({ role });
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding staff by role:', error);
      return [];
    }
  }

  async findByDepartment(department) {
    try {
      const docs = await this.model.find({ department });
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding staff by department:', error);
      return [];
    }
  }
}

module.exports = MongoDBDTAMStaffRepository;
