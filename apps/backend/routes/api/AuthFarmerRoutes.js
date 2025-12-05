const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/AuthController');
const upload = require('../../middleware/UploadMiddleware');

// POST /api/auth/farmer/register
/**
 * @swagger
 * /api/auth-farmer/register:
 *   post:
 *     summary: Register a new farmer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               idCardImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', upload.single('idCardImage'), (req, res) => AuthController.register(req, res));

// POST /api/auth/farmer/login
/**
 * @swagger
 * /api/auth-farmer/login:
 *   post:
 *     summary: Login for farmer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', (req, res) => AuthController.login(req, res));

// GET /api/auth/farmer/verify-email/:token
/**
 * @swagger
 * /api/auth-farmer/verify-email/{token}:
 *   get:
 *     summary: Verify email address
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid token
 */
router.get('/verify-email/:token', (req, res) => AuthController.verifyEmail(req, res));

module.exports = router;
