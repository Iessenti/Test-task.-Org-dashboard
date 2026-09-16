import { z } from 'zod';

const levelSchema = z.enum(['Дивизион', 'Отдел', 'Команда']);

export const aiFilterSchema = z.object({
  nameContains: z.string().trim().min(1).max(100).optional(),
  levels: z.array(levelSchema).min(1).max(3).optional(),
  minPerformance: z.number().finite().min(0).max(100).optional(),
  maxPerformance: z.number().finite().min(0).max(100).optional(),
  minBudget: z.number().finite().min(0).optional(),
  maxBudget: z.number().finite().min(0).optional(),
  minEmployees: z.number().int().min(0).optional(),
  maxEmployees: z.number().int().min(0).optional(),
  sortBy: z.enum(['totalBudget', 'totalEmployees', 'averagePerformance']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
}).strict().superRefine((filter, context) => {
  if (filter.minPerformance !== undefined
    && filter.maxPerformance !== undefined
    && filter.minPerformance > filter.maxPerformance) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['minPerformance'],
      message: 'minPerformance must not exceed maxPerformance',
    });
  }
  if (filter.minBudget !== undefined
    && filter.maxBudget !== undefined
    && filter.minBudget > filter.maxBudget) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['minBudget'],
      message: 'minBudget must not exceed maxBudget',
    });
  }
  if (filter.minEmployees !== undefined
    && filter.maxEmployees !== undefined
    && filter.minEmployees > filter.maxEmployees) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['minEmployees'],
      message: 'minEmployees must not exceed maxEmployees',
    });
  }
  if (filter.sortDirection !== undefined && filter.sortBy === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['sortBy'],
      message: 'sortBy is required when sortDirection is set',
    });
  }
});

export function parseAiFilterResponse(payload) {
  const result = aiFilterSchema.safeParse(payload);
  if (!result.success) {
    const error = new Error('AI provider returned an invalid structured filter');
    error.name = 'AiFilterValidationError';
    error.issues = result.error.issues;
    throw error;
  }
  return result.data;
}
