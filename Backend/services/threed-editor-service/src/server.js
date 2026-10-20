const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { getStorageRoot, getHdriRoot, getTexturesRoot } = require('./utils/storageHelper');
const threedModelRoutes = require('./routes/threedModelRoutes');
const textureRoutes = require('./routes/textureRoutes');
const presetsRoutes = require('./routes/presetsRoutes');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.THREED_EDITOR_PORT || process.env.PORT || 5006;

// Connect to MongoDB
connectDB();

// CORS Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
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

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Static file serving for storage/uploads/textures/hdri
const storageRoot = getStorageRoot();
const hdriRoot = getHdriRoot();
const texturesRoot = getTexturesRoot();

app.use('/storage', express.static(storageRoot));
app.use('/uploads', express.static(storageRoot));
if (hdriRoot) {
  app.use('/hdri', express.static(hdriRoot));
}
if (texturesRoot) {
  app.use('/textures', express.static(texturesRoot));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'threed-editor-service' });
});

// Mount Routes
app.use('/api/3d-models', threedModelRoutes);
app.use('/api/textures', textureRoutes);
app.use('/api/presets', presetsRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found on threed-editor-service' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[3D Editor Service] Global Error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Limit is 500MB.' });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[3D Editor Service] Running on port ${PORT} (active: ${Date.now()})`);
  console.log(`[3D Editor Service] Storage root: ${storageRoot}`);
  console.log(`[3D Editor Service] HDRI root: ${hdriRoot}`);
  console.log(`[3D Editor Service] Textures root: ${texturesRoot}`);
});

module.exports = app;
