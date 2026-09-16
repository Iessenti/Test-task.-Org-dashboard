import { recalculateOrgAggregateChain } from '../aggregation/org-tree-aggregation';
import type { RealtimeMetricPatch } from './org-tree-realtime';
import type { OrgSnapshot } from '../model/org-tree-types';

export type RealtimePatchTransition = {
  snapshot: OrgSnapshot;
  affectedIds: string[];
  changedMetrics: string[];
};

export function applyRealtimeMetricPatch(
  snapshot: OrgSnapshot,
  patch: RealtimeMetricPatch,
): RealtimePatchTransition {
  const currentNode = snapshot.nodesById[patch.nodeId];
  if (currentNode === undefined) {
    throw new Error(`Cannot patch unknown organization node: ${patch.nodeId}`);
  }

  const changedMetrics = Object.keys(patch.metrics).filter((metric) => (
    patch.metrics[metric] !== currentNode[metric]
  ));
  if (changedMetrics.length === 0) {
    return { snapshot, affectedIds: [], changedMetrics: [] };
  }

  const nextNode = {
    ...currentNode,
    ...patch.metrics,
    updatedAt: patch.updatedAt,
  };
  const nodesById = {
    ...snapshot.nodesById,
    [patch.nodeId]: nextNode,
  };
  const aggregates = recalculateOrgAggregateChain({
    nodesById,
    childrenByParentId: snapshot.childrenByParentId,
    aggregatesById: snapshot.aggregatesById,
    targetId: patch.nodeId,
  });

  return {
    snapshot: {
      nodesById,
      rootIds: snapshot.rootIds,
      childrenByParentId: snapshot.childrenByParentId,
      depthById: snapshot.depthById,
      aggregatesById: aggregates.aggregatesById,
    },
    affectedIds: aggregates.affectedIds,
    changedMetrics,
  };
}
