/**
 * PaymentService
 * Handles payment processing for GACP certification applications
 *
 * Payment Rules:
 * 1. Initial Submission: 5,000 THB (Required before review starts)
 * 2. 3rd Rejection: Additional 5,000 THB (Conditional - only if rejected 3+ times)
 *
 * @module services/payment
 * @version 1.0.0
 */

const EventEmitter = require('events');
const logger = require('../utils/logger');

class PaymentService extends EventEmitter {
  constructor(paymentRepository, applicationRepository, notificationService) {
    super();
    this.paymentRepository = paymentRepository;
    this.applicationRepository = applicationRepository;
    this.notificationService = notificationService;

    // Payment types
    this.PAYMENT_TYPES = {
      INITIAL: 'initial',
      RESUBMISSION: 'resubmission',
    };

    // Payment status
    this.PAYMENT_STATUS = {
      PENDING: 'pending',
      COMPLETED: 'completed',
      FAILED: 'failed',
      CANCELLED: 'cancelled',
    };

    // Payment methods
    this.PAYMENT_METHODS = {
      CREDIT_CARD: 'credit_card',
      BANK_TRANSFER: 'bank_transfer',
      QR_CODE: 'qr_code',
      PROMPTPAY: 'promptpay',
    };

    // Amount constants
    this.PAYMENT_AMOUNT = 5000; // THB
    this.SUBMISSION_THRESHOLD = 3; // Trigger payment on 3rd rejection
  }

  /**
   * Create a new payment for application submission
   * @param {Object} data - Payment data
   * @param {string} data.applicationId - Application ID
   * @param {string} data.farmerId - Farmer user ID
   * @param {string} data.type - Payment type (initial/resubmission)
   * @param {number} data.submissionCount - Current submission count
   * @returns {Promise<Object>} Created payment
   */
  async createPayment(data) {
    try {
      const { applicationId, farmerId, type, submissionCount = 1 } = data;

      logger.info(`[PaymentService] Creating ${type} payment for application ${applicationId}`);

      // Validate payment type
      if (!Object.values(this.PAYMENT_TYPES).includes(type)) {
        throw new Error(`Invalid payment type: ${type}`);
      }

      // Check if payment already exists
      const existingPayment = await this.paymentRepository.findByApplicationAndType(
        applicationId,
        type,
      );

      if (existingPayment && existingPayment.status === this.PAYMENT_STATUS.COMPLETED) {
        logger.warn(`[PaymentService] Payment already completed for ${applicationId} (${type})`);
        return existingPayment;
      }

      // Create payment record
      const payment = await this.paymentRepository.create({
        applicationId,
        farmerId,
        amount: this.PAYMENT_AMOUNT,
        type,
        status: this.PAYMENT_STATUS.PENDING,
        submissionCount,
        paymentMethod: null,
        transactionId: null,
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Send notification to farmer
      if (this.notificationService) {
        await this.notificationService.sendNotification({
          userId: farmerId,
          type: 'payment_required',
          title: 'จำเป็นต้องชำระเงิน',
          message:
            type === this.PAYMENT_TYPES.INITIAL
              ? `กรุณาชำระค่าธรรมเนียม ${this.PAYMENT_AMOUNT} บาท เพื่อดำเนินการต่อ`
              : `เนื่องจากถูกปฏิเสธครั้งที่ ${submissionCount} กรุณาชำระค่าธรรมเนียมเพิ่มเติม ${this.PAYMENT_AMOUNT} บาท`,
          priority: 'high',
          data: {
            paymentId: payment.id,
            applicationId,
            amount: this.PAYMENT_AMOUNT,
            type,
          },
        });
      }

      // Emit event
      this.emit('payment:created', { payment, applicationId, farmerId });

      logger.info(`[PaymentService] Payment created: ${payment.id}`);
      return payment;
    } catch (error) {
      logger.error('[PaymentService] Create payment error:', error);
      throw error;
    }
  }

  /**
   * Process payment completion
   * @param {string} paymentId - Payment ID
   * @param {Object} data - Payment completion data
   * @param {string} data.paymentMethod - Payment method used
   * @param {string} data.transactionId - Transaction ID from gateway
   * @returns {Promise<Object>} Updated payment
   */
  async completePayment(paymentId, data) {
    try {
      const { paymentMethod, transactionId } = data;

      logger.info(`[PaymentService] Completing payment ${paymentId}`);

      // Get payment
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
      }

      // Check if already completed
      if (payment.status === this.PAYMENT_STATUS.COMPLETED) {
        logger.warn(`[PaymentService] Payment already completed: ${paymentId}`);
        return payment;
      }

      // Update payment status
      const updatedPayment = await this.paymentRepository.update(paymentId, {
        status: this.PAYMENT_STATUS.COMPLETED,
        paymentMethod,
        transactionId,
        paidAt: new Date(),
        updatedAt: new Date(),
      });

      // Update application payment status
      await this.applicationRepository.addPayment(payment.applicationId, {
        paymentId: updatedPayment.id,
        amount: updatedPayment.amount,
        type: updatedPayment.type,
        status: this.PAYMENT_STATUS.COMPLETED,
        paidAt: updatedPayment.paidAt,
      });

      // Send notifications
      if (this.notificationService) {
        // Notify farmer
        await this.notificationService.sendNotification({
          userId: payment.farmerId,
          type: 'payment_completed',
          title: 'ชำระเงินสำเร็จ',
          message: `การชำระเงินจำนวน ${payment.amount} บาทเสร็จสมบูรณ์`,
          priority: 'medium',
          data: {
            paymentId: updatedPayment.id,
            applicationId: payment.applicationId,
            amount: payment.amount,
          },
        });

        // Notify reviewer (if initial payment)
        if (payment.type === this.PAYMENT_TYPES.INITIAL) {
          const application = await this.applicationRepository.findById(payment.applicationId);
          if (application && application.assignedReviewer) {
            await this.notificationService.sendNotification({
              userId: application.assignedReviewer,
              type: 'payment_completed',
              title: 'ได้รับการชำระเงินแล้ว',
              message: `${application.applicationId} สามารถดำเนินการตรวจสอบได้`,
              priority: 'medium',
              data: {
                applicationId: application.id,
                paymentId: updatedPayment.id,
              },
            });
          }
        }
      }

      // Emit event
      this.emit('payment:completed', {
        payment: updatedPayment,
        applicationId: payment.applicationId,
        farmerId: payment.farmerId,
      });

      logger.info(`[PaymentService] Payment completed: ${paymentId}`);
      return updatedPayment;
    } catch (error) {
      logger.error('[PaymentService] Complete payment error:', error);
      throw error;
    }
  }

  /**
   * Check if initial payment is required
   * @param {string} applicationId - Application ID
   * @returns {Promise<boolean>} True if payment required
   */
  async isInitialPaymentRequired(applicationId) {
    try {
      const payment = await this.paymentRepository.findByApplicationAndType(
        applicationId,
        this.PAYMENT_TYPES.INITIAL,
      );

      return !payment || payment.status !== this.PAYMENT_STATUS.COMPLETED;
    } catch (error) {
      logger.error('[PaymentService] Check initial payment error:', error);
      throw error;
    }
  }

  /**
   * Check if 3rd rejection payment is required
   * @param {string} applicationId - Application ID
   * @param {number} submissionCount - Current submission count
   * @returns {Promise<boolean>} True if payment required
   */
  async isResubmissionPaymentRequired(applicationId, submissionCount) {
    try {
      // Only required on 3rd rejection or more
      if (submissionCount < this.SUBMISSION_THRESHOLD) {
        return false;
      }

      const payment = await this.paymentRepository.findByApplicationAndType(
        applicationId,
        this.PAYMENT_TYPES.RESUBMISSION,
      );

      return !payment || payment.status !== this.PAYMENT_STATUS.COMPLETED;
    } catch (error) {
      logger.error('[PaymentService] Check resubmission payment error:', error);
      throw error;
    }
  }

  /**
   * Get payment status for application
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} Payment status summary
   */
  async getPaymentStatus(applicationId) {
    try {
      const payments = await this.paymentRepository.findByApplication(applicationId);

      const initialPayment = payments.find(p => p.type === this.PAYMENT_TYPES.INITIAL);
      const resubmissionPayment = payments.find(p => p.type === this.PAYMENT_TYPES.RESUBMISSION);

      return {
        initialPaid: initialPayment?.status === this.PAYMENT_STATUS.COMPLETED,
        resubmissionPaid: resubmissionPayment?.status === this.PAYMENT_STATUS.COMPLETED,
        totalPaid: payments
          .filter(p => p.status === this.PAYMENT_STATUS.COMPLETED)
          .reduce((sum, p) => sum + p.amount, 0),
        pendingPayments: payments.filter(p => p.status === this.PAYMENT_STATUS.PENDING),
        completedPayments: payments.filter(p => p.status === this.PAYMENT_STATUS.COMPLETED),
      };
    } catch (error) {
      logger.error('[PaymentService] Get payment status error:', error);
      throw error;
    }
  }

  /**
   * Handle application rejection (check if 3rd rejection payment needed)
   * @param {string} applicationId - Application ID
   * @param {string} farmerId - Farmer user ID
   * @param {number} submissionCount - Current submission count
   * @returns {Promise<Object|null>} Payment if created, null if not needed
   */
  async handleApplicationRejection(applicationId, farmerId, submissionCount) {
    try {
      logger.info(
        `[PaymentService] Handling rejection for ${applicationId} (count: ${submissionCount})`,
      );

      // Check if 3rd rejection or more
      if (submissionCount >= this.SUBMISSION_THRESHOLD) {
        const paymentRequired = await this.isResubmissionPaymentRequired(
          applicationId,
          submissionCount,
        );

        if (paymentRequired) {
          // Create resubmission payment
          return await this.createPayment({
            applicationId,
            farmerId,
            type: this.PAYMENT_TYPES.RESUBMISSION,
            submissionCount,
          });
        }
      }

      return null;
    } catch (error) {
      logger.error('[PaymentService] Handle rejection error:', error);
      throw error;
    }
  }

  /**
   * Get all payments for a farmer
   * @param {string} farmerId - Farmer user ID
   * @returns {Promise<Array>} List of payments
   */
  async getFarmerPayments(farmerId) {
    try {
      return await this.paymentRepository.findByFarmer(farmerId);
    } catch (error) {
      logger.error('[PaymentService] Get farmer payments error:', error);
      throw error;
    }
  }

  /**
   * Cancel a pending payment
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Updated payment
   */
  async cancelPayment(paymentId) {
    try {
      logger.info(`[PaymentService] Cancelling payment ${paymentId}`);

      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
      }

      if (payment.status !== this.PAYMENT_STATUS.PENDING) {
        throw new Error(`Cannot cancel payment with status: ${payment.status}`);
      }

      const updatedPayment = await this.paymentRepository.update(paymentId, {
        status: this.PAYMENT_STATUS.CANCELLED,
        updatedAt: new Date(),
      });

      this.emit('payment:cancelled', { payment: updatedPayment });

      return updatedPayment;
    } catch (error) {
      logger.error('[PaymentService] Cancel payment error:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Payment statistics
   */
  async getPaymentStatistics(filters = {}) {
    try {
      const stats = await this.paymentRepository.getStatistics(filters);
      return {
        totalPayments: stats.total,
        completedPayments: stats.completed,
        pendingPayments: stats.pending,
        failedPayments: stats.failed,
        totalAmount: stats.totalAmount,
        averageAmount: stats.total > 0 ? stats.totalAmount / stats.total : 0,
        completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      };
    } catch (error) {
      logger.error('[PaymentService] Get statistics error:', error);
      throw error;
    }
  }
}

module.exports = PaymentService;
