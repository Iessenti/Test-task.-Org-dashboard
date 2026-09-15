import type { OrgAggregate, OrgNodeDto } from './org-tree-validation';

export type OrgAggregationIndexes = {
  nodesById: Record<string, OrgNodeDto>;
  childrenByParentId: Record<string, string[]>;
};

export function getAveragePerformance(aggregate: OrgAggregate): number | null {
  return aggregate.totalHeadcount === 0
    ? null
    : aggregate.weightedPerformanceSum / aggregate.totalHeadcount;
}

export function calculateOrgAggregates({
  nodesById,
  childrenByParentId,
}: OrgAggregationIndexes): Record<string, OrgAggregate> {
  const aggregatesById: Record<string, OrgAggregate> = {};

  const aggregateNode = (id: string): OrgAggregate => {
    const existingAggregate = aggregatesById[id];
    if (existingAggregate !== undefined) {
      return existingAggregate;
    }

    const node = nodesById[id];
    if (node === undefined) {
      throw new Error(`Cannot aggregate unknown organization node: ${id}`);
    }

    const aggregate = (childrenByParentId[id] ?? []).reduce<OrgAggregate>(
      (total, childId) => {
        const childAggregate = aggregateNode(childId);
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

    aggregatesById[id] = aggregate;
    return aggregate;
  };

  Object.keys(nodesById).forEach(aggregateNode);
  return aggregatesById;
}
