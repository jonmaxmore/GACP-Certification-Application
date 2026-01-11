/**
 * NotificationService - Helper for creating notifications (Prisma Version)
 * 
 * Usage:
 *   const { sendNotification, NotifyType } = require('./notification-service');
 *   await sendNotification(userId, NotifyType.QUOTE_RECEIVED, { quoteId: '...' });
 */

const prisma = require('./prisma-database').prisma;

// Notification types
const NotifyType = {
    // General
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',

    // Quote/Invoice workflow
    QUOTE_RECEIVED: 'QUOTE_RECEIVED',
    INVOICE_RECEIVED: 'INVOICE_RECEIVED',
    PAYMENT_REMINDER: 'PAYMENT_REMINDER',

    // Application workflow
    APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
    APPLICATION_APPROVED: 'APPLICATION_APPROVED',
    APPLICATION_REJECTED: 'APPLICATION_REJECTED',
    REVISION_REQUIRED: 'REVISION_REQUIRED',
    AUDIT_SCHEDULED: 'AUDIT_SCHEDULED', // [NEW]

    // Team workflow
    TEAM_REVIEW_COMPLETE: 'TEAM_REVIEW_COMPLETE',
};

// Notification templates
const NotifyTemplates = {
    [NotifyType.QUOTE_RECEIVED]: (data) => ({
        title: 'ได้รับใบเสนอราคา',
        message: `คุณได้รับใบเสนอราคาเลขที่ ${data.quoteNumber || '-'} จำนวน ${(data.amount || 0).toLocaleString()} บาท`,
    }),
    [NotifyType.INVOICE_RECEIVED]: (data) => ({
        title: 'ได้รับใบวางบิล',
        message: `ใบวางบิลเลขที่ ${data.invoiceNumber || '-'} พร้อมชำระเงินแล้ว`,
    }),
    [NotifyType.APPLICATION_APPROVED]: (data) => ({
        title: '✅ คำขอได้รับการอนุมัติ',
        message: `คำขอเลขที่ ${data.applicationNumber || '-'} ได้รับการอนุมัติเรียบร้อย`,
    }),
    [NotifyType.APPLICATION_REJECTED]: (data) => ({
        title: '❌ คำขอไม่ผ่านการพิจารณา',
        message: `คำขอเลขที่ ${data.applicationNumber || '-'} ไม่ผ่านการพิจารณา กรุณาตรวจสอบ`,
    }),
    [NotifyType.REVISION_REQUIRED]: (data) => ({
        title: '🔄 กรุณาแก้ไขคำขอ',
        message: `คำขอเลขที่ ${data.applicationNumber || '-'} ต้องแก้ไข: ${data.reason || 'ดูรายละเอียดในระบบ'}`,
    }),
    [NotifyType.PAYMENT_REMINDER]: (data) => ({
        title: '💳 แจ้งเตือนการชำระเงิน',
        message: `กรุณาชำระเงินใบวางบิลเลขที่ ${data.invoiceNumber || '-'} ภายในวันที่ ${data.dueDate || '-'}`,
    }),
    [NotifyType.AUDIT_SCHEDULED]: (data) => ({
        title: '📅 นัดหมายการตรวจประเมิน',
        message: `คำขอของคุณถูกนัดหมายการตรวจแบบ ${data.auditMode === 'ONLINE' ? 'ออนไลน์' : 'ลงพื้นที่'} ในวันที่ ${data.scheduledDate} เวลา ${data.scheduledTime} น.`,
    }),
};

/**
 * Send a notification to a user
 * @param {string} recipientId - User ID
 * @param {string} type - Notification type from NotifyType
 * @param {Object} data - Additional data (quoteId, invoiceId, etc.)
 * @param {Object} overrides - Override title/message
 */
async function sendNotification(recipientId, type, data = {}, overrides = {}) {
    try {
        if (!recipientId) {
            console.warn('[NotificationService] No recipient ID provided');
            return null;
        }

        // Get template or use defaults
        const template = NotifyTemplates[type];
        const templateResult = template ? template(data) : {};

        // Use Prisma to create notification
        const notification = await prisma.notification.create({
            data: {
                userId: recipientId,
                type: type || 'INFO',
                title: overrides.title || templateResult.title || 'การแจ้งเตือนใหม่',
                message: overrides.message || templateResult.message || 'คุณมีการแจ้งเตือนใหม่',
                metadata: { // Map 'data' to 'metadata' JSON field
                    ...data,
                    timestamp: new Date().toISOString(),
                },
                isRead: false,
            },
        });

        console.log(`[NotificationService] Sent ${type} notification to user ${recipientId}`);
        return notification;

    } catch (error) {
        console.error('[NotificationService] Error sending notification:', error.message);
        return null;
    }
}

/**
 * Send multiple notifications (batch)
 */
async function sendBatchNotifications(notifications) {
    const results = [];
    for (const n of notifications) {
        const result = await sendNotification(n.recipientId, n.type, n.data, n.overrides);
        results.push(result);
    }
    return results;
}

module.exports = {
    sendNotification,
    sendBatchNotifications,
    NotifyType,
    NotifyTemplates,
};
