import { z } from 'zod';

export const attributesSchema = z.object({
  strength: z.number().int().min(0).max(100),
  intelligence: z.number().int().min(0).max(100),
  charisma: z.number().int().min(0).max(100),
  leadership: z.number().int().min(0).max(100),
  attack: z.number().int().min(0).max(100),
  defense: z.number().int().min(0).max(100),
  speed: z.number().int().min(0).max(100),
  health: z.number().int().min(0).max(100),
});

export const cardSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  attributes: attributesSchema,
  tier: z.enum(['Common', 'Rare', 'Epic', 'Legendary', 'Mythic']),
  description: z.string().trim().min(1, 'Description is required'),
  birthYear: z
    .union([z.number().int().min(1).max(2100), z.literal(''), z.undefined()])
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v)))
    .optional(),
  deathYear: z
    .union([z.number().int().min(1).max(2100), z.literal(''), z.undefined()])
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v)))
    .optional(),
});


