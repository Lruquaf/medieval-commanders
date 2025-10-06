const { PrismaClient } = require('./node_modules/.prisma/client-local');
const path = require('path');

// Local development Prisma client with SQLite
let prisma;

try {
  // Use local SQLite database
  const localDbUrl = "file:./dev.db";
  
  console.log('🔧 Local Development Mode');
  console.log('📁 Using SQLite database:', localDbUrl);

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: localDbUrl
      }
    },
    log: ['info', 'warn', 'error']
  });

  // Test connection
  prisma.$connect()
    .then(() => {
      console.log('✅ Local SQLite database connected successfully');
    })
    .catch((error) => {
      console.error('❌ Local database connection failed:', error.message);
      console.log('💡 Run: npm run setup:local');
    });

} catch (error) {
  console.error('Failed to initialize local Prisma Client:', error);
  console.log('🔧 Setup commands:');
  console.log('1. npm run setup:local');
  throw error;
}

module.exports = prisma;
