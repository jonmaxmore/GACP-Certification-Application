const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createLogger } = require('../shared/logger');
const logger = createLogger('auth-proxy');

// Auth Service (Port 3001) - Proxy to main backend
const authApp = express();

authApp.use(
  cors({
    origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }),
);

authApp.use(express.json());

// Health check endpoint
authApp.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    port: 3001,
    timestamp: new Date().toISOString(),
  });
});

// Proxy all other requests to main backend
authApp.use(
  '/',
  createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: {
      '^/': '/auth/', // Redirect to auth routes on main backend
    },
    onError: (err, req, res) => {
      logger.error('Auth proxy error:', err.message);
      res.status(503).json({
        error: 'Service temporarily unavailable',
        service: 'auth-service',
      });
    },
  }),
);

const PORT = 3001;
authApp.listen(PORT, () => {});

module.exports = authApp;
