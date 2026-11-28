// Core dependencies and environment configuration (local -> Backend/.env -> cwd)
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Express app initialization and reverse-proxy trust setting
const app = express();
app.set('trust proxy', true);

// Gateway port and downstream microservice base URLs
const PORT = process.env.GATEWAY_PORT || process.env.PORT || 8000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:5001';
const MYFLIPIBOOK_SERVICE_URL = process.env.MYFLIPIBOOK_SERVICE_URL || 'http://127.0.0.1:5002';
const PAGE_EDITOR_SERVICE_URL = process.env.PAGE_EDITOR_SERVICE_URL || 'http://127.0.0.1:5003';
const PDF_EDITOR_SERVICE_URL = process.env.PDF_EDITOR_SERVICE_URL || 'http://127.0.0.1:5004';
const CUSTOMIZED_EDITOR_SERVICE_URL = process.env.CUSTOMIZED_EDITOR_SERVICE_URL || 'http://127.0.0.1:5005';
const THREED_EDITOR_SERVICE_URL = process.env.THREED_EDITOR_SERVICE_URL || 'http://127.0.0.1:5006';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://127.0.0.1:5007';
const APP_SERVICE_URL = process.env.APP_SERVICE_URL || 'http://127.0.0.1:5008';
const ADMIN_USER_SERVICE_URL = process.env.ADMIN_USER_SERVICE_URL || 'http://127.0.0.1:5009';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://127.0.0.1:5010';

// ============================================================================
// 1. CORS & ORIGIN VALIDATION
// ============================================================================

// Static allowlist of frontend and gateway origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:8000',
  'https://testing.flipibook.com',
  'https://flipibook.com',
  process.env.CLIENT_URL
].filter(Boolean);

// Allow listed origins, local loopback ports, and *.flipibook.com / *.sslip.io subdomains
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Server-to-server, curl, health probes
  if (allowedOrigins.includes(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*flipibook\.com$/.test(origin)) return true;
  if (/^https?:\/\/([a-zA-Z0-9-]+\.)*sslip\.io(:\d+)?$/.test(origin)) return true;
  return false;
};

// Apply CORS middleware with credentials and range/etag headers exposed
app.use(cors({
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Range', 'ETag', 'Accept-Ranges']
}));

// ============================================================================
// 2. STATIC STORAGE, ASSET FALLBACKS & TEMPLATE BOOKS
// ============================================================================

// Root directory for user uploads and generated flipbook assets
const storageRoot = process.env.STORAGE_PATH
  ? path.resolve(process.env.STORAGE_PATH)
  : path.resolve(__dirname, '../../storage');

// Send a static file with 1-day cache and CORS/range headers
const sendStaticFile = (res, filePath) => {
  return res.sendFile(filePath, {
    maxAge: '1d',
    headers: {
      'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin') || '*',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, ETag, Accept-Ranges'
    }
  });
};

// In-memory 60s cache of top-level storage directories to avoid repeated disk crawls
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

// Resolve /storage and /uploads requests across legacy folder aliases, in-flight pages, and nested assets
const storageStaticMiddleware = async (req, res, next) => {
  const relPath = decodeURIComponent(req.path.replace(/^\/+/, ''));

  // Normalize legacy casing, environment prefixes, and renamed folders
  const candidateRelPaths = [
    relPath,
    relPath.replace(/^(?:testing|production)[/\\]/i, ''),
    relPath.replace(/\/images?\//gi, '/Image/').replace(/\/videos?\//gi, '/video/').replace(/\/gifs?\//gi, '/gif/'),
    relPath.replace(/^(?:testing|production)[/\\]/i, '').replace(/\/images?\//gi, '/Image/').replace(/\/videos?\//gi, '/video/').replace(/\/gifs?\//gi, '/gif/'),
    relPath.replace(/\/Gallery\//g, '/gallery/').replace(/\/Images\//g, '/images/').replace(/\/Videos\//g, '/videos/').replace(/\/Profile\//g, '/profile/').replace(/\/Company_logo\//g, '/company_logo/').replace(/\/CustomizationGallery\//g, '/customizationGallery/').replace(/\/3DGallery\//g, '/3dGallery/'),
    relPath.replace(/\/gallery\//g, '/Gallery/').replace(/\/images\//g, '/Images/').replace(/\/videos\//g, '/Videos/').replace(/\/profile\//g, '/Profile/').replace(/\/company_logo\//g, '/Company_logo/').replace(/\/customizationGallery\//g, '/CustomizationGallery/').replace(/\/3dGallery\//g, '/3DGallery/'),
    relPath.replace(/\/(?:Profile|profile)\//g, '/userdetails/profile/').replace(/\/(?:Company_logo|company_logo)\//g, '/userdetails/company_logo/')
  ];

  // 1. Direct path & My_Flipbooks -> books fallback
  for (const candRel of new Set(candidateRelPaths)) {
    const directPath = path.join(storageRoot, candRel);
    try {
      const stat = await fs.promises.stat(directPath).catch(() => null);
      if (stat && stat.isFile()) return sendStaticFile(res, directPath);
    } catch (e) {}

    if (candRel.includes('My_Flipbooks')) {
      const booksDirectPath = path.join(storageRoot, candRel.replace('My_Flipbooks', 'books'));
      try {
        const bStat = await fs.promises.stat(booksDirectPath).catch(() => null);
        if (bStat && bStat.isFile()) return sendStaticFile(res, booksDirectPath);
      } catch (e) {}
    }
  }

  // 2. Search across top-level user directories (e.g. FLIPI0001)
  const parts = relPath.split(/[/\\]/);
  try {
    const topDirs = await getCachedTopDirs();
    for (const d of topDirs) {
      const candDirect = path.join(storageRoot, d, relPath);
      const candDirectStat = await fs.promises.stat(candDirect).catch(() => null);
      if (candDirectStat && candDirectStat.isFile()) return sendStaticFile(res, candDirect);

      if (parts.length > 1) {
        const candidatePath = path.join(storageRoot, d, parts.slice(1).join(path.sep));
        const candStat = await fs.promises.stat(candidatePath).catch(() => null);
        if (candStat && candStat.isFile()) return sendStaticFile(res, candidatePath);
      }
    }
  } catch (e) {}

  // 3. Fast-stream waiter for book pages currently being generated by background workers
  const bookPageMatch = relPath.match(/books[/\\](?:[^/\\]+[/\\])?([^/\\]+)[/\\]pages[/\\](?:webp_page[/\\])?(\d+)\.(webp|json)$/i);
  if (bookPageMatch) {
    const [, bookId, pageNum, ext] = bookPageMatch;
    const fileName = `${pageNum}.${ext}`;

    try {
      const topDirs = await getCachedTopDirs();
      const candidatePagesDirs = [
        path.join(storageRoot, 'FLIPI0001', 'books', bookId, 'pages', 'webp_page'),
        path.join(storageRoot, 'FLIPI0001', 'books', 'default', bookId, 'pages', 'webp_page'),
        path.join(storageRoot, 'FLIPI0001', 'books', bookId, 'pages'),
        path.join(storageRoot, 'FLIPI0002', 'books', 'default', bookId, 'pages', 'webp_page'),
        ...topDirs.map(d => path.join(storageRoot, d, 'books', bookId, 'pages', 'webp_page')),
        ...topDirs.map(d => path.join(storageRoot, d, 'books', 'default', bookId, 'pages', 'webp_page')),
        ...topDirs.map(d => path.join(storageRoot, d, 'books', bookId, 'pages')),
        ...topDirs.map(d => path.join(storageRoot, d, 'books', 'default', bookId, 'pages'))
      ];

      // Fuzzy-match bookId against disk directories (>=85% char overlap, length +/-2)
      for (const td of topDirs) {
        const booksDir = path.join(storageRoot, td, 'books');
        if (fs.existsSync(booksDir)) {
          try {
            const bookDirs = fs.readdirSync(booksDir);
            for (const bd of bookDirs) {
              if (bd !== bookId && Math.abs(bd.length - bookId.length) <= 2) {
                const shorter = bd.length < bookId.length ? bd : bookId;
                const longer = bd.length < bookId.length ? bookId : bd;
                let matches = 0;
                for (let ci = 0; ci < shorter.length; ci++) if (shorter[ci] === longer[ci]) matches++;
                if (matches / longer.length >= 0.85) {
                  const fuzzyCandidates = [
                    path.join(booksDir, bd, 'pages', 'webp_page'),
                    path.join(booksDir, bd, 'pages'),
                    path.join(booksDir, 'default', bd, 'pages', 'webp_page'),
                    path.join(booksDir, 'default', bd, 'pages')
                  ];
                  for (const fc of fuzzyCandidates) {
                    if (fs.existsSync(fc)) candidatePagesDirs.push(fc);
                  }
                }
              }
            }
          } catch (_) {}
        }
      }

      const targetPagesDir = candidatePagesDirs.find(pDir => fs.existsSync(pDir)) || null;
      if (targetPagesDir) {
        const targetFilePath = path.join(targetPagesDir, fileName);
        const startTime = Date.now();
        while (Date.now() - startTime < 1500) {
          if (fs.existsSync(targetFilePath)) return sendStaticFile(res, targetFilePath);
          await new Promise(r => setTimeout(r, 150));
        }
        if (fs.existsSync(targetFilePath)) return sendStaticFile(res, targetFilePath);

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(404).json({ error: 'Page asset still generating', pageNum, inProgress: true });
      }
    } catch (e) {}
  }

  // 4. Fallback scan for relative ../assets/ requests missing the book folder prefix
  const assetMatch = relPath.match(/assets[/\\](Image|video|gif|audio|3D_Model|download)[/\\]([^/\\]+)$/i);
  if (assetMatch) {
    const assetFile = assetMatch[2];
    try {
      const topDirs = fs.readdirSync(storageRoot);
      const scanForFile = (dir, depth = 0) => {
        if (depth > 6) return null;
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isFile() && ent.name.toLowerCase() === assetFile.toLowerCase()) return full;
            if (ent.isDirectory()) {
              const found = scanForFile(full, depth + 1);
              if (found) return found;
            }
          }
        } catch (e) {}
        return null;
      };

      for (const d of topDirs) {
        const userBooksDir = path.join(storageRoot, d, 'books');
        if (fs.existsSync(userBooksDir)) {
          const found = scanForFile(userBooksDir);
          if (found) return sendStaticFile(res, found);
        }
      }
    } catch (e) {}
  }

  next();
};

// Shared express.static options with CORS and range headers
const staticConfig = {
  maxAge: '1d',
  setHeaders: (res) => {
    if (!res.getHeader('Access-Control-Allow-Origin')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, ETag, Accept-Ranges');
  }
};

// Mount storage, uploads, and page-editor template static directories
app.use('/storage', storageStaticMiddleware);
app.use('/storage', express.static(storageRoot, staticConfig));
app.use('/uploads', storageStaticMiddleware);
app.use('/uploads', express.static(storageRoot, staticConfig));

const templateAssetsRoot = path.resolve(__dirname, '../../services/page-editor-service/src/assets');
app.use('/assets', express.static(templateAssetsRoot, staticConfig));

// List built-in SVG template books from page-editor-service assets
app.get('/api/templates/books', async (req, res) => {
  try {
    const templatesDir = path.join(templateAssetsRoot, 'Templates');
    if (!fs.existsSync(templatesDir)) {
      return res.json({ success: true, books: [] });
    }

    const entries = await fs.promises.readdir(templatesDir, { withFileTypes: true });
    const bookFolders = entries.filter(e => e.isDirectory());

    const books = await Promise.all(
      bookFolders.map(async (folder) => {
        const folderPath = path.join(templatesDir, folder.name);
        const files = await fs.promises.readdir(folderPath);
        const svgFiles = files
          .filter(f => f.toLowerCase().endsWith('.svg'))
          .sort((a, b) => (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0));

        const pages = svgFiles.map(f => `/assets/Templates/${folder.name}/${f}`);
        return {
          id: folder.name.toLowerCase(),
          folder: folder.name,
          title: folder.name === 'Interior_Book' ? 'Corporate Modern' : folder.name === 'Mobile_Book' ? 'Mobile App & Tech Showcase' : folder.name.replace(/_/g, ' '),
          category: folder.name === 'Interior_Book' ? 'Industrial' : 'Product Catalog',
          pagesCount: svgFiles.length,
          thumbnail: pages.length > 0 ? pages[0] : '',
          pages,
          isMultiPageBook: svgFiles.length > 1
        };
      })
    );

    res.json({ success: true, books });
  } catch (error) {
    console.error('Error fetching template books:', error);
    res.status(500).json({ success: false, message: 'Failed to read template books', error: error.message });
  }
});

// Return 404 JSON for unmatched /storage or /uploads paths
app.use(['/storage', '/uploads'], (req, res) => {
  res.status(404).json({ success: false, message: `Asset not found: ${req.path}` });
});

// ============================================================================
// 3. GATEWAY HEALTH ENDPOINTS
// ============================================================================

// Basic gateway liveness check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Instance hostname check for load-balanced deployments
app.get('/health/instance', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    instance: os.hostname(),
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// 4. PROXY HELPER & SHARED MIDDLEWARE FACTORY
// ============================================================================

// Forward original client IP headers to downstream microservices
const forwardClientIp = (proxyReq, req) => {
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
};

// Build a standardized http-proxy-middleware instance with IP forwarding and 502 error handling
const createServiceProxy = ({ target, serviceName, unavailableMessage, timeout, pathRewrite, ignoreAbortErrors = false }) => {
  const config = {
    target,
    changeOrigin: true,
    xfwd: true,
    cookieDomainRewrite: '',
    cookiePathRewrite: '/',
    on: {
      proxyReq: forwardClientIp,
      error: (err, req, res) => {
        if (ignoreAbortErrors && (req.aborted || err.code === 'ECONNRESET' || err.message === 'socket hang up')) {
          return;
        }
        console.error(`[API Gateway] Proxy error to ${serviceName} (${req.originalUrl}):`, err.message);
        if (!res.headersSent) {
          res.status(502).json({ success: false, message: unavailableMessage });
        }
      }
    }
  };

  if (timeout) {
    config.timeout = timeout;
    config.proxyTimeout = timeout;
  }
  if (pathRewrite) {
    config.pathRewrite = pathRewrite;
  }

  return createProxyMiddleware(config);
};

// ============================================================================
// 5. MICROSERVICE PROXY ROUTES
// ============================================================================

// Auth Service (port 5001) - login, register, tokens, OTP, and OAuth
app.use('/api/auth', createServiceProxy({
  target: `${AUTH_SERVICE_URL}/api/auth`,
  serviceName: 'auth-service',
  unavailableMessage: 'Auth Service unavailable. Please ensure auth service is running.'
}));

// Specialized /api/flipbook sub-route interceptors (evaluated before general /api/flipbook proxy)
const isPdfConversionRoute = (pathname) =>
  /^\/api\/flipbook\/(convert-pdf-inkscape|convert-office-to-pdf|inspect-document|export-vector-pdf|inkscape-status|office-status|check-inkscape|check-libreoffice)(\/|$|\?)/i.test(pathname);

const isPageEditorRoute = (pathname) =>
  /^\/api\/flipbook\/(save-page|save-pages-batch|get-page|rename-page|delete-page|upload-asset|upload-3d-model|delete-asset|get-gallery-assets|rename-gallery-asset|delete-gallery-asset|use-gallery-asset|inline-svgs|resolve-map-url)(\/|$|\?)/i.test(pathname);

const isCustomizedEditorRoute = (pathname) =>
  /^\/api\/flipbook\/(public|preview-image|preview-card|update-settings|reset-settings|branding|background|book-appearance|appearance|transparent-sheet|upload-customized-asset|delete-customized-asset|background-assets|copy-theme-asset|submit-lead|get-leads|leads|verify-credential|send-visibility-otp|verify-visibility-otp|customized-settings|customized_settings)(\/|$|\?)/i.test(pathname);

const pdfConversionProxy = createServiceProxy({
  target: PDF_EDITOR_SERVICE_URL,
  serviceName: 'pdf-editor-service',
  unavailableMessage: 'PDF Editor Service unavailable. Please ensure pdf-editor-service is running.',
  timeout: 300000
});

const pageEditorProxy = createServiceProxy({
  target: PAGE_EDITOR_SERVICE_URL,
  serviceName: 'page-editor-service',
  unavailableMessage: 'Page Editor Service unavailable. Please ensure page editor service is running.',
  timeout: 300000
});

const customizedEditorProxy = createServiceProxy({
  target: CUSTOMIZED_EDITOR_SERVICE_URL,
  serviceName: 'customized-editor-service',
  unavailableMessage: 'Customized Editor Service unavailable. Please ensure customized-editor-service is running.',
  timeout: 300000,
  pathRewrite: (p) => p.replace(/^\/api\/flipbook/, '/api/customized-editor')
});

// Route crawler /share/* previews and /api/flipbook editor sub-routes to their owning services
app.use((req, res, next) => {
  const shareMatch = req.path.match(/^\/share(?:=([^\/]+)|\/([^\/]+))?\/([a-zA-Z0-9_-]+)/i);
  if (shareMatch) {
    const shareId = shareMatch[3] || shareMatch[2] || shareMatch[1];
    const userAgent = String(req.headers['user-agent'] || '').toLowerCase();
    const isBot = /facebookexternalhit|whatsapp|twitterbot|linkedinbot|telegrambot|slackbot|discordbot|googlebot|bingbot|applebot|embedly|skypeuripreview|quora link preview|pinterest/i.test(userAgent);
    if (isBot && shareId) {
      req.url = `/api/customized-editor/preview-card/${shareId}`;
      return customizedEditorProxy(req, res, next);
    }
  }

  if (isPdfConversionRoute(req.path) || isPdfConversionRoute(req.originalUrl)) return pdfConversionProxy(req, res, next);
  if (isPageEditorRoute(req.path) || isPageEditorRoute(req.originalUrl)) return pageEditorProxy(req, res, next);
  if (isCustomizedEditorRoute(req.path) || isCustomizedEditorRoute(req.originalUrl)) return customizedEditorProxy(req, res, next);
  next();
});

// MyFlipibook Service (port 5002) - flipbooks, analytics, user settings, explore, and bookshelves
app.use('/api/analytics', createServiceProxy({
  target: `${MYFLIPIBOOK_SERVICE_URL}/api/analytics`,
  serviceName: 'myflipibook-service',
  unavailableMessage: 'Analytics Service unavailable.',
  timeout: 300000
}));

app.use('/api/flipbook', createServiceProxy({
  target: `${MYFLIPIBOOK_SERVICE_URL}/api/flipbook`,
  serviceName: 'myflipibook-service',
  unavailableMessage: 'MyFlipibook Service unavailable. Please ensure myflipibook service is running.',
  timeout: 300000
}));

app.use('/api/myflipibook', createServiceProxy({
  target: `${MYFLIPIBOOK_SERVICE_URL}/api/myflipibook`,
  serviceName: 'myflipibook-service',
  unavailableMessage: 'MyFlipibook Service unavailable. Please ensure myflipibook service is running.',
  timeout: 300000
}));

app.use('/api/usersetting', createServiceProxy({
  target: `${MYFLIPIBOOK_SERVICE_URL}/api/usersetting`,
  serviceName: 'myflipibook-service',
  unavailableMessage: 'MyFlipibook Service unavailable. Please ensure myflipibook service is running.'
}));

app.use('/api/explore', createServiceProxy({
  target: `${MYFLIPIBOOK_SERVICE_URL}/api/explore`,
  serviceName: 'myflipibook-service',
  unavailableMessage: 'Explore Service unavailable. Please ensure myflipibook service is running.',
  timeout: 300000
}));

// Bookshelf endpoints mounted under /api/profile/* -> MyFlipibook Service
['/my-shelf-books', '/add-to-shelf', '/remove-from-shelf', '/delete-shelf', '/update-shelf-order', '/update-shelf-design'].forEach((shelfEndpoint) => {
  app.use(`/api/profile${shelfEndpoint}`, createServiceProxy({
    target: `${MYFLIPIBOOK_SERVICE_URL}/api/profile${shelfEndpoint}`,
    serviceName: 'myflipibook-service',
    unavailableMessage: 'Bookshelf Service unavailable. Please ensure myflipibook service is running.',
    timeout: 300000
  }));
});

app.use('/api/shelf', createProxyMiddleware({
  target: `${MYFLIPIBOOK_SERVICE_URL}/api/shelf`,
  changeOrigin: true,
  xfwd: true,
  timeout: 300000,
  proxyTimeout: 300000,
  cookieDomainRewrite: '',
  cookiePathRewrite: '/'
}));

// Page Editor Service (port 5003) - direct page editor endpoints
app.use('/api/page-editor', createServiceProxy({
  target: `${PAGE_EDITOR_SERVICE_URL}/api/page-editor`,
  serviceName: 'page-editor-service',
  unavailableMessage: 'Page Editor Service unavailable. Please ensure page editor service is running.'
}));

// PDF Editor Service (port 5004) - direct PDF conversion endpoints
app.use('/api/pdf-editor', createServiceProxy({
  target: `${PDF_EDITOR_SERVICE_URL}/api/pdf-editor`,
  serviceName: 'pdf-editor-service',
  unavailableMessage: 'PDF Editor Service unavailable. Please ensure pdf editor service is running.'
}));

// Customized Editor Service (port 5005) - viewer customization, branding, and leads
app.use('/api/customized-editor', createServiceProxy({
  target: `${CUSTOMIZED_EDITOR_SERVICE_URL}/api/customized-editor`,
  serviceName: 'customized-editor-service',
  unavailableMessage: 'Customized Editor Service unavailable. Please ensure customized-editor-service is running.',
  timeout: 300000,
  ignoreAbortErrors: true
}));

// 3D Editor Service (port 5006) - 3D models, textures, presets, and static HDRI/texture assets
app.use('/api/3d-models', createServiceProxy({
  target: `${THREED_EDITOR_SERVICE_URL}/api/3d-models`,
  serviceName: 'threed-editor-service',
  unavailableMessage: '3D Editor Service unavailable. Please ensure threed-editor-service is running.',
  timeout: 300000
}));

app.use('/api/textures', createServiceProxy({
  target: `${THREED_EDITOR_SERVICE_URL}/api/textures`,
  serviceName: 'threed-editor-service',
  unavailableMessage: '3D Editor Service unavailable. Please ensure threed-editor-service is running.',
  timeout: 300000
}));

app.use('/api/presets', createServiceProxy({
  target: `${THREED_EDITOR_SERVICE_URL}/api/presets`,
  serviceName: 'threed-editor-service',
  unavailableMessage: '3D Editor Service unavailable. Please ensure threed-editor-service is running.',
  timeout: 300000
}));

app.use('/hdri', createProxyMiddleware({
  target: `${THREED_EDITOR_SERVICE_URL}/hdri`,
  changeOrigin: true,
  xfwd: true,
  cookieDomainRewrite: '',
  cookiePathRewrite: '/'
}));

app.use('/textures', createProxyMiddleware({
  target: `${THREED_EDITOR_SERVICE_URL}/textures`,
  changeOrigin: true,
  xfwd: true,
  cookieDomainRewrite: '',
  cookiePathRewrite: '/'
}));

// Payment Service (port 5007) - plans, subscriptions, and payment webhooks
app.use('/api/payment', createServiceProxy({
  target: `${PAYMENT_SERVICE_URL}/api/payment`,
  serviceName: 'payment-services',
  unavailableMessage: 'Payment Service unavailable. Please ensure payment service is running.'
}));

// App Service (port 5008) - user profiles, accounts, community forum, and support tickets
app.use('/api/profile', createServiceProxy({
  target: `${APP_SERVICE_URL}/api/profile`,
  serviceName: 'app-service',
  unavailableMessage: 'Profile Service unavailable. Please ensure app-service is running.',
  timeout: 300000
}));

app.use('/api/user', createServiceProxy({
  target: `${APP_SERVICE_URL}/api/user`,
  serviceName: 'app-service',
  unavailableMessage: 'User Service unavailable. Please ensure app-service is running.'
}));

app.use('/api/users', createServiceProxy({
  target: `${APP_SERVICE_URL}/api/users`,
  serviceName: 'app-service',
  unavailableMessage: 'User Service unavailable. Please ensure app-service is running.'
}));

app.use('/api/forum', createServiceProxy({
  target: `${APP_SERVICE_URL}/api/forum`,
  serviceName: 'app-service',
  unavailableMessage: 'Forum Service unavailable. Please ensure app-service is running.'
}));

app.use('/api/tickets', createServiceProxy({
  target: `${APP_SERVICE_URL}/api/tickets`,
  serviceName: 'app-service',
  unavailableMessage: 'Support Ticket Service unavailable. Please ensure app-service is running.'
}));

// Admin User Service (port 5009) - admin dashboard, moderation, and analytics
app.use('/api/admin', createServiceProxy({
  target: `${ADMIN_USER_SERVICE_URL}/api/admin`,
  serviceName: 'admin-user-service',
  unavailableMessage: 'Admin Service unavailable. Please ensure admin-user-service is running.'
}));

// Notification Service (port 5010) - user notifications & Socket.IO real-time channel
app.use('/api/notifications', createServiceProxy({
  target: `${NOTIFICATION_SERVICE_URL}/api/notifications`,
  serviceName: 'notification-service',
  unavailableMessage: 'Notification Service unavailable. Please ensure notification-service is running.'
}));

const socketProxy = createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL,
  pathFilter: '/socket.io',
  changeOrigin: true,
  ws: true,
  xfwd: true,
  cookieDomainRewrite: '',
  cookiePathRewrite: '/'
});
app.use(socketProxy);

// ============================================================================
// 6. SERVER STARTUP & PROCESS ERROR HANDLERS
// ============================================================================

// Start HTTP gateway and log active route mappings
const server = app.listen(PORT, '0.0.0.0', () => {
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
  console.log(`[API Gateway] Routing /api/user -> ${APP_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/forum -> ${APP_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/admin -> ${ADMIN_USER_SERVICE_URL}`);
  console.log(`[API Gateway] Routing /api/notifications -> ${NOTIFICATION_SERVICE_URL}`);
});

server.on('upgrade', (req, socket, head) => {
  if (req.url && req.url.startsWith('/socket.io')) {
    socketProxy.upgrade(req, socket, head);
  }
});

// Log uncaught process-level errors without crashing silently
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught exception in api-gateway:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[CRITICAL] Unhandled rejection in api-gateway:', reason);
});

module.exports = app;
