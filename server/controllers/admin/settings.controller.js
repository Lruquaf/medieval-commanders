const prisma = require('../../prisma');

async function get(req, res) {
  try {
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      return res.json({ email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@medievalcommanders.com', instagramUrl: '', twitterUrl: '', facebookUrl: '', linkedinUrl: '', youtubeUrl: '' });
    }
    res.json({ email: admin.email, instagramUrl: admin.instagramUrl || '', twitterUrl: admin.twitterUrl || '', facebookUrl: admin.facebookUrl || '', linkedinUrl: admin.linkedinUrl || '', youtubeUrl: admin.youtubeUrl || '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    const { email, instagramUrl, twitterUrl, facebookUrl, linkedinUrl, youtubeUrl } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email address is required' });
    let admin = await prisma.admin.findFirst();
    const updateData = { email, instagramUrl: instagramUrl || null, twitterUrl: twitterUrl || null, facebookUrl: facebookUrl || null, linkedinUrl: linkedinUrl || null, youtubeUrl: youtubeUrl || null };
    if (admin) {
      admin = await prisma.admin.update({ where: { id: admin.id }, data: updateData });
    } else {
      admin = await prisma.admin.create({ data: updateData });
    }
    res.json({ email: admin.email, instagramUrl: admin.instagramUrl || '', twitterUrl: admin.twitterUrl || '', facebookUrl: admin.facebookUrl || '', linkedinUrl: admin.linkedinUrl || '', youtubeUrl: admin.youtubeUrl || '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { get, update };


