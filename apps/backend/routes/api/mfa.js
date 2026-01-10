/**
 * MFA API Routes (V2)
 * For DTAM Staff Multi-Factor Authentication
 * Prisma Implementation
 */

const express = require('express');
const router = express.Router();
const { mfaService } = require('../../middleware/mfa-service');
const { auditLogger, AuditCategory } = require('../../middleware/audit-logger');
const prisma = require('../../services/prisma-database').prisma;

// Middleware to ensure user is Staff
const { authenticateDTAM } = require('../../middleware/auth-middleware');

/**
 * POST /setup
 * Initialize MFA setup for staff user
 */
router.post('/setup', authenticateDTAM, async (req, res) => {
    try {
        const userId = req.user.id;
        const email = req.user.email;

        // Generate new secret
        const secret = mfaService.generateSecret();
        const qrCodeUri = mfaService.generateQRCodeUri(secret, email);

        // Store secret temporarily (not yet verified)
        await prisma.dTAMStaff.update({
            where: { id: userId },
            data: {
                mfaSecret: secret,
                mfaEnabled: false, // Not enabled until verified
            },
        });

        // Log MFA setup initiation
        await auditLogger.log({
            category: AuditCategory.SECURITY,
            action: 'MFA_SETUP_INITIATED',
            actorId: userId,
            actorRole: req.user.role,
            resourceType: 'USER',
            resourceId: userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        res.json({
            success: true,
            data: {
                secret,
                qrCodeUri,
                message: 'Scan QR code with authenticator app, then verify with a code',
            },
        });
    } catch (error) {
        console.error('[MFA] Setup error:', error);
        res.status(500).json({ success: false, error: 'Setup failed' });
    }
});

/**
 * POST /verify-setup
 * Verify MFA setup with first code
 */
router.post('/verify-setup', authenticateDTAM, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        if (!code || code.length !== 6) {
            return res.status(400).json({
                success: false,
                error: 'Invalid code format',
            });
        }

        // Get stored secret
        const user = await prisma.dTAMStaff.findUnique({
            where: { id: userId },
            select: { mfaSecret: true },
        });

        if (!user?.mfaSecret) {
            return res.status(400).json({
                success: false,
                error: 'MFA not initialized. Please start setup first.',
            });
        }

        // Verify code
        const isValid = mfaService.verifyTOTP(user.mfaSecret, code);

        if (!isValid) {
            await auditLogger.log({
                category: AuditCategory.SECURITY,
                action: 'MFA_SETUP_FAILED',
                actorId: userId,
                actorRole: req.user.role,
                resourceType: 'USER',
                resourceId: userId,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: { reason: 'Invalid verification code' },
            });

            return res.status(400).json({
                success: false,
                error: 'Invalid code. Please try again.',
            });
        }

        // Generate backup codes
        const backupCodes = mfaService.generateBackupCodes();
        const hashedCodes = backupCodes.map(code => mfaService.hashBackupCode(code));

        // Enable MFA
        await prisma.dTAMStaff.update({
            where: { id: userId },
            data: {
                mfaEnabled: true,
                mfaBackupCodes: JSON.stringify(hashedCodes),
            },
        });

        // Log success
        await auditLogger.log({
            category: AuditCategory.SECURITY,
            action: 'MFA_ENABLED',
            actorId: userId,
            actorRole: req.user.role,
            resourceType: 'USER',
            resourceId: userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        res.json({
            success: true,
            data: {
                message: 'MFA enabled successfully',
                backupCodes, // Show once only!
                warning: 'Save these backup codes securely. They will not be shown again.',
            },
        });
    } catch (error) {
        console.error('[MFA] Verify setup error:', error);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
});

/**
 * POST /verify
 * Verify MFA code during login
 */
router.post('/verify', async (req, res) => {
    try {
        const { userId, code, isBackupCode } = req.body;

        if (!userId || !code) {
            return res.status(400).json({
                success: false,
                error: 'User ID and code required',
            });
        }

        const user = await prisma.dTAMStaff.findUnique({
            where: { id: userId },
            select: {
                mfaSecret: true,
                mfaEnabled: true,
                mfaBackupCodes: true,
                role: true,
            },
        });

        if (!user?.mfaEnabled) {
            return res.status(400).json({
                success: false,
                error: 'MFA not enabled for this user',
            });
        }

        let isValid = false;

        if (isBackupCode) {
            // Verify backup code
            const hashedInput = mfaService.hashBackupCode(code);
            const backupCodes = JSON.parse(user.mfaBackupCodes || '[]');
            const codeIndex = backupCodes.indexOf(hashedInput);

            if (codeIndex !== -1) {
                isValid = true;
                // Remove used backup code
                backupCodes.splice(codeIndex, 1);
                await prisma.dTAMStaff.update({
                    where: { id: userId },
                    data: { mfaBackupCodes: JSON.stringify(backupCodes) },
                });
            }
        } else {
            // Verify TOTP
            isValid = mfaService.verifyTOTP(user.mfaSecret, code);
        }

        // Log attempt
        await auditLogger.log({
            category: AuditCategory.AUTHENTICATION,
            action: isValid ? 'MFA_VERIFY_SUCCESS' : 'MFA_VERIFY_FAILED',
            actorId: userId,
            actorRole: user.role,
            resourceType: 'USER',
            resourceId: userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            result: isValid ? 'SUCCESS' : 'FAILURE',
        });

        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid code',
            });
        }

        res.json({
            success: true,
            message: 'MFA verification successful',
        });
    } catch (error) {
        console.error('[MFA] Verify error:', error);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
});

/**
 * DELETE /disable
 * Disable MFA (requires current code)
 */
router.delete('/disable', authenticateDTAM, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        const user = await prisma.dTAMStaff.findUnique({
            where: { id: userId },
            select: { mfaSecret: true, mfaEnabled: true },
        });

        if (!user?.mfaEnabled) {
            return res.status(400).json({
                success: false,
                error: 'MFA is not enabled',
            });
        }

        // Verify code before disabling
        const isValid = mfaService.verifyTOTP(user.mfaSecret, code);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid code',
            });
        }

        // Disable MFA
        await prisma.dTAMStaff.update({
            where: { id: userId },
            data: {
                mfaEnabled: false,
                mfaSecret: null,
                mfaBackupCodes: null,
            },
        });

        // Log
        await auditLogger.log({
            category: AuditCategory.SECURITY,
            action: 'MFA_DISABLED',
            actorId: userId,
            actorRole: req.user.role,
            resourceType: 'USER',
            resourceId: userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        res.json({
            success: true,
            message: 'MFA disabled successfully',
        });
    } catch (error) {
        console.error('[MFA] Disable error:', error);
        res.status(500).json({ success: false, error: 'Failed to disable MFA' });
    }
});

module.exports = router;
