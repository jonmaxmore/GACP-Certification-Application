/**
 * Payment Service - Core Business Logic
 *
 * Comprehensive payment management service for the GACP platform.
 * Handles PromptPay integration, fee calculation, webhook processing,
 * and payment lifecycle management with clear business rules.
 *
 * Business Process Flow:
 * 1. Fee Calculation → Validation → Payment Initiation
 * 2. PromptPay QR Generation → Customer Payment → Bank Notification
 * 3. Webhook Processing → Payment Verification → Status Update
 * 4. Receipt Generation → Application Update → Audit Logging
 *
 * Key Business Rules:
 * - Base certification fee: 5,000 THB
 * - Inspection fee: 2,000 THB per visit
 * - Expedited processing: +50% surcharge
 * - VAT: 7% on all fees
 * - Payment expiry: 15 minutes for PromptPay
 * - Maximum retry attempts: 3 times
 * - Refund window: 30 days from payment date
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const Payment = require('../domain/entities/Payment');
const crypto = require('crypto');
const QRCode = require('qrcode');

class PaymentService {
  constructor(dependencies = {}) {
    this.paymentRepository = dependencies.paymentRepository;
    this.applicationRepository = dependencies.applicationRepository;
    this.userRepository = dependencies.userRepository;
    this.auditService = dependencies.auditService;
    this.notificationService = dependencies.notificationService;
    this.promptPayGateway = dependencies.promptPayGateway;
    this.receiptService = dependencies.receiptService;

    // Payment configuration
    this.config = {
      fees: {
        CERTIFICATION_FEE: 5000, // ค่าธรรมเนียมการรับรอง 5,000 บาท
        INSPECTION_FEE: 2000, // ค่าธรรมเนียมการตรวจสอบ 2,000 บาท
        RENEWAL_FEE: 3000, // ค่าธรรมเนียมการต่ออายุ 3,000 บาท
        AMENDMENT_FEE: 1000, // ค่าธรรมเนียมการแก้ไข 1,000 บาท
        EXPEDITED_FEE_RATE: 0.5, // ค่าธรรมเนียมเร่งด่วน 50% ของค่าปกติ
        PROCESSING_FEE: 100, // ค่าธรรมเนียมการประมวลผล 100 บาท
        VAT_RATE: 0.07, // อัตรา VAT 7%
      },
      limits: {
        maxRetryAttempts: 3,
        paymentExpiryMinutes: 15,
        refundWindowDays: 30,
      },
    };

    logger.info('[PaymentService] Initialized successfully');
  }

  /**
   * Calculate fees for an application based on type and requirements
   * Business Logic: Different application types have different fee structures
   *
   * @param {string} applicationType - Type of application
   * @param {Object} options - Additional options for fee calculation
   * @returns {Object} Fee breakdown with detailed calculation
   */
  async calculateApplicationFees(applicationType, options = {}) {
    try {
      const {
        isExpedited = false,
        requiresInspection = true,
        promoCode = null,
        applicationId = null,
      } = options;

      console.log(`[PaymentService] Calculating fees for ${applicationType}`, {
        isExpedited,
        requiresInspection,
        promoCode,
      });

      // Base fee calculation based on application type
      let baseFee = 0;
      let paymentType = '';

      switch (applicationType) {
        case 'NEW_CERTIFICATION':
          baseFee = this.config.fees.CERTIFICATION_FEE;
          paymentType = 'CERTIFICATION_FEE';
          break;
        case 'RENEWAL':
          baseFee = this.config.fees.RENEWAL_FEE;
          paymentType = 'RENEWAL_FEE';
          break;
        case 'AMENDMENT':
          baseFee = this.config.fees.AMENDMENT_FEE;
          paymentType = 'AMENDMENT_FEE';
          break;
        default:
          throw new Error(`Unknown application type: ${applicationType}`);
      }

      // Add inspection fee if required
      let inspectionFee = 0;
      if (requiresInspection) {
        inspectionFee = this.config.fees.INSPECTION_FEE;
      }

      // Processing fee
      const processingFee = this.config.fees.PROCESSING_FEE;

      // Calculate expedited fee (50% surcharge on base + inspection fees)
      let expeditedFee = 0;
      if (isExpedited) {
        expeditedFee = (baseFee + inspectionFee) * this.config.fees.EXPEDITED_FEE_RATE;
      }

      // Apply promotional discount
      let discountAmount = 0;
      if (promoCode) {
        discountAmount = await this._calculatePromoDiscount(promoCode, baseFee + inspectionFee);
      }

      // Calculate subtotal and VAT
      const subtotal = baseFee + inspectionFee + processingFee + expeditedFee - discountAmount;
      const vatAmount = subtotal * this.config.fees.VAT_RATE;
      const totalAmount = subtotal + vatAmount;

      const feeBreakdown = {
        baseFee: Math.round(baseFee * 100) / 100,
        inspectionFee: Math.round(inspectionFee * 100) / 100,
        processingFee: Math.round(processingFee * 100) / 100,
        expeditedFee: Math.round(expeditedFee * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        currency: 'THB',
        paymentType,
        calculatedAt: new Date(),
        calculationVersion: '1.0',
      };

      // Log fee calculation for audit
      if (this.auditService) {
        await this.auditService.log({
          type: 'FEE_CALCULATED',
          applicationId,
          applicationType,
          feeBreakdown,
          options,
          timestamp: new Date(),
        });
      }

      logger.info('[PaymentService] Fee calculation completed:', feeBreakdown);
      return {
        success: true,
        feeBreakdown,
        expiryMinutes: this.config.limits.paymentExpiryMinutes,
      };
    } catch (error) {
      logger.error('[PaymentService] Fee calculation error:', error);
      throw new Error(`Failed to calculate fees: ${error.message}`);
    }
  }

  /**
   * Initiate payment process with PromptPay integration
   * Business Logic: Creates payment record and generates PromptPay QR code
   *
   * @param {Object} paymentRequest - Payment initiation details
   * @param {string} userId - User ID making the payment
   * @returns {Object} Payment details with QR code
   */
  async initiatePayment(paymentRequest, userId) {
    try {
      const { applicationId, paymentType, amount, feeBreakdown, metadata = {} } = paymentRequest;

      console.log(`[PaymentService] Initiating payment for application ${applicationId}`, {
        paymentType,
        amount,
        userId,
      });

      // Validate application exists and belongs to user
      const application = await this._validateApplicationForPayment(applicationId, userId);

      // Check if there's already a pending payment
      const existingPayment = await Payment.findOne({
        applicationId,
        status: 'PENDING',
        expiresAt: { $gt: new Date() },
      });

      if (existingPayment) {
        return {
          success: true,
          payment: existingPayment,
          message: 'Using existing pending payment',
        };
      }

      // Create payment record
      const paymentData = {
        applicationId,
        userId,
        paymentType,
        amount,
        currency: 'THB',
        status: 'PENDING',
        feeBreakdown,
        metadata: {
          ...metadata,
          applicationStatus: application.status,
          initiatedAt: new Date(),
        },
        expiresAt: new Date(Date.now() + this.config.limits.paymentExpiryMinutes * 60 * 1000),
      };

      const payment = new Payment(paymentData);

      // Generate PromptPay QR code
      const promptPayData = await this._generatePromptPayQR(payment);
      payment.promptPay = promptPayData;

      // Add initial payment attempt
      await payment.addPaymentAttempt('PENDING');

      // Save payment
      await payment.save();

      // Log payment initiation
      if (this.auditService) {
        await this.auditService.log({
          type: 'PAYMENT_INITIATED',
          paymentId: payment.paymentId,
          applicationId,
          userId,
          amount,
          timestamp: new Date(),
        });
      }

      // Send notification to user
      if (this.notificationService) {
        await this.notificationService.sendPaymentInitiated({
          userId,
          payment,
          qrCodeData: promptPayData,
        });
      }

      logger.info(`[PaymentService] Payment initiated successfully: ${payment.paymentId}`);

      return {
        success: true,
        payment: {
          paymentId: payment.paymentId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          expiresAt: payment.expiresAt,
          promptPay: {
            qrCode: payment.promptPay.qrCode,
            qrCodeImage: payment.promptPay.qrCodeImage,
            referenceNumber: payment.promptPay.referenceNumber,
            expiryDate: payment.promptPay.expiryDate,
          },
          feeBreakdown: payment.feeBreakdown,
        },
      };
    } catch (error) {
      logger.error('[PaymentService] Payment initiation error:', error);
      throw new Error(`Failed to initiate payment: ${error.message}`);
    }
  }

  /**
   * Process payment webhook from PromptPay gateway
   * Business Logic: Verifies webhook authenticity and updates payment status
   *
   * @param {Object} webhookData - Webhook payload from payment gateway
   * @returns {Object} Processing result
   */
  async processPaymentWebhook(webhookData) {
    try {
      const { paymentId, referenceNumber, status, transactionId, amount, _timestamp, signature } =
        webhookData;

      console.log(`[PaymentService] Processing webhook for payment ${paymentId}`, {
        status,
        transactionId,
        amount,
      });

      // Verify webhook signature for security
      const isValidSignature = await this._verifyWebhookSignature(webhookData, signature);
      if (!isValidSignature) {
        throw new Error('Invalid webhook signature');
      }

      // Find payment by ID or reference number
      const payment = await Payment.findOne({
        $or: [{ paymentId }, { 'promptPay.referenceNumber': referenceNumber }],
      });

      if (!payment) {
        throw new Error(`Payment not found: ${paymentId || referenceNumber}`);
      }

      // Verify amount matches
      if (Math.abs(payment.amount - amount) > 0.01) {
        throw new Error(`Amount mismatch: expected ${payment.amount}, received ${amount}`);
      }

      // Process based on webhook status
      let updateResult;
      switch (status.toLowerCase()) {
        case 'success':
        case 'completed':
          updateResult = await this._processSuccessfulPayment(payment, webhookData);
          break;
        case 'failed':
        case 'error':
          updateResult = await this._processFailedPayment(payment, webhookData);
          break;
        case 'expired':
          updateResult = await this._processExpiredPayment(payment);
          break;
        default:
          throw new Error(`Unknown webhook status: ${status}`);
      }

      // Log webhook processing
      if (this.auditService) {
        await this.auditService.log({
          type: 'WEBHOOK_PROCESSED',
          paymentId: payment.paymentId,
          webhookStatus: status,
          transactionId,
          timestamp: new Date(),
        });
      }

      return {
        success: true,
        paymentId: payment.paymentId,
        status: payment.status,
        message: updateResult.message,
      };
    } catch (error) {
      logger.error('[PaymentService] Webhook processing error:', error);

      // Log webhook error for investigation
      if (this.auditService) {
        await this.auditService.log({
          type: 'WEBHOOK_ERROR',
          error: error.message,
          webhookData,
          timestamp: new Date(),
        });
      }

      throw error;
    }
  }

  /**
   * Get payment status and details
   * Business Logic: Returns payment information with security checks
   *
   * @param {string} paymentId - Payment ID to retrieve
   * @param {string} userId - User requesting the information
   * @returns {Object} Payment details
   */
  async getPaymentStatus(paymentId, userId) {
    try {
      const payment = await Payment.findOne({ paymentId }).populate('applicationId');

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Verify user has access to this payment
      if (payment.userId.toString() !== userId) {
        throw new Error('Access denied: Payment belongs to different user');
      }

      return {
        success: true,
        payment: {
          paymentId: payment.paymentId,
          applicationId: payment.applicationId._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentType: payment.paymentType,
          createdAt: payment.createdAt,
          paidAt: payment.paidAt,
          expiresAt: payment.expiresAt,
          isExpired: payment.isExpired,
          canRetry: payment.canRetry,
          feeBreakdown: payment.feeBreakdown,
          receipt: payment.receipt,
          lastAttempt: payment.paymentAttempts[payment.paymentAttempts.length - 1],
        },
      };
    } catch (error) {
      logger.error('[PaymentService] Get payment status error:', error);
      throw error;
    }
  }

  /**
   * Process refund request
   * Business Logic: Validates refund eligibility and processes refund
   *
   * @param {string} paymentId - Payment to refund
   * @param {Object} refundRequest - Refund details
   * @param {string} adminUserId - Admin user processing refund
   * @returns {Object} Refund result
   */
  async processRefund(paymentId, refundRequest, adminUserId) {
    try {
      const { reason, amount, notes } = refundRequest;

      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Validate refund eligibility
      if (payment.status !== 'COMPLETED') {
        throw new Error('Can only refund completed payments');
      }

      if (payment.refund.refundDate) {
        throw new Error('Payment has already been refunded');
      }

      // Check refund window
      const refundWindowMs = this.config.limits.refundWindowDays * 24 * 60 * 60 * 1000;
      if (Date.now() - payment.paidAt.getTime() > refundWindowMs) {
        throw new Error('Refund window has expired');
      }

      // Validate refund amount
      const refundAmount = amount || payment.amount;
      if (refundAmount > payment.amount) {
        throw new Error('Refund amount cannot exceed payment amount');
      }

      // Process refund
      payment.refund = {
        refundReason: reason,
        refundAmount,
        refundDate: new Date(),
        refundMethod: 'BANK_TRANSFER',
        refundApprovedBy: adminUserId,
        refundNotes: notes,
      };

      payment.status = refundAmount === payment.amount ? 'REFUNDED' : 'PARTIAL_REFUNDED';
      await payment.save();

      // Log refund
      if (this.auditService) {
        await this.auditService.log({
          type: 'REFUND_PROCESSED',
          paymentId,
          refundAmount,
          reason,
          adminUserId,
          timestamp: new Date(),
        });
      }

      // Send notification
      if (this.notificationService) {
        await this.notificationService.sendRefundNotification({
          userId: payment.userId,
          payment,
          refundAmount,
        });
      }

      return {
        success: true,
        refundAmount,
        refundDate: payment.refund.refundDate,
        message: 'Refund processed successfully',
      };
    } catch (error) {
      logger.error('[PaymentService] Refund processing error:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Generate PromptPay QR code data
   * @private
   */
  async _generatePromptPayQR(payment) {
    try {
      const referenceNumber = `GACP${payment.paymentId.slice(-8)}`;

      // PromptPay payload structure (simplified)
      const promptPayData = {
        merchantId: process.env.PROMPTPAY_MERCHANT_ID || '0123456789012',
        amount: payment.amount,
        referenceNumber,
        expiryDate: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      };

      // Generate QR code string (EMV format for PromptPay)
      const qrString = this._buildPromptPayQRString(promptPayData);

      // Generate QR code image
      const qrCodeImage = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return {
        qrCode: qrString,
        qrCodeImage,
        referenceNumber,
        expiryDate: promptPayData.expiryDate,
        paymentMethod: 'QR_CODE',
      };
    } catch (error) {
      logger.error('[PaymentService] QR generation error:', error);
      throw new Error(`Failed to generate PromptPay QR: ${error.message}`);
    }
  }

  /**
   * Build PromptPay QR string in EMV format
   * @private
   */
  _buildPromptPayQRString(data) {
    // Simplified PromptPay QR string generation
    // In production, use proper EMV QR code library
    const { merchantId, _amount, referenceNumber } = data;

    return `00020101021229370016A000000677010112${merchantId.padStart(13, '0')}53037645802TH5909GACP DTAM6007Bangkok62${referenceNumber.length.toString().padStart(2, '0')}${referenceNumber}6304`;
  }

  /**
   * Validate application for payment
   * @private
   */
  async _validateApplicationForPayment(applicationId, userId) {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.userId.toString() !== userId) {
      throw new Error('Access denied: Application belongs to different user');
    }

    if (!['PENDING_PAYMENT', 'PAYMENT_REQUIRED'].includes(application.status)) {
      throw new Error('Application is not in a payable state');
    }

    return application;
  }

  /**
   * Process successful payment
   * @private
   */
  async _processSuccessfulPayment(payment, webhookData) {
    const { transactionId, timestamp } = webhookData;

    // Update payment status
    await payment.markAsCompleted({
      bankTransactionId: transactionId,
      transactionTime: new Date(timestamp),
    });

    // Generate receipt
    if (this.receiptService) {
      const receiptUrl = await this.receiptService.generateReceipt(payment);
      payment.receipt.receiptUrl = receiptUrl;
      await payment.save();
    }

    // Update application status
    if (this.applicationRepository) {
      await this.applicationRepository.updateStatus(payment.applicationId, 'PAYMENT_COMPLETED');
    }

    // Send success notification
    if (this.notificationService) {
      await this.notificationService.sendPaymentSuccess({
        userId: payment.userId,
        payment,
      });
    }

    return { message: 'Payment completed successfully' };
  }

  /**
   * Process failed payment
   * @private
   */
  async _processFailedPayment(payment, webhookData) {
    const { errorCode, errorMessage } = webhookData;

    await payment.markAsFailed(errorCode, errorMessage);

    // Check if retry is possible
    if (payment.canRetry) {
      // Send retry notification
      if (this.notificationService) {
        await this.notificationService.sendPaymentRetryAvailable({
          userId: payment.userId,
          payment,
        });
      }
    }

    return { message: 'Payment failed, retry available' };
  }

  /**
   * Process expired payment
   * @private
   */
  async _processExpiredPayment(payment) {
    payment.status = 'EXPIRED';
    await payment.save();

    if (this.notificationService) {
      await this.notificationService.sendPaymentExpired({
        userId: payment.userId,
        payment,
      });
    }

    return { message: 'Payment expired' };
  }

  /**
   * Verify webhook signature
   * @private
   */
  async _verifyWebhookSignature(data, signature) {
    const secret = process.env.PROMPTPAY_WEBHOOK_SECRET || 'default-secret';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(data))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex'),
    );
  }

  /**
   * Calculate promotional discount
   * @private
   */
  async _calculatePromoDiscount(promoCode, baseAmount) {
    // Simplified promo code logic
    const promoCodes = {
      WELCOME10: 0.1, // 10% discount
      EARLY50: 50, // 50 THB discount
      RENEWAL20: 0.2, // 20% discount for renewals
    };

    const discount = promoCodes[promoCode];
    if (!discount) {
      return 0;
    }

    if (discount < 1) {
      // Percentage discount
      return baseAmount * discount;
    } else {
      // Fixed amount discount
      return Math.min(discount, baseAmount);
    }
  }

  /**
   * Health check for payment service
   */
  async healthCheck() {
    try {
      // Check database connectivity
      const pendingPayments = await Payment.countDocuments({ status: 'PENDING' });

      return {
        status: 'healthy',
        database: 'connected',
        pendingPayments,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = PaymentService;
