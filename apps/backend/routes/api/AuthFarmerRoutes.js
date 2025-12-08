const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/AuthController');
const upload = require('../../middleware/UploadMiddleware');
const { authenticateFarmer } = require('../../middleware/AuthMiddleware');

// Public Routes
router.post('/register', upload.single('idCardImage'), (req, res) => AuthController.register(req, res));
router.post('/login', (req, res) => AuthController.login(req, res));

// Protected Routes
router.get('/me', authenticateFarmer, (req, res) => AuthController.getMe(req, res));

module.exports = router;
