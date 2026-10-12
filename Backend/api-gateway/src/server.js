const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const express = require('express');
const cors = require('cors');
const os = require('os');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.GATEWAY_PORT || process.env.PORT || 8000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const MYFLIPIBOOK_SERVICE_URL = process.env.MYFLIPIBOOK_SERVICE_URL || 'http://localhost:5002';
const PAGE_EDITOR_SERVICE_URL = process.env.PAGE_EDITOR_SERVICE_URL || 'http://localhost:5003';
const PDF_EDITOR_SERVICE_URL = process.env.PDF_EDITOR_SERVICE_URL || 'http://localhost:5004';

// Global Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8000',
  'https://testing.flipibook.com',
  'https://flipibook.com',
  process.env.CLIENT_URL
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Server-to-server, curl, health probes
  if (allowedOrigins.includes(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*flipibook\.com$/.test(origin)) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
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

// Instance Check
app.get('/health/instance', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    instance: os.hostname(),
    timestamp: new Date().toISOString()
  });
});

// Proxy /api/auth requests to Auth Service
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: `${AUTH_SERVICE_URL}/api/auth`,
    changeOrigin: true,
    xfwd: true,
    cookieDomainRewrite: '',
    cookiePathRewrite: '/',
    on: {
      proxyReq: (proxyReq, req) => {
        // Forward real public client IP to internal microservices
        const clientIp =
          req.headers['cf-connecting-ip'] ||
          req.headers['x-real-ip'] ||
          (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
          req.socket?.remoteAddress ||
          req.ip;

        if (clientIp) {
          proxyReq.setHeader('x-client-ip', clientIp);
          proxyReq.setHeader('x-real-ip', clientIp);
        }
      },
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

// Proxy /api/myflipibook requests to MyFlipibook Service
app.use(
  '/api/myflipibook',
  createProxyMiddleware({
    target: `${MYFLIPIBOOK_SERVICE_URL}/api/myflipibook`,
    changeOrigin: true,
    xfwd: true,
    cookieDomainRewrite: '',
    cookiePathRewrite: '/',
    on: {
      proxyReq: (proxyReq, req) => {
        const clientIp =
          req.headers['cf-connecting-ip'] ||
          req.headers['x-real-ip'] ||
          (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
          req.socket?.remoteAddress ||
          req.ip;

        if (clientIp) {
          proxyReq.setHeader('x-client-ip', clientIp);
          proxyReq.setHeader('x-real-ip', clientIp);
        }
      },
      error: (err, req, res) => {
        console.error('[API Gateway] Proxy error to myflipibook-service:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'MyFlipibook Service unavailable. Please ensure myflipibook service is running.'
          });
        }
      }
    }
  })
);

// Proxy /api/page-editor requests to Page Editor Service
app.use(
  '/api/page-editor',
  createProxyMiddleware({
    target: `${PAGE_EDITOR_SERVICE_URL}/api/page-editor`,
    changeOrigin: true,
    xfwd: true,
    cookieDomainRewrite: '',
    cookiePathRewrite: '/',
    on: {
      proxyReq: (proxyReq, req) => {
        const clientIp =
          req.headers['cf-connecting-ip'] ||
          req.headers['x-real-ip'] ||
          (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
          req.socket?.remoteAddress ||
          req.ip;

        if (clientIp) {
          proxyReq.setHeader('x-client-ip', clientIp);
          proxyReq.setHeader('x-real-ip', clientIp);
        }
      },
      error: (err, req, res) => {
        console.error('[API Gateway] Proxy error to page-editor-service:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'Page Editor Service unavailable. Please ensure page editor service is running.'
          });
        }
      }
    }
  })
);

// Proxy /api/pdf-editor requests to PDF Editor Service
app.use(
  '/api/pdf-editor',
  createProxyMiddleware({
    target: `${PDF_EDITOR_SERVICE_URL}/api/pdf-editor`,
    changeOrigin: true,
    xfwd: true,
    cookieDomainRewrite: '',
    cookiePathRewrite: '/',
    on: {
      proxyReq: (proxyReq, req) => {
        const clientIp =
          req.headers['cf-connecting-ip'] ||
          req.headers['x-real-ip'] ||
          (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
          req.socket?.remoteAddress ||
          req.ip;

        if (clientIp) {
          proxyReq.setHeader('x-client-ip', clientIp);
          proxyReq.setHeader('x-real-ip', clientIp);
        }
      },
      error: (err, req, res) => {
        console.error('[API Gateway] Proxy error to pdf-editor-service:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'PDF Editor Service unavailable. Please ensure pdf editor service is running.'
          });
        }
      }
    }
  })
);

app.listen(PORT, () => {
  console.log(`[API Gateway] Running on http://localhost:${PORT}`);
  console.log(`[API Gateway] Routing /api/auth -> ${AUTH_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/myflipibook -> ${MYFLIPIBOOK_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/page-editor -> ${PAGE_EDITOR_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/pdf-editor -> ${PDF_EDITOR_SERVICE_URL}`);
});


module.exports = app;
