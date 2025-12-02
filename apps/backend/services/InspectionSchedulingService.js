/**
 * InspectionSchedulingService
 * Business logic for inspection scheduling
 *
 * @module services/InspectionSchedulingService
 */

const InspectionSchedule = require('../models/InspectionSchedule');
const EmailService = require('./email/EmailService');
const logger = require('../shared/logger');

class InspectionSchedulingService {
  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Create a new inspection schedule
   * @param {Object} scheduleData - Schedule data
   * @param {string} scheduleData.inspectionId - Inspection ID
   * @param {string} scheduleData.applicationId - Application ID
   * @param {string} scheduleData.farmerId - Farmer user ID
   * @param {string} scheduleData.type - Inspection type (video_call or onsite)
   * @param {string} scheduleData.scheduledDate - Scheduled date
   * @param {string} scheduleData.scheduledTime - Scheduled time
   * @param {Array} scheduleData.inspectorTeam - Inspector team
   * @param {string} scheduleData.notes - Additional notes
   * @returns {Promise<Object>} Created schedule
   */
  async createSchedule(scheduleData) {
    try {
      // Validate required fields
      this.validateScheduleData(scheduleData);

      // Check for scheduling conflicts
      await this.checkSchedulingConflicts(scheduleData);

      // Create schedule
      const schedule = new InspectionSchedule({
        inspectionId: scheduleData.inspectionId,
        applicationId: scheduleData.applicationId,
        farmerId: scheduleData.farmerId,
        type: scheduleData.type,
        scheduledDate: new Date(scheduleData.scheduledDate),
        scheduledTime: scheduleData.scheduledTime,
        inspectorTeam: scheduleData.inspectorTeam || [],
        notes: scheduleData.notes || '',
        status: 'pending_confirmation',
      });

      await schedule.save();

      // Populate references
      await schedule.populate([
        { path: 'farmerId', select: 'fullName email phone' },
        { path: 'inspectorTeam.inspectorId', select: 'fullName email' },
      ]);

      // Send notification to farmer
      try {
        await this.notifyFarmer(schedule);
      } catch (emailError) {
        logger.error('[InspectionSchedulingService] Failed to send farmer notification:', emailError);
        // Don't fail the entire operation if email fails
      }

      // Send notification to inspectors
      try {
        await this.notifyInspectors(schedule);
      } catch (emailError) {
        logger.error('[InspectionSchedulingService] Failed to send inspector notification:', emailError);
      }

      logger.info('[InspectionSchedulingService] Inspection scheduled successfully', {
        scheduleId: schedule._id,
        inspectionId: schedule.inspectionId,
        farmerId: schedule.farmerId,
      });

      return schedule;
    } catch (error) {
      logger.error('[InspectionSchedulingService] createSchedule error:', error);
      throw error;
    }
  }

  /**
   * Get schedule by inspection ID
   * @param {string} inspectionId - Inspection ID
   * @returns {Promise<Object|null>} Schedule or null
   */
  async getScheduleByInspectionId(inspectionId) {
    try {
      const schedule = await InspectionSchedule.findOne({ inspectionId })
        .populate([
          { path: 'farmerId', select: 'fullName email phone' },
          { path: 'inspectorTeam.inspectorId', select: 'fullName email' },
        ]);

      return schedule;
    } catch (error) {
      logger.error('[InspectionSchedulingService] getScheduleByInspectionId error:', error);
      throw error;
    }
  }

  /**
   * Confirm or reject schedule
   * @param {string} inspectionId - Inspection ID
   * @param {boolean} confirmed - Confirmation status
   * @param {string} userId - User ID who confirmed/rejected
   * @param {string} rejectionReason - Reason for rejection (optional)
   * @returns {Promise<Object>} Updated schedule
   */
  async confirmSchedule(inspectionId, confirmed, userId, rejectionReason = null) {
    try {
      const schedule = await InspectionSchedule.findOne({ inspectionId });

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      if (schedule.status !== 'pending_confirmation') {
        throw new Error(`Cannot confirm schedule with status: ${schedule.status}`);
      }

      if (confirmed) {
        schedule.status = 'confirmed';
        schedule.confirmedBy = {
          userId,
          confirmedAt: new Date(),
        };
      } else {
        schedule.status = 'rejected';
        schedule.rejectionReason = rejectionReason || 'No reason provided';
      }

      await schedule.save();
      await schedule.populate('farmerId', 'fullName email phone');

      // Send notification
      try {
        await this.notifyScheduleStatusChange(schedule, confirmed);
      } catch (emailError) {
        logger.error('[InspectionSchedulingService] Failed to send status change notification:', emailError);
      }

      logger.info('[InspectionSchedulingService] Schedule status updated', {
        scheduleId: schedule._id,
        status: schedule.status,
        confirmed,
      });

      return schedule;
    } catch (error) {
      logger.error('[InspectionSchedulingService] confirmSchedule error:', error);
      throw error;
    }
  }

  /**
   * Get schedules by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} filters - Additional filters (inspectorId, status, etc.)
   * @returns {Promise<Array>} List of schedules
   */
  async getSchedulesByDateRange(startDate, endDate, filters = {}) {
    try {
      const query = {};

      // Add inspector filter if provided
      if (filters.inspectorId) {
        query['inspectorTeam.inspectorId'] = filters.inspectorId;
      }

      // Add status filter if provided
      if (filters.status) {
        query.status = filters.status;
      }

      const schedules = await InspectionSchedule.findByDateRange(startDate, endDate, query);

      return schedules;
    } catch (error) {
      logger.error('[InspectionSchedulingService] getSchedulesByDateRange error:', error);
      throw error;
    }
  }

  /**
   * Reschedule an inspection
   * @param {string} inspectionId - Inspection ID
   * @param {Object} newScheduleData - New schedule data
   * @param {string} userId - User ID who requested reschedule
   * @param {string} reason - Reason for rescheduling
   * @returns {Promise<Object>} Updated schedule
   */
  async reschedule(inspectionId, newScheduleData, userId, reason) {
    try {
      const schedule = await InspectionSchedule.findOne({ inspectionId });

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      if (!schedule.canModify()) {
        throw new Error('Schedule cannot be modified');
      }

      // Save reschedule history
      schedule.rescheduleHistory.push({
        previousDate: schedule.scheduledDate,
        previousTime: schedule.scheduledTime,
        reason,
        rescheduledAt: new Date(),
        rescheduledBy: userId,
      });

      // Update schedule
      schedule.scheduledDate = new Date(newScheduleData.scheduledDate);
      schedule.scheduledTime = newScheduleData.scheduledTime;
      schedule.status = 'rescheduled';

      if (newScheduleData.notes) {
        schedule.notes = newScheduleData.notes;
      }

      await schedule.save();
      await schedule.populate('farmerId', 'fullName email phone');

      // Send notification
      try {
        await this.notifyReschedule(schedule, reason);
      } catch (emailError) {
        logger.error('[InspectionSchedulingService] Failed to send reschedule notification:', emailError);
      }

      logger.info('[InspectionSchedulingService] Inspection rescheduled', {
        scheduleId: schedule._id,
        inspectionId,
      });

      return schedule;
    } catch (error) {
      logger.error('[InspectionSchedulingService] reschedule error:', error);
      throw error;
    }
  }

  /**
   * Cancel a schedule
   * @param {string} inspectionId - Inspection ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Updated schedule
   */
  async cancelSchedule(inspectionId, reason) {
    try {
      const schedule = await InspectionSchedule.findOne({ inspectionId });

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      schedule.status = 'cancelled';
      schedule.cancelledAt = new Date();
      schedule.cancellationReason = reason;

      await schedule.save();

      logger.info('[InspectionSchedulingService] Schedule cancelled', {
        scheduleId: schedule._id,
        inspectionId,
      });

      return schedule;
    } catch (error) {
      logger.error('[InspectionSchedulingService] cancelSchedule error:', error);
      throw error;
    }
  }

  // ========== Validation Methods ==========

  /**
   * Validate schedule data
   * @param {Object} data - Schedule data
   * @throws {Error} If validation fails
   */
  validateScheduleData(data) {
    if (!data.inspectionId) {
      throw new Error('Inspection ID is required');
    }

    if (!data.farmerId) {
      throw new Error('Farmer ID is required');
    }

    if (!data.type || !['video_call', 'onsite'].includes(data.type)) {
      throw new Error('Invalid inspection type. Must be "video_call" or "onsite"');
    }

    if (!data.scheduledDate) {
      throw new Error('Scheduled date is required');
    }

    if (!data.scheduledTime) {
      throw new Error('Scheduled time is required');
    }

    // Validate date is not in the past
    const scheduleDate = new Date(data.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (scheduleDate < today) {
      throw new Error('Cannot schedule inspection in the past');
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.scheduledTime)) {
      throw new Error('Invalid time format. Use HH:MM format');
    }
  }

  /**
   * Check for scheduling conflicts
   * @param {Object} data - Schedule data
   * @throws {Error} If conflict found
   */
  async checkSchedulingConflicts(data) {
    // Check if there's already a schedule for this inspection
    const existingSchedule = await InspectionSchedule.findOne({
      inspectionId: data.inspectionId,
      status: { $in: ['pending_confirmation', 'confirmed'] },
    });

    if (existingSchedule) {
      throw new Error('An active schedule already exists for this inspection');
    }

    // Check inspector availability (if inspectors assigned)
    if (data.inspectorTeam && data.inspectorTeam.length > 0) {
      for (const inspector of data.inspectorTeam) {
        const conflicts = await InspectionSchedule.find({
          'inspectorTeam.inspectorId': inspector.inspectorId,
          scheduledDate: new Date(data.scheduledDate),
          scheduledTime: data.scheduledTime,
          status: { $in: ['pending_confirmation', 'confirmed'] },
        });

        if (conflicts.length > 0) {
          throw new Error(`Inspector ${inspector.name} is not available at this time`);
        }
      }
    }
  }

  // ========== Notification Methods ==========

  /**
   * Notify farmer about new schedule
   * @param {Object} schedule - Schedule object
   */
  async notifyFarmer(schedule) {
    if (!schedule.farmerId || !schedule.farmerId.email) {
      logger.warn('[InspectionSchedulingService] Cannot notify farmer: email not available');
      return;
    }

    const farmer = schedule.farmerId;
    const inspectorNames = schedule.inspectorTeam
      .map((i) => i.name || 'เจ้าหน้าที่')
      .join(', ');

    await this.emailService.sendInspectionScheduledEmail(farmer, {
      type: schedule.type,
      scheduledDate: schedule.scheduledDate.toISOString().split('T')[0],
      scheduledTime: schedule.scheduledTime,
      inspectorName: inspectorNames || 'เจ้าหน้าที่',
      notes: schedule.notes,
    });

    logger.info('[InspectionSchedulingService] Farmer notification sent', {
      farmerId: farmer._id,
      email: farmer.email,
    });
  }

  /**
   * Notify inspectors about new assignment
   * @param {Object} schedule - Schedule object
   */
  async notifyInspectors(schedule) {
    for (const inspector of schedule.inspectorTeam) {
      if (inspector.inspectorId && inspector.inspectorId.email) {
        // TODO: Create inspector notification email template
        logger.info('[InspectionSchedulingService] Inspector notification queued', {
          inspectorId: inspector.inspectorId._id,
        });
      }
    }
  }

  /**
   * Notify about schedule status change
   * @param {Object} schedule - Schedule object
   * @param {boolean} confirmed - Confirmation status
   */
  async notifyScheduleStatusChange(schedule, confirmed) {
    // TODO: Send status change notification
    logger.info('[InspectionSchedulingService] Status change notification queued', {
      scheduleId: schedule._id,
      status: schedule.status,
    });
  }

  /**
   * Notify about reschedule
   * @param {Object} schedule - Schedule object
   * @param {string} reason - Reschedule reason
   */
  async notifyReschedule(schedule, reason) {
    // TODO: Send reschedule notification
    logger.info('[InspectionSchedulingService] Reschedule notification queued', {
      scheduleId: schedule._id,
      reason,
    });
  }
}

module.exports = InspectionSchedulingService;
