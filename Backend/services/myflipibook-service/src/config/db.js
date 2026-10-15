const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[MyFlipibook Service] Warning: MONGO_URI not defined, running without DB connection.');
      return;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`[MyFlipibook Service] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MyFlipibook Service] Database connection error: ${error.message}`);
  }
};

module.exports = connectDB;
