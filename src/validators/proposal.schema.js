import { z } from 'zod';

export const proposalSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().min(1, 'Description is required'),
  proposerName: z.string().trim().optional(),
  proposerInstagram: z.string().trim().optional(),
  birthYear: z
    .union([z.number().int().min(1).max(2100), z.literal(''), z.undefined()])
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v)))
    .optional(),
  deathYear: z
    .union([z.number().int().min(1).max(2100), z.literal(''), z.undefined()])
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v)))
    .optional(),
});


