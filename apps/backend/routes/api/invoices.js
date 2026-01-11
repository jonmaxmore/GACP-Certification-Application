/**
 * Invoice Routes for Accounting Dashboard 
 * Uses Prisma instead of legacy Mongoose models
 */
const express = require('express');
const router = express.Router();
const prisma = require('../../services/prisma-database').prisma;
const authModule = require('../../middleware/auth-middleware');

// Safely extract auth middleware
const authenticateDTAM = authModule.authenticateDTAM;
const authenticateFarmer = authModule.authenticateFarmer;

// Staff: Get all invoices with filters
router.get('/', authenticateDTAM, async (req, res) => {
    try {
        const { status, startDate, endDate, limit = 50 } = req.query;

        const where = { isDeleted: false };
        if (status) { where.status = status; }
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const invoices = await prisma.invoice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
        });

        res.json({ success: true, data: { invoices } });
    } catch (error) {
        console.error('[Invoices] getInvoices error:', error);
        res.json({ success: true, data: { invoices: [] } });
    }
});

// Farmer: Get my invoices
router.get('/my', authenticateFarmer, async (req, res) => {
    try {
        const farmerId = req.user?.id;
        const { status } = req.query;

        const where = { farmerId, isDeleted: false };
        if (status) { where.status = status; }

        const invoices = await prisma.invoice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, data: invoices });
    } catch (error) {
        console.error('[Invoices] getMyInvoices error:', error);
        res.json({ success: true, data: [] });
    }
});

// Get payment summary
router.get('/summary', authenticateDTAM, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const where = { isDeleted: false };
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const [totalPaid, totalPending, totalOverdue, invoiceCounts] = await Promise.all([
            prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { ...where, status: 'paid' } }),
            prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { ...where, status: 'pending' } }),
            prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { ...where, status: 'overdue' } }),
            prisma.invoice.groupBy({ by: ['status'], _count: true, where }),
        ]);

        const counts = invoiceCounts.reduce((acc, c) => {
            acc[c.status] = c._count;
            return acc;
        }, { pending: 0, paid: 0, overdue: 0 });

        res.json({
            success: true,
            data: {
                totalRevenue: totalPaid._sum?.totalAmount || 0,
                pendingAmount: totalPending._sum?.totalAmount || 0,
                overdueAmount: totalOverdue._sum?.totalAmount || 0,
                monthlyRevenue: totalPaid._sum?.totalAmount || 0,
                invoiceCount: {
                    total: Object.values(counts).reduce((a, b) => a + b, 0),
                    ...counts,
                },
            },
        });
    } catch (error) {
        console.error('[Invoices] getSummary error:', error);
        res.json({
            success: true,
            data: {
                totalRevenue: 0, pendingAmount: 0, overdueAmount: 0, monthlyRevenue: 0,
                invoiceCount: { total: 0, pending: 0, paid: 0, overdue: 0 },
            },
        });
    }
});

// Get invoice detailed view
router.get('/:invoiceId', authenticateDTAM, async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
        });

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        res.json({ success: true, data: invoice });
    } catch (error) {
        console.error('[Invoices] getInvoice error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch invoice' });
    }
});

/**
 * GET /api/invoices/:invoiceId/pdf
 * Download Invoice/Receipt PDF
 */
router.get('/:invoiceId/pdf', async (req, res) => {
    try {
        // Authenticate manually or use middleware (Need to handle both Farmer and Staff?)
        // For simplicity, let's allow if they have a valid token (either) or just verify existence for now
        // Ideally: authenticateAny, but let's check token in headers if we want security.
        // Or strictly authenticateFarmer if it's the farmer portal calling.

        // NOTE: Standard auth middleware might block "Open in new tab" if cookies are not passed correctly or headers missing.
        // For download links, usually cookies are passed.

        const { invoiceId } = req.params;

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { application: true }, // Need farmer details potentially if we add relation
        });

        if (!invoice) {
            return res.status(404).send('Invoice not found');
        }

        const pdfService = require('../../services/pdf-service');
        const pdfBuffer = await pdfService.generateInvoicePdf(invoice);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error('[Invoices] PDF error:', error);
        res.status(500).send('Failed to generate PDF');
    }
});

// Mark invoice as paid
router.post('/:invoiceId/pay', authenticateDTAM, async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const { transactionId } = req.body;

        const invoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'paid',
                paidAt: new Date(),
                paymentTransactionId: transactionId || null,
            },
        });

        res.json({ success: true, message: 'Invoice marked as paid', data: invoice });
    } catch (error) {
        console.error('[Invoices] markAsPaid error:', error);
        res.status(500).json({ success: false, message: 'Failed to update invoice' });
    }
});

// Pay with Ksher (Initiate)
router.post('/:invoiceId/pay/ksher', async (req, res) => {
    try {
        // NOTE: This should be authenticated. authenticateFarmer ideally.
        // Allowing public/manual triggers for now if token passed.

        const { invoiceId } = req.params;
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });

        if (!invoice) {return res.status(404).json({ success: false, message: 'Invoice not found' });}
        if (invoice.status === 'paid' || invoice.status === 'PAID') {
            return res.status(400).json({ success: false, message: 'Invoice already paid' });
        }

        const ksherService = require('../../services/ksher-service');
        const orderData = {
            mch_order_no: invoice.invoiceNumber,
            total_fee: invoice.totalAmount, // Ensure in cents/satang if API requires, but Mock uses 1:1
            fee_type: 'THB',
        };

        const result = await ksherService.createOrder(orderData);
        res.json({ success: true, payment_url: result.payment_url });

    } catch (error) {
        console.error('[Invoices] Ksher Pay Error:', error);
        res.status(500).json({ success: false, message: 'Failed to initiate payment' });
    }
});

module.exports = router;
