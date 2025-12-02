/**
 * Transaction Manager - Atomic Operations with Rollback
 *
 * Purpose: Ensure data consistency across multiple operations
 * Features:
 * - MongoDB transactions
 * - Automatic rollback on failure
 * - Operation logging
 * - Error recovery
 */

const logger = require('../shared/logger');
const mongoose = require('mongoose');

class TransactionManager {
  constructor(config = {}) {
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000; // ms
    this.auditService = config.auditService || null;
  }

  /**
   * Execute operations within a transaction
   * Automatically rolls back on failure
   */
  async executeWithRollback(operations, metadata = {}) {
    const session = await mongoose.startSession();

    let attempt = 0;

    while (attempt < this.maxRetries) {
      try {
        session.startTransaction();

        const results = [];
        const executedOperations = [];

        // Execute each operation
        for (const operation of operations) {
          logger.info(`🔄 Executing: ${operation.name}`);

          const startTime = Date.now();
          const result = await operation.execute(session);
          const duration = Date.now() - startTime;

          results.push(result);
          executedOperations.push({
            name: operation.name,
            duration,
            result: 'success',
          });
        }

        // Commit transaction
        await session.commitTransaction();

        logger.info('✅ Transaction committed successfully');

        // Log successful transaction
        if (this.auditService) {
          await this.auditService.logAction(
            'transaction_committed',
            { userId: metadata.userId || 'system', role: metadata.role || 'system' },
            {
              type: 'transaction',
              id: session.id.toString(),
              after: { operations: executedOperations, results },
            },
            {
              ...metadata,
              attempt: attempt + 1,
              operationCount: operations.length,
            },
          );
        }

        return {
          success: true,
          results,
          operations: executedOperations,
          attempt: attempt + 1,
        };
      } catch (error) {
        console.error(
          `❌ Transaction failed (attempt ${attempt + 1}/${this.maxRetries}):`,
          error.message,
        );

        // Abort transaction
        await session.abortTransaction();

        // Log rollback
        if (this.auditService) {
          await this.auditService.logFailure(
            'transaction_rollback',
            { userId: metadata.userId || 'system', role: metadata.role || 'system' },
            {
              type: 'transaction',
              id: session.id.toString(),
            },
            error,
            {
              ...metadata,
              attempt: attempt + 1,
              operationCount: operations.length,
              operations: operations.map(op => op.name),
            },
          );
        }

        // Retry logic
        attempt++;

        if (attempt >= this.maxRetries) {
          // Max retries reached
          return {
            success: false,
            error: {
              message: error.message,
              code: error.code,
              stack: error.stack,
            },
            rollback: true,
            attempts: attempt,
          };
        }

        // Wait before retry
        await this.delay(this.retryDelay * attempt);
      } finally {
        session.endSession();
      }
    }
  }

  /**
   * Execute operations with compensating actions
   * For operations that cannot use MongoDB transactions
   */
  async executeWithCompensation(operations, metadata = {}) {
    const executedOperations = [];

    try {
      const results = [];

      // Execute each operation
      for (const operation of operations) {
        logger.info(`🔄 Executing: ${operation.name}`);

        const startTime = Date.now();
        const result = await operation.execute();
        const duration = Date.now() - startTime;

        results.push(result);
        executedOperations.push({
          name: operation.name,
          duration,
          result: 'success',
          compensate: operation.compensate || null,
        });
      }

      logger.info('✅ All operations completed successfully');

      return {
        success: true,
        results,
        operations: executedOperations,
      };
    } catch (error) {
      logger.error('❌ Operation failed, executing compensations:', error.message);

      // Execute compensating actions in reverse order
      for (let i = executedOperations.length - 1; i >= 0; i--) {
        const operation = executedOperations[i];

        if (operation.compensate) {
          try {
            logger.info(`↩️ Compensating: ${operation.name}`);
            await operation.compensate();
          } catch (compensationError) {
            console.error(
              `❌ Compensation failed for ${operation.name}:`,
              compensationError.message,
            );
            // Continue with other compensations
          }
        }
      }

      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
        compensated: true,
        executedOperations: executedOperations.map(op => op.name),
      };
    }
  }

  /**
   * Delay helper for retries
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a safe operation wrapper
   */
  createOperation(name, executeFunc, compensateFunc = null) {
    return {
      name,
      execute: executeFunc,
      compensate: compensateFunc,
    };
  }
}

// Example usage functions
class ApplicationService {
  constructor(transactionManager, auditService, certificateService, notificationService) {
    this.transactionManager = transactionManager;
    this.auditService = auditService;
    this.certificateService = certificateService;
    this.notificationService = notificationService;
  }

  /**
   * Approve application with transaction
   */
  async approveApplication(applicationId, approverId) {
    const Application = mongoose.model('Application');
    const Certificate = mongoose.model('Certificate');

    const operations = [
      this.transactionManager.createOperation('Update application status', async session => {
        const application = await Application.findByIdAndUpdate(
          applicationId,
          {
            status: 'approved',
            approvedBy: approverId,
            approvedAt: new Date(),
          },
          { session, new: true },
        );

        if (!application) {
          throw new Error('Application not found');
        }

        return application;
      }),

      this.transactionManager.createOperation('Generate certificate', async session => {
        const application = await Application.findById(applicationId).session(session);

        const certificate = await this.certificateService.generateCertificate(
          session.getClient().db(),
          application,
        );

        return certificate;
      }),

      this.transactionManager.createOperation(
        'Update application with certificate number',
        async session => {
          const certificate = await Certificate.findOne({ applicationId }).session(session);

          const application = await Application.findByIdAndUpdate(
            applicationId,
            { certificateNumber: certificate.certificateNumber },
            { session, new: true },
          );

          return application;
        },
      ),

      this.transactionManager.createOperation('Send approval notification', async session => {
        const application = await Application.findById(applicationId).session(session);

        await this.notificationService.sendNotification({
          type: 'APPLICATION_APPROVED',
          userId: application.farmerId,
          data: {
            applicationId: application.id,
            certificateNumber: application.certificateNumber,
          },
        });

        return { notificationSent: true };
      }),

      this.transactionManager.createOperation('Create audit log', async session => {
        await this.auditService.logAction(
          'application_approved',
          { userId: approverId, role: 'approver' },
          {
            type: 'application',
            id: applicationId,
            after: { status: 'approved' },
          },
        );

        return { auditLogCreated: true };
      }),
    ];

    return await this.transactionManager.executeWithRollback(operations, {
      userId: approverId,
      role: 'approver',
      action: 'approve_application',
    });
  }

  /**
   * Reject application with compensation
   */
  async rejectApplication(applicationId, reviewerId, reason) {
    const Application = mongoose.model('Application');

    const operations = [
      this.transactionManager.createOperation(
        'Update application status',
        async () => {
          const application = await Application.findByIdAndUpdate(
            applicationId,
            {
              status: 'rejected',
              rejectedBy: reviewerId,
              rejectedAt: new Date(),
              lockedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              rejectionReason: reason,
            },
            { new: true },
          );

          if (!application) {
            throw new Error('Application not found');
          }

          return application;
        },
        // Compensation: revert to previous status
        async () => {
          await Application.findByIdAndUpdate(applicationId, {
            $unset: {
              rejectedBy: '',
              rejectedAt: '',
              lockedUntil: '',
              rejectionReason: '',
            },
          });
        },
      ),

      this.transactionManager.createOperation(
        'Send rejection notification',
        async () => {
          const application = await Application.findById(applicationId);

          await this.notificationService.sendNotification({
            type: 'APPLICATION_REJECTED',
            userId: application.farmerId,
            data: {
              applicationId: application.id,
              reason,
              canResubmitAt: application.lockedUntil,
            },
          });

          return { notificationSent: true };
        },
        // No compensation needed for notifications
        null,
      ),

      this.transactionManager.createOperation('Create audit log', async () => {
        await this.auditService.logAction(
          'application_rejected',
          { userId: reviewerId, role: 'reviewer' },
          {
            type: 'application',
            id: applicationId,
            after: { status: 'rejected', reason },
          },
        );

        return { auditLogCreated: true };
      }),
    ];

    return await this.transactionManager.executeWithCompensation(operations);
  }
}

module.exports = {
  TransactionManager,
  ApplicationService,
};

// Example usage
if (require.main === module) {
  const { MongoClient } = require('mongodb');

  const test = async function () {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_platform');

    const AuditService = require('./AuditService');
    const auditService = new AuditService(mongoose.connection.db);

    const transactionManager = new TransactionManager({
      maxRetries: 3,
      retryDelay: 1000,
      auditService,
    });

    // Test transaction
    const operations = [
      transactionManager.createOperation('Operation 1', async session => {
        logger.info('Executing operation 1');
        return { result: 'success' };
      }),
      transactionManager.createOperation('Operation 2', async session => {
        logger.info('Executing operation 2');
        return { result: 'success' };
      }),
    ];

    const result = await transactionManager.executeWithRollback(operations, {
      userId: 'test-user',
      role: 'admin',
    });

    logger.info('Transaction result:', result);

    await mongoose.connection.close();
  };

  test().catch(console.error);
}
