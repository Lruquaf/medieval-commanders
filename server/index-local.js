const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const emailService = require('./emailService');

// Use local Prisma client
const { PrismaClient } = require('@prisma/client');
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
    const { name, email, attributes, tier, description, birthDate, deathDate } = req.body;
    
    if (!name || !email || !attributes || !tier || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const imageUrl = getImageUrl(req.file);
    
    const proposal = await prisma.proposal.create({
      data: {
        name,
        email,
        image: imageUrl,
        attributes: attributes,
        tier,
        description,
        birthDate: birthDate ? new Date(`${birthDate}-01-01`) : null,
        deathDate: deathDate ? new Date(`${deathDate}-01-01`) : null,
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
        birthDate: birthDate ? new Date(`${birthDate}-01-01`) : null,
        deathDate: deathDate ? new Date(`${deathDate}-01-01`) : null,
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
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(`${birthDate}-01-01`) : null;
    if (deathDate !== undefined) updateData.deathDate = deathDate ? new Date(`${deathDate}-01-01`) : null;
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

// Admin: Get admin settings
app.get('/api/admin/settings', async (req, res) => {
  try {
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      return res.json({ email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@medievalcommanders.com' });
    }
    res.json({ email: admin.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update admin email
app.put('/api/admin/settings', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    // Check if admin exists
    let admin = await prisma.admin.findFirst();
    
    if (admin) {
      // Update existing admin
      admin = await prisma.admin.update({
        where: { id: admin.id },
        data: { email }
      });
    } else {
      // Create new admin
      admin = await prisma.admin.create({
        data: { email }
      });
    }

    res.json({ email: admin.email });
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
