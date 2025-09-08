const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('Cleaning database...');
    
    // Delete all cards
    const deletedCards = await prisma.card.deleteMany({});
    console.log(`Deleted ${deletedCards.count} cards`);
    
    // Delete all proposals
    const deletedProposals = await prisma.proposal.deleteMany({});
    console.log(`Deleted ${deletedProposals.count} proposals`);
    
    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
