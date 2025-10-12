import { API_BASE_URL } from '../api/client';

// Builds a safe, optimized image URL for Cloudinary, backend uploads, or public assets
// opts: { transform: string } or common options translated to Cloudinary (w, h, q, c)
export function getImageUrl(imagePath, opts = {}) {
  const placeholderSvg = '/placeholder-commander.svg';
  const placeholderJpg = '/placeholder-commander.jpg';
  if (!imagePath) return placeholderSvg;

  if (typeof imagePath !== 'string') return placeholderSvg;

  // Base64/inline data
  if (imagePath.startsWith('data:')) return imagePath;

  // Public assets in /public
  if (imagePath === 'placeholder-commander.jpg' || imagePath === 'placeholder-commander.svg') {
    return `/${imagePath}`;
  }

  const toTransformString = (o) => {
    if (o.transform) return o.transform; // manual override
    const parts = [];
    if (o.w) parts.push(`w_${o.w}`);
    if (o.h) parts.push(`h_${o.h}`);
    if (o.c) parts.push(`c_${o.c}`);
    if (o.q) parts.push(`q_${o.q}`);
    // Always prefer automatic format/quality if not provided
    if (!o.q) parts.push('q_auto');
    parts.push('f_auto');
    return parts.join(',');
  };

  // Absolute URLs
  if (imagePath.startsWith('http')) {
    if (imagePath.includes('cloudinary.com')) {
      // Insert transforms into Cloudinary URL if requested
      const t = toTransformString(opts);
      if (t) {
        const parts = imagePath.split('/upload/');
        if (parts.length === 2) return `${parts[0]}/upload/${t}/${parts[1]}`;
      }
    }
    return imagePath;
  }

  // Backend uploads path
  if (imagePath.includes('/uploads/')) {
    const base = String(API_BASE_URL || '').replace(/\/$/, '');
    return `${base}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }

  // Fallbacks
  return placeholderSvg;
}


