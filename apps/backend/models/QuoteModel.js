const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Quote Model - ใบเสนอราคา
 * Used for services requiring team review (replacement, amendment)
 * Team creates quote → sends to farmer → farmer accepts → invoice generated
 */
const QuoteSchema = new Schema({
    // Reference to application
    applicationId: {
        type: Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },

    // Quote number for reference
    quoteNumber: {
        type: String,
        required: true,
        unique: true
    },

    // Service type from application
    serviceType: {
        type: String,
        enum: ['new_application', 'renewal', 'replacement', 'amendment'],
        required: true
    },

    // Staff who created this quote
    createdByStaff: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Farmer/Applicant receiving the quote
    farmerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Line items
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

    // Thai text for amount
    totalAmountText: { type: String }, // e.g., "สามหมื่นบาทถ้วน"

    // Validity
    validUntil: {
        type: Date,
        required: true
    },

    // Status
    status: {
        type: String,
        enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'invoiced'],
        default: 'draft'
    },

    // Timestamps for tracking
    sentAt: Date,
    acceptedAt: Date,
    rejectedAt: Date,

    // Related invoice (generated after acceptance)
    invoiceId: {
        type: Schema.Types.ObjectId,
        ref: 'Invoice'
    },

    // Notes from staff
    notes: String,

    // Notes from farmer (if rejected)
    farmerNotes: String

}, {
    timestamps: true
});

// Auto-generate quote number
QuoteSchema.pre('validate', async function (next) {
    if (!this.quoteNumber) {
        const date = new Date();
        const year = date.getFullYear() + 543; // Thai Year
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        this.quoteNumber = `QT-${year}${month}-${random}`;
    }
    next();
});

// Calculate totals before save
QuoteSchema.pre('save', function (next) {
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
        this.totalAmount = this.subtotal + (this.vat || 0);
    }
    next();
});

// Indexes
QuoteSchema.index({ applicationId: 1 });
QuoteSchema.index({ farmerId: 1 });
QuoteSchema.index({ status: 1 });
// Note: quoteNumber already has unique:true in schema definition

module.exports = mongoose.model('Quote', QuoteSchema);
