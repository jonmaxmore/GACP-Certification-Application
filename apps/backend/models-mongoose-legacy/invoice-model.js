const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

/**
 * Invoice Model - ใบวางบิล / ใบแจ้งหนี้
 * Generated from Quote or automatically for fixed-fee services
 * Enhanced: UUID, Audit Trail, Legal Retention for government compliance
 */
const InvoiceSchema = new Schema({
    // ========== UUID (Public-safe identifier for API) ==========
    uuid: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: () => uuidv4(),
        immutable: true,
    },

    // ========== SOFT DELETE ==========
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    deleteReason: { type: String, trim: true },

    // ========== AUDIT TRAIL ==========
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByIp: { type: String, maxlength: 45 },

    // ========== LEGAL RETENTION (5 years for tax) ==========
    retainUntil: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 365.25 * 24 * 60 * 60 * 1000), // 7 years for tax
    },
    legalHold: { type: Boolean, default: false },

    // Reference
    applicationId: {
        type: Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },

    // Generated from quote (if applicable)
    quoteId: {
        type: Schema.Types.ObjectId,
        ref: 'Quote'
    },

    // Invoice number for reference
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },

    // Service type
    serviceType: {
        type: String,
        enum: ['new_application', 'renewal', 'replacement', 'amendment'],
        required: true
    },

    // Farmer/Applicant
    farmerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Billing details
    billingName: String,
    billingAddress: String,
    certificateNumber: String, // ใบรับรองเลขที่

    // Line items (copied from quote or auto-generated)
    items: [{
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true }
    }],

    // Totals
    subtotal: { type: Number, required: true },
    vat: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    totalAmountText: String, // "สามหมื่นบาทถ้วน"

    // Payment info
    dueDate: { type: Date, required: true },

    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'cancelled'],
        default: 'pending'
    },

    paidAt: Date,
    paymentTransactionId: { type: Schema.Types.ObjectId, ref: 'PaymentTransaction' },

    // Notes
    notes: String

}, {
    timestamps: true
});

// Auto-generate invoice number
InvoiceSchema.pre('validate', async function (next) {
    if (!this.invoiceNumber) {
        const date = new Date();
        const year = date.getFullYear() + 543;
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        this.invoiceNumber = `INV-${year}${month}-${random}`;
    }
    next();
});

// Set default due date (7 days from creation)
InvoiceSchema.pre('save', function (next) {
    if (!this.dueDate) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        this.dueDate = dueDate;
    }
    next();
});

// Indexes
InvoiceSchema.index({ applicationId: 1 });
InvoiceSchema.index({ farmerId: 1 });
InvoiceSchema.index({ status: 1 });
// Note: invoiceNumber already has unique:true in schema definition

module.exports = mongoose.model('Invoice', InvoiceSchema);
