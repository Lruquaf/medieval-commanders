const { PrismaClient } = require('./node_modules/.prisma/client-local');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
});

async function main() {
  console.log('🌱 Seeding local development database (append-only)...');

  try {
    // Safety guard: destructive reseed only if forced
    const hasAnyData = await Promise.all([
      prisma.card.count(), prisma.proposal.count(), prisma.admin.count()
    ]).then(([c, p, a]) => (c + p + a) > 0);

    if (hasAnyData && process.env.FORCE_SEED === '1') {
      console.log('🧹 FORCE_SEED=1 set: wiping existing data...');
      await prisma.proposal.deleteMany();
      await prisma.card.deleteMany();
      await prisma.admin.deleteMany();
    }

    // Ensure admin user exists (create if missing)
    let admin = await prisma.admin.findFirst();
    if (!admin) {
      admin = await prisma.admin.create({
        data: {
          email: 'admin@medievalcommanders.com',
          instagramUrl: 'https://instagram.com/medievalcommanders',
          twitterUrl: 'https://twitter.com/medievalcommanders',
          facebookUrl: 'https://facebook.com/medievalcommanders',
          linkedinUrl: 'https://linkedin.com/company/medievalcommanders',
          youtubeUrl: 'https://youtube.com/@medievalcommanders'
        }
      });
      console.log('✅ Admin user created:', admin.email);
    } else {
      console.log('ℹ️  Admin user exists:', admin.email);
    }

    // Sample medieval commanders data
    const sampleCards = [
      {
        name: "William the Conqueror",
        email: "admin@medievalcommanders.com",
        image: "placeholder-commander.jpg",
        attributes: JSON.stringify({
          strength: 95,
          intelligence: 88,
          charisma: 92,
          leadership: 98,
          tactics: 94
        }),
        tier: "Legendary",
        description: "Duke of Normandy who became King of England after the Norman Conquest of 1066. Known for his military prowess and administrative reforms.",
        birthYear: 1028,
        deathYear: 1087,
        status: "approved"
      },
      {
        name: "Alfred the Great",
        email: "admin@medievalcommanders.com",
        image: "placeholder-commander.jpg",
        attributes: JSON.stringify({
          strength: 85,
          intelligence: 96,
          charisma: 88,
          leadership: 94,
          tactics: 90
        }),
        tier: "Legendary",
        description: "King of Wessex who defended England against Viking invasions and promoted learning and legal reform.",
        birthYear: 849,
        deathYear: 899,
        status: "approved"
      },
      {
        name: "Richard the Lionheart",
        email: "admin@medievalcommanders.com",
        image: "placeholder-commander.jpg",
        attributes: JSON.stringify({
          strength: 98,
          intelligence: 85,
          charisma: 95,
          leadership: 96,
          tactics: 89
        }),
        tier: "Legendary",
        description: "King of England and one of the leaders of the Third Crusade. Known for his courage and military skill.",
        birthYear: 1157,
        deathYear: 1199,
        status: "approved"
      },
      {
        name: "Joan of Arc",
        email: "admin@medievalcommanders.com",
        image: "placeholder-commander.jpg",
        attributes: JSON.stringify({
          strength: 75,
          intelligence: 90,
          charisma: 99,
          leadership: 97,
          tactics: 88
        }),
        tier: "Epic",
        description: "French heroine who led the French army to victory during the Hundred Years' War. Canonized as a saint.",
        birthYear: 1412,
        deathYear: 1431,
        status: "approved"
      },
      {
        name: "Charlemagne",
        email: "admin@medievalcommanders.com",
        image: "placeholder-commander.jpg",
        attributes: JSON.stringify({
          strength: 92,
          intelligence: 95,
          charisma: 94,
          leadership: 99,
          tactics: 96
        }),
        tier: "Legendary",
        description: "King of the Franks and first Holy Roman Emperor. United much of Western Europe and promoted education and culture.",
        birthYear: 742,
        deathYear: 814,
        status: "approved"
      },
      {
        name: "Charles Martel",
        email: "admin@medievalcommanders.com",
        image: "placeholder-commander.jpg",
        attributes: JSON.stringify({
          strength: 92,
          intelligence: 88,
          charisma: 85,
          leadership: 95,
          tactics: 93
        }),
        tier: "Legendary",
        description: "Frankish statesman and military leader; victory at the Battle of Tours (732) halted Umayyad advance into Western Europe.",
        birthYear: 688,
        deathYear: 741,
        status: "approved"
      },
      {
        name: "Saladin",
        email: "admin@medievalcommanders.com",
        image: "placeholder-commander.jpg",
        attributes: JSON.stringify({
          strength: 89,
          intelligence: 96,
          charisma: 93,
          leadership: 98,
          tactics: 97
        }),
        tier: "Legendary",
        description: "First Sultan of Egypt and Syria, founder of the Ayyubid dynasty. Known for his chivalry and military genius.",
        birthYear: 1137,
        deathYear: 1193,
        status: "approved"
      },
      {
        name: "El Cid",
        email: "admin@medievalcommanders.com",
        image: "placeholder-commander.jpg",
        attributes: JSON.stringify({
          strength: 94,
          intelligence: 87,
          charisma: 91,
          leadership: 95,
          tactics: 93
        }),
        tier: "Epic",
        description: "Castilian nobleman and military leader who became a national hero of Spain. Known for his loyalty and military skill.",
        birthYear: 1043,
        deathYear: 1099,
        status: "approved"
      },
      {
        name: "Genghis Khan",
        email: "admin@medievalcommanders.com",
        image: "placeholder-commander.jpg",
        attributes: JSON.stringify({
          strength: 97,
          intelligence: 93,
          charisma: 96,
          leadership: 99,
          tactics: 98
        }),
        tier: "Legendary",
        description: "Founder and first Great Khan of the Mongol Empire. One of the most successful military commanders in history.",
        birthYear: 1162,
        deathYear: 1227,
        status: "approved"
      },
      {
        name: "Eleanor of Aquitaine",
        email: "admin@medievalcommanders.com",
        image: "placeholder-commander.jpg",
        attributes: JSON.stringify({
          strength: 70,
          intelligence: 98,
          charisma: 97,
          leadership: 94,
          tactics: 89
        }),
        tier: "Epic",
        description: "Queen consort of France and England, one of the most powerful women of the Middle Ages. Patron of the arts and literature.",
        birthYear: 1122,
        deathYear: 1204,
        status: "approved"
      }
    ];

    // Helper: find upload file for a given name (slug match, pick most recent)
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, 'uploads');
    const slugify = (str) => String(str)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9\s_-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/-+/g, '_');
    let uploadFiles = [];
    try {
      uploadFiles = fs.readdirSync(uploadsDir).filter(n => n && !n.startsWith('.'));
    } catch (_) {}
    const fileMtime = (f) => {
      try { return fs.statSync(path.join(uploadsDir, f)).mtimeMs || 0; } catch { return 0; }
    };

    // Append-only: create cards if missing (by name), and auto-link uploads
    for (const cardData of sampleCards) {
      const existing = await prisma.card.findFirst({ where: { name: cardData.name } });
      if (existing) {
        // Optionally update image if current is placeholder and there is a matching upload
        const isPlaceholder = !existing.image || existing.image === 'placeholder-commander.jpg' || existing.image === 'placeholder-commander.svg';
        if (isPlaceholder && uploadFiles.length > 0) {
          const slug = slugify(cardData.name);
          const candidates = uploadFiles.filter(f => f.toLowerCase().includes(slug)).sort((a, b) => fileMtime(b) - fileMtime(a));
          if (candidates.length > 0) {
            const newPath = `/uploads/${candidates[0]}`;
            await prisma.card.update({ where: { id: existing.id }, data: { image: newPath } });
            console.log(`🔗 Linked upload for existing card: ${cardData.name} -> ${newPath}`);
          }
        }
        continue;
      }

      // Prepare image: prefer uploads match, else keep provided
      let finalImage = cardData.image;
      if (uploadFiles.length > 0) {
        const slug = slugify(cardData.name);
        const candidates = uploadFiles.filter(f => f.toLowerCase().includes(slug)).sort((a, b) => fileMtime(b) - fileMtime(a));
        if (candidates.length > 0) {
          finalImage = `/uploads/${candidates[0]}`;
        }
      }

      const card = await prisma.card.create({
        data: { ...cardData, image: finalImage }
      });
      console.log(`✅ Card ensured: ${card.name} (${card.tier})`);
    }

    // Create some sample proposals (append-only by name)
    const sampleProposals = [
      {
        name: "Alexander Nevsky",
        email: "user@example.com",
        image: "placeholder-commander.jpg",
        attributes: JSON.stringify({
          strength: 88,
          intelligence: 85,
          charisma: 90,
          leadership: 92,
          tactics: 87
        }),
        tier: "Rare",
        description: "Prince of Novgorod and Grand Prince of Vladimir. Known for his victories against the Teutonic Knights and Swedes.",
        birthYear: 1220,
        deathYear: 1263,
        status: "pending"
      },
      {
        name: "Boudicca",
        email: "user2@example.com",
        image: "placeholder-commander.jpg",
        attributes: JSON.stringify({
          strength: 85,
          intelligence: 88,
          charisma: 95,
          leadership: 93,
          tactics: 82
        }),
        tier: "Epic",
        description: "Queen of the British Celtic Iceni tribe who led an uprising against the Roman Empire in AD 60-61.",
        birthYear: 30,
        deathYear: 61,
        status: "pending"
      }
    ];

    for (const proposalData of sampleProposals) {
      const existing = await prisma.proposal.findFirst({ where: { name: proposalData.name } });
      if (existing) {
        continue;
      }
      const proposal = await prisma.proposal.create({ data: proposalData });
      console.log(`✅ Proposal ensured: ${proposal.name} (${proposal.tier})`);
    }

    console.log('');
    console.log('🎉 Local development database seeded (append-only) successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   👤 Admin users: 1`);
    console.log(`   🃏 Cards: ${sampleCards.length}`);
    console.log(`   📝 Proposals: ${sampleProposals.length}`);
    console.log('');
    console.log('🔑 Admin login: admin@medievalcommanders.com');
    console.log('🚀 Start the server with: npm run dev:local');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e);
    process.exit(1);
  });
