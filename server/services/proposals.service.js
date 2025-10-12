const prisma = require('../prisma');
const { formatYear } = require('../utils/formatYear');

async function listAllAdmin() {
  const all = await prisma.proposal.findMany({
    select: { id: true, name: true, email: true, proposerName: true, proposerInstagram: true, image: true, attributes: true, tier: true, description: true, birthYear: true, deathYear: true, status: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' }
  });
  return all.map((p) => ({ ...p, attributes: safeParse(p.attributes) }));
}

async function listAllPublic() {
  const all = await prisma.proposal.findMany({
    where: { status: 'pending' },
    select: { id: true, name: true, email: true, proposerName: true, proposerInstagram: true, image: true, attributes: true, tier: true, description: true, birthYear: true, deathYear: true, status: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' }
  });
  return all.map((p) => ({ ...p, attributes: safeParse(p.attributes) }));
}

async function getById(id) {
  const p = await prisma.proposal.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      proposerName: true,
      proposerInstagram: true,
      image: true,
      attributes: true,
      tier: true,
      description: true,
      birthYear: true,
      deathYear: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!p) return null;
  return { ...p, attributes: safeParse(p.attributes) };
}

async function create({ name, email, proposerName, proposerInstagram, attributes, tier, description, birthDate, deathDate, image }) {
  const defaultAttributes = JSON.stringify({ strength: 0, intelligence: 0, charisma: 0, leadership: 0, attack: 0, defense: 0, speed: 0, health: 0 });
  const attributesToStore = typeof attributes === 'string' && attributes.trim() !== '' ? attributes : (attributes && typeof attributes === 'object') ? JSON.stringify(attributes) : defaultAttributes;
  const tierToStore = tier && String(tier).trim() !== '' ? tier : 'Common';

  const data = {
    name,
    attributes: attributesToStore,
    tier: tierToStore,
    description,
    birthYear: formatYear(birthDate),
    deathYear: formatYear(deathDate),
    status: 'pending'
  };
  // Ensure email is always a string value; some DBs may have NOT NULL constraint from legacy schema
  const sanitizedEmail = typeof email === 'string' && email.trim() !== '' ? email.trim() : '';
  data.email = sanitizedEmail;
  if (image !== undefined) data.image = image;
  if (proposerName) data.proposerName = proposerName;
  if (proposerInstagram) data.proposerInstagram = proposerInstagram;

  const proposal = await prisma.proposal.create({ data });
  return { ...proposal, attributes: safeParse(proposal.attributes) };
}

async function approve(id) {
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      // email intentionally omitted
      image: true,
      attributes: true,
      tier: true,
      description: true,
      birthYear: true,
      deathYear: true,
      status: true
    }
  });
  if (!proposal) return null;
  const newCard = await prisma.card.create({
    data: {
      name: proposal.name,
      // email omitted
      image: proposal.image,
      attributes: proposal.attributes,
      tier: proposal.tier,
      description: proposal.description,
      birthYear: proposal.birthYear,
      deathYear: proposal.deathYear,
      status: 'approved'
    }
  });
  await prisma.proposal.update({ where: { id }, data: { status: 'approved' } });
  return { ...newCard, attributes: safeParse(newCard.attributes) };
}

async function reject(id) {
  const proposal = await prisma.proposal.findUnique({ where: { id }, select: { id: true } });
  if (!proposal) return null;
  await prisma.proposal.update({ where: { id }, data: { status: 'rejected' } });
  return { message: 'Proposal rejected' };
}

async function remove(id) {
  const proposal = await prisma.proposal.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!proposal) return null;
  if (proposal.status === 'pending') return { error: 'Cannot delete a pending proposal' };
  await prisma.proposal.delete({ where: { id } });
  return { message: 'Proposal deleted' };
}

async function update(id, { name, attributes, tier, description, birthDate, deathDate, image }) {
  const existing = await prisma.proposal.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!existing) return null;
  if (existing.status !== 'pending') return { error: 'Only pending proposals can be edited' };
  const updateData = {};
  if (name) updateData.name = name;
  if (attributes) updateData.attributes = attributes;
  if (tier) updateData.tier = tier;
  if (description) updateData.description = description;
  if (birthDate !== undefined) updateData.birthYear = formatYear(birthDate);
  if (deathDate !== undefined) updateData.deathYear = formatYear(deathDate);
  if (image !== undefined) updateData.image = image;
  const updated = await prisma.proposal.update({ where: { id }, data: updateData });
  return { ...updated, attributes: safeParse(updated.attributes) };
}

function safeParse(val) {
  try { return JSON.parse(val); } catch (_) { return {}; }
}

module.exports = { listAllAdmin, listAllPublic, getById, create, approve, reject, remove, update };


