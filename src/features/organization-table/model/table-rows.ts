import { getAveragePerformance } from '@/data/org-tree/aggregation/org-tree-aggregation';
import type { OrgSnapshot } from '@/data/org-tree/model/org-tree-types';
import { getOrganizationLevel } from './table-levels';
import type { OrganizationTableRow } from './table-types';

export type { OrganizationTableRow } from './table-types';

export function buildOrganizationTableRows(snapshot: OrgSnapshot): OrganizationTableRow[] {
  return Object.keys(snapshot.nodesById).map((id) => {
    const node = snapshot.nodesById[id];
    const aggregate = snapshot.aggregatesById[id];
    if (node === undefined || aggregate === undefined) {
      throw new Error(`Cannot build table row for unknown organization node: ${id}`);
    }

    return {
      id,
      subdivision: node.name,
      level: getOrganizationLevel(snapshot.depthById[id] ?? 0),
      totalEmployees: aggregate.totalHeadcount,
      totalBudget: aggregate.totalBudget,
      averagePerformance: getAveragePerformance(aggregate),
    };
  });
}
