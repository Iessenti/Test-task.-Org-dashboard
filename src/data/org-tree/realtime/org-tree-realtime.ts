import { z } from 'zod';

const metricPatchSchema = z.object({
  headcount: z.number().int().nonnegative().optional(),
  budget: z.number().finite().nonnegative().optional(),
  performance: z.number().min(0).max(100).optional(),
}).strict().refine((metrics) => Object.keys(metrics).length > 0, {
  message: 'A realtime patch must change at least one metric.',
});

export const realtimePatchSchema = z.object({
  type: z.literal('metric.patch'),
  eventId: z.string().min(1),
  sequence: z.number().int().positive(),
  nodeId: z.string().min(1),
  metrics: metricPatchSchema,
  updatedAt: z.string().datetime({ offset: true }),
}).strict();

export type RealtimeMetricPatch = z.infer<typeof realtimePatchSchema>;

export class RealtimePatchValidationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'RealtimePatchValidationError';
  }
}

export function parseRealtimePatch(
  payload: unknown,
  knownNodeIds: ReadonlySet<string>,
): RealtimeMetricPatch {
  let decodedPayload = payload;

  if (typeof payload === 'string') {
    try {
      decodedPayload = JSON.parse(payload) as unknown;
    } catch (error) {
      throw new RealtimePatchValidationError('Realtime patch is not valid JSON.', { cause: error });
    }
  }

  let patch: RealtimeMetricPatch;
  try {
    patch = realtimePatchSchema.parse(decodedPayload);
  } catch (error) {
    throw new RealtimePatchValidationError('Realtime patch failed validation.', { cause: error });
  }

  if (!knownNodeIds.has(patch.nodeId)) {
    throw new RealtimePatchValidationError(`Realtime patch targets unknown node: ${patch.nodeId}`);
  }

  return patch;
}
