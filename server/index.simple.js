const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL, 
        'https://medieval-commanders.vercel.app',
        'https://medieval-commanders-git-main-lruquafs-projects.vercel.app',
        'https://medieval-commanders-q1zz3mdwj-lruquafs-projects.vercel.app',
        'https://medieval-commanders-app.vercel.app',
        'https://medieval-commanders-collection.vercel.app',
        'https://medieval-commanders-q2shk0jcz-lruquafs-projects.vercel.app',
        'https://your-frontend-domain.vercel.app', 
        'https://your-frontend-domain.netlify.app'
      ].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  });
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

// Try to load Prisma, but don't fail if it's not available
let prisma = null;
try {
  prisma = require('./prisma');
  console.log('Prisma client loaded successfully');
} catch (error) {
  console.log('Prisma client not available:', error.message);
}

// Mock data for when Prisma is not available
const mockCards = [
  {
    id: '1',
    name: 'Richard the Lionheart',
    email: 'richard@example.com',
    image: '/placeholder-commander.jpg',
    attributes: JSON.stringify({
      strength: 85,
      intelligence: 70,
      charisma: 90,
      leadership: 95
    }),
    tier: 'Legendary',
    description: 'King of England and leader of the Third Crusade',
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockProposals = [];

// Helper function to get data
const getCards = async () => {
  if (prisma) {
    try {
      return await prisma.card.findMany({
        where: { status: 'approved' }
      });
    } catch (error) {
      console.log('Database error, using mock data:', error.message);
      return mockCards;
    }
  }
  return mockCards;
};

const getProposals = async () => {
  if (prisma) {
    try {
      return await prisma.proposal.findMany();
    } catch (error) {
      console.log('Database error, using mock data:', error.message);
      return mockProposals;
    }
  }
  return mockProposals;
};

// API Routes
app.get('/api/cards', async (req, res) => {
  try {
    const cards = await getCards();
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

app.post('/api/proposals', upload.single('image'), async (req, res) => {
  try {
    const { name, email, attributes, tier, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    const proposalData = {
      name,
      email,
      image,
      attributes,
      tier,
      description,
      status: 'pending'
    };

    if (prisma) {
      try {
        const proposal = await prisma.proposal.create({
          data: proposalData
        });
        res.json(proposal);
      } catch (error) {
        console.log('Database error, using mock response:', error.message);
        res.json({ ...proposalData, id: Date.now().toString() });
      }
    } else {
      res.json({ ...proposalData, id: Date.now().toString() });
    }
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// Admin routes
app.get('/api/admin/cards', async (req, res) => {
  try {
    const cards = await getCards();
    res.json(cards);
  } catch (error) {
    console.error('Error fetching admin cards:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

app.get('/api/admin/proposals', async (req, res) => {
  try {
    const proposals = await getProposals();
    res.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// Admin: Update a proposal (simple server)
app.put('/api/admin/proposals/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, attributes, tier, description, birthDate, deathDate } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (prisma) {
      // With prisma available
      const existing = await prisma.proposal.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Proposal not found' });
      }
      if (existing.status !== 'pending') {
        return res.status(400).json({ error: 'Only pending proposals can be edited' });
      }
      const updateData = {};
      if (name) updateData.name = name;
      if (attributes) updateData.attributes = attributes;
      if (tier) updateData.tier = tier;
      if (description) updateData.description = description;
      if (birthDate !== undefined) updateData.birthYear = birthDate ? parseInt(birthDate) : null;
      if (deathDate !== undefined) updateData.deathYear = deathDate ? parseInt(deathDate) : null;
      if (image !== undefined) updateData.image = image;
      const updated = await prisma.proposal.update({ where: { id }, data: updateData });
      return res.json(updated);
    }

    // Fallback: update mock data
    const idx = mockProposals.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    const existing = mockProposals[idx];
    const updated = {
      ...existing,
      name: name ?? existing.name,
      attributes: attributes ?? existing.attributes,
      tier: tier ?? existing.tier,
      description: description ?? existing.description,
      birthYear: birthDate !== undefined ? (birthDate ? parseInt(birthDate) : null) : existing.birthYear,
      deathYear: deathDate !== undefined ? (deathDate ? parseInt(deathDate) : null) : existing.deathYear,
      image: image !== undefined ? image : existing.image,
      updatedAt: new Date()
    };
    mockProposals[idx] = updated;
    res.json(updated);
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ error: 'Failed to update proposal' });
  }
});

// Admin: Delete a proposal (simple server)
app.delete('/api/admin/proposals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (prisma) {
      const existing = await prisma.proposal.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'Proposal not found' });
      if (existing.status === 'pending') {
        return res.status(400).json({ error: 'Cannot delete a pending proposal' });
      }
      await prisma.proposal.delete({ where: { id } });
      return res.json({ message: 'Proposal deleted' });
    }
    const idx = mockProposals.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Proposal not found' });
    if (mockProposals[idx].status === 'pending') {
      return res.status(400).json({ error: 'Cannot delete a pending proposal' });
    }
    mockProposals.splice(idx, 1);
    res.json({ message: 'Proposal deleted' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});
