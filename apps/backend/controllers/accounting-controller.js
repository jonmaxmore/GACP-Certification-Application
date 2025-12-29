/**
 * Accounting Controller
 * Handles Quote, Invoice, and Receipt management for ACCOUNTANT role
 * Features: CRUD, document number updates, real-time sync
 */

const Quote = require('../models/QuoteModel');
const Invoice = require('../models/InvoiceModel');
const User = require('../models/UserModel');
const { createLogger } = require('../shared/logger');
const logger = createLogger('accounting-controller');

class AccountingController {
    /**
     * Get all quotes with filters
     */
    async getQuotes(req, res) {
        try {
            const { status, farmerId, page = 1, limit = 20 } = req.query;
            const query = {};

            if (status) query.status = status;
            if (farmerId) query.farmerId = farmerId;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [quotes, total] = await Promise.all([
                Quote.find(query)
                    .populate('farmerId', 'firstName lastName email')
                    .populate('applicationId', 'applicationNumber')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                Quote.countDocuments(query),
            ]);

            res.json({
                success: true,
                data: quotes,
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
            const query = {};

            if (status) query.status = status;
            if (farmerId) query.farmerId = farmerId;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [invoices, total] = await Promise.all([
                Invoice.find(query)
                    .populate('farmerId', 'firstName lastName email')
                    .populate('applicationId', 'applicationNumber')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                Invoice.countDocuments(query),
            ]);

            res.json({
                success: true,
                data: invoices,
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
     * Key feature for accountant to update temporary numbers to official ones
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

            let document;
            let Model = type === 'quote' ? Quote : Invoice;
            let numberField = type === 'quote' ? 'quoteNumber' : 'invoiceNumber';

            // Check if new number already exists
            const existing = await Model.findOne({ [numberField]: newNumber });
            if (existing && existing._id.toString() !== id) {
                return res.status(409).json({
                    success: false,
                    message: `${type === 'quote' ? 'Quote' : 'Invoice'} number already exists`,
                });
            }

            // Update document number
            document = await Model.findByIdAndUpdate(
                id,
                {
                    [numberField]: newNumber,
                    notes: notes || undefined,
                    $push: {
                        updateHistory: {
                            field: numberField,
                            oldValue: document?.[numberField],
                            newValue: newNumber,
                            updatedBy: req.user?.id,
                            updatedAt: new Date(),
                        },
                    },
                },
                { new: true }
            );

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: `${type === 'quote' ? 'Quote' : 'Invoice'} not found`,
                });
            }

            logger.info(`Document number updated: ${type} ${id} → ${newNumber} by ${req.user?.email}`);

            res.json({
                success: true,
                message: 'เลขที่เอกสารอัพเดทสำเร็จ',
                data: document,
            });
        } catch (error) {
            logger.error('Update document number error:', error);
            res.status(500).json({ success: false, message: 'Failed to update document number' });
        }
    }

    /**
     * Create new quote
     */
    async createQuote(req, res) {
        try {
            const { applicationId, farmerId, items, validDays = 30, notes } = req.body;

            // Calculate totals
            const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
            const vat = 0; // Thailand: exempt for GACP services
            const totalAmount = subtotal + vat;

            // Valid until date
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + validDays);

            const quote = new Quote({
                applicationId,
                farmerId,
                createdByStaff: req.user?.id,
                serviceType: 'new_application',
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
            });

            await quote.save();

            logger.info(`Quote created: ${quote.quoteNumber} by ${req.user?.email}`);

            res.status(201).json({
                success: true,
                message: 'สร้างใบเสนอราคาสำเร็จ',
                data: quote,
            });
        } catch (error) {
            logger.error('Create quote error:', error);
            res.status(500).json({ success: false, message: 'Failed to create quote' });
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
            if (status === 'sent') updateData.sentAt = new Date();
            if (status === 'accepted') updateData.acceptedAt = new Date();
            if (status === 'rejected') {
                updateData.rejectedAt = new Date();
                updateData.farmerNotes = notes;
            }
            if (notes) updateData.notes = notes;

            const quote = await Quote.findByIdAndUpdate(id, updateData, { new: true })
                .populate('farmerId', 'firstName lastName email');

            if (!quote) {
                return res.status(404).json({ success: false, message: 'Quote not found' });
            }

            res.json({
                success: true,
                message: 'อัพเดทสถานะสำเร็จ',
                data: quote,
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

            const quote = await Quote.findById(quoteId);
            if (!quote) {
                return res.status(404).json({ success: false, message: 'Quote not found' });
            }

            if (quote.status !== 'accepted') {
                return res.status(400).json({
                    success: false,
                    message: 'Quote must be accepted before creating invoice',
                });
            }

            // Create invoice from quote data
            const invoice = new Invoice({
                applicationId: quote.applicationId,
                quoteId: quote._id,
                serviceType: quote.serviceType,
                farmerId: quote.farmerId,
                items: quote.items,
                subtotal: quote.subtotal,
                vat: quote.vat,
                totalAmount: quote.totalAmount,
                totalAmountText: quote.totalAmountText,
                status: 'pending',
            });

            await invoice.save();

            // Update quote status
            quote.status = 'invoiced';
            quote.invoiceId = invoice._id;
            await quote.save();

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
                if (paymentTransactionId) updateData.paymentTransactionId = paymentTransactionId;
            }

            const invoice = await Invoice.findByIdAndUpdate(id, updateData, { new: true })
                .populate('farmerId', 'firstName lastName email');

            if (!invoice) {
                return res.status(404).json({ success: false, message: 'Invoice not found' });
            }

            res.json({
                success: true,
                message: 'อัพเดทสถานะสำเร็จ',
                data: invoice,
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
                Quote.countDocuments(),
                Quote.countDocuments({ status: { $in: ['draft', 'sent'] } }),
                Quote.countDocuments({ status: 'accepted' }),
                Invoice.countDocuments(),
                Invoice.countDocuments({ status: 'pending' }),
                Invoice.countDocuments({ status: 'paid' }),
                Quote.countDocuments({ createdAt: { $gte: today } }),
                Invoice.countDocuments({ createdAt: { $gte: today } }),
            ]);

            // Calculate totals
            const paidInvoices = await Invoice.find({ status: 'paid' });
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

