const Redis = require('ioredis');

let redisClient = null;
let isConnected = false;
let hasLoggedFailure = false;

/**
 * Initialize resilient Redis client
 */
const initRedis = () => {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || null;
  if (!redisUrl) {
    if (!hasLoggedFailure) {
      console.log('[Redis] No REDIS_URL configured. Falling back to in-memory mode.');
      hasLoggedFailure = true;
    }
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      enableOfflineQueue: false, // Don't hang express requests if redis is offline
      retryStrategy(times) {
        // Reconnect after 3 seconds, up to max 10 seconds
        return Math.min(times * 1000, 10000);
      }
    });

    redisClient.on('connect', () => {
      isConnected = true;
      console.log('[Redis] Connected to Redis instance successfully.');
    });

    redisClient.on('ready', () => {
      isConnected = true;
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      if (!hasLoggedFailure) {
        console.warn('[Redis Note] Redis not reachable, falling back to in-memory mode:', err.message);
        hasLoggedFailure = true;
      }
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    return redisClient;
  } catch (err) {
    console.warn('[Redis] Failed to initialize Redis client:', err.message);
    return null;
  }
};

// Auto-initialize when loaded
initRedis();

module.exports = {
  getRedis: () => redisClient,
  isAvailable: () => isConnected && redisClient !== null,
  initRedis
};

