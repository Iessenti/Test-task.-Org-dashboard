import { describe, expect, it } from 'vitest';
import { filterOrganizationTableRows } from './table-filtering';
import { parseOrgSnapshot } from '@/data/org-tree/org-tree-validation';
import { buildOrganizationTableRows } from './table-rows';

describe('filterOrganizationTableRows', () => {
  it('matches names case-insensitively and keeps contextual ancestors', () => {
    const snapshot = parseOrgSnapshot([
      { id: 'root', name: 'Главный офис', parentId: null, headcount: 1, budget: 1, performance: 1, updatedAt: '2026-09-15' },
      { id: 'department', name: 'Продажи', parentId: 'root', headcount: 1, budget: 1, performance: 1, updatedAt: '2026-09-15' },
      { id: 'team', name: 'Команда Север', parentId: 'department', headcount: 1, budget: 1, performance: 1, updatedAt: '2026-09-15' },
      { id: 'other', name: 'Финансы', parentId: 'root', headcount: 1, budget: 1, performance: 1, updatedAt: '2026-09-15' },
    ]);

    const rows = buildOrganizationTableRows(snapshot);
    expect(filterOrganizationTableRows(rows, snapshot, 'СЕВЕР').map((row) => row.id))
      .toEqual(['root', 'department', 'team']);
    expect(snapshot.nodesById).toHaveProperty('other');
  });

  it('returns all rows for an empty query in their current order', () => {
    const snapshot = parseOrgSnapshot([
      { id: 'a', name: 'A', parentId: null, headcount: 1, budget: 1, performance: 1, updatedAt: '2026-09-15' },
      { id: 'b', name: 'B', parentId: null, headcount: 1, budget: 1, performance: 1, updatedAt: '2026-09-15' },
    ]);
    const rows = buildOrganizationTableRows(snapshot);
    expect(filterOrganizationTableRows(rows, snapshot, '')).toEqual(rows);
  });
});
