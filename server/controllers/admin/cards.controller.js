const service = require('../../services/cards.service');
const { getImageUrl } = require('../../services/image.service');

async function list(req, res) {
  const data = await service.listAll();
  res.json(data);
}

async function update(req, res) {
  const { id } = req.params;
  const { name, attributes, tier, description, birthDate, deathDate } = req.body;
  const image = req.file ? getImageUrl(req.file) : undefined;
  try {
    const result = await service.update(id, { name, attributes, tier, description, birthDate, deathDate, image });
    res.json(result);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Card not found' });
    res.status(500).json({ error: error.message });
  }
}

async function create(req, res) {
  const { name, attributes, tier, description, birthDate, deathDate } = req.body;
  if (!name || !attributes || !tier || !description) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const image = req.file ? getImageUrl(req.file) : undefined;
    const result = await service.create({ name, attributes, tier, description, birthDate, deathDate, image });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create card', details: error.message });
  }
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    const result = await service.remove(id);
    res.json(result);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Card not found' });
    res.status(500).json({ error: error.message });
  }
}

module.exports = { list, update, create, remove };


