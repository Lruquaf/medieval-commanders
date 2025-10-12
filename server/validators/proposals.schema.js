const { z } = require('zod');

const idParam = z.object({ params: z.object({ id: z.string().min(1) }) });

const createBody = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    email: z.string().email().optional().nullable(),
    attributes: z.union([z.string().min(2), z.record(z.any())]).optional(),
    tier: z.string().optional(),
    birthDate: z.string().optional().nullable(),
    deathDate: z.string().optional().nullable(),
    proposerName: z.string().optional().nullable(),
    proposerInstagram: z.string().optional().nullable()
  })
});

const updateBody = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    attributes: z.union([z.string().min(2), z.record(z.any())]).optional(),
    tier: z.string().optional(),
    birthDate: z.string().optional().nullable(),
    deathDate: z.string().optional().nullable()
  })
});

module.exports = { idParam, createBody, updateBody };


