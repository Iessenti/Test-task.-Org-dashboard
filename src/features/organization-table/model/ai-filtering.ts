import type { OrgSnapshot } from '@/data/org-tree/model/org-tree-types';
import type { OrganizationTableRow } from './table-types';

export type AiFilter = {
  nameContains?: string;
  levels?: Array<OrganizationTableRow['level']>;
  minPerformance?: number;
  maxPerformance?: number;
  minBudget?: number;
  maxBudget?: number;
  minEmployees?: number;
  maxEmployees?: number;
  sortBy?: 'totalBudget' | 'totalEmployees' | 'averagePerformance';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
};

export function filterOrganizationTableRowsByAiFilter(
  rows: readonly OrganizationTableRow[],
  snapshot: OrgSnapshot,
  filter: AiFilter,
): OrganizationTableRow[] {
  const normalizedName = filter.nameContains?.trim().toLocaleLowerCase('ru-RU');
  const hasNumericFilter = filter.minPerformance !== undefined
    || filter.maxPerformance !== undefined
    || filter.minBudget !== undefined
    || filter.maxBudget !== undefined
    || filter.minEmployees !== undefined
    || filter.maxEmployees !== undefined;
  const hasResultSelection = hasNumericFilter || filter.sortBy !== undefined || filter.limit !== undefined;
  const visibleIds = new Set<string>();
  const matchingRows: OrganizationTableRow[] = [];

  for (const row of rows) {
    const node = snapshot.nodesById[row.id];
    const matchesName = normalizedName === undefined || normalizedName === ''
      || node?.name.toLocaleLowerCase('ru-RU').includes(normalizedName);
    const matchesLevel = filter.levels === undefined || filter.levels.includes(row.level);
    const matchesMin = filter.minPerformance === undefined
      || (row.averagePerformance !== null && row.averagePerformance >= filter.minPerformance);
    const matchesMax = filter.maxPerformance === undefined
      || (row.averagePerformance !== null && row.averagePerformance <= filter.maxPerformance);
    const matchesMinBudget = filter.minBudget === undefined || row.totalBudget >= filter.minBudget;
    const matchesMaxBudget = filter.maxBudget === undefined || row.totalBudget <= filter.maxBudget;
    const matchesMinEmployees = filter.minEmployees === undefined || row.totalEmployees >= filter.minEmployees;
    const matchesMaxEmployees = filter.maxEmployees === undefined || row.totalEmployees <= filter.maxEmployees;

    if (node !== undefined && matchesName && matchesLevel && matchesMin && matchesMax
      && matchesMinBudget && matchesMaxBudget && matchesMinEmployees && matchesMaxEmployees) matchingRows.push(row);
  }

  const orderedRows = filter.sortBy !== undefined
    ? [...matchingRows].sort((left, right) => {
      const leftValue = left[filter.sortBy!];
      const rightValue = right[filter.sortBy!];
      if (leftValue === rightValue) return 0;
      if (leftValue === null) return 1;
      if (rightValue === null) return -1;
      const comparison = leftValue < rightValue ? -1 : 1;
      return filter.sortDirection === 'desc' ? -comparison : comparison;
    })
    : matchingRows;
  const selectedRows = filter.limit === undefined ? orderedRows : orderedRows.slice(0, filter.limit);

  for (const row of selectedRows) {
    if (hasResultSelection) {
      visibleIds.add(row.id);
      continue;
    }

    let currentId: string | null = row.id;
    while (currentId !== null && !visibleIds.has(currentId)) {
      visibleIds.add(currentId);
      currentId = snapshot.nodesById[currentId]?.parentId ?? null;
    }
  }

  return rows.filter((row) => visibleIds.has(row.id));
}
