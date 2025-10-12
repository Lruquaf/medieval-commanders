const prisma = require('../prisma');
const { formatYear } = require('../utils/formatYear');
const { deleteImageByUrl } = require('./image.service');

async function listApproved() {
  const approvedCards = await prisma.card.findMany({ where: { status: 'approved' }, orderBy: { createdAt: 'desc' } });
  return approvedCards.map((card) => ({ ...card, attributes: safeParse(card.attributes) }));
}

async function listAll() {
  const allCards = await prisma.card.findMany({ orderBy: { createdAt: 'desc' } });
  return allCards.map((card) => ({ ...card, attributes: safeParse(card.attributes) }));
}

async function getById(id) {
  const card = await prisma.card.findUnique({ where: { id } });
  if (!card) return null;
  return { ...card, attributes: safeParse(card.attributes) };
}

async function update(id, { name, attributes, tier, description, birthDate, deathDate, image }) {
  const existing = await prisma.card.findUnique({ where: { id } });
  const updateData = {};
  if (name) updateData.name = name;
  if (attributes) updateData.attributes = attributes;
  if (tier) updateData.tier = tier;
  if (description) updateData.description = description;
  if (birthDate !== undefined) updateData.birthYear = formatYear(birthDate);
  if (deathDate !== undefined) updateData.deathYear = formatYear(deathDate);
  if (image !== undefined) updateData.image = image;
  const updated = await prisma.card.update({ where: { id }, data: updateData });
  if (existing && image !== undefined && existing.image && existing.image !== image) {
    try { await deleteImageByUrl(existing.image); } catch (_) {}
  }
  return { ...updated, attributes: safeParse(updated.attributes) };
}

async function create({ name, attributes, tier, description, birthDate, deathDate, image }) {
  const newCard = await prisma.card.create({
    data: {
      name,
      image,
      attributes: typeof attributes === 'string' ? attributes : JSON.stringify(attributes),
      tier,
      description,
      birthYear: formatYear(birthDate),
      deathYear: formatYear(deathDate),
      status: 'approved'
    }
  });
  return { ...newCard, attributes: safeParse(newCard.attributes) };
}

async function remove(id) {
  const existing = await prisma.card.findUnique({ where: { id } });
  const deleted = await prisma.card.delete({ where: { id } });
  if (existing && existing.image) {
    try { await deleteImageByUrl(existing.image); } catch (_) {}
  }
  return { message: 'Card deleted successfully' };
}

function safeParse(val) {
  try { return JSON.parse(val); } catch (_) { return {}; }
}

module.exports = { listApproved, listAll, update, create, remove };


