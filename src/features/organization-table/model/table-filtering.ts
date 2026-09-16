import type { OrgSnapshot } from '@/data/org-tree/model/org-tree-types';
import type { OrganizationTableRow } from './table-types';

export function filterOrganizationTableRows(
  rows: readonly OrganizationTableRow[],
  snapshot: OrgSnapshot,
  query: string,
): OrganizationTableRow[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU');
  if (normalizedQuery === '') return [...rows];

  const visibleIds = new Set<string>();
  for (const row of rows) {
    const node = snapshot.nodesById[row.id];
    if (node?.name.toLocaleLowerCase('ru-RU').includes(normalizedQuery)) {
      let currentId: string | null = row.id;
      while (currentId !== null && !visibleIds.has(currentId)) {
        visibleIds.add(currentId);
        currentId = snapshot.nodesById[currentId]?.parentId ?? null;
      }
    }
  }

  return rows.filter((row) => visibleIds.has(row.id));
}
