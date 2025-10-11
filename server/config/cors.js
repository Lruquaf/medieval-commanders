const cors = require('cors');

function buildCors({ isProduction, whitelist }) {
  if (isProduction) {
    const allowed = Array.isArray(whitelist) ? whitelist : [];
    return cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowed.length === 0 || allowed.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    });
  }

  return cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });
}

module.exports = { buildCors };


