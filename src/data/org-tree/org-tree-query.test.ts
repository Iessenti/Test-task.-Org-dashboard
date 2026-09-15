import { describe, expect, it, vi } from 'vitest';
import * as aggregation from './org-tree-aggregation';
import { reconcileOrgSnapshots } from './org-tree-query';
import { parseOrgSnapshot } from './org-tree-validation';

const payload = [
  {
    id: 'root',
    name: 'Root',
    parentId: null,
    headcount: 2,
    budget: 100,
    performance: 50,
    updatedAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'child',
    name: 'Child',
    parentId: 'root',
    headcount: 3,
    budget: 200,
    performance: 80,
    updatedAt: '2026-09-15T00:00:00.000Z',
  },
];

describe('organization snapshot reconciliation', () => {
  it('accepts a changed full snapshot with its computed aggregates', () => {
    const previous = parseOrgSnapshot(payload);
    const next = parseOrgSnapshot(payload.map((node) =>
      node.id === 'child' ? { ...node, headcount: 5 } : node,
    ));

    const accepted = reconcileOrgSnapshots(previous, next);

    expect(accepted).toBe(next);
    expect(accepted.aggregatesById.root).toEqual({
      totalHeadcount: 7,
      totalBudget: 300,
      weightedPerformanceSum: 500,
    });
  });

  it('retains the current snapshot and aggregates for a semantic no-op', () => {
    const previous = parseOrgSnapshot(payload);
    const sameDataInDifferentOrder = parseOrgSnapshot([...payload].reverse());

    const accepted = reconcileOrgSnapshots(previous, sameDataInDifferentOrder);

    expect(accepted).toBe(previous);
    expect(accepted.aggregatesById).toBe(previous.aggregatesById);
  });

  it('reuses aggregates when the accepted snapshot is reconciled repeatedly', () => {
    const aggregateSpy = vi.spyOn(aggregation, 'calculateOrgAggregates');
    const snapshot = parseOrgSnapshot(payload);
    const callsAfterAcceptance = aggregateSpy.mock.calls.length;

    const firstRerender = reconcileOrgSnapshots(snapshot, snapshot);
    const secondRerender = reconcileOrgSnapshots(firstRerender, snapshot);

    expect(secondRerender).toBe(snapshot);
    expect(secondRerender.aggregatesById).toBe(snapshot.aggregatesById);
    expect(aggregateSpy).toHaveBeenCalledTimes(callsAfterAcceptance);
    aggregateSpy.mockRestore();
  });
});
