const dns = require('dns');
const mongoose = require('mongoose');

// Configure reliable DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (_) {}

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return mongoose.connection;
  }

  try {
    isConnecting = true;
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[PDF Editor Service] Warning: MONGO_URI not defined, running without DB connection.');
      return;
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    const dbTarget = conn.connection.name || conn.connection.host || 'connected';
    console.log(`[PDF Editor Service] MongoDB Connected: ${dbTarget}`);
  } catch (error) {
    console.error(`[PDF Editor Service] Database connection error: ${error.message}`);
    setTimeout(connectDB, 5000);
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[PDF Editor Service] MongoDB disconnected. Reconnecting in 3s...');
  setTimeout(connectDB, 3000);
});

module.exports = connectDB;

