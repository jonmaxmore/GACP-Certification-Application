const logger = require('../shared/logger');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PaymentController {
    /**
     * Get user's payment documents (Invoices/Receipts)
     * GET /api/v2/payments/my
     */
    async getMyPayments(req, res) {
        try {
            const userId = req.user?.id || req.user?._id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated',
                });
            }

            // Get Invoices for this user
            const invoices = await prisma.invoice.findMany({
                where: { farmerId: userId },
                orderBy: { createdAt: 'desc' },
                include: { application: true },
            });

            // Transform to frontend format
            const formattedDocs = [];

            for (const inv of invoices) {
                // Invoice Record
                formattedDocs.push({
                    id: inv.id,
                    type: 'INVOICE',
                    documentNumber: inv.invoiceNumber,
                    applicationId: inv.applicationId,
                    amount: inv.totalAmount,
                    status: inv.status === 'paid' ? 'PAID' : 'PENDING', // Normalize status
                    createdAt: inv.createdAt,
                    paidAt: inv.paidAt,
                });

                // Receipt Record (Virtual, if paid)
                if (inv.status === 'paid') {
                    formattedDocs.push({
                        id: inv.id + '_receipt', // Virtual ID
                        type: 'RECEIPT',
                        documentNumber: 'RCP-' + inv.invoiceNumber,
                        applicationId: inv.applicationId,
                        amount: inv.totalAmount,
                        status: 'ISSUED',
                        createdAt: inv.paidAt || inv.createdAt, // Issued when paid
                        paidAt: inv.paidAt,
                    });
                }
            }

            // Sort by date desc
            formattedDocs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            res.json({
                success: true,
                data: formattedDocs,
            });
        } catch (error) {
            logger.error('Error fetching payment documents:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }

    /**
     * Get single payment document by ID
     * GET /api/v2/payments/:id
     */
    async getPaymentById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            // Check if it's a receipt (virtual) or invoice
            let isReceipt = false;
            let queryId = id;
            if (id.endsWith('_receipt')) {
                isReceipt = true;
                queryId = id.replace('_receipt', '');
            }

            const invoice = await prisma.invoice.findUnique({
                where: { id: queryId },
                include: { application: true },
            });

            if (!invoice) {
                return res.status(404).json({ success: false, error: 'Document not found' });
            }

            if (invoice.farmerId !== userId && req.user.role !== 'DTAM_STAFF' && req.user.role !== 'ADMIN') {
                return res.status(403).json({ success: false, error: 'Forbidden' });
            }

            // Map to response
            const data = {
                id: isReceipt ? invoice.id + '_receipt' : invoice.id,
                type: isReceipt ? 'RECEIPT' : 'INVOICE',
                documentNumber: isReceipt ? 'RCP-' + invoice.invoiceNumber : invoice.invoiceNumber,
                applicationId: invoice.applicationId,
                amount: invoice.totalAmount,
                status: isReceipt ? 'ISSUED' : (invoice.status === 'paid' ? 'PAID' : 'PENDING'),
                items: invoice.items,
                recipientName: invoice.billingName || invoice.application?.farmer?.firstName || 'Farmer', // Simplification
                createdAt: isReceipt ? (invoice.paidAt || invoice.createdAt) : invoice.createdAt,
                paidAt: invoice.paidAt,
            };

            res.json({
                success: true,
                data: data,
            });
        } catch (error) {
            logger.error('Error fetching payment document:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }

    /**
     * Generate payment documents from existing applications
     * (Deprecated/No-op for Prisma version as Invoices are created on flow)
     */
    async generateDocumentsFromApplications(userId) {
        return [];
    }

    /**
     * Confirm payment with slip upload
     * POST /api/v2/payments/confirm
     */
    async confirmPayment(req, res) {
        try {
            const { invoiceId, applicationId, phase, amount } = req.body;
            const slipImage = req.file;
            const userId = req.user?.id;

            // Finding invoice
            let invoice;
            if (invoiceId) {
                invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
            } else if (applicationId) {
                // Try to find pending invoice
                invoice = await prisma.invoice.findFirst({
                    where: {
                        applicationId,
                        status: 'pending',
                    },
                });
            }

            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    error: 'Invoice not found or already paid',
                });
            }

            // Update invoice status
            await prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                    status: 'paid', // Mark as paid immediately for demo/smoke test
                    paidAt: new Date(),
                    paymentTransactionId: 'MANUAL_SLIP_' + Date.now(),
                    notes: slipImage ? (invoice.notes + `\nSlip: ${slipImage.filename}`) : invoice.notes,
                },
            });

            // Update Application Status logic
            const appPhaseT = parseInt(phase) || (invoice.serviceType === 'AUDIT_FEE' ? 2 : 1);

            let newAppStatus = undefined;
            let updateData = {};

            const currentApp = await prisma.application.findUnique({ where: { id: invoice.applicationId } });
            if (currentApp) {
                if (currentApp.status === 'PAYMENT_2_PENDING') {
                    newAppStatus = 'PENDING_AUDIT';
                    updateData = {
                        status: newAppStatus,
                        phase2Status: 'PAID',
                        phase2PaidAt: new Date(),
                        updatedBy: req.user?.id,
                    };
                } else if (currentApp.status === 'DRAFT' || currentApp.status === 'SUBMITTED' || currentApp.status === 'PENDING_PAYMENT') {
                    // Phase 1
                    newAppStatus = 'PENDING_REVIEW';
                    updateData = {
                        status: newAppStatus,
                        phase1Status: 'PAID',
                        phase1PaidAt: new Date(),
                        updatedBy: req.user?.id,
                    };
                }

                if (newAppStatus) {
                    await prisma.application.update({
                        where: { id: invoice.applicationId },
                        data: updateData,
                    });
                    logger.info(`[Payment Manual] Updated Application ${currentApp.applicationNumber} to ${newAppStatus}`);
                }
            }

            res.json({
                success: true,
                data: {
                    invoiceId: invoice.id,
                    message: 'Payment confirmed successfully',
                    status: 'paid',
                },
            });
        } catch (error) {
            logger.error('Payment confirmation error:', error);
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }
}

module.exports = new PaymentController();
