const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            // General types
            'info', 'success', 'warning', 'error',
            // Quote/Invoice workflow
            'QUOTE_RECEIVED',       // ได้รับใบเสนอราคา
            'INVOICE_RECEIVED',     // ได้รับใบวางบิล
            'PAYMENT_REMINDER',     // แจ้งเตือนกำหนดชำระ
            'PAYMENT_CONFIRMED',    // ยืนยันการชำระเงินแล้ว
            // Application workflow
            'APPLICATION_SUBMITTED', // ส่งคำขอแล้ว
            'APPLICATION_APPROVED', // อนุมัติแล้ว
            'APPLICATION_REJECTED', // ไม่อนุมัติ
            'REVISION_REQUIRED',    // ต้องแก้ไข
            // Team workflow
            'TEAM_REVIEW_COMPLETE'  // ทีมประเมินเสร็จ
        ],
        default: 'info'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    data: {
        type: mongoose.Schema.Types.Mixed // Additional data for navigation logic
    },
    relatedEntity: {
        entityType: String,
        entityId: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true
});

// Index for getting unread count quickly
NotificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);

