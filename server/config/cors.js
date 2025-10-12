const cors = require('cors');

function normalizeOrigin(value) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  // Remove trailing slash and lowercase for strict compare
  return trimmed.replace(/\/$/, '').toLowerCase();
}

function buildCors({ isProduction, whitelist }) {
  if (isProduction) {
    // Hardcode known production frontends here. Also include any provided FRONTEND_URL entries.
    const hardcoded = [
      'https://medcomtest.netlify.app'
    ];
    const allowed = (
      (Array.isArray(whitelist) ? whitelist : [])
        .map(normalizeOrigin)
        .filter(Boolean)
    ).concat(hardcoded.map(normalizeOrigin));

    return cors({
      origin: (origin, callback) => {
        // Allow non-browser or same-origin requests (no Origin header)
        if (!origin) return callback(null, true);

        const incoming = normalizeOrigin(origin);
        const isAllowed = allowed.length === 0 || allowed.includes(incoming);

        // Do NOT throw; returning false avoids 500 and simply omits CORS headers
        return callback(null, isAllowed);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      optionsSuccessStatus: 200
    });
  }

  return cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
  });
}

module.exports = { buildCors };


