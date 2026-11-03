/**
 * rateLimiter.js
 * High-performance distributed rate limiter powered by Redis with in-memory fallback.
 * Prevents brute-force, credential stuffing, and OTP flooding across all container instances.
 */

const { getRedis, isAvailable } = require('../../../../shared/redisClient');

const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 10,
  message = 'Too many requests. Please try again later.'
}) => {
  const inMemoryHits = new Map();
  const windowSeconds = Math.ceil(windowMs / 1000);

  // Periodically clean up expired records in memory every 5 minutes to prevent memory leaks
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of inMemoryHits.entries()) {
      if (now - record.startTime > windowMs) {
        inMemoryHits.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  if (interval.unref) interval.unref();

  return async (req, res, next) => {
    const ip =
      req.ip ||
      (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    const redis = getRedis();

    // 1. Primary: Redis distributed rate limiter
    if (isAvailable() && redis) {
      try {
        const key = `ratelimit:${req.baseUrl || ''}:${req.path || ''}:${ip}`;
        const current = await redis.incr(key);

        if (current === 1) {
          await redis.expire(key, windowSeconds);
        }

        if (current > max) {
          const ttl = await redis.ttl(key);
          const retryAfterSeconds = ttl > 0 ? ttl : windowSeconds;
          res.setHeader('Retry-After', retryAfterSeconds);
          return res.status(429).json({
            success: false,
            code: 'RATE_LIMIT_EXCEEDED',
            message,
            retryAfterSeconds
          });
        }

        return next();
      } catch (redisErr) {
        // Fall back to in-memory silently if redis operation fails
      }
    }

    // 2. Secondary: In-memory fallback (runs if Redis is offline or not configured)
    const now = Date.now();
    const record = inMemoryHits.get(ip);

    if (!record || now - record.startTime > windowMs) {
      inMemoryHits.set(ip, { count: 1, startTime: now });
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.startTime + windowMs - now) / 1000));
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfterSeconds
      });
    }

    next();
  };
};

module.exports = {
  createRateLimiter,
  authLimiter: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  }),
  otpLimiter: createRateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5,
    message: 'Too many verification code requests. Please wait a few minutes before trying again.'
  }),
  otpVerifyLimiter: createRateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    message: 'Too many incorrect attempts. Please request a new code or try again later.'
  })
};
