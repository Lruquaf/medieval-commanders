const multer = require('multer');
const { createMulter } = require('../config/multer');

const uploadInstance = createMulter();

const uploadWithErrorHandling = (req, res, next) => {
  const timeoutMs = 90000;
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        error: 'Upload timeout. Please try again with a smaller image or better connection.',
        code: 'UPLOAD_TIMEOUT'
      });
    }
  }, timeoutMs);

  uploadInstance.single('image')(req, res, (err) => {
    clearTimeout(timeout);

    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large (max 5MB)' });
        return res.status(400).json({ error: `Multer error: ${err.message}` });
      }
      if (err.message === 'Only image files are allowed!') return res.status(400).json({ error: 'Only image files are allowed!' });
      if (err.name === 'TimeoutError' || String(err.message || '').includes('Request Timeout')) return res.status(408).json({ error: 'Upload timeout. Please try again with a smaller image or better connection.', code: 'UPLOAD_TIMEOUT' });
      if (err.name === 'UnexpectedResponse' || String(err.message || '').includes('502') || String(err.message || '').includes('503')) return res.status(502).json({ error: 'Upload service temporarily unavailable. Please try again in a few moments.', code: 'SERVICE_UNAVAILABLE' });
      if (String(err.message || '').includes('Invalid cloud_name')) return res.status(500).json({ error: 'Image upload service configuration error. Please contact administrator.', details: 'Cloudinary configuration issue' });
      if (String(err.message || '').includes('cloudinary')) return res.status(500).json({ error: 'Image upload service error. Please try again or contact administrator.', details: err.message });
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    next();
  });
};

module.exports = uploadWithErrorHandling;


