import type { OrgAggregate, OrgNodeDto } from '../model/org-tree-types';

export function recalculateOrgAggregateChain({
  nodesById,
  childrenByParentId,
  aggregatesById,
  targetId,
}: {
  nodesById: Record<string, OrgNodeDto>;
  childrenByParentId: Record<string, string[]>;
  aggregatesById: Record<string, OrgAggregate>;
  targetId: string;
}): { aggregatesById: Record<string, OrgAggregate>; affectedIds: string[] } {
  if (nodesById[targetId] === undefined) throw new Error(`Cannot recalculate unknown organization node: ${targetId}`);
  const nextAggregatesById = { ...aggregatesById };
  const affectedIds: string[] = [];
  let currentId: string | null = targetId;

  while (currentId !== null) {
    const node = nodesById[currentId];
    if (node === undefined) throw new Error(`Cannot recalculate unknown organization node: ${currentId}`);
    const aggregate = (childrenByParentId[currentId] ?? []).reduce<OrgAggregate>(
      (total, childId) => {
        const childAggregate = nextAggregatesById[childId];
        if (childAggregate === undefined) throw new Error(`Cannot recalculate missing child aggregate: ${childId}`);
        return {
          totalHeadcount: total.totalHeadcount + childAggregate.totalHeadcount,
          totalBudget: total.totalBudget + childAggregate.totalBudget,
          weightedPerformanceSum: total.weightedPerformanceSum + childAggregate.weightedPerformanceSum,
        };
      },
      {
        totalHeadcount: node.headcount,
        totalBudget: node.budget,
        weightedPerformanceSum: node.performance * node.headcount,
      },
    );
    nextAggregatesById[currentId] = aggregate;
    affectedIds.push(currentId);
    currentId = node.parentId;
  }
  return { aggregatesById: nextAggregatesById, affectedIds };
}
