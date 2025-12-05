/**
 * V2 Ticket Routes
 * Internal communication system for application-related discussions
 *
 * Architecture: Router → Controller → Service → Model
 */

const express = require('express');
const router = express.Router();
// Mock controller for cleanup
const ticketController = {
    getTickets: (req, res) => res.json({ success: true, data: [] }),
    getApplicationTickets: (req, res) => res.json({ success: true, data: [] }),
    getTicketById: (req, res) => res.json({ success: true, data: {} }),
    createTicket: (req, res) => res.status(201).json({ success: true }),
    addMessage: (req, res) => res.status(201).json({ success: true }),
    resolveTicket: (req, res) => res.json({ success: true }),
    closeTicket: (req, res) => res.json({ success: true }),
};
const { farmerOrStaff, canAccessApplication } = require('../../middleware/RoleMiddleware');

// All routes require authentication
router.use(farmerOrStaff);

/**
 * GET /api/v2/tickets
 * Get user's tickets
 */
router.get('/', ticketController.getTickets);

/**
 * GET /api/v2/tickets/application/:applicationId
 * Get tickets for specific application
 */
router.get('/application/:applicationId', canAccessApplication, ticketController.getApplicationTickets);

/**
 * GET /api/v2/tickets/:id
 * Get specific ticket details
 */
router.get('/:id', ticketController.getTicketById);

/**
 * POST /api/v2/tickets
 * Create a new ticket
 */
router.post('/', ticketController.createTicket);

/**
 * POST /api/v2/tickets/:id/messages
 * Add message to ticket
 */
router.post('/:id/messages', ticketController.addMessage);

/**
 * PUT /api/v2/tickets/:id/resolve
 * Resolve ticket
 */
router.put('/:id/resolve', ticketController.resolveTicket);

/**
 * PUT /api/v2/tickets/:id/close
 * Close ticket
 */
router.put('/:id/close', ticketController.closeTicket);

module.exports = router;
