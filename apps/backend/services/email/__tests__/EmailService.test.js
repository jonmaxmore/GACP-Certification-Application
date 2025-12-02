/**
 * EmailService Tests
 * @jest-environment node
 */

const EmailService = require('../EmailService');
const EmailTemplateEngine = require('../EmailTemplateEngine');

// Mock nodemailer
jest.mock('nodemailer');
const nodemailer = require('nodemailer');

// Mock logger
jest.mock('../../../shared/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('EmailService', () => {
  let emailService;
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

    emailService = new EmailService();
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

      const gmailService = new EmailService();

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

      const sendgridService = new EmailService();

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
      const result = await emailService.sendEmail({
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
        emailService.sendEmail({
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

      await emailService.sendPasswordResetEmail(user, resetToken);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'รีเซ็ตรหัสผ่าน - GACP Platform',
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

      await emailService.sendPasswordResetEmail(user, resetToken);

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

      await emailService.sendVerificationEmail(user, verificationToken);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'newuser@example.com',
          subject: 'ยืนยันอีเมล - GACP Platform',
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

      await emailService.sendWelcomeEmail(user);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'welcome@example.com',
          subject: 'ยินดีต้อนรับสู่ GACP Platform',
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

      await emailService.sendApplicationStatusEmail(user, application, newStatus);

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

      await emailService.sendInspectionScheduledEmail(user, inspection);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'farmer@example.com',
          subject: 'การตรวจสอบฟาร์มได้รับการนัดหมายแล้ว',
        })
      );

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('ตรวจผ่านวิดีโอคอล');
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

      await emailService.sendInspectionScheduledEmail(user, inspection);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('ตรวจที่ฟาร์ม');
    });
  });

  describe('getStatusMessage', () => {
    it('should return correct status messages', () => {
      expect(emailService.getStatusMessage('DRAFT')).toBe('ใบสมัครอยู่ในสถานะร่าง');
      expect(emailService.getStatusMessage('APPROVED')).toBe('ใบสมัครได้รับการอนุมัติ');
      expect(emailService.getStatusMessage('REJECTED')).toBe('ใบสมัครไม่ผ่านการพิจารณา');
      expect(emailService.getStatusMessage('UNKNOWN_STATUS')).toBe('สถานะอัปเดต');
    });
  });

  describe('verifyConnection', () => {
    it('should verify email connection successfully', async () => {
      const result = await emailService.verifyConnection();

      expect(mockTransporter.verify).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle verification failure', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));

      const result = await emailService.verifyConnection();

      expect(result).toBe(false);
    });
  });
});
