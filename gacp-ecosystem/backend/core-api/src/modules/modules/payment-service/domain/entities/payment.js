/**
 * Payment Service Module - Domain Entity
 *
 * Core payment entity for the GACP platform handling certification fees,
 * PromptPay integration, and payment lifecycle management.
 *
 * Business Rules:
 * - Payments must be associated with an application
 * - PromptPay payments have 15-minute expiry window
 * - Failed payments can be retried up to 3 times
 * - Successful payments cannot be modified
 * - Refunds require admin approval
 *
 * Payment Flow:
 * 1. Payment Request → Amount Calculation → PromptPay QR Generation
 * 2. Customer Payment → Bank Notification → Webhook Verification
 * 3. Payment Confirmation → Application Status Update → Receipt Generation
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    // Core Payment Information
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    },

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Payment Details
    paymentType: {
      type: String,
      enum: [
        'CERTIFICATION_FEE', // ค่าธรรมเนียมการรับรอง
        'INSPECTION_FEE', // ค่าธรรมเนียมการตรวจสอบ
        'RENEWAL_FEE', // ค่าธรรมเนียมการต่ออายุ
        'AMENDMENT_FEE', // ค่าธรรมเนียมการแก้ไข
        'EXPEDITED_FEE', // ค่าธรรมเนียมการเร่งด่วน
        'PENALTY_FEE', // ค่าปรับ
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          // Amount must be positive and max 2 decimal places
          return value > 0 && Number.isInteger(value * 100);
        },
        message: 'Amount must be positive with maximum 2 decimal places',
      },
    },

    currency: {
      type: String,
      default: 'THB',
      enum: ['THB'],
      required: true,
    },

    // Payment Status Tracking
    status: {
      type: String,
      enum: [
        'PENDING', // รอการชำระเงิน
        'PROCESSING', // กำลังประมวลผล
        'COMPLETED', // ชำระเงินสำเร็จ
        'FAILED', // ชำระเงินไม่สำเร็จ
        'CANCELLED', // ยกเลิกการชำระเงิน
        'EXPIRED', // หมดอายุ
        'REFUNDED', // คืนเงินแล้ว
        'PARTIAL_REFUNDED', // คืนเงินบางส่วน
      ],
      default: 'PENDING',
      required: true,
      index: true,
    },

    // PromptPay Integration
    promptPay: {
      qrCode: {
        type: String,
        sparse: true, // Allows null values but ensures uniqueness when present
      },

      qrCodeImage: {
        type: String, // Base64 encoded QR code image
        sparse: true,
      },

      referenceNumber: {
        type: String,
        sparse: true,
        unique: true,
      },

      bankTransactionId: {
        type: String,
        sparse: true,
      },

      expiryDate: {
        type: Date,
        validate: {
          validator: function (value) {
            return !value || value > new Date();
          },
          message: 'Expiry date must be in the future',
        },
      },

      paymentMethod: {
        type: String,
        enum: ['QR_CODE', 'BANK_TRANSFER', 'MOBILE_BANKING'],
        default: 'QR_CODE',
      },
    },

    // Transaction Details
    transactionDetails: {
      bankCode: String, // รหัสธนาคาร
      bankName: String, // ชื่อธนาคาร
      accountNumber: String, // เลขที่บัญชี (masked)
      transactionTime: Date, // เวลาการทำธุรกรรม
      approvalCode: String, // รหัสอนุมัติ
      terminalId: String, // รหัสเครื่อง
      merchantId: String, // รหัสร้านค้า
    },

    // Fee Calculation Breakdown
    feeBreakdown: {
      baseFee: {
        type: Number,
        required: true,
        min: 0,
      },

      processingFee: {
        type: Number,
        default: 0,
        min: 0,
      },

      expeditedFee: {
        type: Number,
        default: 0,
        min: 0,
      },

      vatAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      discountAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    // Payment Attempts & Retry Logic
    paymentAttempts: [
      {
        attemptNumber: {
          type: Number,
          required: true,
        },

        attemptDate: {
          type: Date,
          default: Date.now,
        },

        status: {
          type: String,
          enum: ['PENDING', 'SUCCESS', 'FAILED'],
          required: true,
        },

        errorCode: String,
        errorMessage: String,

        responseData: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    ],

    // Webhook & Notification Tracking
    webhookEvents: [
      {
        eventType: {
          type: String,
          enum: [
            'PAYMENT_INITIATED',
            'PAYMENT_PROCESSING',
            'PAYMENT_SUCCESS',
            'PAYMENT_FAILED',
            'PAYMENT_EXPIRED',
            'REFUND_INITIATED',
            'REFUND_COMPLETED',
          ],
          required: true,
        },

        eventDate: {
          type: Date,
          default: Date.now,
        },

        eventData: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },

        webhookSource: {
          type: String,
          enum: ['PROMPTPAY_GATEWAY', 'BANK_NOTIFICATION', 'MANUAL_UPDATE'],
          required: true,
        },

        processed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Receipt & Documentation
    receipt: {
      receiptNumber: {
        type: String,
        unique: true,
        sparse: true,
      },

      receiptUrl: String, // URL to PDF receipt
      receiptGenerated: Boolean,
      receiptGeneratedAt: Date,

      taxInvoiceNumber: String,
      taxInvoiceUrl: String,
    },

    // Refund Information
    refund: {
      refundReason: {
        type: String,
        enum: [
          'APPLICATION_REJECTED',
          'DUPLICATE_PAYMENT',
          'USER_REQUEST',
          'SYSTEM_ERROR',
          'OVERPAYMENT',
          'ADMIN_ADJUSTMENT',
        ],
      },

      refundAmount: {
        type: Number,
        min: 0,
        validate: {
          validator: function (value) {
            return !value || value <= this.amount;
          },
          message: 'Refund amount cannot exceed payment amount',
        },
      },

      refundDate: Date,
      refundMethod: {
        type: String,
        enum: ['BANK_TRANSFER', 'ORIGINAL_PAYMENT_METHOD'],
      },

      refundTransactionId: String,
      refundApprovedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      refundNotes: String,
    },

    // Metadata & Audit
    metadata: {
      ipAddress: String,
      userAgent: String,
      deviceFingerprint: String,
      sessionId: String,

      // Fee calculation details
      feeCalculationVersion: {
        type: String,
        default: '1.0',
      },

      // Promotional codes or discounts applied
      promoCode: String,
      discountApplied: {
        type: Number,
        default: 0,
      },
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    paidAt: Date,

    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // TTL index for automatic cleanup
    },
  },
  {
    timestamps: true,
    collection: 'payments',
  },
);

// Indexes for Performance
PaymentSchema.index({ applicationId: 1, status: 1 });
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ paymentType: 1, status: 1 });
PaymentSchema.index({ 'promptPay.referenceNumber': 1 }, { sparse: true });
PaymentSchema.index({ 'receipt.receiptNumber': 1 }, { sparse: true });
PaymentSchema.index({ status: 1, expiresAt: 1 });

// Virtual Fields
PaymentSchema.virtual('isExpired').get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

PaymentSchema.virtual('canRetry').get(function () {
  const maxAttempts = 3;
  return this.status === 'FAILED' && this.paymentAttempts.length < maxAttempts;
});

PaymentSchema.virtual('isRefundable').get(function () {
  return this.status === 'COMPLETED' && !this.refund.refundDate;
});

PaymentSchema.virtual('formattedAmount').get(function () {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(this.amount);
});

// Business Logic Methods
PaymentSchema.methods.markAsCompleted = function (transactionDetails = {}) {
  this.status = 'COMPLETED';
  this.paidAt = new Date();
  this.transactionDetails = { ...this.transactionDetails, ...transactionDetails };
  this.updatedAt = new Date();

  // Add success webhook event
  this.webhookEvents.push({
    eventType: 'PAYMENT_SUCCESS',
    eventData: transactionDetails,
    webhookSource: 'PROMPTPAY_GATEWAY',
    processed: false,
  });

  return this.save();
};

PaymentSchema.methods.markAsFailed = function (errorCode, errorMessage) {
  this.status = 'FAILED';
  this.updatedAt = new Date();

  // Add failure webhook event
  this.webhookEvents.push({
    eventType: 'PAYMENT_FAILED',
    eventData: { errorCode, errorMessage },
    webhookSource: 'PROMPTPAY_GATEWAY',
    processed: false,
  });

  return this.save();
};

PaymentSchema.methods.addPaymentAttempt = function (status, errorData = {}) {
  const attemptNumber = this.paymentAttempts.length + 1;

  this.paymentAttempts.push({
    attemptNumber,
    status,
    errorCode: errorData.errorCode,
    errorMessage: errorData.errorMessage,
    responseData: errorData.responseData || {},
  });

  this.updatedAt = new Date();
  return this.save();
};

PaymentSchema.methods.calculateFeeBreakdown = function () {
  const baseFee = this.feeBreakdown.baseFee || 0;
  const processingFee = this.feeBreakdown.processingFee || 0;
  const expeditedFee = this.feeBreakdown.expeditedFee || 0;
  const discountAmount = this.feeBreakdown.discountAmount || 0;

  const subtotal = baseFee + processingFee + expeditedFee - discountAmount;
  const vatAmount = subtotal * 0.07; // 7% VAT
  const totalAmount = subtotal + vatAmount;

  this.feeBreakdown.vatAmount = Math.round(vatAmount * 100) / 100;
  this.feeBreakdown.totalAmount = Math.round(totalAmount * 100) / 100;
  this.amount = this.feeBreakdown.totalAmount;

  return this.feeBreakdown;
};

PaymentSchema.methods.generateReceiptNumber = function () {
  if (!this.receipt.receiptNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const sequence = this.paymentId.slice(-6);

    this.receipt.receiptNumber = `RCP${year}${month}${day}${sequence}`;
    this.receipt.receiptGenerated = true;
    this.receipt.receiptGeneratedAt = new Date();
  }

  return this.receipt.receiptNumber;
};

// Static Methods
PaymentSchema.statics.findByApplicationId = function (applicationId) {
  return this.find({ applicationId }).sort({ createdAt: -1 });
};

PaymentSchema.statics.findPendingPayments = function () {
  return this.find({
    status: 'PENDING',
    expiresAt: { $gt: new Date() },
  });
};

PaymentSchema.statics.findExpiredPayments = function () {
  return this.find({
    status: 'PENDING',
    expiresAt: { $lte: new Date() },
  });
};

PaymentSchema.statics.getPaymentStatistics = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
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
};

// Pre-save Middleware
PaymentSchema.pre('save', function (next) {
  // Update timestamp
  this.updatedAt = new Date();

  // Auto-expire pending payments after 15 minutes
  if (this.status === 'PENDING' && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  }

  // Ensure fee breakdown consistency
  if (this.feeBreakdown && this.feeBreakdown.baseFee) {
    this.calculateFeeBreakdown();
  }

  next();
});

// Post-save Middleware
PaymentSchema.post('save', function (doc) {
  // Emit events for external processing
  if (doc.status === 'COMPLETED' && doc.isModified('status')) {
    // Payment completed - trigger application status update
    logger.info(`[Payment] Payment completed: ${doc.paymentId}`);
  }

  if (doc.status === 'FAILED' && doc.isModified('status')) {
    // Payment failed - trigger retry logic or notification
    logger.info(`[Payment] Payment failed: ${doc.paymentId}`);
  }
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
