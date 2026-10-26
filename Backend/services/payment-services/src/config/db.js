const dns = require('node:dns');
const mongoose = require('mongoose');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // ignore if unable to set custom DNS
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[Payment Service] Warning: MONGO_URI not defined, running without DB connection.');
      return;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`[Payment Service] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Payment Service] Database connection error: ${error.message}`);
  }
};

module.exports = connectDB;
