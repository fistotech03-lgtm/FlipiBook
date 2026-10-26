const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[User Service] Warning: MONGO_URI not defined, running without DB connection.');
      return;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`[User Service] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[User Service] Database connection error: ${error.message}`);
    // Do not exit process so service can still respond to health checks
  }
};

module.exports = connectDB;
