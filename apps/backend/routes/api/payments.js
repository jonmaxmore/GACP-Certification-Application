/**
 * Payment Routes (Prisma Implementation)
 * Handles payment document listing and confirmation
 */

const express = require('express');
const router = express.Router();
const prisma = require('../../services/prisma-database').prisma;
const authModule = require('../../middleware/auth-middleware');
const upload = require('../../middleware/upload-middleware');
const logger = require('../../shared/logger');

const { authenticateFarmer } = require('../../middleware/auth-middleware');

/**
 * GET /api/payments/my
 * Get payments (Invoices) for authenticated user
 */
router.get('/my', authenticateFarmer, async (req, res) => {
    try {
        const userId = req.user.id;

        const invoices = await prisma.invoice.findMany({
            where: {
                farmerId: userId,
                isDeleted: false,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                application: {
                    select: { applicationNumber: true },
                },
            },
        });

        res.json({
            success: true,
            data: invoices,
        });
    } catch (error) {
        logger.error('[Payments] getMy error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payments',
        });
    }
});

/**
 * POST /api/payments/confirm
 * Upload payment slip and mark invoice as pending verification
 */
router.post('/confirm', authenticateFarmer, upload.single('slipImage'), async (req, res) => {
    try {
        const { invoiceId, transactionId } = req.body;
        const file = req.file;

        if (!invoiceId) {
            return res.status(400).json({ success: false, error: 'Invoice ID is required' });
        }

        // Verify ownership
        const invoice = await prisma.invoice.findFirst({
            where: { id: invoiceId, farmerId: req.user.id },
        });

        if (!invoice) {
            return res.status(404).json({ success: false, error: 'Invoice not found' });
        }

        const updateData = {
            status: 'payment_verification_pending',
            paymentTransactionId: transactionId || null,
            updatedBy: req.user.id,
        };

        // If file uploaded, store path in metadata or notes (Since Invoice model doesn't have slipUrl default)
        // Checking Invoice model... it has 'items' (JSON) or 'notes'.
        // Ideally we should add 'slipUrl' to Invoice model, but avoiding schema changes for now.
        // We will store it in 'notes' or if 'metadata' exists. Invoice has 'items' (JSON).
        // Let's assume we append to notes for now to be safe, or just rely on the file existing in /uploads/slips.

        if (file) {
            const slipInfo = `[Slip Uploaded: ${file.filename}]`;
            updateData.notes = invoice.notes ? `${invoice.notes}\n${slipInfo}` : slipInfo;
        }

        const updatedInvoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: updateData,
        });

        logger.info(`[Payments] Invoice ${invoiceId} payment confirmed by user ${req.user.id}`);

        res.json({
            success: true,
            message: 'Payment confirmation submitted',
            data: updatedInvoice,
        });

    } catch (error) {
        logger.error('[Payments] confirm error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;
