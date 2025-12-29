/**
 * Payment Document Schema
 * Stores Quotation, Invoice, Receipt documents linked to Applications
 * 
 * Document Flow:
 * 1. QUOTATION - Generated when application submitted (shows total fees)
 * 2. INVOICE - Generated when quotation approved (for Phase 1 payment - 50%)
 * 3. RECEIPT - Generated when payment confirmed
 * 4. Second INVOICE - After document review for Phase 2 payment (50%)
 * 5. Second RECEIPT - After Phase 2 payment confirmed
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentDocumentSchema = new Schema({
    // Document type and number
    type: {
        type: String,
        enum: ['QUOTATION', 'INVOICE', 'RECEIPT'],
        required: true
    },
    documentNumber: {
        type: String,
        required: true,
        unique: true
    },

    // Link to application and user
    applicationId: {
        type: Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Related invoice (for receipts)
    relatedInvoiceId: {
        type: Schema.Types.ObjectId,
        ref: 'PaymentDocument'
    },

    // Payment phase (1 = initial 50%, 2 = after inspection 50%)
    phase: {
        type: Number,
        enum: [1, 2],
        default: 1
    },

    // Amount and items
    amount: {
        type: Number,
        required: true
    },
    items: [{
        order: Number,
        description: String,
        quantity: { type: Number, default: 1 },
        unit: { type: String, default: 'ครั้ง' },
        unitPrice: Number,
        amount: Number
    }],

    // Status varies by document type
    // QUOTATION: PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED
    // INVOICE: PENDING, DELIVERED, CANCELLED
    // RECEIPT: ISSUED, CANCELLED
    status: {
        type: String,
        enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PENDING', 'DELIVERED', 'ISSUED', 'CANCELLED'],
        required: true
    },

    // Dates
    issueDate: { type: Date, default: Date.now },
    dueDate: Date,
    paidAt: Date,

    // Recipient info (from application)
    recipientName: String,
    recipientTaxId: String,
    recipientAddress: String,

    // Notes
    note: String,

    // PDF path if generated
    pdfPath: String

}, { timestamps: true });

// Generate document number
PaymentDocumentSchema.statics.generateDocumentNumber = async function (type) {
    const now = new Date();
    const year = (now.getFullYear() + 543).toString().slice(-2); // Thai year, 2 digits
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    let prefix;
    switch (type) {
        case 'QUOTATION': prefix = 'G'; break;
        case 'INVOICE': prefix = 'GI'; break;
        case 'RECEIPT': prefix = 'REC'; break;
        default: prefix = 'DOC';
    }

    // Find last document of this type this month
    const pattern = new RegExp(`^${prefix}-${year}${month}`);
    const lastDoc = await this.findOne({ documentNumber: pattern })
        .sort({ documentNumber: -1 });

    let seq = 1;
    if (lastDoc) {
        const lastNum = parseInt(lastDoc.documentNumber.slice(-4));
        seq = lastNum + 1;
    }

    return `${prefix}-${year}${month}${seq.toString().padStart(4, '0')}`;
};

// Index for fast lookups
PaymentDocumentSchema.index({ userId: 1, createdAt: -1 });
PaymentDocumentSchema.index({ applicationId: 1 });
PaymentDocumentSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('PaymentDocument', PaymentDocumentSchema);

