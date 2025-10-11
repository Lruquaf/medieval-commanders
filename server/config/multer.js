const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { env } = require('./env');
const { initCloudinary } = require('./cloudinary');

function buildStorage() {
  if (env.IS_PRODUCTION) {
    const { cloudinary, isConfigured } = initCloudinary();
    if (isConfigured) {
      return new CloudinaryStorage({
        cloudinary,
        params: {
          folder: 'medieval-commanders',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: [{ width: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
          timeout: 60000,
          resource_type: 'auto'
        }
      });
    }
    return null; // explicit: no storage in prod without Cloudinary
  }

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  return multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadsDir); },
    filename: function (req, file, cb) {
      const timestamp = Date.now();
      const sanitized = String(file.originalname || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${timestamp}-${sanitized}`);
    }
  });
}

function createMulter() {
  const storage = buildStorage();
  return multer({
    storage: storage || multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) return cb(null, true);
      return cb(new Error('Only image files are allowed!'), false);
    },
    limits: { fileSize: 5 * 1024 * 1024, fieldSize: 10 * 1024 * 1024 }
  });
}

module.exports = { createMulter };


