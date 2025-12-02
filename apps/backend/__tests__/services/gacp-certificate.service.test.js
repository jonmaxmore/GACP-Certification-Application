// All top-level jest.mock calls are removed and replaced with jest.doMock inside beforeEach.

describe('GACPCertificateService', () => {
  let GACPCertificateService;
  let appRepoInstance;
  let certRepoInstance;
  let queueServiceMock;

  beforeEach(() => {
    jest.resetModules();

    // Define mocks
    const mockAppRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      updateStatus: jest.fn(),
    };
    const mockCertRepo = {
      create: jest.fn(),
      findByCertificateNumber: jest.fn(),
      save: jest.fn(),
      model: {
        findOne: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(null),
      },
    };
    queueServiceMock = {
      addDocumentJob: jest.fn().mockResolvedValue({ success: true, id: 'job-123' }),
      addEmailJob: jest.fn(),
      addAIQCJob: jest.fn(),
    };

    // Apply mocks using doMock
    jest.doMock('../../repositories/ApplicationRepository', () => {
      return jest.fn().mockImplementation(() => mockAppRepo);
    });
    jest.doMock('../../repositories/CertificateRepository', () => {
      return jest.fn().mockImplementation(() => mockCertRepo);
    });
    jest.doMock('../../services/queue/queueService', () => queueServiceMock);
    jest.doMock('../../models/Application', () => ({}));
    jest.doMock('../../models/User', () => ({}));
    jest.doMock('../../services/cache/cacheService', () => ({}));
    jest.doMock('../../shared/logger', () => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      createLogger: jest.fn().mockReturnValue({
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      }),
    }));
    jest.doMock('../../shared/errors', () => ({
      ValidationError: class extends Error {},
      BusinessLogicError: class extends Error {},
    }));
    jest.doMock('pdfkit', () => {
      return class {
        pipe() {}
        fontSize() { return this; }
        font() { return this; }
        text() { return this; }
        moveDown() { return this; }
        image() { return this; }
        end() {}
      };
    });
    jest.doMock('bull', () => {
      return jest.fn().mockImplementation(() => ({
        process: jest.fn(),
        on: jest.fn(),
        add: jest.fn(),
        getWaitingCount: jest.fn(),
        getActiveCount: jest.fn(),
        getCompletedCount: jest.fn(),
        getFailedCount: jest.fn(),
        clean: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        close: jest.fn(),
      }));
    });

    // Require service
    GACPCertificateService = require('../../services/gacp-certificate');

    // Store repo instances for assertions
    appRepoInstance = mockAppRepo;
    certRepoInstance = mockCertRepo;

    // Ensure queue is enabled
    process.env.ENABLE_QUEUE = 'true';
  });

  describe('generateCertificate', () => {
    it('should create a certificate successfully', async () => {
      const validAppId = '507f1f77bcf86cd799439011';
      // const validCertId = '507f1f77bcf86cd799439012'; // Not used in this test

      const mockApplication = {
        _id: validAppId,
        applicationNumber: 'APP-001',
        farmer: {
          name: 'John Doe',
          farmName: 'Green Farm',
          address: '123 Farm Lane'
        },
        lotId: 'LOT-2023-001',
        inspectionResult: {
          result: 'PASS',
          score: 95
        },
        currentStatus: 'approved', // Added required field
        farmInformation: { // Added required nested fields
            location: {
                province: 'Chiang Mai',
                address: '123',
                subdistrict: 'Sub',
                district: 'Dist',
                postalCode: '50000',
                coordinates: { lat: 0, lng: 0 }
            },
            farmSize: { totalArea: 10 },
            farmingSystem: 'Organic'
        },
        applicant: {
            fullName: 'John Doe',
            nationalId: '1234567890123',
            email: 'john@example.com'
        },
        cropInformation: [{ cropType: 'Hemp' }],
        calculateTotalScore: () => 95,
        inspectionCompleted: new Date(),
        assignedInspector: 'inspector-1',
        updateStatus: jest.fn(),
        save: jest.fn()
      };

      appRepoInstance.findById.mockResolvedValue(mockApplication);

      const result = await GACPCertificateService.generateCertificate(validAppId, 'user-123');

      // Expect queued response structure if queue is enabled
      expect(result).toHaveProperty('status', 'queued');
      expect(result).toHaveProperty('jobId', 'job-123');

      expect(appRepoInstance.findById).toHaveBeenCalledWith(validAppId);
      expect(queueServiceMock.addDocumentJob).toHaveBeenCalled();
    });

    it('should throw error if application not found', async () => {
      const validAppId = '507f1f77bcf86cd799439011';
      appRepoInstance.findById.mockResolvedValue(null);

      await expect(GACPCertificateService.generateCertificate(validAppId, 'user-123'))
        .rejects.toThrow();
    });
  });
});
