// middleware/rateLimiter.js
// Simple in-memory rate limiter (replace with redis-rate-limiter in production)
const requests = new Map();

const rateLimiter = (windowMs = 15 * 60 * 1000, max = 200) => (req, res, next) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean old entries
  const timestamps = (requests.get(key) || []).filter(t => t > windowStart);
  timestamps.push(now);
  requests.set(key, timestamps);

  if (timestamps.length > max) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }
  next();
};

// Stricter limiter for AI routes
const aiRateLimiter = rateLimiter(60 * 1000, 10); // 10 req/min
const defaultLimiter = rateLimiter(15 * 60 * 1000, 300);

module.exports = { defaultLimiter, aiRateLimiter };
