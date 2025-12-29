const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/auth-controller');
const upload = require('../../middleware/upload-middleware');
const { authenticateFarmer } = require('../../middleware/auth-middleware');
const { strictRateLimiter } = require('../../middleware/rate-limit-middleware');

// Rate limiters for auth routes (防止暴力破解 / Brute-force protection)
const loginRateLimiter = strictRateLimiter(15 * 60 * 1000, 10); // 10 per 15 min
const registerRateLimiter = strictRateLimiter(60 * 60 * 1000, 5); // 5 per hour

// Public Routes (with rate limiting)
router.post('/register', registerRateLimiter, upload.single('idCardImage'), (req, res) => AuthController.register(req, res));
router.post('/login', loginRateLimiter, (req, res) => AuthController.login(req, res));
router.post('/check-identifier', (req, res) => AuthController.checkIdentifier(req, res));

// Protected Routes
router.get('/me', authenticateFarmer, (req, res) => AuthController.getMe(req, res));

module.exports = router;

