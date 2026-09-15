import { describe, expect, it, vi } from 'vitest';
import * as aggregation from '@/data/org-tree/org-tree-aggregation';
import { parseOrgSnapshot } from '@/data/org-tree/org-tree-validation';
import { filterOrganizationTableRows } from './table-filtering';
import { sortOrganizationTableRows } from './table-sorting';
import { buildOrganizationTableRows } from './table-rows';

describe('organization table projection composition', () => {
  it('composes filtering and sorting without changing the canonical snapshot', () => {
    const aggregateSpy = vi.spyOn(aggregation, 'calculateOrgAggregates');
    const snapshot = parseOrgSnapshot([
      { id: 'root', name: 'Главный офис', parentId: null, headcount: 1, budget: 10, performance: 1, updatedAt: '2026-09-15' },
      { id: 'department', name: 'Продажи', parentId: 'root', headcount: 1, budget: 20, performance: 1, updatedAt: '2026-09-15' },
      { id: 'team-a', name: 'Команда Север', parentId: 'department', headcount: 1, budget: 30, performance: 1, updatedAt: '2026-09-15' },
      { id: 'team-b', name: 'Команда юг', parentId: 'department', headcount: 1, budget: 40, performance: 1, updatedAt: '2026-09-15' },
      { id: 'other', name: 'Финансы', parentId: 'root', headcount: 1, budget: 50, performance: 1, updatedAt: '2026-09-15' },
    ]);
    const originalNodes = snapshot.nodesById;
    const originalAggregates = snapshot.aggregatesById;
    const rows = buildOrganizationTableRows(snapshot);
    const beforeProjection = aggregateSpy.mock.calls.length;

    const filtered = filterOrganizationTableRows(rows, snapshot, 'команда');
    const projected = sortOrganizationTableRows(filtered, { column: 'totalBudget', direction: 'desc' });

    expect(projected.map((row) => row.id)).toEqual(['root', 'department', 'team-b', 'team-a']);
    expect(snapshot.nodesById).toBe(originalNodes);
    expect(snapshot.aggregatesById).toBe(originalAggregates);
    expect(aggregateSpy).toHaveBeenCalledTimes(beforeProjection);
    aggregateSpy.mockRestore();
  });
});
