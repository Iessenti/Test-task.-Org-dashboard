import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { buildOrganizationTableRows } from '@/features/organization-table/model/table-rows';
import { ORG_TREE_QUERY_KEY } from './org-tree-query';
import { createRealtimeCacheUpdater } from './org-tree-realtime-cache';
import { parseOrgSnapshot } from './org-tree-validation';

const snapshot = parseOrgSnapshot([
  { id: 'root', name: 'Root', parentId: null, headcount: 2, budget: 100, performance: 50, updatedAt: '2026-09-15T12:00:00.000Z' },
  { id: 'leaf', name: 'Leaf', parentId: 'root', headcount: 5, budget: 300, performance: 60, updatedAt: '2026-09-15T12:00:00.000Z' },
]);

const payload = (sequence: number) => ({
  type: 'metric.patch',
  eventId: `evt-${sequence}`,
  sequence,
  nodeId: 'leaf',
  metrics: { headcount: 8 },
  updatedAt: `2026-09-15T12:00:0${sequence}.000Z`,
});

describe('createRealtimeCacheUpdater', () => {
  it('updates query-owned data and derived rows without invalidation or GET', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ORG_TREE_QUERY_KEY, snapshot);
    const updater = createRealtimeCacheUpdater(queryClient);
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const result = updater.applyPayload(payload(1));
    const nextSnapshot = queryClient.getQueryData(ORG_TREE_QUERY_KEY);

    expect(result).toMatchObject({ kind: 'applied', changedMetrics: ['headcount'], affectedIds: ['leaf', 'root'] });
    expect(nextSnapshot?.nodesById.leaf.headcount).toBe(8);
    expect(buildOrganizationTableRows(nextSnapshot!).find((row) => row.id === 'root')?.totalEmployees).toBe(10);
    expect(invalidateQueries).not.toHaveBeenCalled();
    expect(nextSnapshot).not.toBe(snapshot);
  });

  it('does not access cache for invalid payloads and ignores stale patches', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ORG_TREE_QUERY_KEY, snapshot);
    const updater = createRealtimeCacheUpdater(queryClient);

    expect(updater.applyPayload({ ...payload(1), metrics: { parentId: 'other' } }).kind).toBe('invalid');
    updater.applyPayload(payload(1));
    const beforeStale = queryClient.getQueryData(ORG_TREE_QUERY_KEY);
    expect(updater.applyPayload(payload(1))).toEqual({ kind: 'ignored', decision: { kind: 'ignore', reason: 'stale' } });
    expect(queryClient.getQueryData(ORG_TREE_QUERY_KEY)).toBe(beforeStale);
  });
});
