import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import {
  fetchOrgSnapshot,
  OrgTreeRequestError,
} from './org-tree-resource';
import { calculateOrgAggregates } from './org-tree-aggregation';
import type { RealtimeMetricPatch } from './org-tree-realtime';
import type { OrgNodeDto, OrgSnapshot } from './org-tree-validation';

export const ORG_TREE_QUERY_KEY = ['org-tree'] as const;
export const ORG_TREE_STALE_TIME = 5_000;
const latestRealtimeUpdatedAtByNode = new Map<string, string>();

export function recordRealtimePatch(patch: RealtimeMetricPatch) {
  latestRealtimeUpdatedAtByNode.set(patch.nodeId, patch.updatedAt);
}

export function clearRealtimePatchWatermarks() {
  latestRealtimeUpdatedAtByNode.clear();
}

const ORG_NODE_FIELDS: Array<keyof OrgNodeDto> = [
  'id',
  'name',
  'parentId',
  'headcount',
  'budget',
  'performance',
  'updatedAt',
];

export function areOrgSnapshotsEqual(
  left: OrgSnapshot,
  right: OrgSnapshot,
): boolean {
  const leftIds = Object.keys(left.nodesById);
  const rightIds = Object.keys(right.nodesById);

  if (leftIds.length !== rightIds.length) {
    return false;
  }

  return leftIds.every((id) => {
    const leftNode = left.nodesById[id];
    const rightNode = right.nodesById[id];

    return leftNode !== undefined && rightNode !== undefined && ORG_NODE_FIELDS.every(
      (field) => leftNode[field] === rightNode[field],
    );
  });
}

export function reconcileOrgSnapshots(
  previous: OrgSnapshot | undefined,
  next: OrgSnapshot,
): OrgSnapshot {
  return previous !== undefined && areOrgSnapshotsEqual(previous, next) ? previous : next;
}

function mergeNewerRealtimeNodes(previous: OrgSnapshot, next: OrgSnapshot): OrgSnapshot {
  const previousIds = Object.keys(previous.nodesById);
  const nextIds = Object.keys(next.nodesById);
  if (previousIds.length !== nextIds.length || previousIds.some((id) => next.nodesById[id] === undefined)) return next;

  const nodesById = { ...next.nodesById };
  let preservedRealtimeValue = false;
  for (const id of nextIds) {
    const realtimeUpdatedAt = latestRealtimeUpdatedAtByNode.get(id);
    const previousNode = previous.nodesById[id];
    const nextNode = next.nodesById[id];
    if (realtimeUpdatedAt !== undefined && previousNode !== undefined && nextNode !== undefined
      && Date.parse(nextNode.updatedAt) < Date.parse(realtimeUpdatedAt)) {
      nodesById[id] = previousNode;
      preservedRealtimeValue = true;
    }
  }
  if (!preservedRealtimeValue) return next;
  return {
    ...next,
    nodesById,
    aggregatesById: calculateOrgAggregates({ nodesById, childrenByParentId: next.childrenByParentId }),
  };
}

function isOrgSnapshot(value: unknown): value is OrgSnapshot {
  return value !== null && typeof value === 'object'
    && 'nodesById' in value
    && 'rootIds' in value
    && 'childrenByParentId' in value
    && 'depthById' in value;
}

export function shouldRetryOrgTreeRequest(
  failureCount: number,
  error: unknown,
): boolean {
  if (!(error instanceof OrgTreeRequestError) || failureCount >= 1) {
    return false;
  }

  return error.kind === 'transport' || (error.kind === 'http' && (error.status ?? 0) >= 500);
}

export function orgTreeQueryOptions(fetcher?: typeof fetch) {
  return queryOptions<OrgSnapshot, OrgTreeRequestError, OrgSnapshot, typeof ORG_TREE_QUERY_KEY>({
    queryKey: ORG_TREE_QUERY_KEY,
    queryFn: ({ signal }) => fetchOrgSnapshot(signal, fetcher),
    staleTime: ORG_TREE_STALE_TIME,
    retry: shouldRetryOrgTreeRequest,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
    structuralSharing: (previous, next) => {
      if (previous === undefined) {
        return next;
      }

      return isOrgSnapshot(previous) && isOrgSnapshot(next)
        ? reconcileOrgSnapshots(previous, mergeNewerRealtimeNodes(previous, next))
        : next;
    },
  });
}

export const orgTreeQueryClient = new QueryClient();

export function useOrgTreeQuery(): UseQueryResult<OrgSnapshot, OrgTreeRequestError> {
  return useQuery(orgTreeQueryOptions());
}

export function OrgTreeQueryProvider({ children }: { children: ReactNode }) {
  return createElement(QueryClientProvider, { client: orgTreeQueryClient }, children);
}
