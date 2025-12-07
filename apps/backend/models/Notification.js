const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: { type: String, required: false }, // User ID or 'ADMIN' or 'OFFICER'
    role: { type: String, enum: ['FARMER', 'OFFICER', 'ADMIN', 'AUDITOR'], default: 'FARMER' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'GacpApplication' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NotificationLegacy', notificationSchema);
