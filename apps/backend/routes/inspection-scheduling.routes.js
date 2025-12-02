/**
 * Inspection Scheduling Routes
 * Handles inspection scheduling operations
 */

const express = require('express');
const router = express.Router();
const InspectionSchedulingService = require('../services/InspectionSchedulingService');
const logger = require('../shared/logger');
const { authenticateAny } = require('../middleware/auth-clean-middleware');

const inspectionService = new InspectionSchedulingService();

// Apply authentication to all routes
router.use(authenticateAny);

/**
 * POST /inspections/:id/schedule
 * Create a new inspection schedule
 */
router.post('/inspections/:id/schedule', async (req, res, next) => {
  try {
    const { id: inspectionId } = req.params;
    const { scheduledDate, scheduledTime, inspectorTeam, notes, type, applicationId, farmerId } = req.body;

    // Validate required fields
    if (!scheduledDate || !scheduledTime || !type) {
      return res.status(400).json({
        success: false,
        error: 'Scheduled date, time, and type are required',
      });
    }

    if (!farmerId) {
      return res.status(400).json({
        success: false,
        error: 'Farmer ID is required',
      });
    }

    // Create schedule using service
    const schedule = await inspectionService.createSchedule({
      inspectionId,
      applicationId,
      farmerId,
      type,
      scheduledDate,
      scheduledTime,
      inspectorTeam,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Inspection scheduled successfully',
      schedule: {
        id: schedule._id,
        inspectionId: schedule.inspectionId,
        type: schedule.type,
        scheduledDate: schedule.scheduledDate,
        scheduledTime: schedule.scheduledTime,
        status: schedule.status,
        inspectorTeam: schedule.inspectorTeam,
        notes: schedule.notes,
        createdAt: schedule.createdAt,
      },
    });
  } catch (error) {
    logger.error('[InspectionSchedulingRoutes] POST /schedule error:', error);

    if (error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message.includes('conflict') || error.message.includes('not available')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    next(error);
  }
});

/**
 * PUT /inspections/:id/schedule/confirm
 * Confirm or reject a schedule
 */
router.put('/inspections/:id/schedule/confirm', async (req, res, next) => {
  try {
    const { id: inspectionId } = req.params;
    const { confirmed, rejectionReason } = req.body;
    // Get userId from auth middleware (farmer or staff) or body
    const userId = req.user?.userId || req.staff?.staffId || req.body.userId;

    if (typeof confirmed !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Confirmation status (confirmed) is required',
      });
    }

    // Confirm or reject schedule
    const schedule = await inspectionService.confirmSchedule(
      inspectionId,
      confirmed,
      userId,
      rejectionReason
    );

    res.json({
      success: true,
      message: confirmed ? 'Schedule confirmed successfully' : 'Schedule rejected',
      schedule: {
        id: schedule._id,
        inspectionId: schedule.inspectionId,
        status: schedule.status,
        confirmedBy: schedule.confirmedBy,
        rejectionReason: schedule.rejectionReason,
      },
    });
  } catch (error) {
    logger.error('[InspectionSchedulingRoutes] PUT /confirm error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found',
      });
    }

    if (error.message.includes('Cannot confirm')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    next(error);
  }
});

/**
 * GET /inspections/:id/schedule
 * Get schedule for a specific inspection
 */
router.get('/inspections/:id/schedule', async (req, res, next) => {
  try {
    const { id: inspectionId } = req.params;

    const schedule = await inspectionService.getScheduleByInspectionId(inspectionId);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found',
      });
    }

    res.json({
      success: true,
      schedule: {
        id: schedule._id,
        inspectionId: schedule.inspectionId,
        type: schedule.type,
        scheduledDate: schedule.scheduledDate,
        scheduledTime: schedule.scheduledTime,
        status: schedule.status,
        farmer: schedule.farmerId,
        inspectorTeam: schedule.inspectorTeam,
        notes: schedule.notes,
        confirmedBy: schedule.confirmedBy,
        rescheduleHistory: schedule.rescheduleHistory,
        createdAt: schedule.createdAt,
        updatedAt: schedule.updatedAt,
      },
    });
  } catch (error) {
    logger.error('[InspectionSchedulingRoutes] GET /schedule error:', error);
    next(error);
  }
});

/**
 * GET /inspections/calendar
 * Get schedules by date range (calendar view)
 */
router.get('/inspections/calendar', async (req, res, next) => {
  try {
    const { startDate, endDate, inspectorId, status } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required',
      });
    }

    const filters = {};
    if (inspectorId) filters.inspectorId = inspectorId;
    if (status) filters.status = status;

    const schedules = await inspectionService.getSchedulesByDateRange(
      startDate,
      endDate,
      filters
    );

    res.json({
      success: true,
      count: schedules.length,
      schedules: schedules.map((schedule) => ({
        id: schedule._id,
        inspectionId: schedule.inspectionId,
        type: schedule.type,
        scheduledDate: schedule.scheduledDate,
        scheduledTime: schedule.scheduledTime,
        status: schedule.status,
        farmer: {
          id: schedule.farmerId._id,
          name: schedule.farmerId.fullName,
          phone: schedule.farmerId.phone,
        },
        inspectorTeam: schedule.inspectorTeam.map((inspector) => ({
          id: inspector.inspectorId?._id,
          name: inspector.name || inspector.inspectorId?.fullName,
        })),
        notes: schedule.notes,
      })),
    });
  } catch (error) {
    logger.error('[InspectionSchedulingRoutes] GET /calendar error:', error);
    next(error);
  }
});

/**
 * PUT /inspections/:id/schedule/reschedule
 * Reschedule an inspection
 */
router.put('/inspections/:id/schedule/reschedule', async (req, res, next) => {
  try {
    const { id: inspectionId } = req.params;
    const { scheduledDate, scheduledTime, reason, notes } = req.body;
    const userId = req.user?.userId || req.staff?.staffId || req.body.userId;

    if (!scheduledDate || !scheduledTime || !reason) {
      return res.status(400).json({
        success: false,
        error: 'New date, time, and reason are required',
      });
    }

    const schedule = await inspectionService.reschedule(
      inspectionId,
      { scheduledDate, scheduledTime, notes },
      userId,
      reason
    );

    res.json({
      success: true,
      message: 'Inspection rescheduled successfully',
      schedule: {
        id: schedule._id,
        inspectionId: schedule.inspectionId,
        scheduledDate: schedule.scheduledDate,
        scheduledTime: schedule.scheduledTime,
        status: schedule.status,
        rescheduleHistory: schedule.rescheduleHistory,
      },
    });
  } catch (error) {
    logger.error('[InspectionSchedulingRoutes] PUT /reschedule error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found',
      });
    }

    if (error.message.includes('cannot be modified')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    next(error);
  }
});

/**
 * DELETE /inspections/:id/schedule
 * Cancel a schedule
 */
router.delete('/inspections/:id/schedule', async (req, res, next) => {
  try {
    const { id: inspectionId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Cancellation reason is required',
      });
    }

    const schedule = await inspectionService.cancelSchedule(inspectionId, reason);

    res.json({
      success: true,
      message: 'Schedule cancelled successfully',
      schedule: {
        id: schedule._id,
        inspectionId: schedule.inspectionId,
        status: schedule.status,
        cancelledAt: schedule.cancelledAt,
        cancellationReason: schedule.cancellationReason,
      },
    });
  } catch (error) {
    logger.error('[InspectionSchedulingRoutes] DELETE /schedule error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found',
      });
    }

    next(error);
  }
});

module.exports = router;
