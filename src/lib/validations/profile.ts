import { z } from 'zod';

export const createProfileSchema = z.object({
  displayName: z.string().min(2).max(100),
  handicapIndex: z.number().min(0).max(54).optional(),
  country: z.string().length(2).optional(),
  city: z.string().max(255).optional(),
  bio: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
});

export const updateProfileSchema = createProfileSchema.partial();

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
