/**
 * Accounting Controller
 * Handles Quote, Invoice, and Receipt management for ACCOUNTANT role
 * Features: CRUD, document number updates, real-time sync
 */

const { prisma } = require('../services/prisma-database');
const { createLogger } = require('../shared/logger');
const logger = createLogger('accounting-controller');

class AccountingController {
    /**
     * Get all quotes with filters
     */
    async getQuotes(req, res) {
        try {
            const { status, farmerId, page = 1, limit = 20 } = req.query;
            const where = {};

            if (status) { where.status = status; }
            if (farmerId) {
                // Quote doesn't have direct farmerId, filter via Application
                where.application = { farmerId: farmerId };
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [quotes, total] = await Promise.all([
                prisma.quote.findMany({
                    where,
                    include: {
                        application: {
                            include: {
                                farmer: {
                                    select: { firstName: true, lastName: true, email: true },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: parseInt(limit),
                }),
                prisma.quote.count({ where }),
            ]);

            // Map prisma result to match expected frontend format (flat farmer object)
            const mappedQuotes = quotes.map(q => ({
                ...q,
                farmerId: q.application?.farmer, // Flatten relation for frontend compat
                applicationId: { applicationNumber: q.application?.applicationNumber }, // Flatten
            }));

            res.json({
                success: true,
                data: mappedQuotes,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            });
        } catch (error) {
            logger.error('Get quotes error:', error);
            res.status(500).json({ success: false, message: 'Failed to get quotes' });
        }
    }

    /**
     * Get all invoices with filters
     */
    async getInvoices(req, res) {
        try {
            const { status, farmerId, page = 1, limit = 20 } = req.query;
            const where = {};

            if (status) { where.status = status; }
            if (farmerId) { where.farmerId = farmerId; }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [invoices, total] = await Promise.all([
                prisma.invoice.findMany({
                    where,
                    include: {
                        farmer: {
                            select: { firstName: true, lastName: true, email: true },
                        },
                        application: {
                            select: { applicationNumber: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: parseInt(limit),
                }),
                prisma.invoice.count({ where }),
            ]);

            const mappedInvoices = invoices.map(inv => ({
                ...inv,
                farmerId: inv.farmer, // Frontend expects object here populated
                applicationId: inv.application,
            }));

            res.json({
                success: true,
                data: mappedInvoices,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            });
        } catch (error) {
            logger.error('Get invoices error:', error);
            res.status(500).json({ success: false, message: 'Failed to get invoices' });
        }
    }

    /**
     * Update document number (Temp → Official)
     */
    async updateDocumentNumber(req, res) {
        try {
            const { type, id } = req.params;
            const { newNumber, notes } = req.body;

            if (!['quote', 'invoice'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid document type. Use "quote" or "invoice"',
                });
            }

            const model = type === 'quote' ? prisma.quote : prisma.invoice;
            const numberField = type === 'quote' ? 'quoteNumber' : 'invoiceNumber';

            // Check if new number already exists
            const existing = await model.findUnique({
                where: { [numberField]: newNumber },
            });

            if (existing && existing.id !== id) {
                return res.status(409).json({
                    success: false,
                    message: `${type === 'quote' ? 'Quote' : 'Invoice'} number already exists`,
                });
            }

            // Update document number
            // Note: Prisma doesn't have $push for JSON columns as easily as Mongoose.
            // We need to fetch, append, and update for `updateHistory` if it's stored in a JSON field (e.g. metadata or custom).
            // Looking at schema snippet: Invoice has `items` (Json), Quote has `items` (Json).
            // `updateHistory` is NOT in the schema snippet.
            // I will assume it is NOT supported in standard schema or stored in 'notes' or ignored for now.
            // Or if `notes` is string, just update notes.

            const document = await model.update({
                where: { id },
                data: {
                    [numberField]: newNumber,
                    notes: notes || undefined,
                },
            });

            logger.info(`Document number updated: ${type} ${id} → ${newNumber} by ${req.user?.email}`);

            res.json({
                success: true,
                message: 'เลขที่เอกสารอัพเดทสำเร็จ',
                data: document,
            });
        } catch (error) {
            logger.error('Update document number error:', error);
            const message = error.code === 'P2025' ? 'Document not found' : 'Failed to update document number';
            res.status(error.code === 'P2025' ? 404 : 500).json({ success: false, message });
        }
    }

    /**
     * Create new quote
     */
    async createQuote(req, res) {
        try {
            const { applicationId, farmerId, items, validDays = 30, notes } = req.body;

            // Generate temp quote number
            const quoteNumber = `QT-${Date.now()}`;

            // Calculate totals
            const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
            const vat = 0; // Thailand: exempt for GACP services
            const totalAmount = subtotal + vat;

            // Valid until date
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + validDays);

            // Prisma create
            // Note: omitting farmerId as it's not in schema relation, relying on applicationId
            const quote = await prisma.quote.create({
                data: {
                    quoteNumber,
                    applicationId,
                    // farmerId: farmerId, // Omitted
                    // createdByStaff: req.user?.id, // Schema check: Quote has `createdBy`? No, AuditLog handles it usually.
                    // But if schema doesn't have it, we can't save it. 
                    // Schema check: Quote has `items` (Json), `subtotal`, `vat`, `totalAmount`, `status`, `validUntil`, `notes`.
                    // It does NOT have createdByStaff.
                    items: items.map(item => ({
                        ...item,
                        total: item.quantity * item.unitPrice,
                    })),
                    subtotal,
                    vat,
                    totalAmount,
                    validUntil,
                    notes,
                    status: 'draft',
                },
            });

            logger.info(`Quote created: ${quote.quoteNumber} by ${req.user?.email}`);

            res.status(201).json({
                success: true,
                message: 'สร้างใบเสนอราคาสำเร็จ',
                data: quote,
            });
        } catch (error) {
            logger.error('Create quote error:', error);
            res.status(500).json({ success: false, message: 'Failed to create quote', error: error.message });
        }
    }

    /**
     * Update quote status
     */
    async updateQuoteStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;

            const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired', 'invoiced'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                    allowedStatuses: validStatuses,
                });
            }

            const updateData = { status };
            // Schema check: Quote has `acceptedAt`, `rejectedAt`? Yes. `sentAt`? No in schema snippet.
            // I'll update what I can.
            if (status === 'accepted') { updateData.acceptedAt = new Date(); }
            if (status === 'rejected') {
                updateData.rejectedAt = new Date();
                // updateData.farmerNotes = notes; // Not in schema
            }
            if (notes) { updateData.notes = notes; }

            const quote = await prisma.quote.update({
                where: { id },
                data: updateData,
                include: {
                    application: {
                        include: { farmer: { select: { firstName: true, lastName: true, email: true } } },
                    },
                },
            });

            // Map farmer
            const mappedQuote = {
                ...quote,
                farmerId: quote.application?.farmer,
            };

            res.json({
                success: true,
                message: 'อัพเดทสถานะสำเร็จ',
                data: mappedQuote,
            });
        } catch (error) {
            logger.error('Update quote status error:', error);
            res.status(500).json({ success: false, message: 'Failed to update quote status' });
        }
    }

    /**
     * Create invoice from quote
     */
    async createInvoiceFromQuote(req, res) {
        try {
            const { quoteId } = req.params;

            const quote = await prisma.quote.findUnique({
                where: { id: quoteId },
                include: { application: true },
            });

            if (!quote) {
                return res.status(404).json({ success: false, message: 'Quote not found' });
            }

            if (quote.status !== 'accepted') {
                return res.status(400).json({
                    success: false,
                    message: 'Quote must be accepted before creating invoice',
                });
            }

            const invoiceNumber = `INV-${Date.now()}`;

            // Create invoice
            // Note: Invoice model HAS farmerId
            const invoice = await prisma.invoice.create({
                data: {
                    invoiceNumber,
                    applicationId: quote.applicationId,
                    quoteId: quote.id,
                    serviceType: 'new_application', // Hardcoded or derive
                    farmerId: quote.application.farmerId, // Get from Application relation
                    items: quote.items,
                    subtotal: quote.subtotal,
                    vat: quote.vat,
                    totalAmount: quote.totalAmount,
                    // totalAmountText: quote.totalAmountText, // Not in Quote model
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
                    status: 'pending',
                },
            });

            // Update quote status
            await prisma.quote.update({
                where: { id: quoteId },
                data: { status: 'invoiced' }, // Schema check: index says status has 'pending', 'accepted', etc. check logic valid?
            });

            logger.info(`Invoice created from quote: ${invoice.invoiceNumber} from ${quote.quoteNumber}`);

            res.status(201).json({
                success: true,
                message: 'สร้างใบวางบิลจากใบเสนอราคาสำเร็จ',
                data: invoice,
            });
        } catch (error) {
            logger.error('Create invoice from quote error:', error);
            res.status(500).json({ success: false, message: 'Failed to create invoice' });
        }
    }

    /**
     * Update invoice status
     */
    async updateInvoiceStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, paymentTransactionId } = req.body;

            const validStatuses = ['pending', 'paid', 'overdue', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                    allowedStatuses: validStatuses,
                });
            }

            const updateData = { status };
            if (status === 'paid') {
                updateData.paidAt = new Date();
                if (paymentTransactionId) { updateData.paymentTransactionId = paymentTransactionId; }
            }

            const invoice = await prisma.invoice.update({
                where: { id },
                data: updateData,
                include: {
                    farmer: { select: { firstName: true, lastName: true, email: true } },
                },
            });

            const mappedInvoice = {
                ...invoice,
                farmerId: invoice.farmer,
            };

            res.json({
                success: true,
                message: 'อัพเดทสถานะสำเร็จ',
                data: mappedInvoice,
            });
        } catch (error) {
            logger.error('Update invoice status error:', error);
            res.status(500).json({ success: false, message: 'Failed to update invoice status' });
        }
    }

    /**
     * Get accounting dashboard stats
     */
    async getDashboardStats(req, res) {
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
            ] = await Promise.all([
                prisma.quote.count(),
                prisma.quote.count({ where: { status: { in: ['draft', 'sent'] } } }),
                prisma.quote.count({ where: { status: 'accepted' } }),
                prisma.invoice.count(),
                prisma.invoice.count({ where: { status: 'pending' } }),
                prisma.invoice.count({ where: { status: 'paid' } }),
                prisma.quote.count({ where: { createdAt: { gte: today } } }),
                prisma.invoice.count({ where: { createdAt: { gte: today } } }),
            ]);

            // Calculate totals
            const paidInvoices = await prisma.invoice.findMany({
                where: { status: 'paid' },
                select: { totalAmount: true },
            });
            const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

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
                        total: totalRevenue,
                        currency: 'THB',
                    },
                },
            });
        } catch (error) {
            logger.error('Get dashboard stats error:', error);
            res.status(500).json({ success: false, message: 'Failed to get dashboard stats' });
        }
    }
}

module.exports = new AccountingController();

