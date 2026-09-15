import { describe, expect, it } from 'vitest';
import { applyRealtimeMetricPatch } from './realtime-patch';
import { parseRealtimePatch, RealtimePatchValidationError, type RealtimeMetricPatch } from './org-tree-realtime';
import { parseOrgSnapshot } from './org-tree-validation';

const snapshot = parseOrgSnapshot([
  { id: 'root', name: 'Root', parentId: null, headcount: 2, budget: 100, performance: 50, updatedAt: '2026-09-15T12:00:00.000Z' },
  { id: 'branch', name: 'Branch', parentId: 'root', headcount: 3, budget: 200, performance: 80, updatedAt: '2026-09-15T12:00:00.000Z' },
  { id: 'leaf', name: 'Leaf', parentId: 'branch', headcount: 5, budget: 300, performance: 60, updatedAt: '2026-09-15T12:00:00.000Z' },
  { id: 'other', name: 'Other', parentId: 'root', headcount: 4, budget: 400, performance: 40, updatedAt: '2026-09-15T12:00:00.000Z' },
]);
const patch: RealtimeMetricPatch = {
  type: 'metric.patch',
  eventId: 'evt-1',
  sequence: 1,
  nodeId: 'leaf',
  metrics: { headcount: 8, performance: 90 },
  updatedAt: '2026-09-15T12:00:01.000Z',
};

describe('applyRealtimeMetricPatch', () => {
  it('applies a valid metric patch immutably and preserves topology', () => {
    const result = applyRealtimeMetricPatch(snapshot, patch);

    expect(result.affectedIds).toEqual(['leaf', 'branch', 'root']);
    expect(result.changedMetrics).toEqual(['headcount', 'performance']);
    expect(result.snapshot.nodesById.leaf).toMatchObject({ headcount: 8, performance: 90 });
    expect(result.snapshot.aggregatesById.root).toEqual({ totalHeadcount: 17, totalBudget: 1000, weightedPerformanceSum: 1220 });
    expect(result.snapshot.rootIds).toBe(snapshot.rootIds);
    expect(result.snapshot.childrenByParentId).toBe(snapshot.childrenByParentId);
    expect(result.snapshot.depthById).toBe(snapshot.depthById);
    expect(result.snapshot.nodesById.other).toBe(snapshot.nodesById.other);
    expect(result.snapshot.aggregatesById.other).toBe(snapshot.aggregatesById.other);
    expect(result.snapshot).not.toBe(snapshot);
  });

  it('returns the same snapshot for a semantic metric no-op', () => {
    const result = applyRealtimeMetricPatch(snapshot, {
      ...patch,
      metrics: { headcount: 5 },
      updatedAt: '2026-09-15T12:01:00.000Z',
    });

    expect(result.snapshot).toBe(snapshot);
    expect(result.affectedIds).toEqual([]);
    expect(result.changedMetrics).toEqual([]);
  });

  it('rejects topology changes before a transition can reach the snapshot', () => {
    expect(() => parseRealtimePatch({ ...patch, parentId: 'other' }, new Set(['leaf']))).toThrow(RealtimePatchValidationError);
    expect(() => parseRealtimePatch({ ...patch, metrics: { parentId: 'other' } }, new Set(['leaf']))).toThrow(RealtimePatchValidationError);
  });
});
