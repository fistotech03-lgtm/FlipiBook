const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const notificationRoutes = require('./routes/notificationRoutes');
const { initSocket } = require('./socket/socketManager');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.NOTIFICATION_SERVICE_PORT || process.env.PORT || 5010;

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
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'notification-service', port: PORT });
});

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found on notification-service' });
});

app.use((err, req, res, next) => {
  console.error('[Notification Service] Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const startServer = async () => {
  try {
    await connectDB();
    const httpServer = http.createServer(app);
    initSocket(httpServer, isAllowedOrigin);
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`[Notification Service] Running on port ${PORT} (with Socket.IO)`);
    });
  } catch (err) {
    console.error('[Notification Service] Fatal startup error:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
