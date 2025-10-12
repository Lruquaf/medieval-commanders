const service = require('../../services/proposals.service');
const { getImageUrl } = require('../../services/image.service');

async function list(req, res) {
  const data = await service.listAllAdmin();
  res.json(data);
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

module.exports = { list, approve, reject, remove, update };


