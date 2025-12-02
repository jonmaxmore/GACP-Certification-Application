/**
 * Invoice Model - GACP Platform
 * MongoDB schema for payment invoice management
 *
 * @module database/models/Invoice
 * @version 2.0.0
 * @date 2025-10-16
 *
 * @standards
 * - OpenAPI 3.0.3 specification compliance
 * - NO REFUNDS policy (all payments final)
 * - PromptPay QR (BOT v2.1)
 * - Thai tax receipt compliance
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * PromptPay Subdocument Schema
 * QR code data for PromptPay payments
 */
const PromptPaySchema = new Schema(
  {
    qrCode: {
      type: String,
      required: true,
      description: 'Base64-encoded PNG image'
    },
    qrData: {
      type: String,
      required: true,
      description: 'EMVCo QR format (BOT v2.1)'
    },
    promptPayId: {
      type: String,
      required: true,
      match: /^[0-9]{10,13}$/,
      description: 'Phone number or Thai ID'
    },
    expiresAt: {
      type: Date,
      required: true,
      description: '15 minutes from generation'
    }
  },
  { _id: false }
);

/**
 * Credit Card Subdocument Schema
 * Credit card payment metadata (via Omise)
 */
const CreditCardSchema = new Schema(
  {
    omiseChargeId: {
      type: String,
      required: true,
      description: 'Omise charge ID'
    },
    cardLastDigits: {
      type: String,
      required: true,
      match: /^[0-9]{4}$/
    },
    cardBrand: {
      type: String,
      required: true,
      enum: ['Visa', 'Mastercard', 'JCB', 'American Express']
    },
    threeDSecure: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { _id: false }
);

/**
 * Invoice Schema
 * Payment invoice records
 */
const InvoiceSchema = new Schema(
  {
    // === PRIMARY KEY ===
    _id: {
      type: Schema.Types.ObjectId,
      auto: true
    },

    // === UNIQUE IDENTIFIERS ===
    invoiceId: {
      type: String,
      required: true,
      match: /^INV-\d{4}-\d{6}$/,
      description: 'Format: INV-YYYY-NNNNNN'
    },

    invoiceNumber: { type: String, required: true, description: 'Public-facing invoice number' },

    // === ASSOCIATIONS ===
    applicationId: {
      type: String,
      required: true,
      index: true,
      ref: 'Application'
    },

    applicationNumber: {
      type: String,
      required: true,
      description: 'Denormalized for performance'
    },

    userId: {
      type: String,
      required: true,
      index: true,
      ref: 'User'
    },

    // === INVOICE TYPE ===
    invoiceType: {
      type: String,
      required: true,
      enum: ['PHASE1_FEE', 'PHASE2_FEE'],
      index: true,
      description: 'PHASE1_FEE: ฿5,000 | PHASE2_FEE: ฿25,000'
    },

    // === AMOUNT (Thai Baht) ===
    amount: {
      type: Number,
      required: true,
      min: 0,
      description: 'Base amount (before VAT if applicable)'
    },

    currency: {
      type: String,
      required: true,
      enum: ['THB'],
      default: 'THB'
    },

    // === VAT CALCULATION ===
    vatRate: {
      type: Number,
      required: true,
      default: 0.07,
      min: 0,
      max: 1,
      description: '7% VAT rate'
    },

    vatAmount: {
      type: Number,
      required: true,
      min: 0,
      description: 'Calculated VAT amount'
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      description: 'Total amount including VAT'
    },

    // === STATUS ===
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'PAID', 'EXPIRED'],
      default: 'PENDING',
      index: true,
      description: 'NO REFUNDED status (no refunds policy)'
    },

    // === PAYMENT METHOD ===
    paymentMethod: {
      type: String,
      enum: [null, 'PROMPTPAY', 'CREDIT_CARD'],
      default: null
    },

    // === PROMPTPAY DATA ===
    promptPay: {
      type: PromptPaySchema,
      default: null
    },

    // === CREDIT CARD DATA ===
    creditCard: {
      type: CreditCardSchema,
      default: null
    },

    // === PAYMENT CONFIRMATION ===
    paidAt: {
      type: Date,
      default: null,
      index: true
    },

    paymentConfirmedBy: {
      type: String,
      default: null,
      description: 'userId who confirmed payment'
    },

    paymentConfirmationNotes: {
      type: String,
      maxlength: 500,
      default: null
    },

    // === THAI TAX RECEIPT ===
    receiptNumber: {
      type: String,
      default: null
    },

    receiptIssuedAt: {
      type: Date,
      default: null
    },

    receiptS3Key: {
      type: String,
      default: null,
      description: 'S3 key for PDF receipt'
    },

    receiptUrl: {
      type: String,
      default: null,
      description: 'Public URL for receipt download'
    },

    // === EXPIRY ===
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      description: '7 days from creation'
    },

    // === TIMESTAMPS ===
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true
    },

    updatedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'invoices',
    versionKey: false
  }
);

// ========================================
// INDEXES
// ========================================

InvoiceSchema.index({ invoiceId: 1 }, { unique: true });
InvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ applicationId: 1, invoiceType: 1 });
InvoiceSchema.index({ userId: 1, status: 1 });
InvoiceSchema.index({ status: 1, expiresAt: 1 });

// Partial index (pending payments only)
InvoiceSchema.index(
  { expiresAt: 1 },
  {
    partialFilterExpression: { status: 'PENDING' },
    name: 'pending_invoice_expiry'
  }
);

// ========================================
// VIRTUAL PROPERTIES
// ========================================

/**
 * Check if invoice is paid
 */
InvoiceSchema.virtual('isPaid').get(function () {
  return this.status === 'PAID';
});

/**
 * Check if invoice is expired
 */
InvoiceSchema.virtual('isExpired').get(function () {
  if (this.status === 'EXPIRED') return true;
  if (this.status === 'PAID') return false;
  return this.expiresAt < new Date();
});

/**
 * Time remaining until expiry (milliseconds)
 */
InvoiceSchema.virtual('timeRemaining').get(function () {
  if (this.isExpired) return 0;
  return this.expiresAt - Date.now();
});

/**
 * Time remaining in minutes
 */
InvoiceSchema.virtual('timeRemainingMinutes').get(function () {
  return Math.floor(this.timeRemaining / (1000 * 60));
});

// ========================================
// INSTANCE METHODS
// ========================================

/**
 * Mark invoice as paid
 * @param {String} paymentMethod - Payment method used
 * @param {String} confirmedBy - User ID who confirmed
 * @param {Object} paymentData - Payment gateway data
 * @returns {Promise<Invoice>}
 */
InvoiceSchema.methods.markAsPaid = async function (paymentMethod, confirmedBy, paymentData = {}) {
  if (this.status === 'PAID') {
    throw new Error('Invoice already paid');
  }

  if (this.isExpired) {
    throw new Error('Invoice expired');
  }

  this.status = 'PAID';
  this.paidAt = new Date();
  this.paymentMethod = paymentMethod;
  this.paymentConfirmedBy = confirmedBy;

  // Store payment method specific data
  if (paymentMethod === 'PROMPTPAY' && paymentData.transferId) {
    this.promptPay = this.promptPay || {};
    this.promptPay.transferId = paymentData.transferId;
  } else if (paymentMethod === 'CREDIT_CARD' && paymentData.chargeId) {
    this.creditCard = {
      omiseChargeId: paymentData.chargeId,
      cardLastDigits: paymentData.cardLastDigits,
      cardBrand: paymentData.cardBrand,
      threeDSecure: paymentData.threeDSecure || false
    };
  }

  await this.save();
  return this;
};

/**
 * Mark invoice as expired
 * @returns {Promise<Invoice>}
 */
InvoiceSchema.methods.markAsExpired = async function () {
  if (this.status === 'PAID') {
    throw new Error('Cannot expire paid invoice');
  }

  this.status = 'EXPIRED';
  await this.save();
  return this;
};

/**
 * Generate Thai tax receipt
 * @returns {Promise<Invoice>}
 */
InvoiceSchema.methods.generateReceipt = async function () {
  if (this.status !== 'PAID') {
    throw new Error('Cannot generate receipt for unpaid invoice');
  }

  if (this.receiptNumber) {
    throw new Error('Receipt already generated');
  }

  // Generate sequential receipt number
  const Invoice = mongoose.model('Invoice');
  this.receiptNumber = await Invoice.generateReceiptNumber();
  this.receiptIssuedAt = new Date();

  // Receipt generation logic (PDF) would go here
  // For now, just mark as ready for generation

  await this.save();
  return this;
};

// ========================================
// STATIC METHODS
// ========================================

/**
 * Generate unique Invoice ID
 * @returns {Promise<String>} - Format: INV-YYYY-NNNNNN
 */
InvoiceSchema.statics.generateInvoiceId = async function () {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const lastInvoice = await this.findOne({
    invoiceId: new RegExp(`^${prefix}`)
  }).sort({ invoiceId: -1 });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceId.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(6, '0')}`;
};

/**
 * Generate unique Receipt Number
 * @returns {Promise<String>} - Format: RCPT-YYYY-NNNNNN
 */
InvoiceSchema.statics.generateReceiptNumber = async function () {
  const year = new Date().getFullYear();
  const prefix = `RCPT-${year}-`;

  const lastReceipt = await this.findOne({
    receiptNumber: new RegExp(`^${prefix}`)
  }).sort({ receiptNumber: -1 });

  let nextNumber = 1;
  if (lastReceipt) {
    const lastNumber = parseInt(lastReceipt.receiptNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(6, '0')}`;
};

/**
 * Find expired invoices
 * @returns {Promise<Invoice[]>}
 */
InvoiceSchema.statics.findExpired = function () {
  return this.find({
    status: 'PENDING',
    expiresAt: { $lt: new Date() }
  });
};

/**
 * Create Phase 1 invoice (฿5,000)
 * @param {String} applicationId - Application ID
 * @param {String} applicationNumber - Application number
 * @param {String} userId - User ID
 * @returns {Promise<Invoice>}
 */
InvoiceSchema.statics.createPhase1Invoice = async function (
  applicationId,
  applicationNumber,
  userId
) {
  const baseAmount = 5000;
  const vatAmount = baseAmount * 0.07;
  const totalAmount = baseAmount; // VAT included in base price

  const invoiceId = await this.generateInvoiceId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return this.create({
    invoiceId,
    invoiceNumber: invoiceId,
    applicationId,
    applicationNumber,
    userId,
    invoiceType: 'PHASE1_FEE',
    amount: baseAmount,
    currency: 'THB',
    vatRate: 0.07,
    vatAmount,
    totalAmount,
    status: 'PENDING',
    expiresAt
  });
};

/**
 * Create Phase 2 invoice (฿25,000)
 * @param {String} applicationId - Application ID
 * @param {String} applicationNumber - Application number
 * @param {String} userId - User ID
 * @returns {Promise<Invoice>}
 */
InvoiceSchema.statics.createPhase2Invoice = async function (
  applicationId,
  applicationNumber,
  userId
) {
  const baseAmount = 25000;
  const vatAmount = baseAmount * 0.07;
  const totalAmount = baseAmount; // VAT included in base price

  const invoiceId = await this.generateInvoiceId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return this.create({
    invoiceId,
    invoiceNumber: invoiceId,
    applicationId,
    applicationNumber,
    userId,
    invoiceType: 'PHASE2_FEE',
    amount: baseAmount,
    currency: 'THB',
    vatRate: 0.07,
    vatAmount,
    totalAmount,
    status: 'PENDING',
    expiresAt
  });
};

// ========================================
// MIDDLEWARE (Hooks)
// ========================================

/**
 * Pre-save: Update updatedAt
 */
InvoiceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Pre-save: Auto-expire if past expiry date
 */
InvoiceSchema.pre('save', function (next) {
  if (this.status === 'PENDING' && this.expiresAt < new Date()) {
    this.status = 'EXPIRED';
  }
  next();
});

/**
 * Pre-save: Validate amounts
 */
InvoiceSchema.pre('save', function (next) {
  // Validate Phase 1 amount
  if (this.invoiceType === 'PHASE1_FEE' && this.amount !== 5000) {
    return next(new Error('Phase 1 invoice must be ฿5,000'));
  }

  // Validate Phase 2 amount
  if (this.invoiceType === 'PHASE2_FEE' && this.amount !== 25000) {
    return next(new Error('Phase 2 invoice must be ฿25,000'));
  }

  next();
});

// ========================================
// SCHEMA CONFIGURATION
// ========================================

InvoiceSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

InvoiceSchema.set('toObject', {
  virtuals: true
});

// ========================================
// EXPORT MODEL
// ========================================

module.exports = mongoose.model('Invoice', InvoiceSchema);
