const express = require('express');
const router = express.Router();
const prisma = require('../../services/prisma-database').prisma;
const ksherService = require('../../services/ksher-service');
const pdfService = require('../../services/pdf-service');
const logger = require('../../shared/logger');

// POST /api/webhooks/ksher
router.post('/ksher', async (req, res) => {
    try {
        const payload = req.body;
        logger.info('Received Ksher Webhook:', JSON.stringify(payload));

        // 1. Verify Signature
        if (!ksherService.verifySignature(payload)) {
            logger.error('Invalid Ksher Signature');
            return res.status(400).json({ result: 'FAIL', msg: 'Invalid Signature' });
        }

        // 2. Check Payment Status
        if (payload.result !== 'SUCCESS') {
            logger.warn(`Payment failed for order: ${payload.mch_order_no}`);
            return res.json({ result: 'SUCCESS', msg: 'OK' }); // Ack receipt even if fail
        }

        // 3. Find Invoice
        const invoiceNumber = payload.mch_order_no;
        const invoice = await prisma.invoice.findUnique({
            where: { invoiceNumber },
            include: { application: true },
        });

        if (!invoice) {
            logger.error(`Invoice not found: ${invoiceNumber}`);
            return res.status(404).json({ result: 'FAIL', msg: 'Invoice Not Found' });
        }

        if (invoice.status === 'PAID') {
            logger.info(`Invoice ${invoiceNumber} already currently PAID. Duplicate webhook.`);
            return res.json({ result: 'SUCCESS', msg: 'OK' });
        }

        // 4. Update Invoice to PAID
        const updatedInvoice = await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
                status: 'PAID', // Uppercase to match schema enum/string usage in frontend
                paidAt: new Date(),
                paymentTransactionId: payload.ksher_order_no,
                notes: `[Ksher] Channel: ${payload.channel || 'N/A'}`,
            },
        });
        logger.info(`Invoice ${invoiceNumber} marked as PAID.`);

        // 5. Update Phase Status if Application Fee (Phase 1)
        if (invoice.serviceType === 'APPLICATION_FEE' && invoice.applicationId) {
            await prisma.application.update({
                where: { id: invoice.applicationId },
                data: {
                    phase1Status: 'PAID',
                    phase1PaidAt: new Date(),
                    status: 'PENDING_REVIEW',
                },
            });
            logger.info(`Application ${invoice.applicationNumber} Phase 1 Status updated to PAID.`);
        }

        // 5b. Update Phase Status if Audit Fee (Phase 2)
        if (invoice.serviceType === 'AUDIT_FEE' && invoice.applicationId) {
            await prisma.application.update({
                where: { id: invoice.applicationId },
                data: {
                    phase2Status: 'PAID',
                    phase2PaidAt: new Date(),
                    status: 'PENDING_AUDIT', // Move to Queue for Scheduling
                },
            });
            logger.info(`Application ${invoice.applicationNumber} Phase 2 Status updated to PAID & Status to PENDING_AUDIT.`);
        }

        // 6. Generate Receipt (Can be async/background, but doing here for simplicity)
        // We generally generate it on-demand via GET /invoices/:id/pdf, but we could pre-generate/cache.
        // For now, no action needed as the GET endpoint generates dynamic receipts based on status='PAID'.

        res.json({ result: 'SUCCESS', msg: 'OK' });

    } catch (error) {
        logger.error('Webhook Error:', error);
        res.status(500).json({ result: 'FAIL', msg: 'Internal Error' });
    }
});

module.exports = router;
