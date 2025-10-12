// Prefer local client (with server/schema.local.prisma) if available; fall back to default
let PrismaClient;
try {
  // eslint-disable-next-line import/no-unresolved
  ({ PrismaClient } = require('.prisma/client-local'));
} catch (_) {
  ({ PrismaClient } = require('@prisma/client'));
}
const path = require('path');
const logger = require('./logger');
const { env } = require('../config/env');

let prisma;

function normalizeDbUrl(url) {
  if (!url) return url;
  try {
    if (url.startsWith('file:')) {
      const rawPath = url.replace(/^file:/, '');
      if (!rawPath.startsWith('/') && !rawPath.startsWith('\\')) {
        // Resolve relative SQLite file path to the project-level prisma/dev.db
        const absolute = path.join(__dirname, '..', '..', 'prisma', 'dev.db');
        return 'file:' + absolute;
      }
    }
  } catch (_) {}
  return url;
}

function createClient() {
  const dbUrl = normalizeDbUrl(env.DATABASE_URL);
  return new PrismaClient({ datasources: { db: { url: dbUrl } }, log: ['query', 'info', 'warn', 'error'] });
}

try {
  prisma = createClient();
  prisma.$connect()
    .then(() => {
      logger.info('✓ Database connection established');
    })
    .catch((error) => {
      logger.error('✗ Database connection failed', { message: error.message, code: error.code, meta: error.meta });
    });
} catch (error) {
  logger.error('Failed to initialize Prisma Client', { error: String(error && error.message || error) });
  throw error;
}

module.exports = prisma;


