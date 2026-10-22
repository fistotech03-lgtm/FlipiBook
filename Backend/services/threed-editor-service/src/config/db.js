const dns = require('node:dns');
const mongoose = require('mongoose');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[3D Editor Service] Warning: MONGO_URI not defined, running without DB connection.');
      return;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`[3D Editor Service] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[3D Editor Service] Database connection error: ${error.message}`);
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[3D Editor Service] MongoDB disconnected. Reconnecting in 3s...');
  setTimeout(connectDB, 3000);
});

module.exports = connectDB;
