const express = require('express');
const { buildCors } = require('./config/cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const prisma = require('./prisma');
const logger = require('./lib/logger');
const emailService = require('./emailService');

// Load root .env so server uses the same DATABASE_URL as CLI
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (_) {}

const app = express();

const { env } = require('./config/env');
const PORT = env.PORT;
const IS_PRODUCTION = env.IS_PRODUCTION;

// Cloudinary configuration (safe no-op if not provided)
const { initCloudinary } = require('./config/cloudinary');
const { createMulter } = require('./config/multer');
const uploadWithErrorHandling = require('./middlewares/upload');
const { getImageUrl } = require('./services/image.service');
const { cloudinary, isConfigured: isCloudinaryConfigured } = initCloudinary();
const { buildHelmet, uploadLimiter, adminLimiter } = require('./config/security');

// CORS
app.use(buildCors({ isProduction: IS_PRODUCTION, whitelist: env.FRONTEND_WHITELIST }));

app.use(express.json());
app.use(buildHelmet());

// Upload storage and static serving for dev
const storage = createMulter().storage;
if (!IS_PRODUCTION) app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper: image URL resolution is provided by services/image.service

// Upload middleware moved to middlewares/upload.js

// Mount API routers
app.use('/api', require('./routes'));

// Test email
app.post('/api/test-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    if (!to || !subject) return res.status(400).json({ error: 'to and subject are required' });
    const result = await emailService.sendEmail(
      to,
      subject,
      `<p>${message || 'This is a test email from Medieval Commanders system.'}</p>`,
      message || 'This is a test email from Medieval Commanders system.'
    );
    if (result.success) return res.json({ success: true, message: 'Test email sent successfully', messageId: result.messageId });
    return res.status(500).json({ success: false, error: result.error });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Small helpers
async function getAdminEmail() {
  try {
    const admin = await prisma.admin.findFirst();
    return admin ? admin.email : process.env.DEFAULT_ADMIN_EMAIL || 'admin@medievalcommanders.com';
  } catch (error) {
    return process.env.DEFAULT_ADMIN_EMAIL || 'admin@medievalcommanders.com';
  }
}

// (health and debug routes moved under /api via routes/*)

// Test upload
app.post('/api/test-upload', uploadLimiter, uploadWithErrorHandling, (req, res) => {
  res.json({
    success: true,
    file: req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : null,
    body: req.body
  });
});

// cards/proposals/admin settings routes moved under routes/*

// Central error handler
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;


