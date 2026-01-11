/**
 * Accounting Dashboard Routes 
 * Uses Prisma (PostgreSQL)
 */
const express = require('express');
const router = express.Router();
const prisma = require('../../services/prisma-database').prisma;
const { authenticateDTAM } = require('../../middleware/auth-middleware');

// Get Dashboard Stats
router.get('/dashboard', authenticateDTAM, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            quotesTotal,
            quotesPending,
            quotesAccepted,
            invoicesTotal,
            invoicesPending,
            invoicesPaid,
            quotesToday,
            invoicesToday,
            revenueResult,
        ] = await Promise.all([
            prisma.quote.count({ where: { isDeleted: false } }),
            prisma.quote.count({ where: { status: { in: ['pending', 'draft', 'sent'] }, isDeleted: false } }),
            prisma.quote.count({ where: { status: 'accepted', isDeleted: false } }),

            prisma.invoice.count({ where: { isDeleted: false } }),
            prisma.invoice.count({ where: { status: 'pending', isDeleted: false } }),
            prisma.invoice.count({ where: { status: 'paid', isDeleted: false } }),

            prisma.quote.count({ where: { createdAt: { gte: today }, isDeleted: false } }),
            prisma.invoice.count({ where: { createdAt: { gte: today }, isDeleted: false } }),

            prisma.invoice.aggregate({
                _sum: { totalAmount: true },
                where: { status: 'paid', isDeleted: false },
            }),
        ]);

        res.json({
            success: true,
            data: {
                quotes: {
                    total: quotesTotal,
                    pending: quotesPending,
                    accepted: quotesAccepted,
                    today: quotesToday,
                },
                invoices: {
                    total: invoicesTotal,
                    pending: invoicesPending,
                    paid: invoicesPaid,
                    today: invoicesToday,
                },
                revenue: {
                    total: revenueResult._sum.totalAmount || 0,
                    currency: 'THB',
                },
            },
        });

    } catch (error) {
        console.error('[Accounting] getDashboardStats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get dashboard stats' });
    }
});

module.exports = router;
