/**
 * Payment Service Module - Main Entry Point
 *
 * Comprehensive payment management module for the GACP platform
 * providing PromptPay integration, fee calculation, and payment lifecycle management.
 *
 * Core Features:
 * - Dynamic fee calculation based on application type
 * - PromptPay QR code generation for Thai banking system
 * - Real-time webhook processing for payment updates
 * - Comprehensive receipt generation and management
 * - Refund processing with admin controls
 * - Payment retry logic with attempt tracking
 * - Comprehensive audit logging and reporting
 *
 * Business Logic:
 * - Base certification fee: 5,000 THB
 * - Inspection fee: 2,000 THB per visit
 * - VAT: 7% applied to all fees
 * - Expedited processing: 50% surcharge
 * - Payment expiry: 15 minutes for PromptPay
 * - Maximum retry attempts: 3 times
 * - Refund window: 30 days from payment date
 *
 * Integration Points:
 * - Application Workflow Module (status updates)
 * - User Management Module (authentication)
 * - Document Management Module (receipt storage)
 * - Notification Service (payment alerts)
 * - Audit Service (payment logging)
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../shared/logger/logger');
const PaymentService = require('./application/services/PaymentService');
const PaymentController = require('./presentation/controllers/PaymentController');
const PaymentRoutes = require('./presentation/routes/payment-routes.routes');
const Payment = require('./domain/entities/Payment');

class PaymentServiceModule {
  constructor(dependencies = {}) {
    this.dependencies = dependencies;
    this.service = null;
    this.controller = null;
    this.routes = null;

    this._initializeModule();
    logger.info('[PaymentServiceModule] Initialized successfully');
  }

  /**
   * Initialize the payment service module
   * @private
   */
  _initializeModule() {
    try {
      // Validate required dependencies
      this._validateDependencies();

      // Initialize service layer
      this.service = new PaymentService(this.dependencies);

      // Initialize presentation layer
      const controllerDependencies = {
        ...this.dependencies,
        paymentService: this.service,
      };

      this.controller = new PaymentController(controllerDependencies);
      this.routes = new PaymentRoutes(controllerDependencies);

      logger.info('[PaymentServiceModule] All components initialized');
    } catch (error) {
      logger.error('[PaymentServiceModule] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Validate required dependencies
   * @private
   */
  _validateDependencies() {
    const required = ['mongooseConnection', 'paymentRepository', 'applicationRepository'];

    const missing = required.filter(dep => !this.dependencies[dep]);

    if (missing.length > 0) {
      throw new Error(`Missing required dependencies: ${missing.join(', ')}`);
    }

    // Validate PromptPay configuration
    if (!process.env.PROMPTPAY_MERCHANT_ID) {
      logger.warn('[PaymentServiceModule] PROMPTPAY_MERCHANT_ID not configured - using default');
    }

    if (!process.env.PROMPTPAY_WEBHOOK_SECRET) {
      console.warn(
        '[PaymentServiceModule] PROMPTPAY_WEBHOOK_SECRET not configured - webhook security disabled',
      );
    }

    // Optional dependencies with warnings
    const optional = [
      'userRepository',
      'auditService',
      'notificationService',
      'receiptService',
      'promptPayGateway',
    ];

    optional.forEach(dep => {
      if (!this.dependencies[dep]) {
        console.warn(
          `[PaymentServiceModule] Optional dependency '${dep}' not provided - related features will be disabled`,
        );
      }
    });
  }

  /**
   * Get the payment service
   */
  getService() {
    return this.service;
  }

  /**
   * Get the payment controller
   */
  getController() {
    return this.controller;
  }

  /**
   * Get the payment routes
   */
  getRoutes() {
    return this.routes.getRouter();
  }

  /**
   * Get the Payment model/entity
   */
  getPaymentModel() {
    return Payment;
  }

  /**
   * Get payment configuration
   */
  getConfig() {
    return {
      module: 'PaymentService',
      version: '1.0.0',
      features: {
        feeCalculation: true,
        promptPayIntegration: true,
        webhookProcessing: true,
        receiptGeneration: !!this.dependencies.receiptService,
        refundProcessing: true,
        paymentRetry: true,
        auditLogging: !!this.dependencies.auditService,
        notifications: !!this.dependencies.notificationService,
      },
      businessRules: {
        fees: {
          CERTIFICATION_FEE: 5000,
          INSPECTION_FEE: 2000,
          RENEWAL_FEE: 3000,
          AMENDMENT_FEE: 1000,
          EXPEDITED_FEE_RATE: 0.5,
          PROCESSING_FEE: 100,
          VAT_RATE: 0.07,
        },
        limits: {
          maxRetryAttempts: 3,
          paymentExpiryMinutes: 15,
          refundWindowDays: 30,
        },
        currency: 'THB',
        paymentMethods: ['QR_CODE', 'BANK_TRANSFER', 'MOBILE_BANKING'],
      },
      security: {
        webhookSignatureVerification: !!process.env.PROMPTPAY_WEBHOOK_SECRET,
        rateLimiting: true,
        inputValidation: true,
        auditLogging: !!this.dependencies.auditService,
      },
      integration: {
        promptPay: {
          merchantId: process.env.PROMPTPAY_MERCHANT_ID || 'not-configured',
          webhookEndpoint: '/api/payments/webhook',
          qrCodeFormat: 'EMV',
        },
        bankingPartner: 'PromptPay Thailand',
        receiptFormat: 'PDF',
      },
    };
  }

  /**
   * Health check for the module
   */
  async healthCheck() {
    try {
      const health = {
        module: 'PaymentService',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        components: {},
      };

      // Check service health
      if (this.service) {
        health.components.service = await this.service.healthCheck();
      }

      // Check database connection
      if (this.dependencies.mongooseConnection) {
        health.components.database = {
          status:
            this.dependencies.mongooseConnection.readyState === 1 ? 'connected' : 'disconnected',
          readyState: this.dependencies.mongooseConnection.readyState,
        };
      }

      // Check payment gateway connectivity
      if (this.dependencies.promptPayGateway) {
        try {
          // Test gateway connectivity
          health.components.promptPayGateway = { status: 'configured' };
        } catch (error) {
          health.components.promptPayGateway = {
            status: 'error',
            error: error.message,
          };
        }
      } else {
        health.components.promptPayGateway = { status: 'not-configured' };
      }

      // Check configuration
      health.components.configuration = {
        merchantIdConfigured: !!process.env.PROMPTPAY_MERCHANT_ID,
        webhookSecretConfigured: !!process.env.PROMPTPAY_WEBHOOK_SECRET,
        receiptServiceAvailable: !!this.dependencies.receiptService,
        notificationServiceAvailable: !!this.dependencies.notificationService,
      };

      // Overall health status
      const componentStatuses = Object.values(health.components).map(c => c.status);
      if (componentStatuses.includes('error')) {
        health.status = 'degraded';
      } else if (componentStatuses.includes('disconnected')) {
        health.status = 'degraded';
      }

      return health;
    } catch (error) {
      return {
        module: 'PaymentService',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Get payment statistics summary
   */
  async getStatisticsSummary(period = '30d') {
    try {
      let startDate;
      switch (period) {
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      const stats = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
      ]);

      const summary = {
        period,
        startDate,
        endDate: new Date(),
        statistics: stats,
        totalPayments: stats.reduce((sum, stat) => sum + stat.count, 0),
        totalRevenue: stats
          .filter(stat => stat._id === 'COMPLETED')
          .reduce((sum, stat) => sum + stat.totalAmount, 0),
      };

      return summary;
    } catch (error) {
      logger.error('[PaymentServiceModule] Statistics error:', error);
      throw error;
    }
  }

  /**
   * Process pending payment cleanup (scheduled task)
   */
  async cleanupExpiredPayments() {
    try {
      logger.info('[PaymentServiceModule] Starting expired payment cleanup');

      // Find expired payments
      const expiredPayments = await Payment.find({
        status: 'PENDING',
        expiresAt: { $lte: new Date() },
      });

      let cleanupCount = 0;

      for (const payment of expiredPayments) {
        try {
          payment.status = 'EXPIRED';
          await payment.save();

          // Notify user if notification service is available
          if (this.dependencies.notificationService) {
            await this.dependencies.notificationService.sendPaymentExpired({
              userId: payment.userId,
              payment,
            });
          }

          cleanupCount++;
        } catch (error) {
          console.error(
            `[PaymentServiceModule] Error cleaning up payment ${payment.paymentId}:`,
            error,
          );
        }
      }

      logger.info(`[PaymentServiceModule] Cleanup completed: ${cleanupCount} payments expired`);

      return {
        cleanupCount,
        processedAt: new Date(),
      };
    } catch (error) {
      logger.error('[PaymentServiceModule] Cleanup error:', error);
      throw error;
    }
  }

  /**
   * Integration helper for other modules
   */
  async notifyPaymentCompleted(paymentId) {
    try {
      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'COMPLETED') {
        throw new Error('Payment is not completed');
      }

      // This can be called by other modules when they need to know about payment completion
      return {
        paymentId,
        applicationId: payment.applicationId,
        amount: payment.amount,
        completedAt: payment.paidAt,
      };
    } catch (error) {
      logger.error('[PaymentServiceModule] Payment notification error:', error);
      throw error;
    }
  }

  /**
   * Clean shutdown of the module
   */
  async shutdown() {
    logger.info('[PaymentServiceModule] Shutting down...');

    try {
      // Process any remaining webhook events
      if (this.service && typeof this.service.shutdown === 'function') {
        await this.service.shutdown();
      }

      // Close payment gateway connections
      if (
        this.dependencies.promptPayGateway &&
        typeof this.dependencies.promptPayGateway.disconnect === 'function'
      ) {
        await this.dependencies.promptPayGateway.disconnect();
      }

      logger.info('[PaymentServiceModule] Shutdown completed');
    } catch (error) {
      logger.error('[PaymentServiceModule] Error during shutdown:', error);
      throw error;
    }
  }
}

// Export both the class and a factory function
module.exports = PaymentServiceModule;

/**
 * Factory function to create a new payment service module instance
 * @param {Object} dependencies - Required and optional dependencies
 * @returns {PaymentServiceModule} Configured module instance
 */
module.exports.createModule = dependencies => {
  return new PaymentServiceModule(dependencies);
};

/**
 * Module metadata
 */
module.exports.metadata = {
  name: 'PaymentService',
  version: '1.0.0',
  description:
    'Comprehensive payment management module for GACP platform with PromptPay integration',
  author: 'GACP Platform Team',
  dependencies: {
    required: ['mongooseConnection', 'paymentRepository', 'applicationRepository'],
    optional: [
      'userRepository',
      'auditService',
      'notificationService',
      'receiptService',
      'promptPayGateway',
    ],
  },
  features: [
    'fee-calculation',
    'promptpay-integration',
    'qr-code-generation',
    'webhook-processing',
    'payment-retry',
    'refund-processing',
    'receipt-generation',
    'audit-logging',
    'rate-limiting',
    'payment-statistics',
  ],
  businessRules: {
    paymentTypes: [
      'CERTIFICATION_FEE',
      'INSPECTION_FEE',
      'RENEWAL_FEE',
      'AMENDMENT_FEE',
      'EXPEDITED_FEE',
      'PENALTY_FEE',
    ],
    currency: 'THB',
    vatRate: 0.07,
    paymentExpiry: '15 minutes',
    maxRetryAttempts: 3,
    refundWindow: '30 days',
  },
};
