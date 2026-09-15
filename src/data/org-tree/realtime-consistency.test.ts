import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { buildOrganizationTableRows } from '@/features/organization-table/model/table-rows';
import { ORG_TREE_QUERY_KEY, reconcileOrgSnapshots } from './org-tree-query';
import { createRealtimeCacheUpdater } from './org-tree-realtime-cache';
import { parseOrgSnapshot } from './org-tree-validation';

const initialSnapshot = parseOrgSnapshot([
  { id: 'root', name: 'Root', parentId: null, headcount: 2, budget: 100, performance: 50, updatedAt: '2026-09-15T12:00:00.000Z' },
  { id: 'leaf', name: 'Leaf', parentId: 'root', headcount: 5, budget: 300, performance: 60, updatedAt: '2026-09-15T12:00:00.000Z' },
]);

const patch = {
  type: 'metric.patch',
  eventId: 'evt-1',
  sequence: 1,
  nodeId: 'leaf',
  metrics: { headcount: 8 },
  updatedAt: '2026-09-15T12:00:01.000Z',
};

describe('realtime snapshot consistency', () => {
  it('keeps tree and table consumers aligned with a later full snapshot', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ORG_TREE_QUERY_KEY, initialSnapshot);
    const updater = createRealtimeCacheUpdater(queryClient);
    updater.applyPayload(patch);

    const realtimeSnapshot = queryClient.getQueryData(ORG_TREE_QUERY_KEY)!;
    const fullSnapshot = parseOrgSnapshot([
      { id: 'root', name: 'Root', parentId: null, headcount: 2, budget: 100, performance: 50, updatedAt: '2026-09-15T12:00:00.000Z' },
      { id: 'leaf', name: 'Leaf', parentId: 'root', headcount: 8, budget: 300, performance: 60, updatedAt: '2026-09-15T12:00:01.000Z' },
    ]);
    const reconciledSnapshot = reconcileOrgSnapshots(realtimeSnapshot, fullSnapshot);
    queryClient.setQueryData(ORG_TREE_QUERY_KEY, reconciledSnapshot);
    const treeConsumerSnapshot = queryClient.getQueryData(ORG_TREE_QUERY_KEY)!;
    const tableConsumerSnapshot = queryClient.getQueryData(ORG_TREE_QUERY_KEY)!;

    expect(treeConsumerSnapshot).toBe(tableConsumerSnapshot);
    expect(treeConsumerSnapshot.nodesById.leaf.headcount).toBe(8);
    expect(buildOrganizationTableRows(treeConsumerSnapshot)).toEqual(buildOrganizationTableRows(tableConsumerSnapshot));
    expect(reconciledSnapshot.aggregatesById.root).toEqual(realtimeSnapshot.aggregatesById.root);
  });
});
