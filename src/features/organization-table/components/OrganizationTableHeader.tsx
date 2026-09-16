import type { TableColumn, TableSort, TableSortInteraction } from '@/features/organization-table/model/table-sorting';
import { SortDirectionIcon } from './SortDirectionIcon';
import { AiSearchButton, AiSearchGlyph, AiSearchSpinner, AiSearchStatus, SearchInput, SearchToolbar } from './OrganizationTableHeader.style';

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
  onAiSearch,
  aiSearching,
  aiError,
  onSortInteraction,
}: {
  filterInput: string;
  sort: TableSort;
  onFilterChange: (_value: string) => void;
  onAiSearch: () => void;
  aiSearching: boolean;
  aiError: string | null;
  onSortInteraction: (_interaction: TableSortInteraction) => void;
}) {
  return (
    <thead>
      <tr>
        <th colSpan={5}>
          <SearchToolbar>
            <SearchInput id="organization-search" aria-label="Поиск по организации" placeholder="Например: команды с эффективностью выше 80" value={filterInput} onChange={(event) => onFilterChange(event.target.value)} />
            <AiSearchButton type="button" aria-busy={aiSearching} onClick={onAiSearch} disabled={aiSearching || filterInput.trim() === ''}>
              {aiSearching ? <AiSearchSpinner aria-hidden="true" /> : <AiSearchGlyph aria-hidden="true">✦</AiSearchGlyph>}
              {aiSearching ? 'Обрабатываем…' : 'AI-поиск'}
            </AiSearchButton>
            {aiError !== null
              ? <AiSearchStatus $error role="alert" aria-live="polite">{aiError}</AiSearchStatus>
              : <AiSearchStatus aria-live="polite">Введите запрос на естественном языке — AI преобразует его в фильтр.</AiSearchStatus>}
          </SearchToolbar>
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
