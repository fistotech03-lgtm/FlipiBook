const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`[Auth Service] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Auth Service] Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
