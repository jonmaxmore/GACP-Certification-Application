/**
 * EmailService
 * Centralized email sending service with template support
 *
 * @module services/email/EmailService
 */

const nodemailer = require('nodemailer');
const logger = require('../../shared/logger');
const EmailTemplateEngine = require('./EmailTemplateEngine');

class EmailService {
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

      logger.info(`[EmailService] Initialized with provider: ${emailProvider}`);
    } catch (error) {
      logger.error('[EmailService] Failed to initialize transporter:', error);
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

      logger.info('[EmailService] Email sent successfully', {
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
      logger.error('[EmailService] Failed to send email:', {
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
      subject: 'รีเซ็ตรหัสผ่าน - GACP Platform',
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
      subject: 'ยืนยันอีเมล - GACP Platform',
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
      subject: 'ยินดีต้อนรับสู่ GACP Platform',
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
      subject: `อัปเดตสถานะใบสมัคร GACP - ${application.applicationNumber}`,
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
      subject: 'การตรวจสอบฟาร์มได้รับการนัดหมายแล้ว',
      template: 'inspection-scheduled',
      data: {
        name: user.fullName || user.email,
        inspectionType: inspection.type === 'video_call' ? 'ตรวจผ่านวิดีโอคอล' : 'ตรวจที่ฟาร์ม',
        scheduledDate: new Date(inspection.scheduledDate).toLocaleDateString('th-TH'),
        scheduledTime: inspection.scheduledTime,
        inspectorName: inspection.inspectorName || 'เจ้าหน้าที่',
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
      DRAFT: 'ใบสมัครอยู่ในสถานะร่าง',
      SUBMITTED: 'ได้รับใบสมัครเรียบร้อยแล้ว',
      PAYMENT_PENDING_1: 'รอการชำระเงินงวดที่ 1 (5,000 บาท)',
      DOCUMENT_REVIEW: 'อยู่ระหว่างการตรวจสอบเอกสาร',
      DOCUMENT_REVISION: 'กรุณาแก้ไขเอกสารตามที่แจ้ง',
      PAYMENT_PENDING_2: 'รอการชำระเงินงวดที่ 2 (25,000 บาท)',
      INSPECTION_SCHEDULED: 'นัดหมายการตรวจสอบฟาร์มแล้ว',
      INSPECTION_COMPLETED: 'ตรวจสอบฟาร์มเสร็จสิ้น',
      PENDING_APPROVAL: 'รออนุมัติผลการตรวจสอบ',
      APPROVED: 'ใบสมัครได้รับการอนุมัติ',
      REJECTED: 'ใบสมัครไม่ผ่านการพิจารณา',
      CERTIFICATE_GENERATING: 'กำลังออกใบรับรอง GACP',
      CERTIFICATE_ISSUED: 'ออกใบรับรอง GACP เรียบร้อยแล้ว',
    };

    return statusMessages[status] || 'สถานะอัปเดต';
  }

  /**
   * Verify email configuration
   * @returns {Promise<boolean>}
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('[EmailService] Email configuration verified successfully');
      return true;
    } catch (error) {
      logger.error('[EmailService] Email configuration verification failed:', error);
      return false;
    }
  }
}

module.exports = EmailService;
