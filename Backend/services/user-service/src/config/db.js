const mongoose = require('mongoose');
global.mongoose = mongoose;

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return mongoose.connection;
  }

  try {
    isConnecting = true;
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[User Service] Warning: MONGO_URI not defined, running without DB connection.');
      return;
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    const dbTarget = conn.connection.name || conn.connection.host || 'connected';
    console.log(`[User Service] MongoDB Connected: ${dbTarget}`);
  } catch (error) {
    console.error(`[User Service] Database connection error: ${error.message}`);
    setTimeout(connectDB, 5000);
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[User Service] MongoDB disconnected. Reconnecting in 3s...');
  setTimeout(connectDB, 3000);
});

module.exports = connectDB;

