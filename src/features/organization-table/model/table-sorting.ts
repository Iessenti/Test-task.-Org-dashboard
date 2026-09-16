import type { OrganizationTableRow, TableColumn } from './table-types';

export type { TableColumn } from './table-types';

export type SortDirection = 'asc' | 'desc';
export type TableSort = { column: TableColumn; direction: SortDirection } | null;
export type TableSortInteraction = {
  column: TableColumn;
  clickCount: number;
  kind: 'click' | 'double-click';
};

const levelOrder: Record<OrganizationTableRow['level'], number> = {
  Дивизион: 0,
  Отдел: 1,
  Команда: 2,
};

export function cycleSort(sort: TableSort, column: TableColumn): TableSort {
  if (sort?.column !== column) return { column, direction: 'asc' };
  if (sort.direction === 'asc') return { column, direction: 'desc' };
  return null;
}

export function reverseSort(sort: TableSort, column: TableColumn): TableSort {
  if (sort?.column !== column) return sort;
  return { column, direction: sort.direction === 'asc' ? 'desc' : 'asc' };
}

function compareRows(left: OrganizationTableRow, right: OrganizationTableRow, column: TableColumn): number {
  if (column === 'subdivision') {
    return left.subdivision.localeCompare(right.subdivision, 'ru-RU', { sensitivity: 'base' });
  }
  if (column === 'level') return levelOrder[left.level] - levelOrder[right.level];

  const leftValue = left[column];
  const rightValue = right[column];
  if (leftValue === rightValue) return 0;
  if (leftValue === null) return 1;
  if (rightValue === null) return -1;
  return leftValue < rightValue ? -1 : 1;
}

export function sortOrganizationTableRows(rows: readonly OrganizationTableRow[], sort: TableSort): OrganizationTableRow[] {
  if (sort === null) return [...rows];

  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      const result = compareRows(left.row, right.row, sort.column);
      if (result !== 0) return sort.direction === 'asc' ? result : -result;
      return left.index - right.index;
    })
    .map(({ row }) => row);
}
