const express = require('express');
const router = express.Router();
const Invoice = require('../../models/InvoiceModel');

/**
 * Invoice Routes - API สำหรับใบวางบิล
 * 
 * GET  /api/v2/invoices/my           - Get my invoices
 * GET  /api/v2/invoices/:invoiceId   - Get invoice detail
 * POST /api/v2/invoices/:invoiceId/pay - Mark as paid (after payment confirmation)
 */

// Farmer: Get my invoices
router.get('/my', async (req, res) => {
    try {
        const farmerId = req.userId;
        const { status } = req.query;

        const filter = { farmerId };
        if (status) {
            filter.status = status;
        }

        const invoices = await Invoice.find(filter)
            .populate('applicationId', 'applicationNumber serviceType')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: invoices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoices',
            error: error.message
        });
    }
});

// Get invoice detail
router.get('/:invoiceId', async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const invoice = await Invoice.findById(invoiceId)
            .populate('applicationId')
            .populate('quoteId');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoice',
            error: error.message
        });
    }
});

// Mark invoice as paid (called after payment confirmation)
router.post('/:invoiceId/pay', async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const { transactionId } = req.body;

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        invoice.status = 'paid';
        invoice.paidAt = new Date();
        if (transactionId) {
            invoice.paymentTransactionId = transactionId;
        }
        await invoice.save();

        // Update application status
        const Application = require('../../models/ApplicationModel');
        const { APPLICATION_STATUS } = require('../../constants/ServiceTypeEnum');

        await Application.findByIdAndUpdate(invoice.applicationId, {
            status: APPLICATION_STATUS.PAYMENT_RECEIVED
        });

        res.json({
            success: true,
            message: 'Invoice marked as paid',
            data: invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update invoice',
            error: error.message
        });
    }
});

module.exports = router;

