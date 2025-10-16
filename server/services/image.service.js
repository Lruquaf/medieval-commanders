const { env } = require('../config/env');
const fs = require('fs');
const path = require('path');
const logger = require('../lib/logger');
const { initCloudinary } = require('../config/cloudinary');

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

function isDataUrl(url) {
  return typeof url === 'string' && url.startsWith('data:');
}

function isCloudinaryUrl(url) {
  if (typeof url !== 'string') return false;
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    const u = new URL(url);
    return /res\.cloudinary\.com$/i.test(u.hostname) || /cloudinary\.com$/i.test(u.hostname);
  } catch (_) {
    return false;
  }
}

function extractCloudinaryPublicId(imageUrl) {
  try {
    const u = new URL(imageUrl);
    const pathname = u.pathname || '';
    const split = pathname.split('/upload/');
    if (split.length < 2) return null;
    const afterUpload = split[1];
    const rawSegments = afterUpload.split('/').filter(Boolean);
    const segments = rawSegments.filter((seg) => !/^v\d+$/i.test(seg) && !seg.includes(','));
    if (segments.length === 0) return null;
    const fileWithExt = segments.pop();
    const withoutExt = fileWithExt.replace(/\.[^.]+$/, '');
    const publicId = [...segments, withoutExt].join('/');
    return publicId || null;
  } catch (e) {
    return null;
  }
}

async function deleteFromCloudinaryByPublicId(publicId) {
  const { cloudinary, isConfigured } = initCloudinary();
  if (!isConfigured) {
    logger.warn('Attempted Cloudinary deletion but Cloudinary is not configured');
    return false;
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    const ok = result && (result.result === 'ok' || result.result === 'not found');
    if (!ok) logger.warn('Cloudinary deletion returned non-ok', { result });
    return !!ok;
  } catch (error) {
    logger.error('Cloudinary deletion failed', { error: String(error && error.message || error), publicId });
    return false;
  }
}

function deleteLocalUploadByUrl(imageUrl) {
  if (typeof imageUrl !== 'string') return false;
  const src = String(imageUrl).trim();
  const marker = '/uploads/';
  const idx = src.indexOf(marker);
  if (idx === -1) return false;
  const afterMarker = src.slice(idx + marker.length);
  if (!afterMarker) return false;
  const relative = decodeURIComponent(afterMarker.replace(/^\/+/, ''));
  const candidates = [
    path.join(__dirname, '..', 'uploads', relative),
    path.join(process.cwd(), 'server', 'uploads', relative),
    path.join(__dirname, '..', 'uploads', path.basename(relative))
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        fs.unlinkSync(candidate);
        return true;
      }
    } catch (error) {
      logger.error('Local upload deletion failed', { error: String(error && error.message || error), filePath: candidate });
    }
  }
  return false;
}

async function deleteImageByUrl(imageUrl) {
  if (!imageUrl || isDataUrl(imageUrl)) return false;
  const urlStr = String(imageUrl).trim();
  // Dev/local uploads
  if (!env.IS_PRODUCTION && urlStr.includes('/uploads/')) {
    return deleteLocalUploadByUrl(urlStr);
  }
  // Cloudinary (prod)
  if (isCloudinaryUrl(urlStr)) {
    const publicId = extractCloudinaryPublicId(urlStr);
    if (!publicId) return false;
    return await deleteFromCloudinaryByPublicId(publicId);
  }
  // If prod but not a Cloudinary URL, we cannot delete
  return false;
}

module.exports = { getImageUrl, deleteImageByUrl };


