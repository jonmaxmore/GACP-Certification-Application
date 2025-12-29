/**
 * Audit Report Service
 * Generates PDF reports for Field Audit results
 */
const pdfGenerator = require('./PdfGenerator.service');
const path = require('path');
const fs = require('fs').promises;

class AuditReportService {
    constructor() {
        this.storageDir = path.join(__dirname, '../../storage/reports');
    }

    async ensureStorageDir() {
        try {
            await fs.access(this.storageDir);
        } catch {
            await fs.mkdir(this.storageDir, { recursive: true });
        }
    }

    /**
     * Generate Field Audit Report PDF
     * @param {Object} auditData - Field audit data
     * @returns {Buffer} PDF buffer
     */
    async generateAuditReport(auditData) {
        const htmlContent = this.generateAuditReportHTML(auditData);
        return await pdfGenerator.generatePDF(htmlContent, {
            headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
          กรมการแพทย์แผนไทยและการแพทย์ทางเลือก | รายงานการตรวจประเมิน GACP
        </div>
      `,
        });
    }

    /**
     * Generate and save audit report to file
     */
    async generateAndSaveAuditReport(auditData) {
        await this.ensureStorageDir();
        const pdfBuffer = await this.generateAuditReport(auditData);
        const filename = `audit_report_${auditData.auditNumber}_${Date.now()}.pdf`;
        const filePath = path.join(this.storageDir, filename);
        await fs.writeFile(filePath, pdfBuffer);
        return { filePath, filename, buffer: pdfBuffer };
    }

    /**
     * Generate HTML template for Audit Report
     */
    generateAuditReportHTML(data) {
        const {
            auditNumber,
            applicationNumber,
            farmerName,
            farmName,
            plantType,
            farmLocation,
            auditMode,
            scheduledDate,
            auditorInfo,
            responses = [],
            overallScore,
            categoryScores = [],
            result,
            auditorNotes,
            createdAt,
        } = data;

        // Group responses by category
        const categorizedResponses = {};
        responses.forEach(r => {
            if (!categorizedResponses[r.category]) {
                categorizedResponses[r.category] = [];
            }
            categorizedResponses[r.category].push(r);
        });

        // Result badge color
        const resultColors = {
            PASS: '#16a34a',
            MINOR: '#eab308',
            MAJOR: '#f97316',
            CRITICAL_FAIL: '#dc2626',
        };
        const resultLabels = {
            PASS: 'ผ่าน',
            MINOR: 'แก้ไขเล็กน้อย',
            MAJOR: 'แก้ไขหลัก',
            CRITICAL_FAIL: 'ไม่ผ่าน',
        };

        const formatDate = (dateStr) => {
            if (!dateStr) return '-';
            return new Date(dateStr).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        };

        return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Sarabun', sans-serif; font-size: 12pt; color: #1e293b; line-height: 1.6; }
    
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1b5e20; padding-bottom: 20px; }
    .header h1 { font-size: 18pt; color: #1b5e20; margin-bottom: 5px; }
    .header p { color: #64748b; font-size: 10pt; }
    .logo { font-size: 24pt; margin-bottom: 10px; }
    
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .meta-item { font-size: 11pt; }
    .meta-label { color: #64748b; }
    .meta-value { font-weight: 600; }
    
    .result-box { text-align: center; background: #f0fdf4; border: 2px solid ${resultColors[result] || '#e2e8f0'}; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
    .result-score { font-size: 36pt; font-weight: 700; color: ${resultColors[result] || '#1b5e20'}; }
    .result-label { font-size: 14pt; font-weight: 600; color: ${resultColors[result] || '#1b5e20'}; margin-top: 5px; }
    
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13pt; font-weight: 700; color: #1b5e20; border-bottom: 2px solid #1b5e20; padding-bottom: 5px; margin-bottom: 15px; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt; }
    th { background: #1b5e20; color: white; text-align: left; padding: 10px; }
    td { border: 1px solid #e2e8f0; padding: 8px; }
    tr:nth-child(even) { background: #f8fafc; }
    
    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 9pt; font-weight: 600; }
    .badge-pass { background: #dcfce7; color: #16a34a; }
    .badge-fail { background: #fee2e2; color: #dc2626; }
    .badge-na { background: #f1f5f9; color: #64748b; }
    
    .category-header { background: #f1f5f9; font-weight: 600; }
    
    .notes-box { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; }
    .notes-title { font-weight: 600; color: #92400e; margin-bottom: 5px; }
    
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 10pt; }
    
    .signature-box { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .signature-item { text-align: center; }
    .signature-line { border-top: 1px solid #1e293b; width: 80%; margin: 60px auto 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌿</div>
      <h1>รายงานการตรวจประเมิน GACP</h1>
      <p>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก | กระทรวงสาธารณสุข</p>
    </div>
    
    <div class="meta-box">
      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">เลขที่รายงาน:</span>
          <span class="meta-value">${auditNumber || '-'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">เลขที่ใบสมัคร:</span>
          <span class="meta-value">${applicationNumber || '-'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">ผู้ประกอบการ:</span>
          <span class="meta-value">${farmerName || '-'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">ชื่อแปลง:</span>
          <span class="meta-value">${farmName || '-'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">พืชสมุนไพร:</span>
          <span class="meta-value">${plantType || '-'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">สถานที่:</span>
          <span class="meta-value">${farmLocation?.province || farmLocation?.address || '-'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">รูปแบบการตรวจ:</span>
          <span class="meta-value">${auditMode === 'ONLINE' ? '📹 ออนไลน์' : '📍 ลงพื้นที่'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">วันที่ตรวจ:</span>
          <span class="meta-value">${formatDate(scheduledDate)}</span>
        </div>
      </div>
    </div>
    
    <div class="result-box">
      <div class="result-score">${overallScore?.toFixed(1) || '0.0'}%</div>
      <div class="result-label">${resultLabels[result] || result || '-'}</div>
    </div>
    
    ${categoryScores.length > 0 ? `
    <div class="section">
      <div class="section-title">📊 คะแนนรายหมวด</div>
      <table>
        <thead>
          <tr>
            <th>หมวด</th>
            <th>คะแนน</th>
            <th>เต็ม</th>
            <th>เปอร์เซ็นต์</th>
          </tr>
        </thead>
        <tbody>
          ${categoryScores.map(cat => `
            <tr>
              <td>${cat.categoryName || cat.category}</td>
              <td>${cat.earnedScore?.toFixed(1) || 0}</td>
              <td>${cat.maxScore || 0}</td>
              <td>${cat.percentage?.toFixed(1) || 0}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    <div class="section">
      <div class="section-title">✅ รายละเอียดการตรวจ</div>
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">รหัส</th>
            <th style="width: 55%;">รายการ</th>
            <th style="width: 15%;">ผล</th>
            <th style="width: 15%;">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(categorizedResponses).map(([category, items]) => `
            <tr class="category-header">
              <td colspan="4">📂 ${category}</td>
            </tr>
            ${items.map(item => `
              <tr>
                <td>${item.itemCode}</td>
                <td>${item.titleTh || item.title || item.itemCode}</td>
                <td>
                  <span class="badge ${item.response === 'PASS' ? 'badge-pass' : item.response === 'FAIL' ? 'badge-fail' : 'badge-na'}">
                    ${item.response === 'PASS' ? '✅ ผ่าน' : item.response === 'FAIL' ? '❌ ไม่ผ่าน' : '- N/A'}
                  </span>
                </td>
                <td>${item.notes || '-'}</td>
              </tr>
            `).join('')}
          `).join('')}
        </tbody>
      </table>
    </div>
    
    ${auditorNotes ? `
    <div class="notes-box">
      <div class="notes-title">📝 หมายเหตุผู้ตรวจ</div>
      <p>${auditorNotes}</p>
    </div>
    ` : ''}
    
    <div class="signature-box">
      <div class="signature-item">
        <div class="signature-line"></div>
        <strong>ผู้ตรวจประเมิน</strong>
        <p>${auditorInfo?.name || '-'}</p>
      </div>
      <div class="signature-item">
        <div class="signature-line"></div>
        <strong>ผู้รับการตรวจ</strong>
        <p>${farmerName || '-'}</p>
      </div>
    </div>
    
    <div class="footer">
      <p>เอกสารนี้ออกโดยระบบ GACP Platform</p>
      <p>วันที่ออกเอกสาร: ${formatDate(createdAt || new Date().toISOString())}</p>
    </div>
  </div>
</body>
</html>
    `;
    }
}

module.exports = new AuditReportService();

