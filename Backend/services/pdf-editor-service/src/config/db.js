const dns = require('node:dns');
const mongoose = require('mongoose');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[PDF Editor Service] Warning: MONGO_URI not defined, running without DB connection.');
      return;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`[PDF Editor Service] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[PDF Editor Service] Database connection error: ${error.message}`);
  }
};

module.exports = connectDB;
