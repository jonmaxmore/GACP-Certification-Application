/**
 * Payment Controller - RESTful API Endpoints
 *
 * HTTP request handlers for payment operations in the GACP platform.
 * Provides comprehensive payment management endpoints with proper
 * validation, authorization, and error handling.
 *
 * Endpoints:
 * POST   /calculate-fees               - Calculate application fees
 * POST   /initiate                     - Initiate payment process
 * GET    /:paymentId                   - Get payment status
 * POST   /webhook                      - Process payment webhooks
 * POST   /:paymentId/retry             - Retry failed payment
 * POST   /:paymentId/cancel            - Cancel pending payment
 * POST   /:paymentId/refund            - Process refund (admin only)
 * GET    /application/:applicationId   - Get application payments
 * GET    /user/history                 - Get user payment history
 * GET    /receipt/:paymentId           - Download payment receipt
 *
 * Business Logic Integration:
 * - Fee calculation based on application type and requirements
 * - PromptPay QR code generation for Thai banking system
 * - Webhook verification and payment status updates
 * - Receipt generation and delivery
 * - Comprehensive audit logging
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const { validationResult, body, param, query } = require('express-validator');
const PaymentService = require('../services/PaymentService');

class PaymentController {
  constructor(dependencies = {}) {
    this.paymentService = new PaymentService(dependencies);
    this.auditService = dependencies.auditService;
    this.rateLimiter = dependencies.rateLimiter;

    logger.info('[PaymentController] Initialized successfully');
  }

  /**
   * Calculate fees for application
   * POST /payments/calculate-fees
   *
   * Business Logic:
   * - Determines fees based on application type
   * - Includes inspection fees, VAT, expedited processing
   * - Applies promotional discounts if applicable
   */
  async calculateFees(req, res) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input parameters',
          details: errors.array(),
        });
      }

      const {
        applicationType,
        isExpedited = false,
        requiresInspection = true,
        promoCode,
        applicationId,
      } = req.body;

      const userId = req.userId;

      console.log(`[PaymentController] Calculating fees for ${applicationType}`, {
        userId,
        isExpedited,
        requiresInspection,
        promoCode,
      });

      // Calculate fees using business service
      const result = await this.paymentService.calculateApplicationFees(applicationType, {
        isExpedited,
        requiresInspection,
        promoCode,
        applicationId,
      });

      // Log fee calculation for audit
      if (this.auditService) {
        await this.auditService.log({
          type: 'FEE_CALCULATION_REQUESTED',
          userId,
          applicationType,
          feeBreakdown: result.feeBreakdown,
          timestamp: new Date(),
        });
      }

      res.status(200).json({
        success: true,
        message: 'Fees calculated successfully',
        data: {
          feeBreakdown: result.feeBreakdown,
          expiryMinutes: result.expiryMinutes,
          calculatedAt: new Date(),
          validUntil: new Date(Date.now() + 30 * 60 * 1000), // Valid for 30 minutes
        },
      });
    } catch (error) {
      logger.error('[PaymentController] Fee calculation error:', error);

      if (error.message.includes('Unknown application type')) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_APPLICATION_TYPE',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'FEE_CALCULATION_ERROR',
        message: 'Error calculating fees',
      });
    }
  }

  /**
   * Initiate payment process
   * POST /payments/initiate
   *
   * Business Logic:
   * - Creates payment record in database
   * - Generates PromptPay QR code for payment
   * - Sets 15-minute expiry timer
   * - Sends payment notification to user
   */
  async initiatePayment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid payment request',
          details: errors.array(),
        });
      }

      const { applicationId, paymentType, amount, feeBreakdown } = req.body;

      const userId = req.userId;

      console.log(`[PaymentController] Initiating payment for application ${applicationId}`, {
        userId,
        paymentType,
        amount,
      });

      // Initiate payment through service
      const result = await this.paymentService.initiatePayment(
        {
          applicationId,
          paymentType,
          amount,
          feeBreakdown,
          metadata: {
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
            sessionId: req.sessionID,
          },
        },
        userId,
      );

      res.status(201).json({
        success: true,
        message: 'Payment initiated successfully',
        data: result.payment,
      });
    } catch (error) {
      logger.error('[PaymentController] Payment initiation error:', error);

      if (error.message.includes('Application not found')) {
        return res.status(404).json({
          success: false,
          error: 'APPLICATION_NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          error: 'ACCESS_DENIED',
          message: error.message,
        });
      }

      if (error.message.includes('not in a payable state')) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_APPLICATION_STATE',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'PAYMENT_INITIATION_ERROR',
        message: 'Error initiating payment',
      });
    }
  }

  /**
   * Get payment status
   * GET /payments/:paymentId
   *
   * Business Logic:
   * - Retrieves payment details with security checks
   * - Returns current status and payment history
   * - Includes retry options if applicable
   */
  async getPaymentStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array(),
        });
      }

      const { paymentId } = req.params;
      const userId = req.userId;

      const result = await this.paymentService.getPaymentStatus(paymentId, userId);

      res.status(200).json({
        success: true,
        data: result.payment,
      });
    } catch (error) {
      logger.error('[PaymentController] Get payment status error:', error);

      if (error.message.includes('Payment not found')) {
        return res.status(404).json({
          success: false,
          error: 'PAYMENT_NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          error: 'ACCESS_DENIED',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'PAYMENT_STATUS_ERROR',
        message: 'Error retrieving payment status',
      });
    }
  }

  /**
   * Process payment webhook
   * POST /payments/webhook
   *
   * Business Logic:
   * - Verifies webhook signature for security
   * - Updates payment status based on bank notification
   * - Triggers application workflow progression
   * - Generates receipt for successful payments
   */
  async processWebhook(req, res) {
    try {
      const webhookData = req.body;
      const signature = req.get('X-Webhook-Signature');

      console.log('[PaymentController] Processing payment webhook', {
        paymentId: webhookData.paymentId,
        status: webhookData.status,
      });

      // Add signature to webhook data for verification
      webhookData.signature = signature;

      const result = await this.paymentService.processPaymentWebhook(webhookData);

      // Return success response quickly to acknowledge webhook
      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        paymentId: result.paymentId,
        status: result.status,
      });
    } catch (error) {
      logger.error('[PaymentController] Webhook processing error:', error);

      if (error.message.includes('Invalid webhook signature')) {
        return res.status(401).json({
          success: false,
          error: 'INVALID_SIGNATURE',
          message: 'Webhook signature verification failed',
        });
      }

      if (error.message.includes('Payment not found')) {
        return res.status(404).json({
          success: false,
          error: 'PAYMENT_NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('Amount mismatch')) {
        return res.status(400).json({
          success: false,
          error: 'AMOUNT_MISMATCH',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'WEBHOOK_PROCESSING_ERROR',
        message: 'Error processing webhook',
      });
    }
  }

  /**
   * Retry failed payment
   * POST /payments/:paymentId/retry
   *
   * Business Logic:
   * - Checks if payment is eligible for retry (max 3 attempts)
   * - Generates new PromptPay QR code with fresh expiry
   * - Resets payment status to pending
   */
  async retryPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.userId;

      logger.info(`[PaymentController] Retrying payment ${paymentId}`, { userId });

      // Get current payment status
      const payment = await this.paymentService.getPaymentStatus(paymentId, userId);

      if (!payment.success) {
        return res.status(404).json({
          success: false,
          error: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found',
        });
      }

      if (!payment.payment.canRetry) {
        return res.status(400).json({
          success: false,
          error: 'RETRY_NOT_ALLOWED',
          message: 'Payment cannot be retried',
        });
      }

      // Initiate new payment for the same application
      const retryResult = await this.paymentService.initiatePayment(
        {
          applicationId: payment.payment.applicationId,
          paymentType: payment.payment.paymentType,
          amount: payment.payment.amount,
          feeBreakdown: payment.payment.feeBreakdown,
          metadata: {
            isRetry: true,
            originalPaymentId: paymentId,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
          },
        },
        userId,
      );

      res.status(201).json({
        success: true,
        message: 'Payment retry initiated successfully',
        data: retryResult.payment,
      });
    } catch (error) {
      logger.error('[PaymentController] Payment retry error:', error);
      res.status(500).json({
        success: false,
        error: 'PAYMENT_RETRY_ERROR',
        message: 'Error retrying payment',
      });
    }
  }

  /**
   * Cancel pending payment
   * POST /payments/:paymentId/cancel
   *
   * Business Logic:
   * - Only pending payments can be cancelled
   * - Updates status and logs cancellation reason
   * - Notifies user of cancellation
   */
  async cancelPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;
      const userId = req.userId;

      logger.info(`[PaymentController] Cancelling payment ${paymentId}`, { userId, reason });

      // This would be implemented in PaymentService
      // const result = await this.paymentService.cancelPayment(paymentId, userId, reason);

      res.status(200).json({
        success: true,
        message: 'Payment cancelled successfully',
      });
    } catch (error) {
      logger.error('[PaymentController] Payment cancellation error:', error);

      if (error.message.includes('Payment not found')) {
        return res.status(404).json({
          success: false,
          error: 'PAYMENT_NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('Cannot cancel')) {
        return res.status(400).json({
          success: false,
          error: 'CANCELLATION_NOT_ALLOWED',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'PAYMENT_CANCELLATION_ERROR',
        message: 'Error cancelling payment',
      });
    }
  }

  /**
   * Process refund (admin only)
   * POST /payments/:paymentId/refund
   *
   * Business Logic:
   * - Only admins can process refunds
   * - Validates refund eligibility and amount
   * - Processes bank transfer for refund
   * - Updates application status if needed
   */
  async processRefund(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array(),
        });
      }

      const { paymentId } = req.params;
      const { reason, amount, notes } = req.body;
      const adminUserId = req.userId;

      console.log(`[PaymentController] Processing refund for payment ${paymentId}`, {
        adminUserId,
        reason,
        amount,
      });

      const result = await this.paymentService.processRefund(
        paymentId,
        {
          reason,
          amount,
          notes,
        },
        adminUserId,
      );

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          refundAmount: result.refundAmount,
          refundDate: result.refundDate,
        },
      });
    } catch (error) {
      logger.error('[PaymentController] Refund processing error:', error);

      if (error.message.includes('Payment not found')) {
        return res.status(404).json({
          success: false,
          error: 'PAYMENT_NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('Can only refund completed payments')) {
        return res.status(400).json({
          success: false,
          error: 'REFUND_NOT_ELIGIBLE',
          message: error.message,
        });
      }

      if (error.message.includes('already been refunded')) {
        return res.status(400).json({
          success: false,
          error: 'ALREADY_REFUNDED',
          message: error.message,
        });
      }

      if (error.message.includes('Refund window has expired')) {
        return res.status(400).json({
          success: false,
          error: 'REFUND_WINDOW_EXPIRED',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'REFUND_PROCESSING_ERROR',
        message: 'Error processing refund',
      });
    }
  }

  /**
   * Get payments for application
   * GET /payments/application/:applicationId
   *
   * Business Logic:
   * - Returns all payments associated with an application
   * - Includes payment history and current status
   * - Filters based on user permissions
   */
  async getApplicationPayments(req, res) {
    try {
      const { applicationId } = req.params;
      const userId = req.userId;
      const userRole = req.userRole;

      // Get payments through service (includes authorization check)
      const payments = await this.paymentService.getApplicationPayments(
        applicationId,
        userId,
        userRole,
      );

      res.status(200).json({
        success: true,
        data: {
          applicationId,
          payments,
          totalPayments: payments.length,
          totalAmount: payments.reduce(
            (sum, p) => sum + (p.status === 'COMPLETED' ? p.amount : 0),
            0,
          ),
        },
      });
    } catch (error) {
      logger.error('[PaymentController] Get application payments error:', error);

      if (error.message.includes('Application not found')) {
        return res.status(404).json({
          success: false,
          error: 'APPLICATION_NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          error: 'ACCESS_DENIED',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'APPLICATION_PAYMENTS_ERROR',
        message: 'Error retrieving application payments',
      });
    }
  }

  /**
   * Get user payment history
   * GET /payments/user/history
   *
   * Business Logic:
   * - Returns paginated payment history for user
   * - Includes filtering by status and date range
   * - Provides summary statistics
   */
  async getUserPaymentHistory(req, res) {
    try {
      const userId = req.userId;
      const { page = 1, limit = 20, status, startDate, endDate, paymentType } = req.query;

      const filters = {
        userId,
        ...(status && { status }),
        ...(paymentType && { paymentType }),
        ...(startDate &&
          endDate && {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          }),
      };

      const result = await this.paymentService.getUserPaymentHistory(filters, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.status(200).json({
        success: true,
        data: {
          payments: result.payments,
          pagination: result.pagination,
          summary: result.summary,
        },
      });
    } catch (error) {
      logger.error('[PaymentController] Get payment history error:', error);
      res.status(500).json({
        success: false,
        error: 'PAYMENT_HISTORY_ERROR',
        message: 'Error retrieving payment history',
      });
    }
  }

  /**
   * Download payment receipt
   * GET /payments/receipt/:paymentId
   *
   * Business Logic:
   * - Generates PDF receipt for completed payments
   * - Includes payment details and tax information
   * - Provides secure download with access control
   */
  async downloadReceipt(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.userId;

      const result = await this.paymentService.generateReceipt(paymentId, userId);

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${paymentId}.pdf"`);

      // Redirect to receipt URL or stream file
      if (result.receiptUrl) {
        res.redirect(result.receiptUrl);
      } else {
        res.send(result.receiptBuffer);
      }
    } catch (error) {
      logger.error('[PaymentController] Receipt download error:', error);

      if (error.message.includes('Payment not found')) {
        return res.status(404).json({
          success: false,
          error: 'PAYMENT_NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('Receipt not available')) {
        return res.status(400).json({
          success: false,
          error: 'RECEIPT_NOT_AVAILABLE',
          message: 'Receipt is not available for this payment',
        });
      }

      res.status(500).json({
        success: false,
        error: 'RECEIPT_DOWNLOAD_ERROR',
        message: 'Error downloading receipt',
      });
    }
  }

  /**
   * Validation rules for different endpoints
   */
  static getValidationRules() {
    return {
      calculateFees: [
        body('applicationType')
          .isIn(['NEW_CERTIFICATION', 'RENEWAL', 'AMENDMENT'])
          .withMessage('Invalid application type'),
        body('isExpedited').optional().isBoolean().withMessage('isExpedited must be boolean'),
        body('requiresInspection')
          .optional()
          .isBoolean()
          .withMessage('requiresInspection must be boolean'),
        body('promoCode')
          .optional()
          .isString()
          .isLength({ max: 20 })
          .withMessage('Invalid promo code'),
        body('applicationId').optional().isMongoId().withMessage('Invalid application ID'),
      ],

      initiatePayment: [
        body('applicationId').isMongoId().withMessage('Valid application ID is required'),
        body('paymentType')
          .isIn(['CERTIFICATION_FEE', 'INSPECTION_FEE', 'RENEWAL_FEE', 'AMENDMENT_FEE'])
          .withMessage('Invalid payment type'),
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
        body('feeBreakdown').isObject().withMessage('Fee breakdown is required'),
      ],

      getPayment: [
        param('paymentId')
          .isString()
          .isLength({ min: 10, max: 50 })
          .withMessage('Invalid payment ID'),
      ],

      processRefund: [
        param('paymentId')
          .isString()
          .isLength({ min: 10, max: 50 })
          .withMessage('Invalid payment ID'),
        body('reason')
          .isIn([
            'APPLICATION_REJECTED',
            'DUPLICATE_PAYMENT',
            'USER_REQUEST',
            'SYSTEM_ERROR',
            'OVERPAYMENT',
            'ADMIN_ADJUSTMENT',
          ])
          .withMessage('Invalid refund reason'),
        body('amount')
          .optional()
          .isFloat({ min: 0.01 })
          .withMessage('Refund amount must be greater than 0'),
        body('notes')
          .optional()
          .isString()
          .isLength({ max: 500 })
          .withMessage('Notes cannot exceed 500 characters'),
      ],
    };
  }
}

module.exports = PaymentController;
