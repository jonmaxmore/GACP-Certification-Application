/**
 * Certificate Routes for V2 API (Prisma Implementation)
 * GET /api/v2/certificates/my - Get user's certificates
 */

const express = require('express');
const router = express.Router();
const prisma = require('../../services/prisma-database').prisma;
const authModule = require('../../middleware/auth-middleware');
const logger = require('../../shared/logger');

// Safe middleware wrapper
const authenticateFarmer = (req, res, next) => {
    if (typeof authModule.authenticateFarmer === 'function') {
        return authModule.authenticateFarmer(req, res, next);
    }
    return res.status(500).json({ error: 'Auth middleware not loaded' });
};

// Staff authentication wrapper (uses DTAM JWT secret)
const authenticateStaff = (req, res, next) => {
    if (typeof authModule.authenticateDTAM === 'function') {
        return authModule.authenticateDTAM(req, res, next);
    }
    return res.status(500).json({ error: 'Auth middleware not loaded' });
};

/**
 * GET /api/certificates
 * Get all certificates (Staff only)
 */
router.get('/', authenticateStaff, async (req, res) => {
    try {
        const certificates = await prisma.certificate.findMany({
            where: { isDeleted: false },
            orderBy: { issuedDate: 'desc' },
            take: 100,
        });

        res.json({
            success: true,
            count: certificates.length,
            data: certificates,
        });
    } catch (error) {
        logger.error('[Certificates] getAll error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch certificates',
        });
    }
});
router.get('/my', authenticateFarmer, async (req, res) => {
    try {
        const userId = req.user.id;

        const certificates = await prisma.certificate.findMany({
            where: { userId, isDeleted: false },
            orderBy: { issuedDate: 'desc' },
        });

        // Check expiry
        const now = new Date();
        const formattedCerts = certificates.map(cert => {
            let status = cert.status;
            if (status === 'ACTIVE' && cert.expiryDate && new Date(cert.expiryDate) < now) {
                status = 'EXPIRED';
            }
            return {
                _id: cert.id, // Frontend expects _id
                certificateNumber: cert.certificateNumber,
                applicationId: cert.applicationId,
                siteName: cert.siteName || cert.farmName, // Fallback
                plantType: cert.plantType || cert.cropType, // Fallback
                issuedDate: cert.issuedDate,
                expiryDate: cert.expiryDate,
                status: status,
                qrCode: cert.qrData, // Frontend expects qrCode or qrData
            };
        });

        res.json({
            success: true,
            data: formattedCerts,
        });
    } catch (error) {
        logger.error('[Certificates] getMy error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch certificates',
        });
    }
});

/**
 * GET /api/v2/certificates/:id
 * Get certificate by ID
 */
router.get('/:id', authenticateFarmer, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const certificate = await prisma.certificate.findFirst({
            where: {
                id,
                userId, // Security: Ensure ownership
                isDeleted: false,
            },
            include: {
                application: {
                    select: { applicationNumber: true },
                },
            },
        });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found',
            });
        }

        res.json({
            success: true,
            data: certificate,
        });
    } catch (error) {
        logger.error('[Certificates] getById error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
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

        const certificate = await prisma.certificate.findUnique({
            where: { certificateNumber },
        });

        if (!certificate || certificate.isDeleted) {
            return res.json({
                success: false,
                valid: false,
                error: 'Certificate not found',
            });
        }

        const now = new Date();
        const isExpired = certificate.expiryDate && new Date(certificate.expiryDate) < now;
        const isActive = certificate.status.toLowerCase() === 'active' && !isExpired;

        res.json({
            success: true,
            valid: isActive,
            data: {
                certificateNumber: certificate.certificateNumber,
                siteName: certificate.siteName || certificate.farmName,
                plantType: certificate.plantType || certificate.cropType,
                issuedDate: certificate.issuedDate,
                expiryDate: certificate.expiryDate,
                status: isExpired ? 'EXPIRED' : certificate.status,
            },
        });
    } catch (error) {
        logger.error('[Certificates] verify error:', error);
        res.status(500).json({
            success: false,
            valid: false,
            error: error.message,
        });
    }
});

module.exports = router;
