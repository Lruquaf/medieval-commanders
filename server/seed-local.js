const { PrismaClient } = require('./node_modules/.prisma/client-local');

// Initialize Prisma client for local SQLite database
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding local database with sample data...');

  try {
    // Clear existing data
    await prisma.proposal.deleteMany();
    await prisma.card.deleteMany();
    console.log('🧹 Cleared existing data');

    // Create sample cards
    const sampleCards = [
      {
        name: 'Richard the Lionheart',
        email: 'richard@crusades.com',
        image: null, // Will use placeholder
        attributes: JSON.stringify({
          strength: 85,
          intelligence: 70,
          charisma: 90,
          leadership: 95,
          attack: 88,
          defense: 75,
          speed: 70,
          health: 82
        }),
        tier: 'Legendary',
        description: 'King of England and leader of the Third Crusade. Known for his military prowess and strategic brilliance in the Holy Land.',
        status: 'approved'
      },
      {
        name: 'William the Conqueror',
        email: 'william@normandy.com',
        image: null,
        attributes: JSON.stringify({
          strength: 80,
          intelligence: 85,
          charisma: 75,
          leadership: 92,
          attack: 82,
          defense: 80,
          speed: 65,
          health: 85
        }),
        tier: 'Legendary',
        description: 'Duke of Normandy who conquered England in 1066. Revolutionized medieval warfare and established Norman rule.',
        status: 'approved'
      },
      {
        name: 'Saladin',
        email: 'saladin@ayyubid.com',
        image: null,
        attributes: JSON.stringify({
          strength: 78,
          intelligence: 90,
          charisma: 85,
          leadership: 88,
          attack: 80,
          defense: 85,
          speed: 75,
          health: 80
        }),
        tier: 'Legendary',
        description: 'Kurdish Muslim leader who recaptured Jerusalem during the Crusades. Known for his chivalry and military genius.',
        status: 'approved'
      },
      {
        name: 'Alfred the Great',
        email: 'alfred@wessex.com',
        image: null,
        attributes: JSON.stringify({
          strength: 70,
          intelligence: 95,
          charisma: 80,
          leadership: 90,
          attack: 72,
          defense: 88,
          speed: 68,
          health: 75
        }),
        tier: 'Epic',
        description: 'King of Wessex who defended against Viking invasions and promoted learning and literacy.',
        status: 'approved'
      },
      {
        name: 'Joan of Arc',
        email: 'joan@france.com',
        image: null,
        attributes: JSON.stringify({
          strength: 65,
          intelligence: 80,
          charisma: 95,
          leadership: 85,
          attack: 70,
          defense: 75,
          speed: 80,
          health: 70
        }),
        tier: 'Epic',
        description: 'French peasant girl who claimed divine guidance and helped turn the tide of the Hundred Years War.',
        status: 'approved'
      }
    ];

    // Create sample proposals
    const sampleProposals = [
      {
        name: 'Charlemagne',
        email: 'user@example.com',
        image: null,
        attributes: JSON.stringify({
          strength: 82,
          intelligence: 88,
          charisma: 85,
          leadership: 95,
          attack: 80,
          defense: 82,
          speed: 65,
          health: 85
        }),
        tier: 'Legendary',
        description: 'King of the Franks and Emperor of the Romans. United much of Western Europe during the early Middle Ages.',
        status: 'pending'
      },
      {
        name: 'El Cid',
        email: 'user2@example.com',
        image: null,
        attributes: JSON.stringify({
          strength: 85,
          intelligence: 75,
          charisma: 80,
          leadership: 82,
          attack: 90,
          defense: 78,
          speed: 75,
          health: 80
        }),
        tier: 'Epic',
        description: 'Castilian knight and warlord in medieval Spain. Famous for his military campaigns during the Reconquista.',
        status: 'pending'
      }
    ];

    // Insert sample cards
    for (const cardData of sampleCards) {
      await prisma.card.create({ data: cardData });
    }
    console.log(`✅ Created ${sampleCards.length} sample cards`);

    // Insert sample proposals
    for (const proposalData of sampleProposals) {
      await prisma.proposal.create({ data: proposalData });
    }
    console.log(`✅ Created ${sampleProposals.length} sample proposals`);

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Sample data created:');
    console.log(`   - ${sampleCards.length} approved cards`);
    console.log(`   - ${sampleProposals.length} pending proposals`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
