const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const myflipibookRoutes = require('./routes/myflipibookRoutes');
const userSettingRoutes = require('./routes/userSettingRoutes');
const exploreRoutes = require('./routes/exploreRoutes');
const shelfRoutes = require('./routes/shelfRoutes');
const profileRoutes = require('./routes/profileRoutes');
const analyticsRoutes = require('./analytics_tracking/analyticsRoutes');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.MYFLIPIBOOK_PORT || process.env.PORT || 5002;

// Connect to MongoDB Database
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8000',
  'https://testing.flipibook.com',
  'https://flipibook.com',
  process.env.CLIENT_URL
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
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

app.use(cookieParser());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const fs = require('fs');
const { getStorageRoot } = require('./utils/storageHelper');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'myflipibook-service' });
});

// Static storage serving with fallback across user folder aliases (e.g. FLIPI0001 vs sanitizedEmail)
const storageStaticMiddleware = async (req, res, next) => {
  const storageRoot = getStorageRoot();
  const relPath = decodeURIComponent(req.path.replace(/^\/+/, ''));
  const directPath = path.join(storageRoot, relPath);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return res.sendFile(directPath);
  }

  const parts = relPath.split(/[/\\]/);
  if (parts.length > 1) {
    const restOfPath = parts.slice(1).join(path.sep);
    try {
      const topDirs = fs.readdirSync(storageRoot);
      for (const d of topDirs) {
        const candidatePath = path.join(storageRoot, d, restOfPath);
        if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
          return res.sendFile(candidatePath);
        }
      }
    } catch (e) {}
  }

  // Fast-Stream In-Flight Page Waiter:
  const bookPageMatch = relPath.match(/books[/\\]([^/\\]+)[/\\]pages[/\\](\d+)\.(webp|json)$/i);
  if (bookPageMatch) {
    const bookId = bookPageMatch[1];
    const pageNum = bookPageMatch[2];
    const ext = bookPageMatch[3];
    const fileName = `${pageNum}.${ext}`;

    try {
      const topDirs = fs.readdirSync(storageRoot);
      const candidatePagesDirs = [
        path.join(storageRoot, 'FLIPI0001', 'books', bookId, 'pages'),
        ...topDirs.map(d => path.join(storageRoot, d, 'books', bookId, 'pages'))
      ];

      let targetPagesDir = null;
      for (const pDir of candidatePagesDirs) {
        if (fs.existsSync(pDir)) {
          targetPagesDir = pDir;
          break;
        }
      }

      if (targetPagesDir) {
        const targetFilePath = path.join(targetPagesDir, fileName);
        const startTime = Date.now();
        while (Date.now() - startTime < 1500) {
          if (fs.existsSync(targetFilePath)) {
            return res.sendFile(targetFilePath);
          }
          await new Promise(r => setTimeout(r, 150));
        }
        if (fs.existsSync(targetFilePath)) {
          return res.sendFile(targetFilePath);
        }
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(404).json({ error: 'Page asset still generating', pageNum, inProgress: true });
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
        const userFlipbooksDir = path.join(storageRoot, d, 'books');
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
          if (found) return res.sendFile(found);
        }
      }
    } catch (e) {}
  }

  next();
};

app.use('/storage', storageStaticMiddleware);
app.use('/storage', express.static(getStorageRoot()));
app.use('/uploads', storageStaticMiddleware);
app.use('/uploads', express.static(getStorageRoot()));

// Service routes (Both /api/myflipibook and /api/flipbook, plus root fallback for full compatibility)
app.use('/api/analytics', analyticsRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/api/myflipibook', myflipibookRoutes);
app.use('/api/flipbook', myflipibookRoutes);
app.use('/api/usersetting', userSettingRoutes);
app.use('/usersetting', userSettingRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/explore', exploreRoutes);
app.use('/api/shelf', shelfRoutes);
app.use('/shelf', shelfRoutes);
app.use('/api/profile', shelfRoutes);
app.use('/profile', shelfRoutes);
app.use('/', userSettingRoutes);
app.use('/', myflipibookRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found on myflipibook-service' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[MyFlipibook Service] Running on port ${PORT} (reloaded: ${Date.now()})`);
});

module.exports = app;
