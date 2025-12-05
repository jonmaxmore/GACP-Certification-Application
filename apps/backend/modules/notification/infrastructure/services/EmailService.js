/**
 * Email Notification Service Implementation
 *
 * Implements INotificationService interface for email delivery using NodeMailer.
 * Part of Clean Architecture - Infrastructure Layer
 */

const logger = require('../../../../shared/logger/logger');
const nodemailer = require('nodemailer');

class EmailNotificationService {
  constructor(config = {}) {
    this.config = {
      host: config.host || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: config.port || process.env.SMTP_PORT || 587,
      secure: config.secure !== undefined ? config.secure : false,
      auth: {
        user: config.user || process.env.SMTP_USER,
        pass: config.pass || process.env.SMTP_PASS,
      },
      from: config.from || process.env.SMTP_FROM || 'noreply@gacp-platform.com',
      fromName: config.fromName || process.env.SMTP_FROM_NAME || 'GACP Platform',
    };

    // Create transporter
    this.transporter = null;
    this._initializeTransporter();
  }

  _initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
      });

      // Verify connection
      this.transporter.verify((error, _success) => {
        if (error) {
          logger.error('Email service verification failed:', error);
        } else {
          logger.info('Email service ready to send messages');
        }
      });
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(emailData) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const { to, subject, html, text, cc, bcc, attachments } = emailData;

      if (!to || !subject || (!html && !text)) {
        throw new Error('Missing required email fields: to, subject, and content');
      }

      const mailOptions = {
        from: `"${this.config.fromName}" <${this.config.from}>`,
        to,
        subject,
        html,
        text: text || this._stripHtml(html),
        cc,
        bcc,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log('Email sent successfully:', {
        messageId: info.messageId,
        to,
        subject,
      });

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendSMS(smsData) {
    // SMS service not implemented in MVP
    // Can be integrated with services like Twilio, AWS SNS, etc.
    logger.warn('SMS service not implemented yet:', smsData);

    return {
      success: false,
      error: 'SMS service not implemented',
    };
  }

  async sendPush(pushData) {
    // Push notification service not implemented in MVP
    // Can be integrated with Firebase Cloud Messaging, OneSignal, etc.
    logger.warn('Push notification service not implemented yet:', pushData);

    return {
      success: false,
      error: 'Push notification service not implemented',
    };
  }

  // Helper: Strip HTML tags for plain text fallback
  _stripHtml(html) {
    if (!html) {
      return '';
    }
    return html
      .replace(/<style[^>]*>.*<\/style>/gi, '')
      .replace(/<script[^>]*>.*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  // Template: Farm Approved
  generateFarmApprovedEmail(farmName, farmerName, certificateUrl) {
    return {
      subject: `ฟาร์ม ${farmName} ได้รับการอนุมัติแล้ว`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ยินดีด้วย!</h1>
            </div>
            <div class="content">
              <p>เรียน คุณ${farmerName}</p>
              <p>ฟาร์ม <strong>${farmName}</strong> ของท่านได้รับการอนุมัติเรียบร้อยแล้ว</p>
              <p>ท่านสามารถดำเนินการขั้นตอนต่อไปได้ เช่น การส่งแบบสำรวจ GAP หรือการลงทะเบียนเข้าอบรม</p>
              ${certificateUrl ? `<a href="${certificateUrl}" class="button">ดูใบรับรอง</a>` : ''}
              <p style="margin-top: 30px;">ขอบคุณที่ใช้บริการระบบ GACP</p>
            </div>
            <div class="footer">
              <p>© 2024 GACP Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  // Template: Survey Submitted
  generateSurveySubmittedEmail(farmName, farmerName) {
    return {
      subject: `แบบสำรวจ GAP ของฟาร์ม ${farmName} ถูกส่งเรียบร้อย`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .info-box { background: #f0f4ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ ส่งแบบสำรวจสำเร็จ</h1>
            </div>
            <div class="content">
              <p>เรียน คุณ${farmerName}</p>
              <p>แบบสำรวจ GAP ของฟาร์ม <strong>${farmName}</strong> ถูกส่งเรียบร้อยแล้ว</p>
              <div class="info-box">
                <p><strong>ขั้นตอนต่อไป:</strong></p>
                <p>เจ้าหน้าที่จะตรวจสอบข้อมูลภายใน 3-5 วันทำการ ท่านจะได้รับการแจ้งเตือนเมื่อมีการอัพเดทสถานะ</p>
              </div>
              <p>ขอบคุณที่ใช้บริการระบบ GACP</p>
            </div>
            <div class="footer">
              <p>© 2024 GACP Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  // Template: Certificate Expiring
  generateCertificateExpiringEmail(farmName, farmerName, daysLeft, renewUrl) {
    return {
      subject: `⚠️ ใบรับรองของฟาร์ม ${farmName} กำลังจะหมดอายุ`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .warning-box { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ แจ้งเตือนใบรับรองใกล้หมดอายุ</h1>
            </div>
            <div class="content">
              <p>เรียน คุณ${farmerName}</p>
              <div class="warning-box">
                <p><strong>⚠️ ใบรับรองของฟาร์ม ${farmName} กำลังจะหมดอายุใน ${daysLeft} วัน</strong></p>
                <p>กรุณาดำเนินการต่ออายุใบรับรองเพื่อรักษาสถานะฟาร์มของท่าน</p>
              </div>
              ${renewUrl ? `<a href="${renewUrl}" class="button">ต่ออายุใบรับรอง</a>` : ''}
              <p>หากมีข้อสงสัย กรุณาติดต่อเจ้าหน้าที่</p>
            </div>
            <div class="footer">
              <p>© 2024 GACP Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  // Template: Training Enrolled
  generateTrainingEnrolledEmail(courseName, farmerName, courseUrl) {
    return {
      subject: `ลงทะเบียนคอร์ส ${courseName} สำเร็จ`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 ลงทะเบียนสำเร็จ</h1>
            </div>
            <div class="content">
              <p>เรียน คุณ${farmerName}</p>
              <p>ท่านได้ลงทะเบียนคอร์ส <strong>${courseName}</strong> เรียบร้อยแล้ว</p>
              <p>ท่านสามารถเข้าเรียนได้ทันที</p>
              ${courseUrl ? `<a href="${courseUrl}" class="button">เริ่มเรียน</a>` : ''}
              <p style="margin-top: 30px;">ขอให้เรียนรู้อย่างมีความสุข!</p>
            </div>
            <div class="footer">
              <p>© 2024 GACP Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  // Template: Generic Notification
  generateGenericEmail(title, message, actionUrl, actionLabel) {
    return {
      subject: title,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
            </div>
            <div class="content">
              <p>${message}</p>
              ${actionUrl ? `<a href="${actionUrl}" class="button">${actionLabel || 'ดูรายละเอียด'}</a>` : ''}
            </div>
            <div class="footer">
              <p>© 2024 GACP Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }
}

module.exports = EmailNotificationService;
