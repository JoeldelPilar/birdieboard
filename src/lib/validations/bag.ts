import { z } from 'zod';

const CLUB_TYPES = [
  'driver',
  '3_wood',
  '5_wood',
  '7_wood',
  '2_hybrid',
  '3_hybrid',
  '4_hybrid',
  '5_hybrid',
  '2_iron',
  '3_iron',
  '4_iron',
  '5_iron',
  '6_iron',
  '7_iron',
  '8_iron',
  '9_iron',
  'pitching_wedge',
  'gap_wedge',
  'sand_wedge',
  'lob_wedge',
  'putter',
] as const;

export const createBagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
});

export const updateBagSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .optional(),
});

export const createClubSchema = z.object({
  clubType: z.enum(CLUB_TYPES, 'Invalid club type'),
  brand: z.string().min(1, 'Brand is required').max(100, 'Brand must be 100 characters or less'),
  model: z.string().min(1, 'Model is required').max(100, 'Model must be 100 characters or less'),
  loft: z.number().min(0).max(80).optional(),
  carryDistance: z.number().int().min(0).max(400).optional(),
  totalDistance: z.number().int().min(0).max(500).optional(),
  shaftType: z.enum(['steel', 'graphite']).optional(),
  shaftFlex: z.enum(['ladies', 'senior', 'regular', 'stiff', 'x_stiff']).optional(),
});

export const updateClubSchema = z.object({
  clubType: z.enum(CLUB_TYPES, 'Invalid club type').optional(),
  brand: z
    .string()
    .min(1, 'Brand is required')
    .max(100, 'Brand must be 100 characters or less')
    .optional(),
  model: z
    .string()
    .min(1, 'Model is required')
    .max(100, 'Model must be 100 characters or less')
    .optional(),
  loft: z.number().min(0).max(80).optional(),
  carryDistance: z.number().int().min(0).max(400).optional(),
  totalDistance: z.number().int().min(0).max(500).optional(),
  shaftType: z.enum(['steel', 'graphite']).optional(),
  shaftFlex: z.enum(['ladies', 'senior', 'regular', 'stiff', 'x_stiff']).optional(),
});

export const reorderClubsSchema = z.array(
  z.object({
    clubId: z.string().uuid('Invalid club ID'),
    sortOrder: z.number().int().min(0),
  }),
);

export type CreateBagInput = z.infer<typeof createBagSchema>;
export type UpdateBagInput = z.infer<typeof updateBagSchema>;
export type CreateClubInput = z.infer<typeof createClubSchema>;
export type UpdateClubInput = z.infer<typeof updateClubSchema>;
export type ReorderClubsInput = z.infer<typeof reorderClubsSchema>;
