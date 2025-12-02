/**
 * InspectionSchedulingService Tests
 * @jest-environment node
 */

const InspectionSchedulingService = require('../InspectionSchedulingService');
const InspectionSchedule = require('../../models/InspectionSchedule');
const EmailService = require('../email/EmailService');

// Mock dependencies
jest.mock('../../models/InspectionSchedule');
jest.mock('../email/EmailService');
jest.mock('../../shared/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('InspectionSchedulingService', () => {
  let service;
  let mockEmailService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock EmailService
    mockEmailService = {
      sendInspectionScheduledEmail: jest.fn().mockResolvedValue({}),
    };
    EmailService.mockImplementation(() => mockEmailService);

    service = new InspectionSchedulingService();
  });

  describe('createSchedule', () => {
    const validScheduleData = {
      inspectionId: 'INS-001',
      applicationId: 'app123',
      farmerId: 'farmer123',
      type: 'video_call',
      scheduledDate: '2025-12-15',
      scheduledTime: '10:00',
      inspectorTeam: [{ inspectorId: 'inspector1', name: 'John Doe' }],
      notes: 'Test inspection',
    };

    it('should create schedule successfully', async () => {
      const mockSchedule = {
        _id: 'schedule123',
        ...validScheduleData,
        scheduledDate: new Date(validScheduleData.scheduledDate), // Ensure Date object
        status: 'pending_confirmation',
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock populate to update farmerId and return self
      mockSchedule.populate = jest.fn().mockImplementation(async () => {
        mockSchedule.farmerId = { _id: 'farmer123', email: 'farmer@test.com', fullName: 'Test Farmer' };
        return mockSchedule;
      });

      InspectionSchedule.mockImplementation(() => mockSchedule);
      InspectionSchedule.findOne = jest.fn().mockResolvedValue(null);
      InspectionSchedule.find = jest.fn().mockResolvedValue([]); // No conflicts

      const result = await service.createSchedule(validScheduleData);

      expect(result).toBeDefined();
      expect(mockSchedule.save).toHaveBeenCalled();
      expect(mockEmailService.sendInspectionScheduledEmail).toHaveBeenCalled();
    });

    it('should throw error if required fields missing', async () => {
      const invalidData = { ...validScheduleData };
      delete invalidData.inspectionId;

      await expect(service.createSchedule(invalidData)).rejects.toThrow(
        'Inspection ID is required'
      );
    });

    it('should throw error if invalid inspection type', async () => {
      const invalidData = { ...validScheduleData, type: 'invalid_type' };

      await expect(service.createSchedule(invalidData)).rejects.toThrow(
        'Invalid inspection type'
      );
    });

    it('should throw error if date is in the past', async () => {
      const pastData = { ...validScheduleData, scheduledDate: '2020-01-01' };

      await expect(service.createSchedule(pastData)).rejects.toThrow(
        'Cannot schedule inspection in the past'
      );
    });

    it('should throw error if time format is invalid', async () => {
      const invalidTimeData = { ...validScheduleData, scheduledTime: '25:00' };

      await expect(service.createSchedule(invalidTimeData)).rejects.toThrow(
        'Invalid time format'
      );
    });

    it('should throw error if schedule already exists', async () => {
      InspectionSchedule.findOne = jest.fn().mockResolvedValue({
        inspectionId: 'INS-001',
        status: 'confirmed',
      });

      await expect(service.createSchedule(validScheduleData)).rejects.toThrow(
        'An active schedule already exists'
      );
    });
  });

  describe('getScheduleByInspectionId', () => {
    it('should return schedule if found', async () => {
      const mockSchedule = {
        _id: 'schedule123',
        inspectionId: 'INS-001',
        status: 'confirmed',
      };

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockSchedule),
      };

      InspectionSchedule.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await service.getScheduleByInspectionId('INS-001');

      expect(result).toEqual(mockSchedule);
      expect(InspectionSchedule.findOne).toHaveBeenCalledWith({ inspectionId: 'INS-001' });
    });

    it('should return null if not found', async () => {
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(null),
      };

      InspectionSchedule.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await service.getScheduleByInspectionId('INS-999');

      expect(result).toBeNull();
    });
  });

  describe('confirmSchedule', () => {
    it('should confirm schedule successfully', async () => {
      const mockSchedule = {
        _id: 'schedule123',
        inspectionId: 'INS-001',
        status: 'pending_confirmation',
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      };

      InspectionSchedule.findOne = jest.fn().mockResolvedValue(mockSchedule);

      const result = await service.confirmSchedule('INS-001', true, 'user123');

      expect(mockSchedule.status).toBe('confirmed');
      expect(mockSchedule.confirmedBy).toBeDefined();
      expect(mockSchedule.save).toHaveBeenCalled();
    });

    it('should reject schedule with reason', async () => {
      const mockSchedule = {
        _id: 'schedule123',
        inspectionId: 'INS-001',
        status: 'pending_confirmation',
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      };

      InspectionSchedule.findOne = jest.fn().mockResolvedValue(mockSchedule);

      const result = await service.confirmSchedule('INS-001', false, 'user123', 'Not available');

      expect(mockSchedule.status).toBe('rejected');
      expect(mockSchedule.rejectionReason).toBe('Not available');
      expect(mockSchedule.save).toHaveBeenCalled();
    });

    it('should throw error if schedule not found', async () => {
      InspectionSchedule.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.confirmSchedule('INS-999', true, 'user123')).rejects.toThrow(
        'Schedule not found'
      );
    });

    it('should throw error if schedule already confirmed', async () => {
      const mockSchedule = {
        status: 'confirmed',
      };

      InspectionSchedule.findOne = jest.fn().mockResolvedValue(mockSchedule);

      await expect(service.confirmSchedule('INS-001', true, 'user123')).rejects.toThrow(
        'Cannot confirm schedule with status: confirmed'
      );
    });
  });

  describe('getSchedulesByDateRange', () => {
    it('should return schedules for date range', async () => {
      const mockSchedules = [
        { _id: 'schedule1', scheduledDate: '2025-12-15' },
        { _id: 'schedule2', scheduledDate: '2025-12-16' },
      ];

      InspectionSchedule.findByDateRange = jest.fn().mockResolvedValue(mockSchedules);

      const result = await service.getSchedulesByDateRange('2025-12-01', '2025-12-31');

      expect(result).toEqual(mockSchedules);
      expect(InspectionSchedule.findByDateRange).toHaveBeenCalledWith(
        '2025-12-01',
        '2025-12-31',
        {}
      );
    });

    it('should apply filters correctly', async () => {
      InspectionSchedule.findByDateRange = jest.fn().mockResolvedValue([]);

      await service.getSchedulesByDateRange('2025-12-01', '2025-12-31', {
        inspectorId: 'inspector1',
        status: 'confirmed',
      });

      expect(InspectionSchedule.findByDateRange).toHaveBeenCalledWith(
        '2025-12-01',
        '2025-12-31',
        {
          'inspectorTeam.inspectorId': 'inspector1',
          status: 'confirmed',
        }
      );
    });
  });

  describe('reschedule', () => {
    it('should reschedule inspection successfully', async () => {
      const mockSchedule = {
        _id: 'schedule123',
        inspectionId: 'INS-001',
        status: 'confirmed',
        scheduledDate: new Date('2025-12-15'),
        scheduledTime: '10:00',
        rescheduleHistory: [],
        canModify: jest.fn().mockReturnValue(true),
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      };

      InspectionSchedule.findOne = jest.fn().mockResolvedValue(mockSchedule);

      const newScheduleData = {
        scheduledDate: '2025-12-20',
        scheduledTime: '14:00',
      };

      const result = await service.reschedule('INS-001', newScheduleData, 'user123', 'Farmer request');

      expect(mockSchedule.status).toBe('rescheduled');
      expect(mockSchedule.rescheduleHistory).toHaveLength(1);
      expect(mockSchedule.save).toHaveBeenCalled();
    });

    it('should throw error if schedule cannot be modified', async () => {
      const mockSchedule = {
        canModify: jest.fn().mockReturnValue(false),
      };

      InspectionSchedule.findOne = jest.fn().mockResolvedValue(mockSchedule);

      await expect(
        service.reschedule('INS-001', {}, 'user123', 'reason')
      ).rejects.toThrow('Schedule cannot be modified');
    });
  });

  describe('cancelSchedule', () => {
    it('should cancel schedule successfully', async () => {
      const mockSchedule = {
        _id: 'schedule123',
        inspectionId: 'INS-001',
        save: jest.fn().mockResolvedValue(true),
      };

      InspectionSchedule.findOne = jest.fn().mockResolvedValue(mockSchedule);

      const result = await service.cancelSchedule('INS-001', 'Weather conditions');

      expect(mockSchedule.status).toBe('cancelled');
      expect(mockSchedule.cancellationReason).toBe('Weather conditions');
      expect(mockSchedule.cancelledAt).toBeDefined();
      expect(mockSchedule.save).toHaveBeenCalled();
    });

    it('should throw error if schedule not found', async () => {
      InspectionSchedule.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.cancelSchedule('INS-999', 'reason')).rejects.toThrow(
        'Schedule not found'
      );
    });
  });

  describe('validateScheduleData', () => {
    it('should pass validation for valid data', () => {
      const validData = {
        inspectionId: 'INS-001',
        farmerId: 'farmer123',
        type: 'video_call',
        scheduledDate: '2025-12-15',
        scheduledTime: '10:00',
      };

      expect(() => service.validateScheduleData(validData)).not.toThrow();
    });

    it('should throw error for missing inspection ID', () => {
      const invalidData = {
        farmerId: 'farmer123',
        type: 'video_call',
        scheduledDate: '2025-12-15',
        scheduledTime: '10:00',
      };

      expect(() => service.validateScheduleData(invalidData)).toThrow(
        'Inspection ID is required'
      );
    });

    it('should throw error for invalid time format', () => {
      const invalidData = {
        inspectionId: 'INS-001',
        farmerId: 'farmer123',
        type: 'video_call',
        scheduledDate: '2025-12-15',
        scheduledTime: '25:99',
      };

      expect(() => service.validateScheduleData(invalidData)).toThrow(
        'Invalid time format'
      );
    });
  });
});
