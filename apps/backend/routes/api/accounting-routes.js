/**
 * Accounting API Routes
 * Endpoints for Quote/Invoice/Receipt management (ACCOUNTANT role)
 */

const express = require('express');
const router = express.Router();
const accountingController = require('../../controllers/AccountingController');
const { authenticate, checkPermission } = require('../../middleware/auth-middleware');

// All routes require authentication
router.use(authenticate);

// Dashboard stats
router.get(
    '/dashboard',
    checkPermission('dashboard.accounting'),
    accountingController.getDashboardStats.bind(accountingController)
);

// Quotes
router.get(
    '/quotes',
    checkPermission('quote.manage'),
    accountingController.getQuotes.bind(accountingController)
);

router.post(
    '/quotes',
    checkPermission('quote.manage'),
    accountingController.createQuote.bind(accountingController)
);

router.put(
    '/quotes/:id/status',
    checkPermission('quote.manage'),
    accountingController.updateQuoteStatus.bind(accountingController)
);

router.post(
    '/quotes/:quoteId/invoice',
    checkPermission('invoice.manage'),
    accountingController.createInvoiceFromQuote.bind(accountingController)
);

// Invoices
router.get(
    '/invoices',
    checkPermission('invoice.manage'),
    accountingController.getInvoices.bind(accountingController)
);

router.put(
    '/invoices/:id/status',
    checkPermission('invoice.manage'),
    accountingController.updateInvoiceStatus.bind(accountingController)
);

// Document number update (key feature for accountant)
router.put(
    '/documents/:type/:id/number',
    checkPermission('document.update'),
    accountingController.updateDocumentNumber.bind(accountingController)
);

module.exports = router;

