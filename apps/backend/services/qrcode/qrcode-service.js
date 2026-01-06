/**
 * QR Code Service
 * Generates and manages QR codes for batch/lot tracking
 * 
 * @module services/qrcode/qrcode-service
 */

const QRCode = require('qrcode');
const crypto = require('crypto');
const logger = require('../../shared/logger');

class QRCodeService {
    constructor() {
        this.baseUrl = process.env.PUBLIC_TRACE_URL || 'http://47.129.167.71/trace';
    }

    /**
     * Generate a unique QR code identifier
     * @returns {string} UUID for QR lookup
     */
    generateQRCodeId() {
        return crypto.randomUUID();
    }

    /**
     * Generate tracking URL for a QR code
     * @param {string} qrCodeId - UUID for the QR code
     * @returns {string} Full tracking URL
     */
    generateTrackingUrl(qrCodeId) {
        return `${this.baseUrl}/${qrCodeId}`;
    }

    /**
     * Generate QR code as data URL (Base64)
     * @param {string} qrCodeId - UUID for the QR code
     * @param {object} options - QR code options
     * @returns {Promise<string>} Data URL string
     */
    async generateDataUrl(qrCodeId, options = {}) {
        const url = this.generateTrackingUrl(qrCodeId);
        const qrOptions = {
            type: 'image/png',
            color: {
                dark: options.darkColor || '#000000',
                light: options.lightColor || '#FFFFFF'
            },
            width: options.width || 300,
            margin: options.margin || 2,
            errorCorrectionLevel: 'M'
        };

        try {
            const dataUrl = await QRCode.toDataURL(url, qrOptions);
            return dataUrl;
        } catch (error) {
            logger.error('QR Code generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate QR code as Buffer (PNG)
     * @param {string} qrCodeId - UUID for the QR code
     * @param {object} options - QR code options
     * @returns {Promise<Buffer>} PNG image buffer
     */
    async generateBuffer(qrCodeId, options = {}) {
        const url = this.generateTrackingUrl(qrCodeId);
        const qrOptions = {
            type: 'png',
            color: {
                dark: options.darkColor || '#000000',
                light: options.lightColor || '#FFFFFF'
            },
            width: options.width || 300,
            margin: options.margin || 2,
            errorCorrectionLevel: 'M'
        };

        try {
            const buffer = await QRCode.toBuffer(url, qrOptions);
            return buffer;
        } catch (error) {
            logger.error('QR Code buffer generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate QR code for a batch or lot
     * @param {string} type - 'BATCH' or 'LOT'
     * @param {string} id - Batch or Lot ID
     * @returns {object} QR code data
     */
    async generateForRecord(type, id) {
        const qrCodeId = this.generateQRCodeId();
        const trackingUrl = this.generateTrackingUrl(qrCodeId);
        const dataUrl = await this.generateDataUrl(qrCodeId);

        return {
            qrCode: qrCodeId,
            trackingUrl,
            dataUrl,
            type,
            recordId: id,
            generatedAt: new Date().toISOString()
        };
    }
}

module.exports = new QRCodeService();
