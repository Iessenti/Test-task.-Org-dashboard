import { z } from 'zod';

export const orgNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
  headcount: z.number().int().nonnegative(),
  budget: z.number().finite().nonnegative(),
  performance: z.number().min(0).max(100),
  updatedAt: z.string(),
});

export const orgTreeSchema = z.array(orgNodeSchema);
