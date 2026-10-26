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
const CUSTOMIZED_EDITOR_SERVICE_URL = process.env.CUSTOMIZED_EDITOR_SERVICE_URL || 'http://127.0.0.1:5005';
const THREED_EDITOR_SERVICE_URL = process.env.THREED_EDITOR_SERVICE_URL || 'http://127.0.0.1:5006';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://127.0.0.1:5007';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://127.0.0.1:5008';

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
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Range', 'ETag', 'Accept-Ranges']
}));

const storageRoot = process.env.STORAGE_PATH
  ? path.resolve(process.env.STORAGE_PATH)
  : path.resolve(__dirname, '../../storage');

const sendStaticFile = (res, filePath) => {
  return res.sendFile(filePath, {
    maxAge: '1d',
    headers: {
      'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin') || '*',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, ETag, Accept-Ranges'
    }
  });
};

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
      return sendStaticFile(res, directPath);
    }
  } catch (e) {}

  // Seamless fallback for requests referencing My_Flipbooks -> check books
  if (relPath.includes('My_Flipbooks')) {
    const booksRelPath = relPath.replace('My_Flipbooks', 'books');
    const booksDirectPath = path.join(storageRoot, booksRelPath);
    try {
      const bStat = await fs.promises.stat(booksDirectPath).catch(() => null);
      if (bStat && bStat.isFile()) {
        return sendStaticFile(res, booksDirectPath);
      }
    } catch (e) {}
  }

  const parts = relPath.split(/[/\\]/);
  if (parts.length > 1) {
    const restOfPath = parts.slice(1).join(path.sep);
    try {
      const topDirs = await getCachedTopDirs();
      for (const d of topDirs) {
        const candidatePath = path.join(storageRoot, d, restOfPath);
        const candStat = await fs.promises.stat(candidatePath).catch(() => null);
        if (candStat && candStat.isFile()) {
          return sendStaticFile(res, candidatePath);
        }
      }
    } catch (e) {}
  }

  // Fallback for flipbook assets where relative navigation (e.g. ../assets/) skipped the book folder
  const assetMatch = relPath.match(/assets[/\\](Image|video|gif|audio|3D_Model|download)[/\\]([^/\\]+)$/i);
  if (assetMatch) {
    const assetSub = assetMatch[1];
    const assetFile = assetMatch[2];
    try {
      const topDirs = fs.readdirSync(storageRoot);
      for (const d of topDirs) {
        const bookDirs = [
          path.join(storageRoot, d, 'books')
        ];
        for (const userFlipbooksDir of bookDirs) {
          if (fs.existsSync(userFlipbooksDir)) {
            const scanForFile = (dir, depth = 0) => {
              if (depth > 6) return null;
              try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const ent of entries) {
                  const full = path.join(dir, ent.name);
                  if (ent.isFile() && ent.name.toLowerCase() === assetFile.toLowerCase()) {
                    return full;
                  }
                  if (ent.isDirectory()) {
                    const found = scanForFile(full, depth + 1);
                    if (found) return found;
                  }
                }
              } catch (e) {}
              return null;
            };
            const found = scanForFile(userFlipbooksDir);
            if (found) return sendStaticFile(res, found);
          }
        }
      }
    } catch (e) {}
  }

  next();
};

const staticConfig = {
  maxAge: '1d',
  setHeaders: (res) => {
    if (!res.getHeader('Access-Control-Allow-Origin')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, ETag, Accept-Ranges');
  }
};

app.use('/storage', storageStaticMiddleware);
app.use('/storage', express.static(storageRoot, staticConfig));
app.use('/uploads', storageStaticMiddleware);
app.use('/uploads', express.static(storageRoot, staticConfig));

const templateAssetsRoot = path.resolve(__dirname, '../../services/page-editor-service/src/assets');
app.use('/assets', express.static(templateAssetsRoot, staticConfig));

app.use(['/storage', '/uploads'], (req, res) => {
  res.status(404).json({ success: false, message: `Asset not found: ${req.path}` });
});

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
  return /^\/api\/flipbook\/(save-page|save-pages-batch|get-page|rename-page|delete-page|upload-asset|upload-3d-model|delete-asset|get-gallery-assets|rename-gallery-asset|delete-gallery-asset|use-gallery-asset|inline-svgs)(\/|$|\?)/i.test(pathname);
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

// Proxy Customized Editor routes to Customized Editor Service (port 5005)
const isCustomizedEditorRoute = (pathname) => {
  return /^\/api\/flipbook\/(public|update-settings|reset-settings|branding|background|book-appearance|appearance|transparent-sheet|upload-customized-asset|delete-customized-asset|background-assets|copy-theme-asset|submit-lead|get-leads|leads|verify-credential|send-visibility-otp|verify-visibility-otp|customized-settings|customized_settings)(\/|$|\?)/i.test(pathname);
};

const customizedEditorProxy = createProxyMiddleware({
  target: CUSTOMIZED_EDITOR_SERVICE_URL,
  changeOrigin: true,
  xfwd: true,
  timeout: 300000,
  proxyTimeout: 300000,
  cookieDomainRewrite: '',
  cookiePathRewrite: '/',
  pathRewrite: (path) => path.replace(/^\/api\/flipbook/, '/api/customized-editor'),
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
      console.error(`[API Gateway] Proxy error to customized-editor-service for ${req.originalUrl}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: 'Customized Editor Service unavailable. Please ensure customized-editor-service is running.'
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
  if (isCustomizedEditorRoute(req.path) || isCustomizedEditorRoute(req.originalUrl)) {
    return customizedEditorProxy(req, res, next);
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

// Proxy /api/explore requests to MyFlipibook Service
app.use(
  '/api/explore',
  createProxyMiddleware({
    target: `${MYFLIPIBOOK_SERVICE_URL}/api/explore`,
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
        console.error('[API Gateway] Proxy error to myflipibook-service for explore:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'Explore Service unavailable. Please ensure myflipibook service is running.'
          });
        }
      }
    }
  })
);

// Proxy /api/profile requests to MyFlipibook Service
app.use(
  '/api/profile',
  createProxyMiddleware({
    target: `${MYFLIPIBOOK_SERVICE_URL}/api/profile`,
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
        console.error('[API Gateway] Proxy error to myflipibook-service for profile:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'Profile Service unavailable. Please ensure myflipibook service is running.'
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

// Proxy /api/customized-editor requests to Customized Editor Service
app.use(
  '/api/customized-editor',
  createProxyMiddleware({
    target: `${CUSTOMIZED_EDITOR_SERVICE_URL}/api/customized-editor`,
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
        console.error('[API Gateway] Proxy error to customized-editor-service:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'Customized Editor Service unavailable. Please ensure customized-editor-service is running.'
          });
        }
      }
    }
  })
);

// Proxy /api/3d-models requests to 3D Editor Service
app.use(
  '/api/3d-models',
  createProxyMiddleware({
    target: `${THREED_EDITOR_SERVICE_URL}/api/3d-models`,
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
        console.error('[API Gateway] Proxy error to threed-editor-service for 3d-models:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: '3D Editor Service unavailable. Please ensure threed-editor-service is running.'
          });
        }
      }
    }
  })
);

// Proxy /api/textures requests to 3D Editor Service
app.use(
  '/api/textures',
  createProxyMiddleware({
    target: `${THREED_EDITOR_SERVICE_URL}/api/textures`,
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
        console.error('[API Gateway] Proxy error to threed-editor-service for textures:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: '3D Editor Service unavailable. Please ensure threed-editor-service is running.'
          });
        }
      }
    }
  })
);

// Proxy /api/presets requests to 3D Editor Service
app.use(
  '/api/presets',
  createProxyMiddleware({
    target: `${THREED_EDITOR_SERVICE_URL}/api/presets`,
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
        console.error('[API Gateway] Proxy error to threed-editor-service for presets:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: '3D Editor Service unavailable. Please ensure threed-editor-service is running.'
          });
        }
      }
    }
  })
);

// Proxy /hdri static requests to 3D Editor Service
app.use(
  '/hdri',
  createProxyMiddleware({
    target: `${THREED_EDITOR_SERVICE_URL}/hdri`,
    changeOrigin: true,
    xfwd: true,
    cookieDomainRewrite: '',
    cookiePathRewrite: '/'
  })
);

// Proxy /textures static requests to 3D Editor Service
app.use(
  '/textures',
  createProxyMiddleware({
    target: `${THREED_EDITOR_SERVICE_URL}/textures`,
    changeOrigin: true,
    xfwd: true,
    cookieDomainRewrite: '',
    cookiePathRewrite: '/'
  })
);

// Proxy /api/payment requests to Payment Service (port 5007)
app.use(
  '/api/payment',
  createProxyMiddleware({
    target: `${PAYMENT_SERVICE_URL}/api/payment`,
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
        console.error('[API Gateway] Proxy error to payment-services:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'Payment Service unavailable. Please ensure payment service is running.'
          });
        }
      }
    }
  })
);

// Proxy /api/user and /api/users requests to User Service (port 5008)
app.use(
  ['/api/user', '/api/users'],
  createProxyMiddleware({
    target: USER_SERVICE_URL,
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
        console.error('[API Gateway] Proxy error to user-service:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'User Service unavailable. Please ensure user service is running.'
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
  console.log(`[API Gateway] Routing /api/customized-editor -> ${CUSTOMIZED_EDITOR_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/3d-models -> ${THREED_EDITOR_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/textures -> ${THREED_EDITOR_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/presets -> ${THREED_EDITOR_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /hdri -> ${THREED_EDITOR_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /textures -> ${THREED_EDITOR_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/payment -> ${PAYMENT_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/user -> ${USER_SERVICE_URL}`);
});

module.exports = app;
