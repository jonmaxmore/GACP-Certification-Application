/**
 * Consent API Routes (V2)
 * PDPA-compliant consent management endpoints
 * Uses Prisma (via consent-manager middleware)
 */

const express = require('express');
const router = express.Router();
const { authenticateFarmer } = require('../../middleware/auth-middleware');
const { consentManager, ConsentCategory, RequiredConsents } = require('../../middleware/consent-manager');

/**
 * GET /
 * Get current user's consent status
 */
router.get('/', authenticateFarmer, async (req, res) => {
    try {
        const consents = await consentManager.getUserConsents(req.user.id);

        res.json({
            success: true,
            data: {
                consents,
                categories: Object.values(ConsentCategory),
                required: RequiredConsents,
            },
        });
    } catch (error) {
        console.error('[Consent] Get error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * POST /
 * Record consent (grant or withdraw)
 */
router.post('/', authenticateFarmer, async (req, res) => {
    try {
        const { category, granted } = req.body;

        if (!category || !Object.values(ConsentCategory).includes(category)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid consent category',
            });
        }

        const consent = await consentManager.recordConsent(
            req.user.id,
            category,
            granted,
            req.ip,
            req.headers['user-agent'],
        );

        res.json({
            success: true,
            data: consent,
        });
    } catch (error) {
        console.error('[Consent] Record error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * POST /bulk
 * Record multiple consents at once (registration)
 */
router.post('/bulk', async (req, res) => {
    try {
        const { userId, consents } = req.body;

        if (!userId || !Array.isArray(consents)) {
            return res.status(400).json({
                success: false,
                error: 'userId and consents array required',
            });
        }

        const results = await consentManager.recordBulkConsent(
            userId,
            consents,
            req.ip,
            req.headers['user-agent'],
        );

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error('[Consent] Bulk error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /:category
 * Withdraw consent (PDPA right)
 */
router.delete('/:category', authenticateFarmer, async (req, res) => {
    try {
        const { category } = req.params;

        const consent = await consentManager.withdrawConsent(
            req.user.id,
            category,
            req.ip,
            req.headers['user-agent'],
        );

        res.json({
            success: true,
            message: 'Consent withdrawn successfully',
            data: consent,
        });
    } catch (error) {
        console.error('[Consent] Withdraw error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * GET /document/:category
 * Get consent document content
 */
router.get('/document/:category', (req, res) => {
    const { category } = req.params;
    const lang = req.query.lang || 'th';

    const document = consentManager.getConsentDocument(category, lang);

    if (!document) {
        return res.status(404).json({
            success: false,
            error: 'Document not found',
        });
    }

    res.json({
        success: true,
        data: document,
    });
});

module.exports = router;
