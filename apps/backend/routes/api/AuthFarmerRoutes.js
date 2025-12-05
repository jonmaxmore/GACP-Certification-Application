const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/AuthController');
const upload = require('../../middleware/UploadMiddleware');

// POST /api/auth/farmer/register
router.post('/register', upload.single('idCardImage'), (req, res) => AuthController.register(req, res));

// POST /api/auth/farmer/login
router.post('/login', (req, res) => AuthController.login(req, res));

// GET /api/auth/farmer/verify-email/:token
router.get('/verify-email/:token', (req, res) => AuthController.verifyEmail(req, res));

module.exports = router;
