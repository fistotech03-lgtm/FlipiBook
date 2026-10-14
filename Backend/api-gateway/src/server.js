const path = require('path');
const fs = require('fs');
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
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:5001';
const MYFLIPIBOOK_SERVICE_URL = process.env.MYFLIPIBOOK_SERVICE_URL || 'http://127.0.0.1:5002';
const PAGE_EDITOR_SERVICE_URL = process.env.PAGE_EDITOR_SERVICE_URL || 'http://127.0.0.1:5003';
const PDF_EDITOR_SERVICE_URL = process.env.PDF_EDITOR_SERVICE_URL || 'http://127.0.0.1:5004';

const storageRoot = process.env.STORAGE_PATH
  ? path.resolve(process.env.STORAGE_PATH)
  : path.resolve(__dirname, '../../storage');

// Static storage serving with fallback across user folder aliases (e.g. FLIPI0001 vs sanitizedEmail)
// Cache top directories in memory with a 60-second TTL to avoid crawling disk on every missing asset/404
let cachedTopDirs = null;
let lastDirsFetch = 0;
const getCachedTopDirs = async () => {
  const now = Date.now();
  if (!cachedTopDirs || (now - lastDirsFetch > 60000)) {
    try {
      cachedTopDirs = await fs.promises.readdir(storageRoot);
      lastDirsFetch = now;
    } catch (e) {
      cachedTopDirs = [];
    }
  }
  return cachedTopDirs;
};

const storageStaticMiddleware = async (req, res, next) => {
  const relPath = decodeURIComponent(req.path.replace(/^\/+/, ''));
  const directPath = path.join(storageRoot, relPath);
  try {
    const stat = await fs.promises.stat(directPath).catch(() => null);
    if (stat && stat.isFile()) {
      return res.sendFile(directPath, { maxAge: '1d' });
    }
  } catch (e) {}

  const parts = relPath.split(/[/\\]/);
  if (parts.length > 1) {
    const restOfPath = parts.slice(1).join(path.sep);
    try {
      const topDirs = await getCachedTopDirs();
      for (const d of topDirs) {
        const candidatePath = path.join(storageRoot, d, restOfPath);
        const candStat = await fs.promises.stat(candidatePath).catch(() => null);
        if (candStat && candStat.isFile()) {
          return res.sendFile(candidatePath, { maxAge: '1d' });
        }
      }
    } catch (e) {}
  }
  next();
};

app.use('/storage', storageStaticMiddleware);
app.use('/storage', express.static(storageRoot));
app.use('/uploads', storageStaticMiddleware);
app.use('/uploads', express.static(storageRoot));

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

// Proxy PDF / Office conversion & inspection routes to PDF Editor Service (port 5004)
const isPdfConversionRoute = (pathname) => {
  return /^\/api\/flipbook\/(convert-pdf-inkscape|convert-office-to-pdf|inspect-document|export-vector-pdf|inkscape-status|office-status|check-inkscape|check-libreoffice)(\/|$|\?)/i.test(pathname);
};

const pdfConversionProxy = createProxyMiddleware({
  target: PDF_EDITOR_SERVICE_URL,
  changeOrigin: true,
  xfwd: true,
  timeout: 300000,
  proxyTimeout: 300000,
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
      console.error(`[API Gateway] Proxy error to pdf-editor-service for ${req.originalUrl}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: 'PDF Editor Service unavailable. Please ensure pdf-editor-service is running.'
        });
      }
    }
  }
});

// Proxy Page Editor routes to Page Editor Service (port 5003)
const isPageEditorRoute = (pathname) => {
  return /^\/api\/flipbook\/(save-page|save-pages-batch|get-page|rename-page|delete-page|upload-asset|delete-asset|get-gallery-assets|rename-gallery-asset|delete-gallery-asset|use-gallery-asset|inline-svgs)(\/|$|\?)/i.test(pathname);
};

const pageEditorProxy = createProxyMiddleware({
  target: PAGE_EDITOR_SERVICE_URL,
  changeOrigin: true,
  xfwd: true,
  timeout: 300000,
  proxyTimeout: 300000,
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
      console.error(`[API Gateway] Proxy error to page-editor-service for ${req.originalUrl}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: 'Page Editor Service unavailable. Please ensure page editor service is running.'
        });
      }
    }
  }
});

app.use((req, res, next) => {
  if (isPdfConversionRoute(req.path) || isPdfConversionRoute(req.originalUrl)) {
    return pdfConversionProxy(req, res, next);
  }
  if (isPageEditorRoute(req.path) || isPageEditorRoute(req.originalUrl)) {
    return pageEditorProxy(req, res, next);
  }
  next();
});

// Proxy /api/flipbook requests to MyFlipibook Service
app.use(
  '/api/flipbook',
  createProxyMiddleware({
    target: `${MYFLIPIBOOK_SERVICE_URL}/api/flipbook`,
    changeOrigin: true,
    xfwd: true,
    timeout: 300000,
    proxyTimeout: 300000,
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
        console.error('[API Gateway] Proxy error to myflipibook-service for flipbook:', err.message);
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

// Proxy /api/myflipibook requests to MyFlipibook Service
app.use(
  '/api/myflipibook',
  createProxyMiddleware({
    target: `${MYFLIPIBOOK_SERVICE_URL}/api/myflipibook`,
    changeOrigin: true,
    xfwd: true,
    timeout: 300000,
    proxyTimeout: 300000,
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
        console.error('[API Gateway] Proxy error to myflipibook-service for myflipibook:', err.message);
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

// Proxy /api/usersetting requests to MyFlipibook Service
app.use(
  '/api/usersetting',
  createProxyMiddleware({
    target: `${MYFLIPIBOOK_SERVICE_URL}/api/usersetting`,
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
        console.error('[API Gateway] Proxy error to myflipibook-service for usersetting:', err.message);
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[API Gateway] Running on http://localhost:${PORT}`);
  console.log(`[API Gateway] Routing /api/auth -> ${AUTH_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/flipbook -> ${MYFLIPIBOOK_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/myflipibook -> ${MYFLIPIBOOK_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/usersetting -> ${MYFLIPIBOOK_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/page-editor -> ${PAGE_EDITOR_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/pdf-editor -> ${PDF_EDITOR_SERVICE_URL}`);
});


module.exports = app;
