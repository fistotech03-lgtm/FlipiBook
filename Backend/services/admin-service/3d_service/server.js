require('dotenv').config();
const dns = require('dns');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const routes = require('./routes');
const { storageRoot } = require('./uploadMiddleware');

// Configure reliable public DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (_) {}

const app = express();
const PORT = process.env.ADMIN_3D_PORT || process.env.PORT || 5011;
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://fistotech03:Murugan1234@projectmanagement.gntieqg.mongodb.net/idcProduct?retryWrites=true&w=majority&appName=idcProduct';

// Enable CORS
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Static route to serve uploaded assets from storage directly
app.use('/storage', express.static(storageRoot));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'admin-3d-service', port: PORT });
});

// Mount 3D Asset management routes (both direct and prefixed)
app.use('/api/admin/3d-editor', routes);
app.use('/api/3d-assets', routes);
app.use('/', routes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Admin 3D Service Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Database Connection & Server Boot
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[Admin 3D Service] Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Admin 3D Service] Running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[Admin 3D Service] MongoDB connection error:', err.message);
    process.exit(1);
  });

