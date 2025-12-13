const express = require('express');
const router = express.Router();
const QuoteController = require('../../controllers/QuoteController');

/**
 * Quote Routes - API สำหรับใบเสนอราคา
 * 
 * Staff routes:
 * - POST   /api/v2/quotes           - Create new quote
 * - GET    /api/v2/quotes/application/:applicationId - Get quotes by application
 * - POST   /api/v2/quotes/:quoteId/send   - Send quote to farmer
 * 
 * Farmer routes:
 * - GET    /api/v2/quotes/my        - Get my received quotes
 * - POST   /api/v2/quotes/:quoteId/accept - Accept quote
 * - POST   /api/v2/quotes/:quoteId/reject - Reject quote
 */

// Staff: Create new quote
router.post('/', QuoteController.createQuote);

// Staff: Get quotes by application
router.get('/application/:applicationId', QuoteController.getQuotesByApplication);

// Staff: Send quote to farmer
router.post('/:quoteId/send', QuoteController.sendQuote);

// Farmer: Get my quotes
router.get('/my', QuoteController.getQuotesForFarmer);

// Farmer: Accept quote
router.post('/:quoteId/accept', QuoteController.acceptQuote);

// Farmer: Reject quote
router.post('/:quoteId/reject', QuoteController.rejectQuote);

module.exports = router;
