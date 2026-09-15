import type { TableColumn, TableSort, TableSortInteraction } from '@/features/organization-table/model/table-sorting';
import { SortDirectionIcon } from './SortDirectionIcon';
import { SearchInput } from './OrganizationTableHeader.style';

const sortableHeaders: Array<{ column: TableColumn; label: string }> = [
  { column: 'subdivision', label: 'Подразделение' },
  { column: 'level', label: 'Уровень' },
  { column: 'totalEmployees', label: 'Всего сотрудников' },
  { column: 'totalBudget', label: 'Общий бюджет' },
  { column: 'averagePerformance', label: 'Средняя эффективность' },
];

export function OrganizationTableHeader({
  filterInput,
  sort,
  onFilterChange,
  onSortInteraction,
}: {
  filterInput: string;
  sort: TableSort;
  onFilterChange: (_value: string) => void;
  onSortInteraction: (_interaction: TableSortInteraction) => void;
}) {
  return (
    <thead>
      <tr>
        <th colSpan={5}>
          <SearchInput id="organization-search" aria-label="Поиск" placeholder="Поиск" value={filterInput} onChange={(event) => onFilterChange(event.target.value)} />
        </th>
      </tr>
      <tr>
        {sortableHeaders.map(({ column, label }) => (
          <th key={column} scope="col" aria-sort={sort?.column === column ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
            <button type="button" aria-label={`Сортировать: ${label}`} onClick={(event) => onSortInteraction({ column, clickCount: event.detail, kind: 'click' })} onDoubleClick={(event) => onSortInteraction({ column, clickCount: event.detail, kind: 'double-click' })}>
              {label} <SortDirectionIcon direction={sort?.column === column ? sort.direction : 'none'} />
            </button>
          </th>
        ))}
      </tr>
    </thead>
  );
}
