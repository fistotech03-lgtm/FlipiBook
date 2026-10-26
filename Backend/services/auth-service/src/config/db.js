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
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log(`[Auth Service] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Auth Service] Database connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
