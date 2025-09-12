const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./prisma');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// CORS configuration - Temporary permissive setup
const corsOptions = {
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Initialize database connection
async function initializeDatabase() {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Test database connection with timeout
    console.log('Attempting to connect to database...');
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

// Routes

// Get all approved cards
app.get('/api/cards', async (req, res) => {
  try {
    const approvedCards = await prisma.card.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' }
    });
    
    // Parse attributes JSON for each card
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
    
    // Parse attributes JSON for each card
    const cardsWithParsedAttributes = allCards.map(card => ({
      ...card,
      attributes: JSON.parse(card.attributes)
    }));
    
    res.json(cardsWithParsedAttributes);
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
    
    // Parse attributes JSON for each proposal
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
app.post('/api/proposals', upload.single('image'), async (req, res) => {
  try {
    const { name, email, attributes, tier, description } = req.body;
    
    if (!name || !email || !attributes || !tier || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const proposal = await prisma.proposal.create({
      data: {
        name,
        email,
        image: req.file ? `/uploads/${req.file.filename}` : null,
        attributes: attributes, // Store as JSON string
        tier,
        description,
        status: 'pending'
      }
    });

    // Parse attributes for response
    const proposalWithParsedAttributes = {
      ...proposal,
      attributes: JSON.parse(proposal.attributes)
    };

    res.status(201).json(proposalWithParsedAttributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Approve a proposal
app.post('/api/admin/proposals/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await prisma.proposal.findUnique({
      where: { id }
    });
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Create new card from proposal
    const newCard = await prisma.card.create({
      data: {
        name: proposal.name,
        email: proposal.email,
        image: proposal.image,
        attributes: proposal.attributes, // Keep as JSON string
        tier: proposal.tier,
        description: proposal.description,
        status: 'approved'
      }
    });

    // Update proposal status
    await prisma.proposal.update({
      where: { id },
      data: { status: 'approved' }
    });

    // Parse attributes for response
    const cardWithParsedAttributes = {
      ...newCard,
      attributes: JSON.parse(newCard.attributes)
    };
    
    res.json(cardWithParsedAttributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Reject a proposal
app.post('/api/admin/proposals/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await prisma.proposal.findUnique({
      where: { id }
    });
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    await prisma.proposal.update({
      where: { id },
      data: { status: 'rejected' }
    });

    res.json({ message: 'Proposal rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update a card
app.put('/api/admin/cards/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, attributes, tier, description } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (attributes) updateData.attributes = attributes; // Store as JSON string
    if (tier) updateData.tier = tier;
    if (description) updateData.description = description;
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const updatedCard = await prisma.card.update({
      where: { id },
      data: updateData
    });

    // Parse attributes for response
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

// Admin: Create a new card
app.post('/api/admin/cards', upload.single('image'), async (req, res) => {
  try {
    const { name, attributes, tier, description } = req.body;
    
    if (!name || !attributes || !tier || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newCard = await prisma.card.create({
      data: {
        name,
        image: req.file ? `/uploads/${req.file.filename}` : '/uploads/default-commander.jpg',
        attributes: attributes, // Store as JSON string
        tier,
        description,
        status: 'approved'
      }
    });

    // Parse attributes for response
    const cardWithParsedAttributes = {
      ...newCard,
      attributes: JSON.parse(newCard.attributes)
    };

    res.status(201).json(cardWithParsedAttributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete a card
app.delete('/api/admin/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.card.delete({
      where: { id }
    });

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    // Try to initialize database, but don't fail if it's not available
    try {
      await initializeDatabase();
      console.log('Database initialized successfully');
    } catch (dbError) {
      console.warn('Database not available, running without database:', dbError.message);
      console.log('Some features may not work without database connection');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
