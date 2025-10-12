const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { env } = require('./env');

function buildHelmet() {
  return helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  });
}

function buildLimiter({ windowMs = 15 * 60 * 1000, max = 100 }) {
  return rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false });
}

// In development, disable rate limiting to avoid blocking (express-rate-limit v7 treats 0 as block-all)
const noop = (req, res, next) => next();

const uploadLimiter = env.IS_PRODUCTION
  ? buildLimiter({ windowMs: 10 * 60 * 1000, max: 30 })
  : noop;

const adminLimiter = env.IS_PRODUCTION
  ? buildLimiter({ windowMs: 15 * 60 * 1000, max: 200 })
  : noop;

module.exports = { buildHelmet, uploadLimiter, adminLimiter };


