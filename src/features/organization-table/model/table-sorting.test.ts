import { describe, expect, it } from 'vitest';
import { cycleSort, reverseSort, sortOrganizationTableRows, type TableSort } from './table-sorting';
import type { OrganizationTableRow } from './table-rows';

const rows: OrganizationTableRow[] = [
  { id: 'b', subdivision: 'Бета', level: 'Отдел', totalEmployees: 2, totalBudget: 100, averagePerformance: 50 },
  { id: 'a', subdivision: 'Альфа', level: 'Дивизион', totalEmployees: 2, totalBudget: 300, averagePerformance: null },
  { id: 'c', subdivision: 'Гамма', level: 'Команда', totalEmployees: 1, totalBudget: 200, averagePerformance: 75 },
];

describe('organization table sorting', () => {
  it('cycles a column through ascending, descending, and cleared states', () => {
    let sort: TableSort = null;
    sort = cycleSort(sort, 'totalEmployees');
    expect(sort).toEqual({ column: 'totalEmployees', direction: 'asc' });
    sort = cycleSort(sort, 'totalEmployees');
    expect(sort).toEqual({ column: 'totalEmployees', direction: 'desc' });
    expect(cycleSort(sort, 'totalEmployees')).toBeNull();
  });

  it('reverses only the active column on double-click', () => {
    expect(reverseSort({ column: 'subdivision', direction: 'asc' }, 'subdivision'))
      .toEqual({ column: 'subdivision', direction: 'desc' });
    expect(reverseSort({ column: 'subdivision', direction: 'asc' }, 'totalBudget'))
      .toEqual({ column: 'subdivision', direction: 'asc' });
  });

  it('sorts every supported column without mutating source order', () => {
    expect(sortOrganizationTableRows(rows, { column: 'subdivision', direction: 'asc' }).map((row) => row.id)).toEqual(['a', 'b', 'c']);
    expect(sortOrganizationTableRows(rows, { column: 'level', direction: 'desc' }).map((row) => row.id)).toEqual(['c', 'b', 'a']);
    expect(sortOrganizationTableRows(rows, { column: 'totalEmployees', direction: 'asc' }).map((row) => row.id)).toEqual(['c', 'b', 'a']);
    expect(sortOrganizationTableRows(rows, { column: 'totalBudget', direction: 'desc' }).map((row) => row.id)).toEqual(['a', 'c', 'b']);
    expect(sortOrganizationTableRows(rows, { column: 'averagePerformance', direction: 'asc' }).map((row) => row.id)).toEqual(['b', 'c', 'a']);
    expect(rows.map((row) => row.id)).toEqual(['b', 'a', 'c']);
  });

  it('keeps ties stable', () => {
    expect(sortOrganizationTableRows(rows, { column: 'totalEmployees', direction: 'asc' }).slice(1).map((row) => row.id)).toEqual(['b', 'a']);
  });
});
