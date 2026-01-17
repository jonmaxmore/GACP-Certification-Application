/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management and payments
 */

const express = require('express');
const router = express.Router();
const invoiceService = require('../../services/invoice-service');
const { authenticateDTAM, authenticateFarmer } = require('../../middleware/auth-middleware');

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: List all invoices (Staff Only)
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 */
router.get('/', authenticateDTAM, async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };
        const invoices = await invoiceService.listAll(filters, req.query.limit ? parseInt(req.query.limit) : 50);
        res.json({ success: true, data: { invoices } });
    } catch (error) {
        console.error('[Invoices] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
    }
});

/**
 * @swagger
 * /api/invoices/my:
 *   get:
 *     summary: Get my invoices (Farmer Only)
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 */
router.get('/my', authenticateFarmer, async (req, res) => {
    try {
        const invoices = await invoiceService.listByFarmer(req.user.id, req.query.status);
        res.json({ success: true, data: invoices });
    } catch (error) {
        console.error('[Invoices] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
    }
});

/**
 * @swagger
 * /api/invoices/summary:
 *   get:
 *     summary: Get financial summary (Staff Only)
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 */
router.get('/summary', authenticateDTAM, async (req, res) => {
    try {
        const summary = await invoiceService.getSummary(req.query.startDate, req.query.endDate);
        res.json({ success: true, data: summary });
    } catch (error) {
        console.error('[Invoices] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch summary' });
    }
});

/**
 * @swagger
 * /api/invoices/{invoiceId}:
 *   get:
 *     summary: Get invoice details
 *     tags: [Invoices]
 */
router.get('/:invoiceId', authenticateDTAM, async (req, res) => {
    try {
        const invoice = await invoiceService.getById(req.params.invoiceId);
        if (!invoice) {return res.status(404).json({ success: false, message: 'Invoice not found' });}
        res.json({ success: true, data: invoice });
    } catch (error) {
        console.error('[Invoices] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch invoice' });
    }
});

/**
 * @swagger
 * /api/invoices/{invoiceId}/pdf:
 *   get:
 *     summary: Download Invoice PDF
 *     tags: [Invoices]
 */
router.get('/:invoiceId/pdf', async (req, res) => {
    try {
        const pdfBuffer = await invoiceService.generatePdf(req.params.invoiceId);
        // We need to fetch ID first to get number, or just trust service
        // For simplicity, service wrapper doesn't return metadata, but we can infer or fetch again if needed for filename
        // Optimizing: Let's assume generic name or fetch ID first in controller if filename critical
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${req.params.invoiceId}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error('[Invoices] PDF Error:', error);
        res.status(500).send('Failed to generate PDF');
    }
});

/**
 * @swagger
 * /api/invoices/{invoiceId}/pay:
 *   post:
 *     summary: Mark invoice as paid (Manual)
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 */
router.post('/:invoiceId/pay', authenticateDTAM, async (req, res) => {
    try {
        const invoice = await invoiceService.markAsPaid(req.params.invoiceId, req.body.transactionId);
        res.json({ success: true, message: 'Invoice marked as paid', data: invoice });
    } catch (error) {
        console.error('[Invoices] Pay Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/invoices/{invoiceId}/pay/ksher:
 *   post:
 *     summary: Initiate Ksher Payment
 *     tags: [Invoices]
 */
router.post('/:invoiceId/pay/ksher', async (req, res) => {
    try {
        const result = await invoiceService.initiateKsherPayment(req.params.invoiceId);
        res.json({ success: true, payment_url: result.payment_url });
    } catch (error) {
        console.error('[Invoices] Ksher Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
