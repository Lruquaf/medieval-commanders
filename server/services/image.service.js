const { env } = require('../config/env');

function getImageUrl(file) {
  if (!file) return null;
  // If Cloudinary (or any remote storage) provided an absolute URL, use it
  if (file.path && /^https?:\/\//i.test(String(file.path))) return file.path;
  if (file.buffer) return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  // For local disk storage in development, persist a relative path so frontend can prefix API base URL
  if (file.filename) return `/uploads/${file.filename}`;
  // Some storages may provide a non-absolute path containing uploads directory
  if (file.path && String(file.path).includes('/uploads/')) {
    const parts = String(file.path).split('/uploads/');
    const relative = parts[1] || '';
    if (relative) return `/uploads/${relative}`;
  }
  return null;
}

module.exports = { getImageUrl };


