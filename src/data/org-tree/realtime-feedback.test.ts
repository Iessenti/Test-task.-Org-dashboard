import { describe, expect, it } from 'vitest';
import { applyRealtimeMetricPatch } from './realtime-patch';
import { deriveRealtimeFeedback } from './realtime-feedback';
import type { RealtimeMetricPatch } from './org-tree-realtime';
import { parseOrgSnapshot } from './org-tree-validation';

const snapshot = parseOrgSnapshot([
  { id: 'root', name: 'Root', parentId: null, headcount: 2, budget: 100, performance: 50, updatedAt: '2026-09-15T12:00:00.000Z' },
  { id: 'branch', name: 'Branch', parentId: 'root', headcount: 3, budget: 200, performance: 80, updatedAt: '2026-09-15T12:00:00.000Z' },
  { id: 'hidden-leaf', name: 'Hidden leaf', parentId: 'branch', headcount: 5, budget: 300, performance: 60, updatedAt: '2026-09-15T12:00:00.000Z' },
  { id: 'unrelated', name: 'Unrelated', parentId: 'root', headcount: 4, budget: 400, performance: 40, updatedAt: '2026-09-15T12:00:00.000Z' },
]);

const patch: RealtimeMetricPatch = {
  type: 'metric.patch',
  eventId: 'evt-1',
  sequence: 1,
  nodeId: 'hidden-leaf',
  metrics: { headcount: 8, performance: 90 },
  updatedAt: '2026-09-15T12:00:01.000Z',
};

describe('deriveRealtimeFeedback', () => {
  it('returns raw target and changed aggregate cells through hidden ancestors', () => {
    const transition = applyRealtimeMetricPatch(snapshot, patch);
    const feedback = deriveRealtimeFeedback(snapshot, transition.snapshot, transition);

    expect(feedback).toEqual([
      { nodeId: 'hidden-leaf', field: 'headcount' },
      { nodeId: 'hidden-leaf', field: 'performance' },
      { nodeId: 'hidden-leaf', field: 'totalHeadcount' },
      { nodeId: 'hidden-leaf', field: 'averagePerformance' },
      { nodeId: 'branch', field: 'totalHeadcount' },
      { nodeId: 'branch', field: 'averagePerformance' },
      { nodeId: 'root', field: 'totalHeadcount' },
      { nodeId: 'root', field: 'averagePerformance' },
    ]);
    expect(feedback.some(({ nodeId }) => nodeId === 'unrelated')).toBe(false);
    expect(feedback.some(({ field }) => field === 'totalBudget')).toBe(false);
  });

  it('returns no feedback for a semantic no-op', () => {
    const transition = applyRealtimeMetricPatch(snapshot, {
      ...patch,
      metrics: { headcount: 5 },
    });

    expect(deriveRealtimeFeedback(snapshot, transition.snapshot, transition)).toEqual([]);
  });
});
