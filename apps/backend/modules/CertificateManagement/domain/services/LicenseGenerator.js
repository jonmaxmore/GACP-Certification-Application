/**
 * LicenseGenerator.js
 * Service for generating GACP License Numbers and PDF Documents
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class LicenseGenerator {
    /**
     * Generate a unique license number
     * Format: GACP-{YEAR}-{PROVINCE}-{RUNNING}
     * Example: GACP-2025-CMI-0001
     * @param {String} provinceCode - 3-letter province code (e.g., CMI, BKK)
     * @param {Number} runningNumber - Sequential number
     * @returns {String} Formatted license number
     */
    generateLicenseNumber(provinceCode, runningNumber) {
        const year = new Date().getFullYear();
        const running = String(runningNumber).padStart(4, '0');
        return `GACP-${year}-${provinceCode}-${running}`;
    }

    /**
     * Generate License PDF
     * @param {Object} application - Application data
     * @param {Object} licenseData - { licenseNumber, issueDate, expiryDate }
     * @returns {Promise<Buffer>} PDF Buffer
     */
    async generateLicensePDF(application, licenseData) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const buffers = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });

                // -- PDF Content --

                // Header
                doc.fontSize(20).text('ใบรับรองมาตรฐาน GACP', { align: 'center' });
                doc.fontSize(14).text('Good Agricultural and Collection Practices', { align: 'center' });
                doc.moveDown();

                // License Number
                doc.fontSize(12).text(`เลขที่ใบรับรอง: ${licenseData.licenseNumber}`, { align: 'right' });
                doc.text(`วันที่ออก: ${licenseData.issueDate.toLocaleDateString('th-TH')}`, { align: 'right' });
                doc.text(`วันหมดอายุ: ${licenseData.expiryDate.toLocaleDateString('th-TH')}`, { align: 'right' });
                doc.moveDown(2);

                // Body
                doc.fontSize(16).text('หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า', { align: 'center' });
                doc.moveDown();

                doc.fontSize(18).font('Helvetica-Bold').text(application.applicantInfo.name, { align: 'center' });
                doc.fontSize(14).font('Helvetica').text(`ที่อยู่: ${application.applicantInfo.address}`, { align: 'center' });
                doc.moveDown();

                doc.text('ได้ผ่านการตรวจสอบมาตรฐานการปฏิบัติทางการเกษตรและการเก็บเกี่ยวที่ดี (GACP)', { align: 'center' });
                doc.text(`สำหรับพืชสมุนไพร: ${application.cropInfo.strainName}`, { align: 'center' });
                doc.moveDown(2);

                // Footer
                doc.fontSize(12).text('ออกโดย กรมการแพทย์แผนไทยและการแพทย์ทางเลือก', { align: 'center', valign: 'bottom' });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new LicenseGenerator();
