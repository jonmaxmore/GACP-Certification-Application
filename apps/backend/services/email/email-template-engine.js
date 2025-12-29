/**
 * EmailTemplateEngine
 * Renders HTML email templates with data
 *
 * @module services/email/EmailTemplateEngine
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../../shared/logger');

class EmailTemplateEngine {
  constructor() {
    this.templatesDir = path.join(__dirname, 'templates');
    this.cache = new Map();
  }

  /**
   * Render template with data
   * @param {string} templateName - Template name (without .html extension)
   * @param {Object} data - Template data
   * @returns {Promise<string>} Rendered HTML
   */
  async render(templateName, data) {
    try {
      // Get template content
      const template = await this.getTemplate(templateName);

      // Replace placeholders with data
      let html = template;
      for (const [key, value] of Object.entries(data)) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        const replacement = (value !== null && value !== undefined) ? String(value) : '';
        html = html.replace(placeholder, replacement);
      }

      // Remove any remaining unreplaced placeholders
      html = html.replace(/{{[^}]+}}/g, '');

      return html;
    } catch (error) {
      logger.error(`[EmailTemplateEngine] Failed to render template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Get template content (with caching)
   * @param {string} templateName - Template name
   * @returns {Promise<string>} Template content
   */
  async getTemplate(templateName) {
    // Check cache
    if (this.cache.has(templateName)) {
      return this.cache.get(templateName);
    }

    // Read template file
    const templatePath = path.join(this.templatesDir, `${templateName}.html`);

    try {
      const content = await fs.readFile(templatePath, 'utf-8');

      // Cache template
      this.cache.set(templateName, content);

      return content;
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.warn(`[EmailTemplateEngine] Template not found: ${templateName}, using fallback`);
        return this.getFallbackTemplate(templateName);
      }
      throw error;
    }
  }

  /**
   * Get fallback template if file not found
   * @param {string} templateName - Template name
   * @returns {string} Fallback HTML
   */
  getFallbackTemplate(templateName) {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GACP Platform</title>
        <style>
          body { font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; padding: 12px 30px; background: #2e7d32; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 GACP Platform</h1>
          </div>
          <div class="content">
            {{content}}
          </div>
          <div class="footer">
            <p>© 2025 GACP Platform - Good Agricultural and Collection Practices</p>
            <p>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก (DTAM)</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Template-specific fallbacks
    const fallbacks = {
      'password-reset': `
        <h2>รีเซ็ตรหัสผ่าน</h2>
        <p>สวัสดีคุณ {{name}}</p>
        <p>คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี GACP Platform</p>
        <p>กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
        <a href="{{resetLink}}" class="button">รีเซ็ตรหัสผ่าน</a>
        <p><small>ลิงก์นี้จะหมดอายุใน {{expiryHours}} ชั่วโมง</small></p>
        <p>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยอีเมลนี้</p>
      `,
      'email-verification': `
        <h2>ยืนยันอีเมล</h2>
        <p>สวัสดีคุณ {{name}}</p>
        <p>ขอบคุณที่สมัครใช้งาน GACP Platform</p>
        <p>กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
        <a href="{{verificationLink}}" class="button">ยืนยันอีเมล</a>
        <p><small>ลิงก์นี้จะหมดอายุใน {{expiryHours}} ชั่วโมง</small></p>
      `,
      'welcome': `
        <h2>ยินดีต้อนรับสู่ GACP Platform</h2>
        <p>สวัสดีคุณ {{name}}</p>
        <p>ยินดีต้อนรับเข้าสู่ระบบ GACP Platform สำหรับการรับรองมาตรฐาน GACP</p>
        <p>บทบาทของคุณ: <strong>{{role}}</strong></p>
        <a href="{{dashboardLink}}" class="button">ไปที่ Dashboard</a>
        <p>หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อเจ้าหน้าที่</p>
      `,
      'application-status': `
        <h2>อัปเดตสถานะใบสมัคร</h2>
        <p>สวัสดีคุณ {{name}}</p>
        <p>ใบสมัครของคุณ <strong>{{applicationNumber}}</strong> มีการอัปเดตสถานะ</p>
        <p>สถานะปัจจุบัน: <strong>{{status}}</strong></p>
        <p>{{statusMessage}}</p>
        <a href="{{applicationLink}}" class="button">ดูรายละเอียด</a>
      `,
      'inspection-scheduled': `
        <h2>นัดหมายการตรวจสอบฟาร์ม</h2>
        <p>สวัสดีคุณ {{name}}</p>
        <p>การตรวจสอบฟาร์มของคุณได้รับการนัดหมายแล้ว</p>
        <p><strong>ประเภท:</strong> {{inspectionType}}</p>
        <p><strong>วันที่:</strong> {{scheduledDate}}</p>
        <p><strong>เวลา:</strong> {{scheduledTime}}</p>
        <p><strong>เจ้าหน้าที่:</strong> {{inspectorName}}</p>
        <p>{{notes}}</p>
        <p>กรุณาเตรียมความพร้อมสำหรับการตรวจสอบ</p>
      `,
    };

    const content = fallbacks[templateName] || '<p>{{message}}</p>';
    return baseTemplate.replace('{{content}}', content);
  }

  /**
   * Clear template cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('[EmailTemplateEngine] Template cache cleared');
  }
}

module.exports = EmailTemplateEngine;
