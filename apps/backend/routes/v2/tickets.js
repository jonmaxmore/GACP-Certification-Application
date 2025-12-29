const express = require('express');
const router = express.Router();
const Ticket = require('../../models/TicketModel');
const { authenticate, checkPermission } = require('../../middleware/AuthMiddleware');

// Real implementation
const ticketController = {
    // Get all tickets (for admin/staff or own tickets for farmer)
    getTickets: async (req, res) => {
        try {
            const query = {};
            // If not admin/staff, only show own tickets
            if (req.user.role === 'farmer') {
                query.creator = req.user.userId;
            } else if (req.user.role === 'officer' || req.user.role === 'auditor') {
                // Officers/Auditors see assigned or all? Let's say assigned or created by them
                // Or potentially all for now to be safe, specific logic can be refined
                // query.$or = [{ assignee: req.user.userId }, { creator: req.user.userId }];
            }

            const tickets = await Ticket.find(query)
                .populate('creator', 'name email role')
                .populate('assignee', 'name email')
                .sort({ createdAt: -1 });

            res.json({ success: true, data: tickets });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get tickets for a specific application
    getApplicationTickets: async (req, res) => {
        try {
            const { applicationId } = req.params;
            const tickets = await Ticket.find({ relatedApplication: applicationId })
                .populate('creator', 'name email role')
                .populate('assignee', 'name email')
                .sort({ createdAt: -1 });

            res.json({ success: true, data: tickets });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get ticket by ID
    getTicketById: async (req, res) => {
        try {
            const ticket = await Ticket.findById(req.params.id)
                .populate('creator', 'name email role')
                .populate('assignee', 'name email')
                .populate('messages.sender', 'name email role');

            if (!ticket) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }

            // Access control check (optional but recommended)
            if (req.user.role === 'farmer' && ticket.creator.toString() !== req.user.userId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            res.json({ success: true, data: ticket });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Create a new ticket
    createTicket: async (req, res) => {
        try {
            const { title, description, category, priority, relatedApplication } = req.body;

            const newTicket = new Ticket({
                title,
                description,
                category,
                priority,
                relatedApplication,
                creator: req.user.userId,
                status: 'open'
            });

            await newTicket.save();
            res.status(201).json({ success: true, data: newTicket });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Add message to ticket
    addMessage: async (req, res) => {
        try {
            const { content, attachments } = req.body;
            const ticket = await Ticket.findById(req.params.id);

            if (!ticket) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }

            ticket.messages.push({
                sender: req.user.userId,
                content,
                attachments
            });

            // Auto-update status if needed
            if (ticket.status === 'resolved' || ticket.status === 'closed') {
                ticket.status = 'in_progress'; // Re-open if new message?
            }

            await ticket.save();

            // Return the updated ticket with populated messages
            const updatedTicket = await Ticket.findById(req.params.id)
                .populate('messages.sender', 'name email role');

            res.status(201).json({ success: true, data: updatedTicket });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Resolve ticket
    resolveTicket: async (req, res) => {
        try {
            const ticket = await Ticket.findByIdAndUpdate(
                req.params.id,
                { status: 'resolved' },
                { new: true }
            );

            if (!ticket) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }

            res.json({ success: true, data: ticket });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Close ticket
    closeTicket: async (req, res) => {
        try {
            const ticket = await Ticket.findByIdAndUpdate(
                req.params.id,
                { status: 'closed' },
                { new: true }
            );

            if (!ticket) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }

            res.json({ success: true, data: ticket });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v2/tickets
 * Get user's tickets
 */
router.get('/', checkPermission('dashboard.view'), ticketController.getTickets);

/**
 * GET /api/v2/tickets/application/:applicationId
 * Get tickets for specific application
 */
router.get('/application/:applicationId', checkPermission('application.read', 'application', 'applicationId'), ticketController.getApplicationTickets);

/**
 * GET /api/v2/tickets/:id
 * Get specific ticket details
 */
router.get('/:id', checkPermission('dashboard.view'), ticketController.getTicketById);

/**
 * POST /api/v2/tickets
 * Create a new ticket
 */
router.post('/', checkPermission('dashboard.view'), ticketController.createTicket);

/**
 * POST /api/v2/tickets/:id/messages
 * Add message to ticket
 */
router.post('/:id/messages', checkPermission('dashboard.view'), ticketController.addMessage);

/**
 * PUT /api/v2/tickets/:id/resolve
 * Resolve ticket
 */
router.put('/:id/resolve', checkPermission('dashboard.view'), ticketController.resolveTicket);

/**
 * PUT /api/v2/tickets/:id/close
 * Close ticket
 */
router.put('/:id/close', checkPermission('dashboard.view'), ticketController.closeTicket);

module.exports = router;

