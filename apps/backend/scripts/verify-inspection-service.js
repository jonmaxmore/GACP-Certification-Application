/**
 * Manual Test Script for Inspection Scheduling Service
 * Run with: node scripts/verify-inspection-service.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Adjust paths based on file location
const InspectionSchedulingService = require('../services/InspectionSchedulingService');
const InspectionSchedule = require('../models/InspectionSchedule');
const logger = require('../shared/logger');

// Mock User and Application models if they don't exist or for simple testing
const mockFarmerId = new mongoose.Types.ObjectId();
const mockInspectorId = new mongoose.Types.ObjectId();
const mockApplicationId = new mongoose.Types.ObjectId();

async function main() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp-platform';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    const service = new InspectionSchedulingService();

    // 1. Create a Schedule
    logger.info('\n--- 1. Testing Create Schedule ---');
    const scheduleData = {
      inspectionId: `INS-${Date.now()}`,
      applicationId: mockApplicationId,
      farmerId: mockFarmerId,
      type: 'video_call',
      scheduledDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days from now
      scheduledTime: '10:00',
      inspectorTeam: [
        {
          inspectorId: mockInspectorId,
          name: 'Test Inspector',
          role: 'Lead',
        },
      ],
      notes: 'Manual test inspection',
    };

    const schedule = await service.createSchedule(scheduleData);
    console.log('Schedule Created:', {
      id: schedule._id,
      inspectionId: schedule.inspectionId,
      status: schedule.status,
      date: schedule.scheduledDate,
    });

    // 2. Get Schedule
    logger.info('\n--- 2. Testing Get Schedule ---');
    const fetchedSchedule = await service.getScheduleByInspectionId(scheduleData.inspectionId);
    console.log('Fetched Schedule:', fetchedSchedule ? 'Found' : 'Not Found');

    // 3. Confirm Schedule
    logger.info('\n--- 3. Testing Confirm Schedule ---');
    const confirmedSchedule = await service.confirmSchedule(
      scheduleData.inspectionId,
      true,
      mockInspectorId
    );
    console.log('Schedule Confirmed:', confirmedSchedule.status);

    // 4. Reschedule
    logger.info('\n--- 4. Testing Reschedule ---');
    const newDate = new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0];
    const rescheduledSchedule = await service.reschedule(
      scheduleData.inspectionId,
      {
        scheduledDate: newDate,
        scheduledTime: '14:00',
        notes: 'Rescheduled for manual test',
      },
      mockFarmerId,
      'Farmer requested change'
    );
    console.log('Schedule Rescheduled:', {
      status: rescheduledSchedule.status,
      newDate: rescheduledSchedule.scheduledDate,
      historyCount: rescheduledSchedule.rescheduleHistory.length,
    });

    // 5. Cancel Schedule
    logger.info('\n--- 5. Testing Cancel Schedule ---');
    const cancelledSchedule = await service.cancelSchedule(
      scheduleData.inspectionId,
      'End of test'
    );
    console.log('Schedule Cancelled:', cancelledSchedule.status);

    // Cleanup
    await InspectionSchedule.deleteOne({ _id: schedule._id });
    logger.info('\nTest data cleaned up');

  } catch (error) {
    logger.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

main();
