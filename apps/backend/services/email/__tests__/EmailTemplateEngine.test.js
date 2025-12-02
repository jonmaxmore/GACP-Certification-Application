/**
 * EmailTemplateEngine Tests
 * @jest-environment node
 */

const EmailTemplateEngine = require('../EmailTemplateEngine');
const fs = require('fs').promises;

// Mock fs
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../../shared/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('EmailTemplateEngine', () => {
  let templateEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    templateEngine = new EmailTemplateEngine();
  });

  describe('render', () => {
    it('should render template with data', async () => {
      const mockTemplate = '<h1>Hello {{name}}</h1><p>{{message}}</p>';
      fs.readFile.mockResolvedValue(mockTemplate);

      const result = await templateEngine.render('test-template', {
        name: 'John Doe',
        message: 'Welcome to GACP',
      });

      expect(result).toBe('<h1>Hello John Doe</h1><p>Welcome to GACP</p>');
    });

    it('should handle missing variables gracefully', async () => {
      const mockTemplate = '<h1>Hello {{name}}</h1><p>{{missing}}</p>';
      fs.readFile.mockResolvedValue(mockTemplate);

      const result = await templateEngine.render('test-template', {
        name: 'John Doe',
      });

      expect(result).toBe('<h1>Hello John Doe</h1><p></p>');
    });

    it('should cache templates after first read', async () => {
      const mockTemplate = '<h1>{{title}}</h1>';
      fs.readFile.mockResolvedValue(mockTemplate);

      // First call
      await templateEngine.render('cached-template', { title: 'First' });
      expect(fs.readFile).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await templateEngine.render('cached-template', { title: 'Second' });
      expect(fs.readFile).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should use fallback template when file not found', async () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      fs.readFile.mockRejectedValue(error);

      const result = await templateEngine.render('password-reset', {
        name: 'Test User',
        resetLink: 'http://example.com/reset',
        expiryHours: 24,
      });

      expect(result).toContain('Test User');
      expect(result).toContain('http://example.com/reset');
      expect(result).toContain('รีเซ็ตรหัสผ่าน');
    });
  });

  describe('getFallbackTemplate', () => {
    it('should return password-reset fallback template', () => {
      const template = templateEngine.getFallbackTemplate('password-reset');

      expect(template).toContain('รีเซ็ตรหัสผ่าน');
      expect(template).toContain('{{name}}');
      expect(template).toContain('{{resetLink}}');
      expect(template).toContain('{{expiryHours}}');
    });

    it('should return email-verification fallback template', () => {
      const template = templateEngine.getFallbackTemplate('email-verification');

      expect(template).toContain('ยืนยันอีเมล');
      expect(template).toContain('{{verificationLink}}');
    });

    it('should return welcome fallback template', () => {
      const template = templateEngine.getFallbackTemplate('welcome');

      expect(template).toContain('ยินดีต้อนรับ');
      expect(template).toContain('{{dashboardLink}}');
    });

    it('should return application-status fallback template', () => {
      const template = templateEngine.getFallbackTemplate('application-status');

      expect(template).toContain('อัปเดตสถานะใบสมัคร');
      expect(template).toContain('{{applicationNumber}}');
      expect(template).toContain('{{statusMessage}}');
    });

    it('should return inspection-scheduled fallback template', () => {
      const template = templateEngine.getFallbackTemplate('inspection-scheduled');

      expect(template).toContain('นัดหมายการตรวจสอบฟาร์ม');
      expect(template).toContain('{{inspectionType}}');
      expect(template).toContain('{{scheduledDate}}');
    });

    it('should return generic fallback for unknown template', () => {
      const template = templateEngine.getFallbackTemplate('unknown-template');

      expect(template).toContain('{{message}}');
      expect(template).toContain('GACP Platform');
    });
  });

  describe('clearCache', () => {
    it('should clear template cache', async () => {
      const mockTemplate = '<h1>{{title}}</h1>';
      fs.readFile.mockResolvedValue(mockTemplate);

      // Load template
      await templateEngine.render('test', { title: 'Test' });
      expect(fs.readFile).toHaveBeenCalledTimes(1);

      // Clear cache
      templateEngine.clearCache();

      // Load again - should read from file
      await templateEngine.render('test', { title: 'Test' });
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('Template rendering edge cases', () => {
    it('should handle templates with multiple occurrences of same variable', async () => {
      const mockTemplate = '<p>{{name}}</p><p>Hello {{name}} again!</p>';
      fs.readFile.mockResolvedValue(mockTemplate);

      const result = await templateEngine.render('test', { name: 'John' });

      expect(result).toBe('<p>John</p><p>Hello John again!</p>');
    });

    it('should handle special characters in data', async () => {
      const mockTemplate = '<p>{{message}}</p>';
      fs.readFile.mockResolvedValue(mockTemplate);

      const result = await templateEngine.render('test', {
        message: 'Hello <script>alert("XSS")</script>',
      });

      // Note: Template engine doesn't escape HTML - this should be handled by email client
      expect(result).toContain('<script>');
    });

    it('should handle empty data object', async () => {
      const mockTemplate = '<h1>{{title}}</h1><p>{{content}}</p>';
      fs.readFile.mockResolvedValue(mockTemplate);

      const result = await templateEngine.render('test', {});

      expect(result).toBe('<h1></h1><p></p>');
    });
  });
});
