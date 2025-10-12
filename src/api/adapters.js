import { DEFAULT_ATTRIBUTES } from './models';

const coerceNumber = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const ensureAttributesObject = (value) => {
  if (!value) return { ...DEFAULT_ATTRIBUTES };
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return { ...DEFAULT_ATTRIBUTES, ...(parsed || {}) };
    } catch (_) {
      return { ...DEFAULT_ATTRIBUTES };
    }
  }
  if (typeof value === 'object') {
    return { ...DEFAULT_ATTRIBUTES, ...value };
  }
  return { ...DEFAULT_ATTRIBUTES };
};

export const normalizeCard = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const attributes = ensureAttributesObject(raw.attributes);
  return {
    id: raw.id,
    name: String(raw.name || '').trim(),
    image: raw.image || undefined,
    attributes,
    tier: raw.tier || 'Common',
    description: raw.description || '',
    birthYear: coerceNumber(raw.birthYear),
    deathYear: coerceNumber(raw.deathYear),
    status: raw.status || undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

export const normalizeProposal = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const attributes = ensureAttributesObject(raw.attributes);
  return {
    id: raw.id,
    name: String(raw.name || '').trim(),
    image: raw.image || undefined,
    attributes,
    tier: raw.tier || 'Common',
    description: raw.description || '',
    birthYear: coerceNumber(raw.birthYear),
    deathYear: coerceNumber(raw.deathYear),
    status: raw.status || 'pending',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    proposerName: raw.proposerName || undefined,
    proposerInstagram: raw.proposerInstagram || undefined,
    email: raw.email || undefined,
  };
};

export const normalizeAdminSettings = (raw) => {
  const data = raw && typeof raw === 'object' ? raw : {};
  return {
    email: data.email || '',
    instagramUrl: data.instagramUrl || '',
    twitterUrl: data.twitterUrl || '',
    facebookUrl: data.facebookUrl || '',
    linkedinUrl: data.linkedinUrl || '',
    youtubeUrl: data.youtubeUrl || '',
  };
};


