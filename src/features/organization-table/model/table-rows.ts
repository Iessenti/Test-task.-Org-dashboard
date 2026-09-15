import { getAveragePerformance } from '@/data/org-tree/org-tree-aggregation';
import type { OrgSnapshot } from '@/data/org-tree/org-tree-validation';

export type OrganizationTableRow = {
  id: string;
  subdivision: string;
  level: 'Дивизион' | 'Отдел' | 'Команда';
  totalEmployees: number;
  totalBudget: number;
  averagePerformance: number | null;
};

function getLevel(depth: number): OrganizationTableRow['level'] {
  if (depth === 0) return 'Дивизион';
  if (depth === 1) return 'Отдел';
  return 'Команда';
}

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
      level: getLevel(snapshot.depthById[id] ?? 0),
      totalEmployees: aggregate.totalHeadcount,
      totalBudget: aggregate.totalBudget,
      averagePerformance: getAveragePerformance(aggregate),
    };
  });
}
