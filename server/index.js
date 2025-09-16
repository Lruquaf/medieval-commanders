const express = require('express');
const multer = require('multer');
const cors = require('cors');
const prisma = require('./prisma');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const emailService = require('./emailService');

const app = express();
const PORT = process.env.PORT || 5001;

// Cloudinary configuration
console.log('Cloudinary config check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? `SET (${process.env.CLOUDINARY_CLOUD_NAME})` : 'NOT SET');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

// Clean up environment variables (remove any whitespace)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

const isCloudinaryConfigured = cloudName && apiKey && apiSecret;

// Helper function to get admin email
async function getAdminEmail() {
  try {
    const admin = await prisma.admin.findFirst();
    return admin ? admin.email : process.env.DEFAULT_ADMIN_EMAIL || 'admin@medievalcommanders.com';
  } catch (error) {
    console.error('Error fetching admin email:', error);
    return process.env.DEFAULT_ADMIN_EMAIL || 'admin@medievalcommanders.com';
  }
}

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log('✅ Cloudinary configured successfully with cloud_name:', cloudName);
} else {
  console.log('❌ Cloudinary not configured - using fallback storage');
  console.log('Missing values:', {
    cloud_name: !cloudName,
    api_key: !apiKey,
    api_secret: !apiSecret
  });
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
          { width: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
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

// Email configuration debug endpoint
app.get('/api/debug/email-config', (req, res) => {
  const config = {
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'NOT SET',
    EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
    EMAIL_FROM: process.env.EMAIL_FROM || 'NOT SET',
    DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    emailServiceConfigured: emailService.isConfigured,
    emailServiceTransporter: emailService.transporter ? 'EXISTS' : 'NULL'
  };
  
  console.log('🔍 Email Configuration Debug:', config);
  res.json(config);
});

// Email test endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject) {
      return res.status(400).json({ error: 'to and subject are required' });
    }

    console.log('🧪 Testing email service...');
    console.log('Email config:', {
      service: process.env.EMAIL_SERVICE,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM,
      configured: emailService.isConfigured
    });

    const result = await emailService.sendEmail(
      to, 
      subject, 
      `<p>${message || 'This is a test email from Medieval Commanders system.'}</p>`,
      message || 'This is a test email from Medieval Commanders system.'
    );

    if (result.success) {
      console.log('✅ Test email sent successfully');
      res.json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId 
      });
    } else {
      console.error('❌ Test email failed:', result.error);
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('❌ Email test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
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
      imageType: card.image ? (card.image.startsWith('http') ? 'URL' : card.image.startsWith('data:') ? 'Base64' : 'Other') : 'None',
      imageLength: card.image ? card.image.length : 0
    }));
    
    res.json({
      totalCards: cards.length,
      sampleCards: cardsWithImages,
      cloudinaryConfig: {
        configured: isCloudinaryConfigured,
        cloudName: cloudName || 'NOT SET',
        apiKey: apiKey ? 'SET' : 'NOT SET',
        apiSecret: apiSecret ? 'SET' : 'NOT SET',
        storageType: isCloudinaryConfigured ? 'Cloudinary' : 'Memory (Base64)'
      },
      serverInfo: {
        nodeEnv: process.env.NODE_ENV,
        port: PORT,
        timestamp: new Date().toISOString()
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
      console.log('File accepted:', file.originalname);
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

// Add multer error handling directly to upload
const uploadWithErrorHandling = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error in middleware:', err);
      console.error('Error message:', err.message);
      console.error('Error name:', err.name);
      console.error('Error code:', err.code);
      console.error('Error stack:', err.stack);
      
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large (max 5MB)' });
        }
        return res.status(400).json({ error: `Multer error: ${err.message}` });
      }
      if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({ error: 'Only image files are allowed!' });
      }
      
      // Handle Cloudinary-specific errors
      if (err.message && err.message.includes('Invalid cloud_name')) {
        return res.status(500).json({ 
          error: 'Image upload service configuration error. Please contact administrator.',
          details: 'Cloudinary configuration issue'
        });
      }
      
      if (err.message && err.message.includes('cloudinary')) {
        return res.status(500).json({ 
          error: 'Image upload service error. Please try again or contact administrator.',
          details: err.message
        });
      }
      
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    next();
  });
};

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
app.post('/api/test-upload', uploadWithErrorHandling, (req, res) => {
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
app.post('/api/proposals', uploadWithErrorHandling, async (req, res) => {
  try {
    const { name, email, attributes, tier, description, birthDate, deathDate } = req.body;
    
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

    // Convert year strings to integers
    const formatYear = (yearString) => {
      if (!yearString || yearString.trim() === '') return null;
      const year = parseInt(yearString);
      if (isNaN(year) || year < 1 || year > 2100) return null;
      return year;
    };

    const proposal = await prisma.proposal.create({
      data: {
        name,
        email,
        image: imageUrl,
        attributes: attributes, // Store as JSON string
        tier,
        description,
        birthYear: formatYear(birthDate),
        deathYear: formatYear(deathDate),
        status: 'pending'
      }
    });

    // Parse attributes for response
    const proposalWithParsedAttributes = {
      ...proposal,
      attributes: JSON.parse(proposal.attributes)
    };

    // Send admin notification email
    try {
      const adminEmail = await getAdminEmail();
      const emailResult = await emailService.sendNewProposalNotificationEmail(adminEmail, proposal);
      if (emailResult.success) {
        console.log('Admin notification email sent successfully');
      } else {
        console.error('Failed to send admin notification email:', emailResult.error);
      }
    } catch (error) {
      console.error('Error sending admin notification email:', error);
    }

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
        birthYear: proposal.birthYear,
        deathYear: proposal.deathYear,
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

    // Send approval email to proposer
    try {
      const emailResult = await emailService.sendProposalApprovalEmail(proposal);
      if (emailResult.success) {
        console.log('Proposal approval email sent successfully');
      } else {
        console.error('Failed to send proposal approval email:', emailResult.error);
      }
    } catch (error) {
      console.error('Error sending proposal approval email:', error);
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

    // Send rejection email to proposer
    try {
      const emailResult = await emailService.sendProposalRejectionEmail(proposal);
      if (emailResult.success) {
        console.log('Proposal rejection email sent successfully');
      } else {
        console.error('Failed to send proposal rejection email:', emailResult.error);
      }
    } catch (error) {
      console.error('Error sending proposal rejection email:', error);
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

// Admin: Update a card
app.put('/api/admin/cards/:id', uploadWithErrorHandling, async (req, res) => {
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
    const { name, attributes, tier, description, birthDate, deathDate } = req.body;
    
    // Convert year strings to integers
    const formatYear = (yearString) => {
      if (!yearString || yearString.trim() === '') return null;
      const year = parseInt(yearString);
      if (isNaN(year) || year < 1 || year > 2100) return null;
      return year;
    };

    const updateData = {};
    if (name) updateData.name = name;
    if (attributes) updateData.attributes = attributes; // Store as JSON string
    if (tier) updateData.tier = tier;
    if (description) updateData.description = description;
    if (birthDate !== undefined) updateData.birthYear = formatYear(birthDate);
    if (deathDate !== undefined) updateData.deathYear = formatYear(deathDate);
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
app.post('/api/admin/cards', uploadWithErrorHandling, async (req, res) => {
  try {
    console.log('=== CARD CREATION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('File field name:', req.file?.fieldname);
    console.log('File original name:', req.file?.originalname);
    console.log('File size:', req.file?.size);
    console.log('File mimetype:', req.file?.mimetype);
    console.log('Cloudinary configured:', isCloudinaryConfigured);
    
    const { name, attributes, tier, description, birthDate, deathDate } = req.body;
    
    // Validate required fields
    if (!name || !attributes || !tier || !description) {
      console.log('Missing required fields:', { name: !!name, attributes: !!attributes, tier: !!tier, description: !!description });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          attributes: !attributes ? 'Attributes are required' : null,
          tier: !tier ? 'Tier is required' : null,
          description: !description ? 'Description is required' : null
        }
      });
    }

    // Validate attributes JSON
    let parsedAttributes;
    try {
      parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid attributes format' });
    }

    // Get image URL based on storage type
    const imageUrl = getImageUrl(req.file);
    if (imageUrl) {
      console.log('Card image processed:', isCloudinaryConfigured ? 'Cloudinary URL' : 'Base64 fallback');
      console.log('Image URL length:', imageUrl.length);
    } else {
      console.log('No image uploaded for card');
    }

    // Convert year strings to integers
    const formatYear = (yearString) => {
      if (!yearString || yearString.trim() === '') return null;
      const year = parseInt(yearString);
      if (isNaN(year) || year < 1 || year > 2100) return null;
      return year;
    };

    const newCard = await prisma.card.create({
      data: {
        name,
        image: imageUrl,
        attributes: typeof attributes === 'string' ? attributes : JSON.stringify(attributes), // Store as JSON string
        tier,
        description,
        birthYear: formatYear(birthDate),
        deathYear: formatYear(deathDate),
        status: 'approved'
      }
    });

    console.log('Card created successfully:', newCard.id);

    // Parse attributes for response
    const cardWithParsedAttributes = {
      ...newCard,
      attributes: JSON.parse(newCard.attributes)
    };

    res.status(201).json(cardWithParsedAttributes);
  } catch (error) {
    console.error('Card creation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create card',
      details: error.message 
    });
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
