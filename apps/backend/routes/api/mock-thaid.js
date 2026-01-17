const express = require('express');
const router = express.Router();
const MockThaIDController = require('../../controllers/mock-thaid-controller');

// OIDC Endpoints
router.get('/authorize', MockThaIDController.authorize);
router.post('/approve', MockThaIDController.approve); // Internal endpoint for the mock UI
router.post('/token', MockThaIDController.token);
router.get('/userinfo', MockThaIDController.userinfo);
router.post('/userinfo', MockThaIDController.userinfo); // Sometimes OIDC uses POST

module.exports = router;
