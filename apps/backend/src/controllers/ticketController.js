/**
 * Ticket Controller (V2)
 * Request handler layer for ticket endpoints
 * Delegates business logic to TicketService
 * Follows Notifications standard pattern
 */

const ticketService = require('../services/ticketService');

class TicketController {
  /**
   * GET /api/v2/tickets
   * Get user's tickets
   */
  async getTickets(req, res, next) {
    try {
      const userId = req.user._id;
      const { status, limit, page } = req.query;

      const result = await ticketService.getUserTickets(userId, {
        status,
        limit,
        page,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v2/tickets/application/:applicationId
   * Get tickets for specific application
   */
  async getApplicationTickets(req, res, next) {
    try {
      const { applicationId } = req.params;
      const { limit, page } = req.query;

      const result = await ticketService.getApplicationTickets(applicationId, {
        limit,
        page,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v2/tickets/:id
   * Get specific ticket details
   */
  async getTicketById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      const ticket = await ticketService.getTicketById(id, userId, userRole);

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v2/tickets
   * Create a new ticket
   */
  async createTicket(req, res, next) {
    try {
      const userId = req.user._id;
      const ticket = await ticketService.createTicket(req.body, userId);

      res.status(201).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v2/tickets/:id/messages
   * Add message to ticket
   */
  async addMessage(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      const ticket = await ticketService.addMessage(id, userId, userRole, req.body);

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v2/tickets/:id/resolve
   * Resolve ticket
   */
  async resolveTicket(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const ticket = await ticketService.resolveTicket(id, userId);

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v2/tickets/:id/close
   * Close ticket
   */
  async closeTicket(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const ticket = await ticketService.closeTicket(id, userId);

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TicketController();
