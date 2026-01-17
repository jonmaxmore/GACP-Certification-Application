const express = require('express');
const router = express.Router();
const E2EController = require('../../controllers/e2e-controller');

// Middleware to ensure we are NOT in production
const ensureNonProduction = (req, res, next) => {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_E2E_ROUTES !== 'true') {
        return res.status(403).json({ error: 'E2E routes are disabled in production' });
    }
    next();
};

router.use(ensureNonProduction);

router.post('/reset', E2EController.reset);
router.post('/application/:id/approve-documents', E2EController.approveDocuments);
router.post('/application/:id/pass-audit', E2EController.passAudit);

module.exports = router;
