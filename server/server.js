const path = require('path');
try { require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); } catch (_) {}

const app = require('./app');
const prisma = require('./prisma');
const { env, validateEnv } = require('./config/env');
const logger = require('./lib/logger');

const PORT = env.PORT;

async function initializeDatabase() {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL environment variable is not set');
  await Promise.race([
    prisma.$connect(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout')), 10000))
  ]);
}

async function start() {
  try {
    try {
      validateEnv();
      await initializeDatabase();
      logger.info('Database initialized successfully');
    } catch (dbErr) {
      logger.warn('Database not available, running without database', { message: dbErr.message });
      logger.info('Some features may not work without database connection');
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check available at: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: String(error && error.message || error) });
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

start();


