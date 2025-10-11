const path = require('path');

// Load root .env once, for both CLI and server
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
} catch (_) {}

const trim = (v) => (typeof v === 'string' ? v.trim() : v);

const raw = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '5001',
  DATABASE_URL: process.env.DATABASE_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  // Optional dedicated CORS origins list (comma-separated). If provided,
  // this takes precedence over FRONTEND_URL for CORS whitelisting.
  CORS_ORIGINS: process.env.CORS_ORIGINS,

  // Email / Resend
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: trim(process.env.CLOUDINARY_CLOUD_NAME),
  CLOUDINARY_API_KEY: trim(process.env.CLOUDINARY_API_KEY),
  CLOUDINARY_API_SECRET: trim(process.env.CLOUDINARY_API_SECRET)
};

const env = {
  NODE_ENV: raw.NODE_ENV,
  IS_PRODUCTION: raw.NODE_ENV === 'production',
  PORT: parseInt(raw.PORT, 10) || 5001,
  DATABASE_URL: raw.DATABASE_URL,
  FRONTEND_URL: raw.FRONTEND_URL,
  FRONTEND_WHITELIST: ((raw.CORS_ORIGINS && String(raw.CORS_ORIGINS)) || (raw.FRONTEND_URL ? String(raw.FRONTEND_URL) : ''))
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  EMAIL_SERVICE: raw.EMAIL_SERVICE,
  RESEND_API_KEY: raw.RESEND_API_KEY,
  EMAIL_FROM: raw.EMAIL_FROM,

  CLOUDINARY_CLOUD_NAME: raw.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: raw.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: raw.CLOUDINARY_API_SECRET,
  CLOUDINARY_CONFIGURED: !!(raw.CLOUDINARY_CLOUD_NAME && raw.CLOUDINARY_API_KEY && raw.CLOUDINARY_API_SECRET)
};

function validateEnv() {
  const problems = [];
  if (env.IS_PRODUCTION) {
    if (!env.DATABASE_URL) problems.push('DATABASE_URL');
    if (env.EMAIL_SERVICE === 'resend' && !env.RESEND_API_KEY) problems.push('RESEND_API_KEY');
    // Cloudinary is encouraged in prod, but not strictly required for app to run
  }

  if (env.IS_PRODUCTION && problems.length > 0) {
    const msg = `Missing required production env vars: ${problems.join(', ')}`;
    throw new Error(msg);
  }

  if (!env.IS_PRODUCTION) {
    const warnings = [];
    if (!env.DATABASE_URL) warnings.push('DATABASE_URL');
    if (env.EMAIL_SERVICE === 'resend' && !env.RESEND_API_KEY) warnings.push('RESEND_API_KEY');
    if (warnings.length > 0) {
      console.warn('Dev env warnings (missing non-critical vars):', warnings);
    }
  }
}

module.exports = { env, validateEnv };


