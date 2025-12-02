/**
 * Payment API Routes
 * REST endpoints for payment operations
 *
 * @module routes/payment
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * Initialize payment routes with dependencies
 * @param {Object} dependencies - Service dependencies
 * @param {PaymentService} dependencies.paymentService - Payment service instance
 * @param {Object} dependencies.authMiddleware - Authentication middleware
 */
function initializePaymentRoutes(dependencies) {
  const { paymentService, authMiddleware } = dependencies;

  /**
   * @route   POST /api/payments
   * @desc    Create new payment
   * @access  Private (Farmer)
   * @body    {applicationId, farmerId, type}
   */
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const { applicationId, farmerId, type } = req.body;

      // Validate required fields
      if (!applicationId || !farmerId || !type) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: applicationId, farmerId, type',
        });
      }

      // Validate type
      if (!['initial', 'resubmission'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment type. Must be "initial" or "resubmission"',
        });
      }

      const payment = await paymentService.createPayment({
        applicationId,
        farmerId,
        type,
      });

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: payment,
      });
    } catch (error) {
      logger.error('[Payment API] Create payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create payment',
      });
    }
  });

  /**
   * @route   GET /api/payments/:id
   * @desc    Get payment by ID
   * @access  Private
   */
  router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;

      const payment = await paymentService.paymentRepository.findById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      logger.error('[Payment API] Get payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get payment',
      });
    }
  });

  /**
   * @route   PUT /api/payments/:id/complete
   * @desc    Complete payment
   * @access  Private (Farmer or Admin)
   * @body    {transactionId, method, receiptNumber, receiptUrl}
   */
  router.put('/:id/complete', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { transactionId, method, receiptNumber, receiptUrl } = req.body;

      if (!transactionId || !method) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: transactionId, method',
        });
      }

      const payment = await paymentService.completePayment(id, {
        transactionId,
        method,
        receiptNumber,
        receiptUrl,
      });

      res.json({
        success: true,
        message: 'Payment completed successfully',
        data: payment,
      });
    } catch (error) {
      logger.error('[Payment API] Complete payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to complete payment',
      });
    }
  });

  /**
   * @route   PUT /api/payments/:id/cancel
   * @desc    Cancel payment
   * @access  Private (Farmer or Admin)
   */
  router.put('/:id/cancel', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const payment = await paymentService.cancelPayment(id, reason);

      res.json({
        success: true,
        message: 'Payment cancelled successfully',
        data: payment,
      });
    } catch (error) {
      logger.error('[Payment API] Cancel payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to cancel payment',
      });
    }
  });

  /**
   * @route   GET /api/payments/application/:applicationId
   * @desc    Get payments by application ID
   * @access  Private
   */
  router.get('/application/:applicationId', authMiddleware, async (req, res) => {
    try {
      const { applicationId } = req.params;

      const payments = await paymentService.paymentRepository.findByApplication(applicationId);

      res.json({
        success: true,
        count: payments.length,
        data: payments,
      });
    } catch (error) {
      logger.error('[Payment API] Get application payments error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get application payments',
      });
    }
  });

  /**
   * @route   GET /api/payments/farmer/:farmerId
   * @desc    Get payments by farmer ID
   * @access  Private (Farmer or Admin)
   */
  router.get('/farmer/:farmerId', authMiddleware, async (req, res) => {
    try {
      const { farmerId } = req.params;
      const { status, type } = req.query;

      const filters = {};
      if (status) {
        filters.status = status;
      }
      if (type) {
        filters.type = type;
      }

      const payments = await paymentService.getFarmerPayments(farmerId, filters);

      res.json({
        success: true,
        count: payments.length,
        data: payments,
      });
    } catch (error) {
      logger.error('[Payment API] Get farmer payments error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get farmer payments',
      });
    }
  });

  /**
   * @route   GET /api/payments/status/:applicationId
   * @desc    Get payment status for application
   * @access  Private
   */
  router.get('/status/:applicationId', authMiddleware, async (req, res) => {
    try {
      const { applicationId } = req.params;

      const status = await paymentService.getPaymentStatus(applicationId);

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error('[Payment API] Get payment status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get payment status',
      });
    }
  });

  /**
   * @route   GET /api/payments/statistics
   * @desc    Get payment statistics (Admin only)
   * @access  Private (Admin)
   */
  router.get('/statistics', authMiddleware, async (req, res) => {
    try {
      const { startDate, endDate, status, type } = req.query;

      const filters = {};
      if (startDate) {
        filters.startDate = startDate;
      }
      if (endDate) {
        filters.endDate = endDate;
      }
      if (status) {
        filters.status = status;
      }
      if (type) {
        filters.type = type;
      }

      const statistics = await paymentService.getPaymentStatistics(filters);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logger.error('[Payment API] Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get payment statistics',
      });
    }
  });

  /**
   * @route   GET /api/payments/overdue
   * @desc    Get overdue payments (Admin only)
   * @access  Private (Admin)
   */
  router.get('/overdue', authMiddleware, async (req, res) => {
    try {
      const { days = 7 } = req.query;

      const overduePayments = await paymentService.paymentRepository.findOverdue(Number(days));

      res.json({
        success: true,
        count: overduePayments.length,
        data: overduePayments,
      });
    } catch (error) {
      logger.error('[Payment API] Get overdue payments error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get overdue payments',
      });
    }
  });

  /**
   * @route   POST /api/payments/check-required
   * @desc    Check if payment is required for application
   * @access  Private
   * @body    {applicationId, submissionCount}
   */
  router.post('/check-required', authMiddleware, async (req, res) => {
    try {
      const { applicationId, submissionCount } = req.body;

      if (!applicationId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: applicationId',
        });
      }

      const initialRequired = await paymentService.isInitialPaymentRequired(applicationId);
      const resubmissionRequired = submissionCount
        ? await paymentService.isResubmissionPaymentRequired(applicationId, submissionCount)
        : false;

      res.json({
        success: true,
        data: {
          initialRequired,
          resubmissionRequired,
          anyRequired: initialRequired || resubmissionRequired,
        },
      });
    } catch (error) {
      logger.error('[Payment API] Check payment required error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check payment requirement',
      });
    }
  });

  return router;
}

module.exports = initializePaymentRoutes;
