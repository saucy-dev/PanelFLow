import rateLimit from 'express-rate-limit';

// Rate limiter for public queue join requests: max 30 requests per minute per IP
export const queueJoinLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many queue registration attempts from this network. Please wait a minute and try again.',
  },
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
