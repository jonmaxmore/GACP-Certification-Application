const Quote = require('../database/models/quote-model');
const Invoice = require('../database/models/invoice-model');
const Application = require('../database/models/application-model');
const { APPLICATION_STATUS } = require('../constants/service-type-enum');

/**
 * Quote Controller - จัดการใบเสนอราคา
 */

/**
 * Create a new quote (Staff only)
 */
const createQuote = async (req, res) => {
    try {
        const { applicationId, items, validDays = 30, notes } = req.body;
        const staffId = req.userId;

        // Validate application exists
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Calculate valid until date
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + validDays);

        // Calculate totals
        const processedItems = items.map(item => ({
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice,
            total: (item.quantity || 1) * item.unitPrice
        }));

        const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);

        const quote = new Quote({
            applicationId,
            serviceType: application.serviceType,
            createdByStaff: staffId,
            farmerId: application.farmerId,
            items: processedItems,
            subtotal,
            totalAmount: subtotal,
            validUntil,
            notes,
            status: 'draft'
        });

        await quote.save();

        res.status(201).json({
            success: true,
            message: 'Quote created successfully',
            data: quote
        });
    } catch (error) {
        console.error('Create quote error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create quote',
            error: error.message
        });
    }
};

/**
 * Get quotes for an application
 */
const getQuotesByApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const quotes = await Quote.find({ applicationId })
            .populate('createdByStaff', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: quotes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quotes',
            error: error.message
        });
    }
};

/**
 * Get quotes for a farmer (their applications)
 */
const getQuotesForFarmer = async (req, res) => {
    try {
        const farmerId = req.userId;
        const { status } = req.query;

        const filter = { farmerId };
        if (status) {
            filter.status = status;
        }

        const quotes = await Quote.find(filter)
            .populate('applicationId', 'applicationNumber serviceType')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: quotes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quotes',
            error: error.message
        });
    }
};

/**
 * Send quote to farmer (Staff only)
 */
const sendQuote = async (req, res) => {
    try {
        const { quoteId } = req.params;

        const quote = await Quote.findById(quoteId);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        if (quote.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Quote already sent or processed'
            });
        }

        quote.status = 'sent';
        quote.sentAt = new Date();
        await quote.save();

        // Update application status
        await Application.findByIdAndUpdate(quote.applicationId, {
            status: APPLICATION_STATUS.QUOTE_SENT,
            'teamQuote.quoteId': quote._id,
            'teamQuote.receivedAt': new Date(),
            'teamQuote.amount': quote.totalAmount
        });

        // Send notification to farmer
        const { sendNotification, NotifyType } = require('../services/services/notification-service');
        await sendNotification(quote.farmerId, NotifyType.QUOTE_RECEIVED, {
            quoteId: quote._id,
            quoteNumber: quote.quoteNumber,
            amount: quote.totalAmount,
            validUntil: quote.validUntil
        });

        res.json({
            success: true,
            message: 'Quote sent to farmer',
            data: quote
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send quote',
            error: error.message
        });
    }
};

/**
 * Accept quote (Farmer only)
 */
const acceptQuote = async (req, res) => {
    try {
        const { quoteId } = req.params;
        const farmerId = req.userId;

        const quote = await Quote.findById(quoteId);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        // Verify farmer owns this quote
        if (quote.farmerId.toString() !== farmerId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (quote.status !== 'sent') {
            return res.status(400).json({
                success: false,
                message: 'Quote cannot be accepted in current status'
            });
        }

        // Check if expired
        if (new Date() > quote.validUntil) {
            quote.status = 'expired';
            await quote.save();
            return res.status(400).json({
                success: false,
                message: 'Quote has expired'
            });
        }

        // Accept quote
        quote.status = 'accepted';
        quote.acceptedAt = new Date();

        // Generate invoice
        const invoice = new Invoice({
            applicationId: quote.applicationId,
            quoteId: quote._id,
            serviceType: quote.serviceType,
            farmerId: quote.farmerId,
            items: quote.items,
            subtotal: quote.subtotal,
            vat: quote.vat || 0,
            totalAmount: quote.totalAmount,
            totalAmountText: quote.totalAmountText
        });

        await invoice.save();

        quote.invoiceId = invoice._id;
        quote.status = 'invoiced';
        await quote.save();

        // Update application
        await Application.findByIdAndUpdate(quote.applicationId, {
            status: APPLICATION_STATUS.AWAITING_PAYMENT,
            'teamQuote.acceptedAt': new Date()
        });

        // Send notification about new invoice
        const { sendNotification, NotifyType } = require('../services/services/notification-service');
        await sendNotification(quote.farmerId, NotifyType.INVOICE_RECEIVED, {
            invoiceId: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.totalAmount,
            applicationId: quote.applicationId
        });

        res.json({
            success: true,
            message: 'Quote accepted, invoice generated',
            data: {
                quote,
                invoice
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to accept quote',
            error: error.message
        });
    }
};

/**
 * Reject quote (Farmer only)
 */
const rejectQuote = async (req, res) => {
    try {
        const { quoteId } = req.params;
        const { reason } = req.body;
        const farmerId = req.userId;

        const quote = await Quote.findById(quoteId);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        if (quote.farmerId.toString() !== farmerId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        quote.status = 'rejected';
        quote.rejectedAt = new Date();
        quote.farmerNotes = reason;
        await quote.save();

        // Update application to pending team review again
        await Application.findByIdAndUpdate(quote.applicationId, {
            status: APPLICATION_STATUS.PENDING_TEAM_REVIEW
        });

        res.json({
            success: true,
            message: 'Quote rejected',
            data: quote
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reject quote',
            error: error.message
        });
    }
};

module.exports = {
    createQuote,
    getQuotesByApplication,
    getQuotesForFarmer,
    sendQuote,
    acceptQuote,
    rejectQuote
};
