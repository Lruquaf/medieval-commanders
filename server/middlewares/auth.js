const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = jwt.verify(token, env.JWT_SECRET);
    if (!payload || payload.role !== 'admin') return res.status(401).json({ error: 'Unauthorized' });

    req.admin = { username: payload.username };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { authenticateAdmin };


