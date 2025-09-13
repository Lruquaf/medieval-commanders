const express = require('express');
const multer = require('multer');
const cors = require('cors');
const prisma = require('./prisma');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 5001;

// Cloudinary configuration
console.log('Cloudinary config check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.log('❌ Cloudinary not configured - using fallback storage');
}

// Helper function to get image URL based on storage type
const getImageUrl = (file) => {
  if (!file) return null;
  
  // Check if file has path (Cloudinary) or buffer (memory storage)
  if (file.path) {
    return file.path; // Cloudinary URL
  } else if (file.buffer) {
    // Fallback: convert to base64
    const base64 = file.buffer.toString('base64');
    const mimeType = file.mimetype;
    return `data:${mimeType};base64,${base64}`;
  }
  
  return null;
};

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

// Cloudinary storage configuration for multer
let storage;
try {
  if (isCloudinaryConfigured) {
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'medieval-commanders',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 800, height: 600, crop: 'fill', quality: 'auto' }
        ]
      }
    });
    console.log('✅ Cloudinary storage configured successfully');
  } else {
    throw new Error('Cloudinary not configured');
  }
} catch (error) {
  console.error('❌ Cloudinary storage failed, using memory storage:', error.message);
  storage = multer.memoryStorage();
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint to check database content
app.get('/api/debug/cards', async (req, res) => {
  try {
    const cards = await prisma.card.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    const cardsWithImages = cards.map(card => ({
      id: card.id,
      name: card.name,
      image: card.image,
      imageType: card.image ? (card.image.startsWith('http') ? 'URL' : card.image.startsWith('data:') ? 'Base64' : 'Other') : 'None'
    }));
    
    res.json({
      totalCards: cards.length,
      sampleCards: cardsWithImages,
      cloudinaryConfig: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
        apiKey: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
        apiSecret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configure multer for file uploads with Cloudinary
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter called:', file.originalname, file.mimetype);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      console.log('File rejected:', file.originalname, file.mimetype);
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add error handling middleware for multer
app.use((error, req, res, next) => {
  console.error('Multer error:', error);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  console.error('Error name:', error.name);
  console.error('Error code:', error.code);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    return res.status(400).json({ error: `Multer error: ${error.message}` });
  }
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed!' });
  }
  next(error);
});

// Test endpoint for file upload
app.post('/api/test-upload', upload.single('image'), (req, res) => {
  console.log('=== TEST UPLOAD DEBUG ===');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('File field name:', req.file?.fieldname);
  console.log('File original name:', req.file?.originalname);
  console.log('File size:', req.file?.size);
  console.log('File mimetype:', req.file?.mimetype);
  console.log('Multer error:', req.multerError);
  
  res.json({
    success: true,
    file: req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : null,
    body: req.body,
    multerError: req.multerError
  });
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
    
    console.log('Fetched cards:', approvedCards.length);
    console.log('Sample card image:', approvedCards[0]?.image);
    
    // Parse attributes JSON for each card
    const cardsWithParsedAttributes = approvedCards.map(card => ({
      ...card,
      attributes: JSON.parse(card.attributes)
    }));
    
    res.json(cardsWithParsedAttributes);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all cards (admin only)
app.get('/api/admin/cards', async (req, res) => {
  try {
    const allCards = await prisma.card.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Fetched admin cards:', allCards.length);
    console.log('Sample admin card image:', allCards[0]?.image);
    
    // Parse attributes JSON for each card
    const cardsWithParsedAttributes = allCards.map(card => ({
      ...card,
      attributes: JSON.parse(card.attributes)
    }));
    
    res.json(cardsWithParsedAttributes);
  } catch (error) {
    console.error('Error fetching admin cards:', error);
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

    // Get image URL based on storage type
    const imageUrl = getImageUrl(req.file);
    if (imageUrl) {
      console.log('Proposal image processed:', isCloudinaryConfigured ? 'Cloudinary' : 'Base64');
    } else {
      console.log('No image uploaded for proposal');
    }

    const proposal = await prisma.proposal.create({
      data: {
        name,
        email,
        image: imageUrl,
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
    console.log('=== CARD UPDATE DEBUG ===');
    console.log('Card ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('File field name:', req.file?.fieldname);
    console.log('File original name:', req.file?.originalname);
    console.log('File size:', req.file?.size);
    console.log('File mimetype:', req.file?.mimetype);
    
    const { id } = req.params;
    const { name, attributes, tier, description } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (attributes) updateData.attributes = attributes; // Store as JSON string
    if (tier) updateData.tier = tier;
    if (description) updateData.description = description;
    if (req.file) {
      updateData.image = getImageUrl(req.file);
      console.log('Card image updated:', isCloudinaryConfigured ? 'Cloudinary' : 'Base64');
    }

    console.log('Update data:', updateData);

    const updatedCard = await prisma.card.update({
      where: { id },
      data: updateData
    });

    console.log('Updated card:', updatedCard);

    // Parse attributes for response
    const cardWithParsedAttributes = {
      ...updatedCard,
      attributes: JSON.parse(updatedCard.attributes)
    };

    res.json(cardWithParsedAttributes);
  } catch (error) {
    console.error('Card update error:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create a new card
app.post('/api/admin/cards', upload.single('image'), async (req, res) => {
  try {
    console.log('=== CARD CREATION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('File field name:', req.file?.fieldname);
    console.log('File original name:', req.file?.originalname);
    console.log('File size:', req.file?.size);
    console.log('File mimetype:', req.file?.mimetype);
    console.log('Multer error:', req.multerError);
    
    const { name, attributes, tier, description } = req.body;
    
    if (!name || !attributes || !tier || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get image URL based on storage type
    const imageUrl = getImageUrl(req.file);
    if (imageUrl) {
      console.log('Card image processed:', isCloudinaryConfigured ? 'Cloudinary' : 'Base64');
    } else {
      console.log('No image uploaded for card');
      console.log('Multer error:', req.multerError);
    }

    const newCard = await prisma.card.create({
      data: {
        name,
        image: imageUrl,
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
