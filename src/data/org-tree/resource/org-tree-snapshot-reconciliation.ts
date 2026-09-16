import { calculateOrgAggregates } from '../aggregation/org-tree-aggregation';
import type { OrgNodeDto, OrgSnapshot } from '../model/org-tree-types';

const ORG_NODE_FIELDS: Array<keyof OrgNodeDto> = [
  'id', 'name', 'parentId', 'headcount', 'budget', 'performance', 'updatedAt',
];

export function areOrgSnapshotsEqual(left: OrgSnapshot, right: OrgSnapshot): boolean {
  const leftIds = Object.keys(left.nodesById);
  const rightIds = Object.keys(right.nodesById);
  if (leftIds.length !== rightIds.length) return false;
  return leftIds.every((id) => {
    const leftNode = left.nodesById[id];
    const rightNode = right.nodesById[id];
    return leftNode !== undefined && rightNode !== undefined
      && ORG_NODE_FIELDS.every((field) => leftNode[field] === rightNode[field]);
  });
}

export function reconcileOrgSnapshots(previous: OrgSnapshot | undefined, next: OrgSnapshot): OrgSnapshot {
  return previous !== undefined && areOrgSnapshotsEqual(previous, next) ? previous : next;
}

export function mergeNewerRealtimeNodes(
  previous: OrgSnapshot,
  next: OrgSnapshot,
  latestRealtimeUpdatedAtByNode: ReadonlyMap<string, string>,
): OrgSnapshot {
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

export function isOrgSnapshot(value: unknown): value is OrgSnapshot {
  return value !== null && typeof value === 'object'
    && 'nodesById' in value && 'rootIds' in value && 'childrenByParentId' in value && 'depthById' in value;
}
