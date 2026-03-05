import { z } from 'zod';

export const searchCoursesSchema = z.object({
  query: z
    .string()
    .min(2, 'Query must be at least 2 characters')
    .max(100, 'Query must be 100 characters or less'),
  country: z.string().length(2, 'Country must be a 2-character code').optional(),
  limit: z.number().int().min(1).max(50).default(20).optional(),
});

export const startRoundSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  teeId: z.string().uuid('Invalid tee ID'),
  roundDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Round date must be in YYYY-MM-DD format'),
});

export const saveHoleScoreSchema = z.object({
  holeNumber: z.number().int().min(1).max(18, 'Hole number must be between 1 and 18'),
  strokes: z.number().int().min(1).max(20, 'Strokes must be between 1 and 20'),
  putts: z.number().int().min(0).max(10, 'Putts must be between 0 and 10').optional(),
  fairwayHit: z.boolean().optional(),
  greenInReg: z.boolean().optional(),
  penaltyStrokes: z
    .number()
    .int()
    .min(0)
    .max(5, 'Penalty strokes must be between 0 and 5')
    .optional(),
  clubUsedOffTee: z.string().uuid('Invalid club ID').optional(),
});

export const completeRoundSchema = z.object({});

export type SearchCoursesInput = z.infer<typeof searchCoursesSchema>;
export type StartRoundInput = z.infer<typeof startRoundSchema>;
export type SaveHoleScoreInput = z.infer<typeof saveHoleScoreSchema>;
export type CompleteRoundInput = z.infer<typeof completeRoundSchema>;
