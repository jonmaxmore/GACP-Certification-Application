/**
 * Invoice Routes for Accounting Dashboard (Migrated to V2)
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
        if (status) where.status = status;
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const invoices = await prisma.invoice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit)
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
        if (status) where.status = status;

        const invoices = await prisma.invoice.findMany({
            where,
            orderBy: { createdAt: 'desc' }
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
                lte: new Date(endDate)
            };
        }

        const [totalPaid, totalPending, totalOverdue, invoiceCounts] = await Promise.all([
            prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { ...where, status: 'paid' } }),
            prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { ...where, status: 'pending' } }),
            prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { ...where, status: 'overdue' } }),
            prisma.invoice.groupBy({ by: ['status'], _count: true, where })
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
                    ...counts
                }
            }
        });
    } catch (error) {
        console.error('[Invoices] getSummary error:', error);
        res.json({
            success: true,
            data: {
                totalRevenue: 0, pendingAmount: 0, overdueAmount: 0, monthlyRevenue: 0,
                invoiceCount: { total: 0, pending: 0, paid: 0, overdue: 0 }
            }
        });
    }
});

// Get invoice detail
router.get('/:invoiceId', authenticateDTAM, async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId }
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
                paymentTransactionId: transactionId || null
            }
        });

        res.json({ success: true, message: 'Invoice marked as paid', data: invoice });
    } catch (error) {
        console.error('[Invoices] markAsPaid error:', error);
        res.status(500).json({ success: false, message: 'Failed to update invoice' });
    }
});

module.exports = router;
