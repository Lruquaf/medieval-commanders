const { z } = require('zod');

const updateSettingsBody = z.object({
  body: z.object({
    email: z.string().email(),
    instagramUrl: z.string().optional().nullable(),
    twitterUrl: z.string().optional().nullable(),
    facebookUrl: z.string().optional().nullable(),
    linkedinUrl: z.string().optional().nullable(),
    youtubeUrl: z.string().optional().nullable()
  })
});

module.exports = { updateSettingsBody };


