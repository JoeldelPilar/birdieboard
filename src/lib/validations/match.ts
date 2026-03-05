import { z } from 'zod';

export const createMatchSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or less'),
  courseId: z.string().uuid('Invalid course ID'),
  matchDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Match date must be a valid ISO date string (YYYY-MM-DD)'),
  teeTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Tee time must be in HH:MM format')
    .optional(),
  format: z.enum(['stroke_play', 'match_play', 'stableford', 'skins'], {
    error: 'Format must be one of: stroke_play, match_play, stableford, skins',
  }),
  scoringType: z.enum(['gross', 'net'], {
    error: 'Scoring type must be gross or net',
  }),
  maxPlayers: z.number().int().min(2).max(20).default(4),
  isPrivate: z.boolean().default(false),
});

export const updateMatchSchema = createMatchSchema.partial();

export const inviteToMatchSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
export type InviteToMatchInput = z.infer<typeof inviteToMatchSchema>;
