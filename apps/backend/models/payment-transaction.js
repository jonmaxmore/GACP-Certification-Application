const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Payment Transaction Schema
 * Logging all Ksher payment attempts and results
 */
const PaymentTransactionSchema = new Schema({
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },

    // Merchant Order No (Our Side)
    transactionId: { type: String, required: true, unique: true },

    // Ksher Info
    ksherOrderId: { type: String },
    paymentChannel: { type: String }, // promptpay, alipay, wechat, true_money, linepay, airpay, credit_card

    amount: { type: Number, required: true },
    currency: { type: String, default: 'THB' },

    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'],
        default: 'PENDING'
    },

    // Detailed logs
    requestPayload: Schema.Types.Mixed,
    responsePayload: Schema.Types.Mixed,

    paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model('PaymentTransaction', PaymentTransactionSchema);
