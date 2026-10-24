const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[Auth Service] Warning: MONGO_URI is not defined in environment variables.');
      return null;
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log(`[Auth Service] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Auth Service] Database connection error: ${error.message}. Retrying in 5s...`);
    setTimeout(connectDB, 5000);
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Auth Service] MongoDB disconnected. Reconnecting in 3s...');
  setTimeout(connectDB, 3000);
});

module.exports = connectDB;
