import { describe, expect, it } from 'vitest';
import { buildOrganizationTableRows } from './table-rows';
import { parseOrgSnapshot } from '@/data/org-tree/org-tree-validation';

describe('buildOrganizationTableRows', () => {
  it('derives one row with all five analytical values for every node', () => {
    const snapshot = parseOrgSnapshot([
      { id: 'root', name: 'Head office', parentId: null, headcount: 2, budget: 100, performance: 50, updatedAt: '2026-09-15' },
      { id: 'child', name: 'Sales', parentId: 'root', headcount: 3, budget: 200, performance: 80, updatedAt: '2026-09-15' },
    ]);

    expect(buildOrganizationTableRows(snapshot)).toEqual([
      { id: 'root', subdivision: 'Head office', level: 'Дивизион', totalEmployees: 5, totalBudget: 300, averagePerformance: 68 },
      { id: 'child', subdivision: 'Sales', level: 'Отдел', totalEmployees: 3, totalBudget: 200, averagePerformance: 80 },
    ]);
  });
});
