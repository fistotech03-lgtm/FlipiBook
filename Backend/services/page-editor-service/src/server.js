const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const pageEditorRoutes = require('./routes/pageEditorRoutes');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PAGE_EDITOR_PORT || process.env.PORT || 5003;

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'page-editor-service' });
});

// Service routes
app.use('/api/page-editor', pageEditorRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found on page-editor-service' });
});

app.listen(PORT, () => {
  console.log(`[Page Editor Service] Running on port ${PORT}`);
});

module.exports = app;
