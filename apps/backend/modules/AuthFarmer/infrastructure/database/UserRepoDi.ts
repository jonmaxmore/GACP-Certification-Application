/**
 * MongoDB User Repository - Refactored with DI
 * Infrastructure Layer - Clean Architecture
 *
 * Changes from original:
 * - Logger injected via constructor (no direct import of shared/logger)
 * - Proper dependency injection pattern
 * - Can be mocked easily in tests
 *
 * Usage:
 *   const logger = new ConsoleLogger();
 *   const repo = new MongoUserRepository(mongoose.connection, logger);
 */

import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User } from '../../domain/entities/User';

/**
 * Logger interface (can be implemented by winston, pino, console, etc.)
 */
export interface ILogger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

/**
 * MongoDB User Repository with DI
 */
export class MongoUserRepositoryWithDI {
  constructor(
    private readonly db: any, // Mongoose connection or collection
    private readonly logger: ILogger,
  ) {}

  async save(user: User): Promise<void> {
    try {
      const userData = this.toMongoDB(user);
      await this.db.collection('users_farmer').insertOne(userData);
      this.logger.info('User saved successfully', {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      this.logger.error('Failed to save user', {
        userId: user.id,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const doc = await this.db.collection('users_farmer').findOne({ email });
      if (!doc) {
        this.logger.debug('User not found by email', { email });
        return null;
      }
      this.logger.debug('User found by email', { email, userId: doc._id });
      return this.toDomain(doc);
    } catch (error) {
      this.logger.error('Error finding user by email', {
        email,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const count = await this.db.collection('users_farmer').countDocuments({ email });
      return count > 0;
    } catch (error) {
      this.logger.error('Error checking email existence', {
        email,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async idCardExists(idCard: string): Promise<boolean> {
    try {
      const count = await this.db.collection('users_farmer').countDocuments({ idCard });
      return count > 0;
    } catch (error) {
      this.logger.error('Error checking ID card existence', {
        idCard,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Convert MongoDB document to Domain entity
   */
  private toDomain(doc: any): User {
    return new User({
      id: doc._id?.toString(),
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      phoneNumber: doc.phoneNumber,
      idCard: doc.idCard,
      address: doc.address,
      province: doc.province,
      district: doc.district,
      subdistrict: doc.subdistrict,
      zipCode: doc.zipCode,
      role: doc.role,
      status: doc.status,
      isEmailVerified: doc.isEmailVerified,
      emailVerificationToken: doc.emailVerificationToken,
      emailVerificationExpiry: doc.emailVerificationExpiry,
      emailVerifiedAt: doc.emailVerifiedAt,
      passwordResetToken: doc.passwordResetToken,
      passwordResetExpiry: doc.passwordResetExpiry,
      lastLoginAt: doc.lastLoginAt,
      failedLoginAttempts: doc.failedLoginAttempts,
      accountLockedUntil: doc.accountLockedUntil,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /**
   * Convert Domain entity to MongoDB document
   */
  private toMongoDB(user: User): any {
    return {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      idCard: user.idCard,
      address: user.address,
      province: user.province,
      district: user.district,
      subdistrict: user.subdistrict,
      zipCode: user.zipCode,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      emailVerificationToken: user.emailVerificationToken,
      emailVerificationExpiry: user.emailVerificationExpiry,
      emailVerifiedAt: user.emailVerifiedAt,
      passwordResetToken: user.passwordResetToken,
      passwordResetExpiry: user.passwordResetExpiry,
      lastLoginAt: user.lastLoginAt,
      failedLoginAttempts: user.failedLoginAttempts,
      accountLockedUntil: user.accountLockedUntil,
      metadata: user.metadata,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

/**
 * Console Logger Implementation (for simple cases)
 */
export class ConsoleLogger implements ILogger {
  info(message: string, meta?: any): void {
    console.log(`[INFO] ${message}`, meta || '');
  }

  error(message: string, meta?: any): void {
    console.error(`[ERROR] ${message}`, meta || '');
  }

  warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${message}`, meta || '');
  }

  debug(message: string, meta?: any): void {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] ${message}`, meta || '');
    }
  }
}

/**
 * Example: Creating repository with DI in composition root
 *
 * ```typescript
 * import { MongoUserRepositoryWithDI, ConsoleLogger } from './infrastructure/database/user-repo-di';
 * import mongoose from 'mongoose';
 *
 * // In your app.ts or container.ts:
 * const logger = new ConsoleLogger();
 * const userRepo = new MongoUserRepositoryWithDI(mongoose.connection, logger);
 *
 * // Pass to use cases:
 * const registerUseCase = new RegisterUserUseCase(
 *   userRepo,
 *   passwordHasher,
 *   tokenGenerator,
 *   eventBus
 * );
 * ```
 */
