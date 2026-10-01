const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';

// Global Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Proxy /api/auth requests to Auth Service
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: `${AUTH_SERVICE_URL}/api/auth`,
    changeOrigin: true,
    cookieDomainRewrite: '',
    on: {
      error: (err, req, res) => {
        console.error('[API Gateway] Proxy error to auth-service:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'Auth Service unavailable. Please ensure auth service is running.'
          });
        }
      }
    }
  })
);

app.listen(PORT, () => {
  console.log(`[API Gateway] Running on http://localhost:${PORT}`);
  console.log(`[API Gateway] Routing /api/auth -> ${AUTH_SERVICE_URL}`);
});

module.exports = app;
