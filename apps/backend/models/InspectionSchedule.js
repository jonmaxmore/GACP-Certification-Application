/**
 * InspectionSchedule Model
 * Stores inspection scheduling information
 */

const mongoose = require('mongoose');

const inspectionScheduleSchema = new mongoose.Schema(
  {
    inspectionId: {
      type: String,
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      index: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['video_call', 'onsite'],
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    inspectorTeam: [
      {
        inspectorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: String,
        role: String,
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'pending_confirmation',
        'confirmed',
        'rejected',
        'rescheduled',
        'completed',
        'cancelled',
      ],
      default: 'pending_confirmation',
      index: true,
    },
    confirmedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      confirmedAt: Date,
    },
    rejectionReason: String,
    rescheduleHistory: [
      {
        previousDate: Date,
        previousTime: String,
        reason: String,
        rescheduledAt: Date,
        rescheduledBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: String,

    // Dispatcher / Queue Management
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The human dispatcher (if manual)
    },
    assignmentMethod: {
      type: String,
      enum: ['system', 'manual', 'self'],
      default: 'system',
    },
    queuePriority: {
      type: String,
      enum: ['normal', 'high', 'urgent'],
      default: 'normal',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
inspectionScheduleSchema.index({ scheduledDate: 1, status: 1 });
inspectionScheduleSchema.index({ farmerId: 1, status: 1 });
inspectionScheduleSchema.index({ 'inspectorTeam.inspectorId': 1, scheduledDate: 1 });

// Virtual for formatted schedule time
inspectionScheduleSchema.virtual('formattedSchedule').get(function () {
  return {
    date: this.scheduledDate.toLocaleDateString('th-TH'),
    time: this.scheduledTime,
    type: this.type === 'video_call' ? 'ตรวจผ่านวิดีโอคอล' : 'ตรวจที่ฟาร์ม',
  };
});

// Method to check if schedule is in the past
inspectionScheduleSchema.methods.isPast = function () {
  const scheduleDateTime = new Date(this.scheduledDate);
  const [hours, minutes] = this.scheduledTime.split(':');
  scheduleDateTime.setHours(parseInt(hours), parseInt(minutes));
  return scheduleDateTime < new Date();
};

// Method to check if schedule can be modified
inspectionScheduleSchema.methods.canModify = function () {
  return ['pending_confirmation', 'confirmed'].includes(this.status) && !this.isPast();
};

// Static method to find schedules by date range
inspectionScheduleSchema.statics.findByDateRange = function (startDate, endDate, filters = {}) {
  return this.find({
    scheduledDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    ...filters,
  })
    .populate('farmerId', 'fullName email phone')
    .populate('inspectorTeam.inspectorId', 'fullName email')
    .sort({ scheduledDate: 1, scheduledTime: 1 });
};

// Static method to find inspector's schedule
inspectionScheduleSchema.statics.findInspectorSchedule = function (inspectorId, startDate, endDate) {
  return this.find({
    'inspectorTeam.inspectorId': inspectorId,
    scheduledDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    status: { $in: ['pending_confirmation', 'confirmed'] },
  })
    .populate('farmerId', 'fullName phone')
    .sort({ scheduledDate: 1, scheduledTime: 1 });
};

/**
 * Smart Queue Logic: Suggest available inspectors
 * Filters out inspectors who are:
 * 1. On leave (unavailableDates)
 * 2. Already booked at that time
 * 3. Not auto-assign enabled (if system)
 */
inspectionScheduleSchema.statics.suggestInspectors = async function (date, time, type = 'video_call') {
  const User = mongoose.model('User');
  const checkDate = new Date(date);

  // 1. Find active inspectors
  const inspectors = await User.find({
    role: 'inspector',
    isActive: true,
    'availability.autoAssignEnabled': true
  });

  const availableInspectors = [];

  for (const inspector of inspectors) {
    // 2. Check Leave/Holiday
    const isUnavailable = inspector.availability?.unavailableDates?.some(u => {
      const uDate = new Date(u.date);
      return uDate.toDateString() === checkDate.toDateString();
    });

    if (isUnavailable) continue;

    // 3. Check Existing Bookings
    const existingBooking = await this.findOne({
      'inspectorTeam.inspectorId': inspector._id,
      scheduledDate: checkDate,
      scheduledTime: time,
      status: { $nin: ['cancelled', 'rejected'] }
    });

    if (!existingBooking) {
      availableInspectors.push(inspector);
    }
  }

  // Sort by workload (least busy first)
  return availableInspectors.sort((a, b) =>
    (a.workload.scheduledInspections || 0) - (b.workload.scheduledInspections || 0)
  );
};

const InspectionSchedule = mongoose.model('InspectionSchedule', inspectionScheduleSchema);

module.exports = InspectionSchedule;
