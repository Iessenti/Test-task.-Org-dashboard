import {
  QueryClient, QueryClientProvider, queryOptions, useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { fetchOrgSnapshot, OrgTreeRequestError } from './org-tree-resource';
import { getRealtimePatchWatermarks, recordRealtimePatch, clearRealtimePatchWatermarks } from '../realtime/realtime-watermarks';
import { isOrgSnapshot, mergeNewerRealtimeNodes, reconcileOrgSnapshots, areOrgSnapshotsEqual } from './org-tree-snapshot-reconciliation';
import type { RealtimeMetricPatch } from '../realtime/org-tree-realtime';
import type { OrgSnapshot } from '../model/org-tree-types';

export const ORG_TREE_QUERY_KEY = ['org-tree'] as const;
export const ORG_TREE_STALE_TIME = 5_000;

export { areOrgSnapshotsEqual, reconcileOrgSnapshots, recordRealtimePatch, clearRealtimePatchWatermarks };

export function shouldRetryOrgTreeRequest(failureCount: number, error: unknown): boolean {
  if (!(error instanceof OrgTreeRequestError) || failureCount >= 1) return false;
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
      if (previous === undefined) return next;
      return isOrgSnapshot(previous) && isOrgSnapshot(next)
        ? reconcileOrgSnapshots(previous, mergeNewerRealtimeNodes(previous, next, getRealtimePatchWatermarks()))
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

export type { RealtimeMetricPatch };
