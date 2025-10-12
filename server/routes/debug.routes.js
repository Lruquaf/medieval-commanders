const router = require('express').Router();
const prisma = require('../prisma');
const emailService = require('../emailService');
const { env } = require('../config/env');

// Email configuration debug
router.get('/email-config', (req, res) => {
  const config = {
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'NOT SET',
    EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
    EMAIL_FROM: process.env.EMAIL_FROM || 'NOT SET',
    DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    emailServiceConfigured: emailService.isConfigured,
    emailServiceTransporter: emailService.transporter ? 'EXISTS' : 'NULL'
  };
  res.json(config);
});

// Database sample inspection
router.get('/cards', async (req, res) => {
  try {
    const cards = await prisma.card.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
    const cardsWithImages = cards.map(card => ({
      id: card.id,
      name: card.name,
      image: card.image,
      imageType: card.image ? (card.image.startsWith('http') ? 'URL' : card.image.startsWith('data:') ? 'Base64' : 'Other') : 'None',
      imageLength: card.image ? card.image.length : 0
    }));
    res.json({ totalCards: cards.length, sampleCards: cardsWithImages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


