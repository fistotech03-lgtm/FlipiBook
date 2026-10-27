const dns = require('node:dns');
const mongoose = require('mongoose');

<<<<<<< HEAD
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // ignore if unable to set custom DNS
}
=======
// Configure reliable DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (_) {}

let isConnecting = false;
>>>>>>> 9f02ce44d97f33916ae3168b3e2c86b6ab0fdd34

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return mongoose.connection;
  }

  try {
    isConnecting = true;
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[Customized Editor Service] Warning: MONGO_URI not defined, running without DB connection.');
      return;
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    const dbTarget = conn.connection.name || conn.connection.host || 'connected';
    console.log(`[Customized Editor Service] MongoDB Connected: ${dbTarget}`);
  } catch (error) {
    console.error(`[Customized Editor Service] Database connection error: ${error.message}`);
    setTimeout(connectDB, 5000);
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Customized Editor Service] MongoDB disconnected. Reconnecting in 3s...');
  setTimeout(connectDB, 3000);
});

module.exports = connectDB;

