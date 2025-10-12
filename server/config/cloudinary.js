const { v2: cloudinary } = require('cloudinary');
const { env } = require('./env');
const logger = require('../lib/logger');

function initCloudinary() {
  const isConfigured = !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
  if (isConfigured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET
    });
    logger.info('Cloudinary configured');
  } else if (env.IS_PRODUCTION) {
    logger.warn('Cloudinary not configured in production');
  }
  return { cloudinary, isConfigured };
}

module.exports = { initCloudinary };


