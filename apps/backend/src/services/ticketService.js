/**
 * Ticket Service (V2)
 * Business logic layer for ticket management
 * Follows layered architecture pattern (matches Notifications standard)
 */

const Ticket = require('../../models/Ticket');
const { ValidationError, NotFoundError, ForbiddenError } = require('../../shared/errors');
const logger = require('../../shared/logger');

class TicketService {
  /**
   * Get user's tickets with filtering and pagination
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Tickets and metadata
   */
  async getUserTickets(userId, options = {}) {
    const { status, limit = 20, page = 1 } = options;

    // Input validation
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    try {
      const skip = (parseInt(page) - 1) * parsedLimit;

      // Get tickets using model method
      const allTickets = await Ticket.getUserTickets(userId, status);

      // Apply pagination
      const paginatedTickets = allTickets.slice(skip, skip + parsedLimit);
      const totalCount = allTickets.length;

      logger.info('User tickets retrieved', {
        userId,
        status,
        count: paginatedTickets.length,
      });

      return {
        tickets: paginatedTickets,
        pagination: {
          page: parseInt(page),
          limit: parsedLimit,
          total: totalCount,
          pages: Math.ceil(totalCount / parsedLimit),
        },
      };
    } catch (error) {
      logger.error('Failed to retrieve user tickets', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get tickets for specific application
   * @param {string} applicationId - Application ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Tickets and metadata
   */
  async getApplicationTickets(applicationId, options = {}) {
    const { limit = 20, page = 1 } = options;

    // Input validation
    if (!applicationId) {
      throw new ValidationError('Application ID is required');
    }

    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    try {
      const allTickets = await Ticket.getApplicationTickets(applicationId);

      // Apply pagination
      const skip = (parseInt(page) - 1) * parsedLimit;
      const paginatedTickets = allTickets.slice(skip, skip + parsedLimit);
      const totalCount = allTickets.length;

      logger.info('Application tickets retrieved', {
        applicationId,
        count: paginatedTickets.length,
      });

      return {
        tickets: paginatedTickets,
        pagination: {
          page: parseInt(page),
          limit: parsedLimit,
          total: totalCount,
          pages: Math.ceil(totalCount / parsedLimit),
        },
      };
    } catch (error) {
      logger.error('Failed to retrieve application tickets', {
        applicationId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get specific ticket details
   * @param {string} ticketId - Ticket ID
   * @param {string} userId - User ID (for authorization)
   * @param {string} userRole - User role
   * @returns {Promise<Object>} Ticket details
   */
  async getTicketById(ticketId, userId, userRole) {
    // Input validation
    if (!ticketId || !userId) {
      throw new ValidationError('Ticket ID and User ID are required');
    }

    try {
      const ticket = await Ticket.findById(ticketId)
        .populate('applicant', 'fullName email')
        .populate('assignedStaff', 'fullName role')
        .populate('messages.sender', 'fullName role')
        .populate('applicationId', 'applicationNumber currentStatus');

      if (!ticket) {
        throw new NotFoundError('Ticket not found');
      }

      // Check access authorization
      const isApplicant = ticket.applicant._id.toString() === userId.toString();
      const isAssignedStaff = ticket.assignedStaff && ticket.assignedStaff._id.toString() === userId.toString();
      const isAdmin = userRole === 'admin';

      if (!isApplicant && !isAssignedStaff && !isAdmin) {
        throw new ForbiddenError('Access denied to this ticket');
      }

      logger.info('Ticket retrieved', {
        ticketId,
        userId,
      });

      return ticket;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      logger.error('Failed to retrieve ticket', {
        ticketId,
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create a new ticket
   * @param {Object} data - Ticket data
   * @param {string} userId - User ID (applicant)
   * @returns {Promise<Object>} Created ticket
   */
  async createTicket(data, userId) {
    const {
      applicationId,
      subject,
      category = 'general_inquiry',
      priority = 1,
      initialMessage,
      fieldReference,
    } = data;

    // Input validation
    if (!applicationId || !subject || !initialMessage) {
      throw new ValidationError('Missing required fields: applicationId, subject, initialMessage');
    }

    // Validate category
    const validCategories = ['document_correction', 'payment_issue', 'general_inquiry', 'technical_support'];
    if (!validCategories.includes(category)) {
      throw new ValidationError(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Validate priority
    if (![0, 1, 2, 3].includes(priority)) {
      throw new ValidationError('Priority must be 0 (low), 1 (normal), 2 (high), or 3 (urgent)');
    }

    // Sanitize inputs
    const sanitizedData = {
      applicationId,
      applicant: userId,
      subject: subject.trim().substring(0, 200),
      category,
      priority,
      messages: [
        {
          sender: userId,
          message: initialMessage.trim().substring(0, 2000),
          fieldReference: fieldReference ? fieldReference.trim() : null,
        },
      ],
    };

    try {
      const ticket = await Ticket.createTicket(sanitizedData);

      logger.info('Ticket created', {
        ticketId: ticket._id,
        applicationId,
        category,
        userId,
      });

      return ticket;
    } catch (error) {
      logger.error('Failed to create ticket', {
        applicationId,
        category,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Add message to ticket
   * @param {string} ticketId - Ticket ID
   * @param {string} userId - User ID (sender)
   * @param {string} userRole - User role
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Updated ticket
   */
  async addMessage(ticketId, userId, userRole, messageData) {
    const { message, fieldReference, attachments = [] } = messageData;

    // Input validation
    if (!ticketId || !userId || !message) {
      throw new ValidationError('Ticket ID, User ID, and message are required');
    }

    // Sanitize message
    const sanitizedMessage = message.trim().substring(0, 2000);
    if (!sanitizedMessage) {
      throw new ValidationError('Message cannot be empty');
    }

    try {
      const ticket = await Ticket.findById(ticketId);

      if (!ticket) {
        throw new NotFoundError('Ticket not found');
      }

      // Check access authorization
      const isApplicant = ticket.applicant.toString() === userId.toString();
      const isAssignedStaff = ticket.assignedStaff && ticket.assignedStaff.toString() === userId.toString();
      const isAdmin = userRole === 'admin';

      if (!isApplicant && !isAssignedStaff && !isAdmin) {
        throw new ForbiddenError('Access denied to this ticket');
      }

      await ticket.addMessage(userId, sanitizedMessage, fieldReference, attachments);

      logger.info('Message added to ticket', {
        ticketId,
        senderId: userId,
      });

      return ticket;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      logger.error('Failed to add message to ticket', {
        ticketId,
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Resolve ticket
   * @param {string} ticketId - Ticket ID
   * @param {string} userId - User ID (resolver)
   * @returns {Promise<Object>} Updated ticket
   */
  async resolveTicket(ticketId, userId) {
    if (!ticketId || !userId) {
      throw new ValidationError('Ticket ID and User ID are required');
    }

    try {
      const ticket = await Ticket.findById(ticketId);

      if (!ticket) {
        throw new NotFoundError('Ticket not found');
      }

      await ticket.resolve();

      logger.info('Ticket resolved', {
        ticketId,
        resolvedBy: userId,
      });

      return ticket;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Failed to resolve ticket', {
        ticketId,
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Close ticket
   * @param {string} ticketId - Ticket ID
   * @param {string} userId - User ID (closer)
   * @returns {Promise<Object>} Updated ticket
   */
  async closeTicket(ticketId, userId) {
    if (!ticketId || !userId) {
      throw new ValidationError('Ticket ID and User ID are required');
    }

    try {
      const ticket = await Ticket.findById(ticketId);

      if (!ticket) {
        throw new NotFoundError('Ticket not found');
      }

      await ticket.close();

      logger.info('Ticket closed', {
        ticketId,
        closedBy: userId,
      });

      return ticket;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Failed to close ticket', {
        ticketId,
        userId,
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new TicketService();
