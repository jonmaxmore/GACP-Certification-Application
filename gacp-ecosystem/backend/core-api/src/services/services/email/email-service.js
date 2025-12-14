/**
 * email-service
 * Centralized email sending service with template support
 *
 * @module services/email/email-service
 */

const nodemailer = require('nodemailer');
const logger = require('../../shared/logger');
const EmailTemplateEngine = require('./email-template-engine');

class email-service {
  constructor() {
    this.transporter = null;
    this.templateEngine = new EmailTemplateEngine();
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   * Supports multiple providers: Gmail, SendGrid, AWS SES, SMTP
   */
  initializeTransporter() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';

    try {
      switch (emailProvider) {
        case 'gmail':
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_APP_PASSWORD,
            },
          });
          break;

        case 'sendgrid':
          this.transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
              user: 'apikey',
              pass: process.env.SENDGRID_API_KEY,
            },
          });
          break;

        case 'ses':
          // AWS SES configuration
          this.transporter = nodemailer.createTransport({
            host: process.env.AWS_SES_HOST,
            port: 587,
            secure: false,
            auth: {
              user: process.env.AWS_SES_ACCESS_KEY,
              pass: process.env.AWS_SES_SECRET_KEY,
            },
          });
          break;

        case 'smtp':
        default:
          this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          });
          break;
      }

      logger.info(`[email-service] Initialized with provider: ${emailProvider}`);
    } catch (error) {
      logger.error('[email-service] Failed to initialize transporter:', error);
      throw error;
    }
  }

  /**
   * Send email with template
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.template - Template name
   * @param {Object} options.data - Template data
   * @returns {Promise<Object>} Send result
   */
  async sendEmail({ to, subject, template, data }) {
    try {
      // Render template
      const html = await this.templateEngine.render(template, data);

      // Email options
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'GACP Platform'} <${process.env.EMAIL_FROM_ADDRESS || 'noreply@gacp.th'}>`,
        to,
        subject,
        html,
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);

      logger.info('[email-service] Email sent successfully', {
        to,
        subject,
        template,
        messageId: result.messageId,
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error('[email-service] Failed to send email:', {
        to,
        subject,
        template,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>}
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    return this.sendEmail({
      to: user.email,
      subject: 'เธฃเธตเน€เธเนเธ•เธฃเธซเธฑเธชเธเนเธฒเธ - GACP Platform',
      template: 'password-reset',
      data: {
        name: user.fullName || user.email,
        resetLink,
        expiryHours: 24,
      },
    });
  }

  /**
   * Send email verification email
   * @param {Object} user - User object
   * @param {string} verificationToken - Email verification token
   * @returns {Promise<Object>}
   */
  async sendVerificationEmail(user, verificationToken) {
    const verificationLink = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    return this.sendEmail({
      to: user.email,
      subject: 'เธขเธทเธเธขเธฑเธเธญเธตเน€เธกเธฅ - GACP Platform',
      template: 'email-verification',
      data: {
        name: user.fullName || user.email,
        verificationLink,
        expiryHours: 48,
      },
    });
  }

  /**
   * Send welcome email
   * @param {Object} user - User object
   * @returns {Promise<Object>}
   */
  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: 'เธขเธดเธเธ”เธตเธ•เนเธญเธเธฃเธฑเธเธชเธนเน GACP Platform',
      template: 'welcome',
      data: {
        name: user.fullName || user.email,
        role: user.role,
        dashboardLink: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard`,
      },
    });
  }

  /**
   * Send application status update email
   * @param {Object} user - User object
   * @param {Object} application - Application object
   * @param {string} newStatus - New application status
   * @returns {Promise<Object>}
   */
  async sendApplicationStatusEmail(user, application, newStatus) {
    return this.sendEmail({
      to: user.email,
      subject: `เธญเธฑเธเน€เธ”เธ•เธชเธ–เธฒเธเธฐเนเธเธชเธกเธฑเธเธฃ GACP - ${application.applicationNumber}`,
      template: 'application-status',
      data: {
        name: user.fullName || user.email,
        applicationNumber: application.applicationNumber,
        status: newStatus,
        statusMessage: this.getStatusMessage(newStatus),
        applicationLink: `${process.env.APP_URL || 'http://localhost:3000'}/applications/${application._id}`,
      },
    });
  }

  /**
   * Send inspection scheduled notification
   * @param {Object} user - User object
   * @param {Object} inspection - Inspection object
   * @returns {Promise<Object>}
   */
  async sendInspectionScheduledEmail(user, inspection) {
    return this.sendEmail({
      to: user.email,
      subject: 'เธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธเธเธฒเธฃเนเธกเนเธ”เนเธฃเธฑเธเธเธฒเธฃเธเธฑเธ”เธซเธกเธฒเธขเนเธฅเนเธง',
      template: 'inspection-scheduled',
      data: {
        name: user.fullName || user.email,
        inspectionType: inspection.type === 'video_call' ? 'เธ•เธฃเธงเธเธเนเธฒเธเธงเธดเธ”เธตเนเธญเธเธญเธฅ' : 'เธ•เธฃเธงเธเธ—เธตเนเธเธฒเธฃเนเธก',
        scheduledDate: new Date(inspection.scheduledDate).toLocaleDateString('th-TH'),
        scheduledTime: inspection.scheduledTime,
        inspectorName: inspection.inspectorName || 'เน€เธเนเธฒเธซเธเนเธฒเธ—เธตเน',
        notes: inspection.notes || '',
      },
    });
  }

  /**
   * Get human-readable status message
   * @param {string} status - Application status
   * @returns {string}
   */
  getStatusMessage(status) {
    const statusMessages = {
      DRAFT: 'เนเธเธชเธกเธฑเธเธฃเธญเธขเธนเนเนเธเธชเธ–เธฒเธเธฐเธฃเนเธฒเธ',
      SUBMITTED: 'เนเธ”เนเธฃเธฑเธเนเธเธชเธกเธฑเธเธฃเน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง',
      PAYMENT_PENDING_1: 'เธฃเธญเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธเธเธงเธ”เธ—เธตเน 1 (5,000 เธเธฒเธ—)',
      DOCUMENT_REVIEW: 'เธญเธขเธนเนเธฃเธฐเธซเธงเนเธฒเธเธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธเน€เธญเธเธชเธฒเธฃ',
      DOCUMENT_REVISION: 'เธเธฃเธธเธ“เธฒเนเธเนเนเธเน€เธญเธเธชเธฒเธฃเธ•เธฒเธกเธ—เธตเนเนเธเนเธ',
      PAYMENT_PENDING_2: 'เธฃเธญเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธเธเธงเธ”เธ—เธตเน 2 (25,000 เธเธฒเธ—)',
      INSPECTION_SCHEDULED: 'เธเธฑเธ”เธซเธกเธฒเธขเธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธเธเธฒเธฃเนเธกเนเธฅเนเธง',
      INSPECTION_COMPLETED: 'เธ•เธฃเธงเธเธชเธญเธเธเธฒเธฃเนเธกเน€เธชเธฃเนเธเธชเธดเนเธ',
      PENDING_APPROVAL: 'เธฃเธญเธญเธเธธเธกเธฑเธ•เธดเธเธฅเธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธ',
      APPROVED: 'เนเธเธชเธกเธฑเธเธฃเนเธ”เนเธฃเธฑเธเธเธฒเธฃเธญเธเธธเธกเธฑเธ•เธด',
      REJECTED: 'เนเธเธชเธกเธฑเธเธฃเนเธกเนเธเนเธฒเธเธเธฒเธฃเธเธดเธเธฒเธฃเธ“เธฒ',
      CERTIFICATE_GENERATING: 'เธเธณเธฅเธฑเธเธญเธญเธเนเธเธฃเธฑเธเธฃเธญเธ GACP',
      CERTIFICATE_ISSUED: 'เธญเธญเธเนเธเธฃเธฑเธเธฃเธญเธ GACP เน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง',
    };

    return statusMessages[status] || 'เธชเธ–เธฒเธเธฐเธญเธฑเธเน€เธ”เธ•';
  }

  /**
   * Verify email configuration
   * @returns {Promise<boolean>}
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('[email-service] Email configuration verified successfully');
      return true;
    } catch (error) {
      logger.error('[email-service] Email configuration verification failed:', error);
      return false;
    }
  }
}

module.exports = email-service;
