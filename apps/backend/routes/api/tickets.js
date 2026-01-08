/**
 * V2 Ticket Routes - Prisma Version
 * Support ticket system using PostgreSQL
 * Note: Ticket model not yet in schema - using simple JSON storage for now
 */

const express = require('express');
const router = express.Router();
const { authenticate, checkPermission } = require('../../middleware/auth-middleware');

// Temporary in-memory storage (will be replaced with Prisma model later)
let tickets = [];
let ticketIdCounter = 1;

const ticketController = {
    getTickets: async (req, res) => {
        try {
            let userTickets = tickets;
            if (req.user.role === 'farmer') {
                userTickets = tickets.filter(t => t.creator === req.user.userId);
            }
            res.json({ success: true, data: userTickets });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getApplicationTickets: async (req, res) => {
        try {
            const { applicationId } = req.params;
            const appTickets = tickets.filter(t => t.relatedApplication === applicationId);
            res.json({ success: true, data: appTickets });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getTicketById: async (req, res) => {
        try {
            const ticket = tickets.find(t => t.id === req.params.id);
            if (!ticket) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }
            res.json({ success: true, data: ticket });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createTicket: async (req, res) => {
        try {
            const { title, description, category, priority, relatedApplication } = req.body;
            const newTicket = {
                id: `ticket-${ticketIdCounter++}`,
                title,
                description,
                category,
                priority,
                relatedApplication,
                creator: req.user.userId,
                status: 'open',
                messages: [],
                createdAt: new Date()
            };
            tickets.push(newTicket);
            res.status(201).json({ success: true, data: newTicket });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    addMessage: async (req, res) => {
        try {
            const { content } = req.body;
            const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
            if (ticketIndex === -1) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }
            tickets[ticketIndex].messages.push({
                sender: req.user.userId,
                content,
                createdAt: new Date()
            });
            res.status(201).json({ success: true, data: tickets[ticketIndex] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    resolveTicket: async (req, res) => {
        try {
            const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
            if (ticketIndex === -1) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }
            tickets[ticketIndex].status = 'resolved';
            res.json({ success: true, data: tickets[ticketIndex] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    closeTicket: async (req, res) => {
        try {
            const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
            if (ticketIndex === -1) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }
            tickets[ticketIndex].status = 'closed';
            res.json({ success: true, data: tickets[ticketIndex] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

// All routes require authentication
router.use(authenticate);

router.get('/', checkPermission('dashboard.view'), ticketController.getTickets);
router.get('/application/:applicationId', checkPermission('application.read'), ticketController.getApplicationTickets);
router.get('/:id', checkPermission('dashboard.view'), ticketController.getTicketById);
router.post('/', checkPermission('dashboard.view'), ticketController.createTicket);
router.post('/:id/messages', checkPermission('dashboard.view'), ticketController.addMessage);
router.put('/:id/resolve', checkPermission('dashboard.view'), ticketController.resolveTicket);
router.put('/:id/close', checkPermission('dashboard.view'), ticketController.closeTicket);

module.exports = router;
