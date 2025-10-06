const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const emailService = require('./emailService');

// Use local Prisma client
const { PrismaClient } = require('./node_modules/.prisma/client-local');
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to get admin email
async function getAdminEmail() {
  try {
    const admin = await prisma.admin.findFirst();
    return admin ? admin.email : process.env.DEFAULT_ADMIN_EMAIL || 'admin@medievalcommanders.com';
  } catch (error) {
    return process.env.DEFAULT_ADMIN_EMAIL || 'admin@medievalcommanders.com';
  }
}

// Local file storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Helper function to get image URL for local storage
const getImageUrl = (file) => {
  if (!file) return null;
  
  // For local development, return the local file URL
  if (file.filename) {
    return `http://localhost:${PORT}/uploads/${file.filename}`;
  }
  
  return null;
};

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Configure multer for local file uploads
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for local development
  }
});

// Error handling middleware
const uploadWithErrorHandling = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large (max 10MB)' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({ error: 'Only image files are allowed!' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    next();
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'local',
    database: 'SQLite',
    storage: 'Local File System'
  });
});

// Debug endpoint
app.get('/api/debug/cards', async (req, res) => {
  try {
    const cards = await prisma.card.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    res.json({
      totalCards: cards.length,
      sampleCards: cards.map(card => ({
        id: card.id,
        name: card.name,
        image: card.image,
        imageType: card.image ? (card.image.startsWith('http') ? 'URL' : 'Other') : 'None'
      })),
      environment: 'local',
      database: 'SQLite',
      storage: 'Local File System',
      uploadsDir: uploadsDir
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all approved cards
app.get('/api/cards', async (req, res) => {
  try {
    const approvedCards = await prisma.card.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' }
    });
    
    const cardsWithParsedAttributes = approvedCards.map(card => ({
      ...card,
      attributes: JSON.parse(card.attributes)
    }));
    
    res.json(cardsWithParsedAttributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all cards (admin only)
app.get('/api/admin/cards', async (req, res) => {
  try {
    const allCards = await prisma.card.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const cardsWithParsedAttributes = allCards.map(card => ({
      ...card,
      attributes: JSON.parse(card.attributes)
    }));
    
    res.json(cardsWithParsedAttributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all proposals (public)
app.get('/api/proposals', async (req, res) => {
  try {
    const allProposals = await prisma.proposal.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const proposalsWithParsedAttributes = allProposals.map(proposal => ({
      ...proposal,
      attributes: JSON.parse(proposal.attributes)
    }));
    
    res.json(proposalsWithParsedAttributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all proposals (admin only)
app.get('/api/admin/proposals', async (req, res) => {
  try {
    const allProposals = await prisma.proposal.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const proposalsWithParsedAttributes = allProposals.map(proposal => ({
      ...proposal,
      attributes: JSON.parse(proposal.attributes)
    }));
    
    res.json(proposalsWithParsedAttributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new card proposal
app.post('/api/proposals', uploadWithErrorHandling, async (req, res) => {
  try {
    const { name, email, attributes, tier, description, birthDate, deathDate, proposerName, proposerInstagram } = req.body;

    // Minimal required fields for simplified local flow
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const imageUrl = getImageUrl(req.file);
    
    // Provide safe defaults for optional legacy fields to keep compatibility
    const defaultAttributes = JSON.stringify({
      strength: 0,
      intelligence: 0,
      charisma: 0,
      leadership: 0,
      attack: 0,
      defense: 0,
      speed: 0,
      health: 0
    });

    const proposal = await prisma.proposal.create({
      data: {
        name,
        email: email || null,
        proposerName: proposerName || null,
        proposerInstagram: proposerInstagram || null,
        image: imageUrl,
        attributes: typeof attributes === 'string' && attributes.trim() !== '' ? attributes : defaultAttributes,
        tier: tier || 'Common',
        description,
        birthYear: birthDate ? parseInt(birthDate) : null,
        deathYear: deathDate ? parseInt(deathDate) : null,
        status: 'pending'
      }
    });

    const proposalWithParsedAttributes = {
      ...proposal,
      attributes: JSON.parse(proposal.attributes)
    };

    // Send admin notification email
    try {
      const adminEmail = await getAdminEmail();
      const emailResult = await emailService.sendNewProposalNotificationEmail(adminEmail, proposal);
      // Email notification sent
    } catch (error) {
      // Email notification failed
    }

    res.status(201).json(proposalWithParsedAttributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create a new card
app.post('/api/admin/cards', uploadWithErrorHandling, async (req, res) => {
  try {
    
    const { name, attributes, tier, description, birthDate, deathDate } = req.body;
    
    if (!name || !attributes || !tier || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const imageUrl = getImageUrl(req.file);
    
    const newCard = await prisma.card.create({
      data: {
        name,
        image: imageUrl,
        attributes: typeof attributes === 'string' ? attributes : JSON.stringify(attributes),
        tier,
        description,
        birthYear: birthDate ? parseInt(birthDate) : null,
        deathYear: deathDate ? parseInt(deathDate) : null,
        status: 'approved'
      }
    });


    const cardWithParsedAttributes = {
      ...newCard,
      attributes: JSON.parse(newCard.attributes)
    };

    res.status(201).json(cardWithParsedAttributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update a card
app.put('/api/admin/cards/:id', uploadWithErrorHandling, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, attributes, tier, description, birthDate, deathDate } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (attributes) updateData.attributes = attributes;
    if (tier) updateData.tier = tier;
    if (description) updateData.description = description;
    if (birthDate !== undefined) updateData.birthYear = birthDate ? parseInt(birthDate) : null;
    if (deathDate !== undefined) updateData.deathYear = deathDate ? parseInt(deathDate) : null;
    if (req.file) {
      updateData.image = getImageUrl(req.file);
    }

    const updatedCard = await prisma.card.update({
      where: { id },
      data: updateData
    });

    const cardWithParsedAttributes = {
      ...updatedCard,
      attributes: JSON.parse(updatedCard.attributes)
    };

    res.json(cardWithParsedAttributes);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete a card
app.delete('/api/admin/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the card to delete the image file
    const card = await prisma.card.findUnique({ where: { id } });
    
    if (card && card.image && card.image.includes('/uploads/')) {
      const filename = path.basename(card.image);
      const filePath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await prisma.card.delete({ where: { id } });

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Local-only: Repair card images by matching filenames in uploads folder
app.post('/api/admin/repair-images', async (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir).filter(name => name && !name.startsWith('.'));

    const slugify = (str) => {
      return String(str)
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9\s_-]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .replace(/-+/g, '_');
    };

    const fileStats = new Map();
    for (const f of files) {
      try {
        const full = path.join(uploadsDir, f);
        const stat = fs.statSync(full);
        fileStats.set(f, stat.mtimeMs || 0);
      } catch (_) {}
    }

    const cards = await prisma.card.findMany();
    const updates = [];

    for (const card of cards) {
      const current = card.image || '';
      if (typeof current === 'string' && current.includes('/uploads/')) continue;

      const slug = slugify(card.name);
      const candidates = files.filter(f => f.toLowerCase().includes(slug));

      if (candidates.length > 0) {
        const picked = candidates.sort((a, b) => (fileStats.get(b) || 0) - (fileStats.get(a) || 0))[0];
        const newPath = `/uploads/${picked}`;

        await prisma.card.update({
          where: { id: card.id },
          data: { image: newPath }
        });

        updates.push({ id: card.id, name: card.name, image: newPath });
      }
    }

    res.json({ updated: updates.length, updates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Approve a proposal
app.post('/api/admin/proposals/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await prisma.proposal.findUnique({ where: { id } });
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const newCard = await prisma.card.create({
      data: {
        name: proposal.name,
        email: proposal.email,
        image: proposal.image,
        attributes: proposal.attributes,
        tier: proposal.tier,
        description: proposal.description,
        birthDate: proposal.birthDate,
        deathDate: proposal.deathDate,
        status: 'approved'
      }
    });

    await prisma.proposal.update({
      where: { id },
      data: { status: 'approved' }
    });

    const cardWithParsedAttributes = {
      ...newCard,
      attributes: JSON.parse(newCard.attributes)
    };

    // Send approval email to proposer
    try {
      const emailResult = await emailService.sendProposalApprovalEmail(proposal);
      // Email notification sent
    } catch (error) {
      // Email notification failed
    }
    
    res.json(cardWithParsedAttributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Reject a proposal
app.post('/api/admin/proposals/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await prisma.proposal.findUnique({ where: { id } });
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    await prisma.proposal.update({
      where: { id },
      data: { status: 'rejected' }
    });

    // Send rejection email to proposer
    try {
      const emailResult = await emailService.sendProposalRejectionEmail(proposal);
      // Email notification sent
    } catch (error) {
      // Email notification failed
    }

    res.json({ message: 'Proposal rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete a proposal (only if approved or rejected)
app.delete('/api/admin/proposals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await prisma.proposal.findUnique({ where: { id } });
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    if (proposal.status === 'pending') {
      return res.status(400).json({ error: 'Cannot delete a pending proposal' });
    }

    await prisma.proposal.delete({ where: { id } });
    res.json({ message: 'Proposal deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update a proposal (edit fields while pending)
app.put('/api/admin/proposals/:id', uploadWithErrorHandling, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, attributes, tier, description, birthDate, deathDate } = req.body;

    const proposal = await prisma.proposal.findUnique({ where: { id } });
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    if (proposal.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending proposals can be edited' });
    }

    const formatYear = (yearString) => {
      if (!yearString || String(yearString).trim() === '') return null;
      const year = parseInt(yearString);
      if (isNaN(year) || year < 1 || year > 2100) return null;
      return year;
    };

    const updateData = {};
    if (name) updateData.name = name;
    if (attributes) updateData.attributes = attributes; // JSON string
    if (tier) updateData.tier = tier;
    if (description) updateData.description = description;
    if (birthDate !== undefined) updateData.birthYear = formatYear(birthDate);
    if (deathDate !== undefined) updateData.deathYear = formatYear(deathDate);
    if (req.file) {
      updateData.image = getImageUrl(req.file);
    }

    const updated = await prisma.proposal.update({ where: { id }, data: updateData });
    const updatedWithParsed = { ...updated, attributes: JSON.parse(updated.attributes) };
    res.json(updatedWithParsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get admin settings
app.get('/api/admin/settings', async (req, res) => {
  try {
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      return res.json({ 
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@medievalcommanders.com',
        instagramUrl: '',
        twitterUrl: '',
        facebookUrl: '',
        linkedinUrl: '',
        youtubeUrl: ''
      });
    }
    res.json({ 
      email: admin.email,
      instagramUrl: admin.instagramUrl || '',
      twitterUrl: admin.twitterUrl || '',
      facebookUrl: admin.facebookUrl || '',
      linkedinUrl: admin.linkedinUrl || '',
      youtubeUrl: admin.youtubeUrl || ''
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update admin settings
app.put('/api/admin/settings', async (req, res) => {
  try {
    const { 
      email, 
      instagramUrl, 
      twitterUrl, 
      facebookUrl, 
      linkedinUrl, 
      youtubeUrl 
    } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    // Check if admin exists
    let admin = await prisma.admin.findFirst();
    
    const updateData = {
      email,
      instagramUrl: instagramUrl || null,
      twitterUrl: twitterUrl || null,
      facebookUrl: facebookUrl || null,
      linkedinUrl: linkedinUrl || null,
      youtubeUrl: youtubeUrl || null
    };
    
    if (admin) {
      // Update existing admin
      admin = await prisma.admin.update({
        where: { id: admin.id },
        data: updateData
      });
    } else {
      // Create new admin
      admin = await prisma.admin.create({
        data: updateData
      });
    }

    res.json({ 
      email: admin.email,
      instagramUrl: admin.instagramUrl || '',
      twitterUrl: admin.twitterUrl || '',
      facebookUrl: admin.facebookUrl || '',
      linkedinUrl: admin.linkedinUrl || '',
      youtubeUrl: admin.youtubeUrl || ''
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  // Server started successfully
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
