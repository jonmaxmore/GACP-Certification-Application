const express = require('express');
const router = express.Router();

// Minimal test - no dependencies
router.post('/login', (req, res) => {
    console.log('=== MINIMAL LOGIN TEST ===');
    console.log('Body received:', JSON.stringify(req.body));
    return res.json({
        success: true,
        message: 'Test route works!',
        receivedBody: req.body
    });
});

router.get('/health', (req, res) => {
    res.json({ service: 'auth-dtam-test', status: 'ok' });
});

module.exports = router;
