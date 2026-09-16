import type { OrgAggregate } from '../model/org-tree-types';

export { calculateOrgAggregates, type OrgAggregationIndexes } from './org-tree-aggregation-initial';
export { recalculateOrgAggregateChain } from './org-tree-aggregation-incremental';

export function getAveragePerformance(aggregate: OrgAggregate): number | null {
  return aggregate.totalHeadcount === 0
    ? null
    : aggregate.weightedPerformanceSum / aggregate.totalHeadcount;
}

export type { OrgAggregate } from '../model/org-tree-types';
