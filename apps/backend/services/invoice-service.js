const { prisma } = require('./prisma-database');
const pdfService = require('./pdf-service');
const ksherService = require('./ksher-service');

class InvoiceService {

    /**
     * List invoices for Staff with filters
     */
    async listAll(filters = {}, limit = 50) {
        const where = { isDeleted: false };
        if (filters.status) where.status = filters.status;
        if (filters.startDate && filters.endDate) {
            where.createdAt = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }

        return prisma.invoice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { farmer: { select: { firstName: true, lastName: true, companyName: true } } }
        });
    }

    /**
     * List invoices for a specific Farmer
     */
    async listByFarmer(farmerId, status) {
        const where = { farmerId, isDeleted: false };
        if (status) where.status = status;

        return prisma.invoice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get Invoice Statistics
     */
    async getSummary(startDate, endDate) {
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

        return {
            totalRevenue: totalPaid._sum?.totalAmount || 0,
            pendingAmount: totalPending._sum?.totalAmount || 0,
            overdueAmount: totalOverdue._sum?.totalAmount || 0,
            monthlyRevenue: totalPaid._sum?.totalAmount || 0,
            invoiceCount: {
                total: Object.values(counts).reduce((a, b) => a + b, 0),
                ...counts,
            },
        };
    }

    /**
     * Get single invoice
     */
    async getById(id) {
        return prisma.invoice.findUnique({
            where: { id },
            include: { application: true, farmer: true },
        });
    }

    /**
     * Generate PDF Buffer
     */
    async generatePdf(id) {
        const invoice = await this.getById(id);
        if (!invoice) throw new Error('Invoice not found');
        return pdfService.generateInvoicePdf(invoice);
    }

    /**
     * Mark as Paid (Manual)
     */
    async markAsPaid(id, transactionId) {
        return prisma.invoice.update({
            where: { id },
            data: {
                status: 'paid',
                paidAt: new Date(),
                paymentTransactionId: transactionId || null,
            },
        });
    }

    /**
     * Initiate Ksher Payment
     */
    async initiateKsherPayment(id) {
        const invoice = await this.getById(id);
        if (!invoice) throw new Error('Invoice not found');
        if (invoice.status === 'paid' || invoice.status === 'PAID') {
            throw new Error('Invoice already paid');
        }

        const orderData = {
            mch_order_no: invoice.invoiceNumber,
            total_fee: invoice.totalAmount,
            fee_type: 'THB',
        };

        return ksherService.createOrder(orderData); // Returns { payment_url: ... }
    }
}

module.exports = new InvoiceService();
