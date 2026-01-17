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

        // --- EMAIL INTEGRATION ---
        // Fire-and-forget email sending to avoid blocking response
        _sendEmailForNotification(recipientId, type, data, overrides).catch(err => {
            console.error(`[NotificationService] Failed to send email for ${type}:`, err.message);
        });
        // -------------------------

        return notification;

    } catch (error) {
        console.error('[NotificationService] Error sending notification:', error.message);
        return null;
    }
}

// Internal Helper: Map Notification Type to Email Template & Send
const EmailService = require('./email/email-service');
const emailService = new EmailService();

async function _sendEmailForNotification(userId, type, data, overrides) {
    // 1. Define Email Mapping (NotifyType -> Email Template)
    const EMAIL_MAP = {
        [NotifyType.QUOTE_RECEIVED]: { template: 'quote-received', subject: 'ใบเสนอราคาใหม่' },
        [NotifyType.INVOICE_RECEIVED]: { template: 'invoice-received', subject: 'ใบแจ้งหนี้ใหม่' },
        [NotifyType.PAYMENT_REMINDER]: { template: 'payment-reminder', subject: 'แจ้งเตือนการชำระเงิน' },
        [NotifyType.PAYMENT_COMPLETED]: { template: 'payment-receipt', subject: 'บิลเงินสด/ใบเสร็จรับเงิน' },
        [NotifyType.APPLICATION_SUBMITTED]: { template: 'application-received', subject: 'ยืนยันการรับใบสมัคร' },
        [NotifyType.APPLICATION_APPROVED]: { template: 'application-status', subject: 'ผลการพิจารณา: อนุมัติ' },
        [NotifyType.APPLICATION_REJECTED]: { template: 'application-status', subject: 'ผลการพิจารณา: ไม่ผ่าน/แก้ไข' },
        [NotifyType.AUDIT_SCHEDULED]: { template: 'inspection-scheduled', subject: 'นัดหมายการตรวจประเมิน' },
    };

    const config = EMAIL_MAP[type];
    if (!config) {return;} // No email needed for this type

    // 2. Fetch User to get Email
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true, lastName: true }, // Minimal fields
    });

    if (!user || !user.email) {
        console.warn(`[NotificationService] User ${userId} has no email, skipping email notification.`);
        return;
    }

    // 3. Prepare Template Data
    // Merge notification data with user data for templates
    const templateData = {
        name: `${user.firstName} ${user.lastName}`.trim() || user.email,
        ...data,
    };

    // 4. Send Email
    await emailService.sendEmail({
        to: user.email,
        subject: overrides.subject || config.subject, // Allow override
        template: config.template,
        data: templateData,
    });
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
