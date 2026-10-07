/**
 * rateLimiter.js
 * High-performance in-memory sliding-window rate limiter middleware.
 * Zero external dependencies. Prevents brute-force, credential stuffing, and OTP flooding.
 */

const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 10,
  message = 'Too many requests. Please try again later.'
}) => {
  const hits = new Map();

  // Periodically clean up expired records every 5 minutes to prevent memory leaks
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now - record.startTime > windowMs) {
        hits.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  if (interval.unref) interval.unref();

  return (req, res, next) => {
    const ip =
      req.ip ||
      (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    const now = Date.now();
    const record = hits.get(ip);

    if (!record || now - record.startTime > windowMs) {
      hits.set(ip, { count: 1, startTime: now });
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
