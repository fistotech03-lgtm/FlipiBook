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
      console.warn('[Auth Service] Warning: MONGO_URI is not defined in environment variables.');
      return null;
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    const dbTarget = conn.connection.name || conn.connection.host || 'connected';
    console.log(`[Auth Service] MongoDB Connected: ${dbTarget}`);
    return conn;
  } catch (error) {
    console.error(`[Auth Service] Database connection error: ${error.message}`);
    setTimeout(connectDB, 5000);
    return null;
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Auth Service] MongoDB disconnected. Reconnecting in 3s...');
  setTimeout(connectDB, 3000);
});

module.exports = connectDB;

