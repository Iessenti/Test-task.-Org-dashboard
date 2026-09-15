import { describe, expect, it, vi } from 'vitest';
import { createRealtimeReconciler } from './realtime-reconciliation';
import type { RealtimeMetricPatch } from './org-tree-realtime';

const patch = (sequence: number, updatedAt: string, nodeId = 'node-1'): RealtimeMetricPatch => ({
  type: 'metric.patch',
  eventId: `evt-${sequence}`,
  sequence,
  nodeId,
  metrics: { performance: 80 + sequence },
  updatedAt,
});

const node = (updatedAt: string) => ({
  id: 'node-1',
  name: 'Node',
  parentId: null,
  headcount: 1,
  budget: 1,
  performance: 1,
  updatedAt,
});

describe('createRealtimeReconciler', () => {
  it('establishes the starting position from the first event after a page load', () => {
    const reconciler = createRealtimeReconciler({ onGap: vi.fn() });

    expect(reconciler.acceptPatch(patch(23, '2026-09-15T12:00:23.000Z'))).toEqual({
      kind: 'apply',
      renewsFreshness: true,
    });
    expect(reconciler.getLastAppliedSequence()).toBe(23);
  });

  it('applies contiguous patches, ignores stale duplicates, and recovers gaps', () => {
    const onGap = vi.fn();
    const reconciler = createRealtimeReconciler({ onGap });

    expect(reconciler.acceptPatch(patch(1, '2026-09-15T12:00:01.000Z'))).toEqual({
      kind: 'apply',
      renewsFreshness: true,
    });
    expect(reconciler.acceptPatch(patch(1, '2026-09-15T12:00:01.000Z'))).toEqual({
      kind: 'ignore',
      reason: 'stale',
    });
    expect(reconciler.acceptPatch(patch(3, '2026-09-15T12:00:03.000Z'))).toEqual({
      kind: 'recover',
      lastAppliedSequence: 1,
      receivedSequence: 3,
      lastEventId: 'evt-1',
    });
    expect(onGap).toHaveBeenCalledWith({
      lastAppliedSequence: 1,
      receivedSequence: 3,
      lastEventId: 'evt-1',
    });
    expect(reconciler.acceptRecovery(3)).toEqual({ resumeFromEventId: 'evt-3', sequence: 3 });
    expect(reconciler.acceptPatch(patch(4, '2026-09-15T12:00:04.000Z'))).toEqual({
      kind: 'apply',
      renewsFreshness: true,
    });
    expect(reconciler.getLastAppliedSequence()).toBe(4);
  });

  it('protects newer patched values from an older in-flight GET', () => {
    const reconciler = createRealtimeReconciler({ onGap: vi.fn() });
    reconciler.acceptPatch(patch(1, '2026-09-15T12:00:02.000Z'));

    expect(reconciler.shouldUseFullResponseNode(node('2026-09-15T12:00:01.000Z'))).toBe(false);
    expect(reconciler.shouldUseFullResponseNode(node('2026-09-15T12:00:02.000Z'))).toBe(true);
    expect(reconciler.shouldUseFullResponseNode(node('2026-09-15T12:00:03.000Z'))).toBe(true);
  });

  it('rejects backwards recovery watermarks', () => {
    const reconciler = createRealtimeReconciler({ onGap: vi.fn() });
    reconciler.acceptPatch(patch(1, '2026-09-15T12:00:01.000Z'));

    expect(() => reconciler.acceptRecovery(0)).toThrow(/must not move backwards/);
  });
});
