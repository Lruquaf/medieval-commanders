const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { adminLimiter } = require('../config/security');

router.post('/login', adminLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password are required' });

  const valid = username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD;
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ role: 'admin', username }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  return res.json({ token, expiresIn: env.JWT_EXPIRES_IN });
});

module.exports = router;


