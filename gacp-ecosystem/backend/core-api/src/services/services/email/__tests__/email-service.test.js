/**
 * email-service Tests
 * @jest-environment node
 */

const email-service = require('../email-service');
const EmailTemplateEngine = require('../email-template-engine');

// Mock nodemailer
jest.mock('nodemailer');
const nodemailer = require('nodemailer');

// Mock logger
jest.mock('../../../shared/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('email-service', () => {
  let email-service;
  let mockTransporter;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({
        messageId: '<test-message-id@example.com>',
      }),
      verify: jest.fn().mockResolvedValue(true),
    };

    nodemailer.createTransport = jest.fn().mockReturnValue(mockTransporter);

    // Set environment variables
    process.env.EMAIL_PROVIDER = 'smtp';
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASSWORD = 'test-password';
    process.env.EMAIL_FROM_NAME = 'Test Platform';
    process.env.EMAIL_FROM_ADDRESS = 'noreply@test.com';
    process.env.APP_URL = 'http://localhost:3000';

    email-service = new email-service();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.EMAIL_PROVIDER;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;
    delete process.env.EMAIL_FROM_NAME;
    delete process.env.EMAIL_FROM_ADDRESS;
    delete process.env.APP_URL;
  });

  describe('Initialization', () => {
    it('should initialize with SMTP provider', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'test-password',
        },
      });
    });

    it('should initialize with Gmail provider', () => {
      process.env.EMAIL_PROVIDER = 'gmail';
      process.env.GMAIL_USER = 'gmail@example.com';
      process.env.GMAIL_APP_PASSWORD = 'gmail-app-password';

      const gmailService = new email-service();

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'gmail@example.com',
          pass: 'gmail-app-password',
        },
      });
    });

    it('should initialize with SendGrid provider', () => {
      process.env.EMAIL_PROVIDER = 'sendgrid';
      process.env.SENDGRID_API_KEY = 'SG.test-api-key';

      const sendgridService = new email-service();

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: 'SG.test-api-key',
        },
      });
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const result = await email-service.sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        template: 'welcome',
        data: {
          name: 'Test User',
        },
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Test Subject',
          from: 'Test Platform <noreply@test.com>',
        })
      );

      expect(result).toEqual({
        success: true,
        messageId: '<test-message-id@example.com>',
      });
    });

    it('should handle email sending errors', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(
        email-service.sendEmail({
          to: 'user@example.com',
          subject: 'Test',
          template: 'welcome',
          data: {},
        })
      ).rejects.toThrow('SMTP Error');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with correct data', async () => {
      const user = {
        email: 'user@example.com',
        fullName: 'Test User',
      };
      const resetToken = 'test-reset-token-123';

      await email-service.sendPasswordResetEmail(user, resetToken);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'เธฃเธตเน€เธเนเธ•เธฃเธซเธฑเธชเธเนเธฒเธ - GACP Platform',
        })
      );

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Test User');
      expect(callArgs.html).toContain('test-reset-token-123');
    });

    it('should use email as name if fullName not provided', async () => {
      const user = {
        email: 'user@example.com',
      };
      const resetToken = 'test-token';

      await email-service.sendPasswordResetEmail(user, resetToken);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('user@example.com');
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email with correct data', async () => {
      const user = {
        email: 'newuser@example.com',
        fullName: 'New User',
      };
      const verificationToken = 'verification-token-456';

      await email-service.sendVerificationEmail(user, verificationToken);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'newuser@example.com',
          subject: 'เธขเธทเธเธขเธฑเธเธญเธตเน€เธกเธฅ - GACP Platform',
        })
      );

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('New User');
      expect(callArgs.html).toContain('verification-token-456');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with user details', async () => {
      const user = {
        email: 'welcome@example.com',
        fullName: 'Welcome User',
        role: 'farmer',
      };

      await email-service.sendWelcomeEmail(user);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'welcome@example.com',
          subject: 'เธขเธดเธเธ”เธตเธ•เนเธญเธเธฃเธฑเธเธชเธนเน GACP Platform',
        })
      );

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Welcome User');
      expect(callArgs.html).toContain('farmer');
    });
  });

  describe('sendApplicationStatusEmail', () => {
    it('should send application status update email', async () => {
      const user = {
        email: 'farmer@example.com',
        fullName: 'Farmer User',
      };
      const application = {
        _id: 'app-123',
        applicationNumber: 'GACP-2025-001',
      };
      const newStatus = 'APPROVED';

      await email-service.sendApplicationStatusEmail(user, application, newStatus);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'farmer@example.com',
        })
      );

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('GACP-2025-001');
      expect(callArgs.html).toContain('APPROVED');
    });
  });

  describe('sendInspectionScheduledEmail', () => {
    it('should send inspection scheduled notification', async () => {
      const user = {
        email: 'farmer@example.com',
        fullName: 'Farmer User',
      };
      const inspection = {
        type: 'video_call',
        scheduledDate: '2025-12-01',
        scheduledTime: '10:00',
        inspectorName: 'Inspector John',
        notes: 'Please prepare documents',
      };

      await email-service.sendInspectionScheduledEmail(user, inspection);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'farmer@example.com',
          subject: 'เธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธเธเธฒเธฃเนเธกเนเธ”เนเธฃเธฑเธเธเธฒเธฃเธเธฑเธ”เธซเธกเธฒเธขเนเธฅเนเธง',
        })
      );

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('เธ•เธฃเธงเธเธเนเธฒเธเธงเธดเธ”เธตเนเธญเธเธญเธฅ');
      expect(callArgs.html).toContain('Inspector John');
      expect(callArgs.html).toContain('Please prepare documents');
    });

    it('should handle onsite inspection type', async () => {
      const user = {
        email: 'farmer@example.com',
        fullName: 'Farmer User',
      };
      const inspection = {
        type: 'onsite',
        scheduledDate: '2025-12-01',
        scheduledTime: '14:00',
      };

      await email-service.sendInspectionScheduledEmail(user, inspection);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('เธ•เธฃเธงเธเธ—เธตเนเธเธฒเธฃเนเธก');
    });
  });

  describe('getStatusMessage', () => {
    it('should return correct status messages', () => {
      expect(email-service.getStatusMessage('DRAFT')).toBe('เนเธเธชเธกเธฑเธเธฃเธญเธขเธนเนเนเธเธชเธ–เธฒเธเธฐเธฃเนเธฒเธ');
      expect(email-service.getStatusMessage('APPROVED')).toBe('เนเธเธชเธกเธฑเธเธฃเนเธ”เนเธฃเธฑเธเธเธฒเธฃเธญเธเธธเธกเธฑเธ•เธด');
      expect(email-service.getStatusMessage('REJECTED')).toBe('เนเธเธชเธกเธฑเธเธฃเนเธกเนเธเนเธฒเธเธเธฒเธฃเธเธดเธเธฒเธฃเธ“เธฒ');
      expect(email-service.getStatusMessage('UNKNOWN_STATUS')).toBe('เธชเธ–เธฒเธเธฐเธญเธฑเธเน€เธ”เธ•');
    });
  });

  describe('verifyConnection', () => {
    it('should verify email connection successfully', async () => {
      const result = await email-service.verifyConnection();

      expect(mockTransporter.verify).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle verification failure', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));

      const result = await email-service.verifyConnection();

      expect(result).toBe(false);
    });
  });
});
