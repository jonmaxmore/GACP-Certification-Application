/**
 * Certificate Routes for V2 API
 * GET /api/v2/certificates/my - Get user's certificates
 */

const express = require('express');
const router = express.Router();
const { authenticateFarmer: authMiddleware } = require('../../middleware/AuthMiddleware');
const logger = require('../../shared/logger');

// Get Certificate Model - handle gracefully if not available
let Certificate;
try {
    Certificate = require('../../models/CertificateModel');
} catch (e) {
    logger.warn('CertificateModel not found, using inline schema');
    const mongoose = require('mongoose');
    const certificateSchema = new mongoose.Schema({
        certificateNumber: { type: String, required: true, unique: true },
        applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        siteName: String,
        plantType: String,
        issuedDate: Date,
        expiryDate: Date,
        status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED'], default: 'ACTIVE' },
        qrCode: String
    }, { timestamps: true });
    Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
}

/**
 * GET /api/v2/certificates/my
 * Get certificates for authenticated user
 * Supports X-User-ID header for development/testing mode
 */
router.get('/my', async (req, res) => {
    try {
        // Get user ID from auth or from X-User-ID header (dev mode)
        let userId = req.user?.id || req.user?._id;

        // Development mode: allow X-User-ID header
        if (!userId && req.headers['x-user-id']) {
            userId = req.headers['x-user-id'];
            logger.info('Using X-User-ID header for development mode:', userId);
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        // Find certificates for this user
        const certificates = await Certificate.find({ userId })
            .sort({ issuedDate: -1 })
            .lean();

        // Update status for expired certificates
        const now = new Date();
        const formattedCerts = certificates.map(cert => {
            let status = cert.status;
            if (status === 'ACTIVE' && cert.expiryDate && new Date(cert.expiryDate) < now) {
                status = 'EXPIRED';
            }
            return {
                _id: cert._id,
                certificateNumber: cert.certificateNumber,
                applicationId: cert.applicationId?.toString() || cert.applicationId,
                siteName: cert.siteName,
                plantType: cert.plantType,
                issuedDate: cert.issuedDate,
                expiryDate: cert.expiryDate,
                status: status,
                qrCode: cert.qrCode
            };
        });

        res.json({
            success: true,
            data: formattedCerts
        });
    } catch (error) {
        logger.error('Error fetching user certificates:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/v2/certificates/:id
 * Get certificate by ID
 * Supports X-User-ID header for development/testing mode
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get user ID from auth or from X-User-ID header (dev mode)
        let userId = req.user?.id || req.user?._id;
        if (!userId && req.headers['x-user-id']) {
            userId = req.headers['x-user-id'];
            logger.info('Using X-User-ID header for /certificates/:id:', userId);
        }

        // Build query - in dev mode without userId, just find by ID
        let query = { _id: id };
        if (userId) {
            query.userId = userId;
        } else {
            logger.warn('No userId provided, fetching certificate by ID only (dev mode)');
        }

        let certificate = await Certificate.findOne(query)
            .populate('applicationId', 'applicationNumber')
            .lean();

        // Fallback: If not found with userId, try without (for dev mode)
        if (!certificate && userId) {
            logger.warn('Certificate not found with userId, trying without...');
            certificate = await Certificate.findOne({ _id: id })
                .populate('applicationId', 'applicationNumber')
                .lean();
        }

        if (!certificate) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found'
            });
        }

        res.json({
            success: true,
            data: certificate
        });
    } catch (error) {
        logger.error('Error fetching certificate:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/v2/certificates/verify/:certificateNumber
 * Public endpoint to verify certificate
 */
router.get('/verify/:certificateNumber', async (req, res) => {
    try {
        const { certificateNumber } = req.params;

        const certificate = await Certificate.findOne({ certificateNumber })
            .select('certificateNumber siteName plantType issuedDate expiryDate status')
            .lean();

        if (!certificate) {
            return res.json({
                success: false,
                valid: false,
                error: 'Certificate not found'
            });
        }

        const now = new Date();
        const isExpired = certificate.expiryDate && new Date(certificate.expiryDate) < now;
        const isActive = certificate.status === 'ACTIVE' && !isExpired;

        res.json({
            success: true,
            valid: isActive,
            data: {
                certificateNumber: certificate.certificateNumber,
                siteName: certificate.siteName,
                plantType: certificate.plantType,
                issuedDate: certificate.issuedDate,
                expiryDate: certificate.expiryDate,
                status: isExpired ? 'EXPIRED' : certificate.status
            }
        });
    } catch (error) {
        logger.error('Error verifying certificate:', error);
        res.status(500).json({
            success: false,
            valid: false,
            error: error.message
        });
    }
});

module.exports = router;
