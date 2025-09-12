// Debug script for Railway PostgreSQL connection
const { PrismaClient } = require('@prisma/client');

async function debugDatabase() {
  console.log('=== Database Debug Information ===');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      console.log('Database URL parts:');
      console.log('- Protocol:', url.protocol);
      console.log('- Hostname:', url.hostname);
      console.log('- Port:', url.port);
      console.log('- Database:', url.pathname);
      console.log('- Username:', url.username);
      console.log('- Password exists:', !!url.password);
    } catch (error) {
      console.error('Invalid DATABASE_URL format:', error.message);
    }
  }
  
  // Test Prisma connection
  console.log('\n=== Testing Prisma Connection ===');
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: ['query', 'info', 'warn', 'error']
    });
    
    console.log('Prisma Client created successfully');
    
    // Test connection
    await prisma.$connect();
    console.log('✓ Database connection successful');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✓ Test query successful:', result);
    
    await prisma.$disconnect();
    console.log('✓ Database disconnected successfully');
    
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
}

debugDatabase().catch(console.error);
