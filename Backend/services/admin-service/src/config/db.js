const dns = require('dns');
const mongoose = require('mongoose');
global.mongoose = mongoose;

// Configure reliable public DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (_) {}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[Admin Service] Warning: MONGO_URI not defined, running without DB connection.');
      return;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`[Admin Service] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Admin Service] Database connection error: ${error.message}`);
  }
};

module.exports = connectDB;
