const service = require('../services/proposals.service');
const emailService = require('../emailService');
const prisma = require('../prisma');
const { getImageUrl } = require('../services/image.service');

async function listAdmin(req, res) {
  const data = await service.listAllAdmin();
  res.json(data);
}

async function listPublic(req, res) {
  const data = await service.listAllPublic();
  res.json(data);
}

async function getById(req, res) {
  const { id } = req.params;
  const item = await service.getById(id);
  if (!item) return res.status(404).json({ error: 'Proposal not found' });
  res.json(item);
}

async function create(req, res) {
  const { name, email, attributes, tier, description, birthDate, deathDate, proposerName, proposerInstagram } = req.body;
  if (!name || !description) return res.status(400).json({ error: 'Missing required fields: name and description are required' });
  const image = req.file ? getImageUrl(req.file) : undefined;
  const proposal = await service.create({ name, email, proposerName, proposerInstagram, attributes, tier, description, birthDate, deathDate, image });
  setImmediate(async () => {
    try {
      const admin = await prisma.admin.findFirst();
      const adminEmail = admin ? admin.email : process.env.DEFAULT_ADMIN_EMAIL || 'admin@medievalcommanders.com';
      await emailService.sendNewProposalNotificationEmail(adminEmail, proposal);
    } catch (_) {}
  });
  res.status(201).json(proposal);
}

async function approve(req, res) {
  const { id } = req.params;
  const result = await service.approve(id);
  if (!result) return res.status(404).json({ error: 'Proposal not found' });
  res.json(result);
}

async function reject(req, res) {
  const { id } = req.params;
  const result = await service.reject(id);
  if (!result) return res.status(404).json({ error: 'Proposal not found' });
  res.json(result);
}

async function remove(req, res) {
  const { id } = req.params;
  const result = await service.remove(id);
  if (!result) return res.status(404).json({ error: 'Proposal not found' });
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
}

async function update(req, res) {
  const { id } = req.params;
  const { name, attributes, tier, description, birthDate, deathDate } = req.body;
  const image = req.file ? getImageUrl(req.file) : undefined;
  const result = await service.update(id, { name, attributes, tier, description, birthDate, deathDate, image });
  if (!result) return res.status(404).json({ error: 'Proposal not found' });
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
}

module.exports = { listAdmin, listPublic, getById, create, approve, reject, remove, update };


