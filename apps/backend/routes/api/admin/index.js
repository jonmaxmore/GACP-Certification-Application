const express = require('express');
const router = express.Router();
const { authenticateDTAM } = require('../../../middleware/auth-middleware');

// Protect all admin routes
router.use(authenticateDTAM);

// Sub-modules
router.use('/config', require('./config')); // System Configuration (Pricing/Rules)
router.use('/plants', require('./plants')); // Plant Master Data
router.use('/users', require('./users'));   // User Management

router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Admin API operational' });
});

module.exports = router;
