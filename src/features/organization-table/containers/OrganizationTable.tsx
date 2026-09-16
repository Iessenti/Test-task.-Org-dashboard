import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { TableEmptyCell, TableShell, TableState, TableStateButton, TableStateMessage, TableStateSpinner, TableSurface } from './OrganizationTable.style';
import type { OrgSnapshot } from '@/data/org-tree/model/org-tree-types';
import { buildOrganizationTableRows } from '@/features/organization-table/model/table-rows';
import { cycleSort, reverseSort, sortOrganizationTableRows, type TableSort, type TableSortInteraction } from '@/features/organization-table/model/table-sorting';
import { filterOrganizationTableRows } from '@/features/organization-table/model/table-filtering';
import { filterOrganizationTableRowsByAiFilter, type AiFilter } from '@/features/organization-table/model/ai-filtering';
import { resolveAiSearch } from '@/features/organization-table/model/ai-search';
import { useDebouncedValue } from '@/features/organization-table/hooks/useDebouncedValue';
import { OrganizationTableHeader } from '@/features/organization-table/components/OrganizationTableHeader';
import { OrganizationTableRow } from '@/features/organization-table/components/OrganizationTableRow';
import type { RealtimeFeedbackController } from '@/data/org-tree/hooks/use-realtime-feedback';

export type OrganizationTableStatus = 'ready' | 'loading' | 'error' | 'empty';

export function OrganizationTable({ snapshot, selectedNodeId, onSelectNode, feedback, status = 'ready', onRetry }: {
  snapshot: OrgSnapshot | undefined;
  selectedNodeId: string | null;
  onSelectNode: (_nodeId: string) => void;
  feedback: RealtimeFeedbackController;
  status?: OrganizationTableStatus;
  onRetry?: () => void;
}) {
  const [sort, setSort] = useState<TableSort>(null);
  const [filterInput, setFilterInput] = useState('');
  const [aiFilter, setAiFilter] = useState<AiFilter | null>(null);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const debouncedFilter = useDebouncedValue(filterInput, 250);
  const baseRows = useMemo(() => snapshot === undefined ? [] : buildOrganizationTableRows(snapshot), [snapshot]);
  const filteredRows = useMemo(
    () => snapshot === undefined
      ? []
      : aiFilter === null
        ? filterOrganizationTableRows(baseRows, snapshot, debouncedFilter)
        : filterOrganizationTableRowsByAiFilter(baseRows, snapshot, aiFilter),
    [aiFilter, baseRows, debouncedFilter, snapshot],
  );
  const rows = useMemo(() => sortOrganizationTableRows(filteredRows, sort), [filteredRows, sort]);
  const focusableRowId = rows.some((row) => row.id === focusedRowId)
    ? focusedRowId
    : rows[0]?.id ?? null;

  const tableSurfaceRef = useRef<HTMLDivElement>(null);
  const focusRow = (rowId: string) => {
    setFocusedRowId(rowId);
    requestAnimationFrame(() => {
      tableSurfaceRef.current?.querySelector<HTMLElement>(`[data-node-id="${rowId}"]`)?.focus();
    });
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, rowId: string) => {
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    if (rowIndex === -1) return;

    const nextIndex = event.key === 'ArrowDown'
      ? Math.min(rowIndex + 1, rows.length - 1)
      : event.key === 'ArrowUp'
        ? Math.max(rowIndex - 1, 0)
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? rows.length - 1
            : -1;

    if (nextIndex !== -1) {
      event.preventDefault();
      if (nextIndex !== rowIndex) focusRow(rows[nextIndex].id);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      onSelectNode(rowId);
    }
  };

  useEffect(() => {
    if (selectedNodeId === null) return;
    const frame = requestAnimationFrame(() => {
      const selectedRow = Array.from(tableSurfaceRef.current?.querySelectorAll<HTMLElement>('[data-node-id]') ?? [])
        .find((row) => row.dataset.nodeId === selectedNodeId);
      selectedRow?.scrollIntoView({ block: 'center', inline: 'nearest' });
      selectedRow?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [rows, selectedNodeId]);

  const handleSortInteraction = (interaction: TableSortInteraction) => {
    if (interaction.kind === 'click' && interaction.clickCount === 1) {
      setSort((currentSort) => cycleSort(currentSort, interaction.column));
      return;
    }

    if (interaction.kind === 'double-click') {
      setSort((currentSort) => {
        const nextSort = reverseSort(currentSort, interaction.column);
        return nextSort === null
          ? { column: interaction.column, direction: 'asc' }
          : nextSort;
      });
    }
  };

  const handleFilterChange = (value: string) => {
    setFilterInput(value);
    setAiFilter(null);
    setAiError(null);
  };

  const handleAiSearch = () => {
    const controller = new AbortController();
    setAiSearching(true);
    setAiError(null);
    void resolveAiSearch(filterInput, controller.signal).then((result) => {
      if (result.kind === 'ai') {
        setAiFilter(result.filter);
        return;
      }
      setAiFilter(null);
      setAiError('AI-поиск недоступен. Использован текстовый поиск.');
    }).finally(() => {
      setAiSearching(false);
    });
  };

  if (status !== 'ready' || snapshot === undefined) {
    return (
      <TableSurface role={status === 'error' ? 'alert' : 'status'}>
        <TableState>
          {status === 'loading' && <TableStateSpinner aria-hidden="true" />}
          <TableStateMessage>
            {status === 'loading' && 'Загрузка организации…'}
            {status === 'error' && 'Не удалось загрузить организацию.'}
            {status === 'empty' && 'Организация пока пуста.'}
          </TableStateMessage>
          {status === 'error' && onRetry !== undefined && <TableStateButton type="button" onClick={onRetry}>Повторить</TableStateButton>}
        </TableState>
      </TableSurface>
    );
  }

  return (
    <TableSurface ref={tableSurfaceRef}>
      <TableShell aria-label="Таблица организации" role="grid">
        <colgroup>
          <col />
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        <OrganizationTableHeader aiError={aiError} aiSearching={aiSearching} filterInput={filterInput} onAiSearch={handleAiSearch} onFilterChange={handleFilterChange} onSortInteraction={handleSortInteraction} sort={sort} />
        <tbody>
          {rows.length === 0 && (
            <tr>
              <TableEmptyCell colSpan={5} role="status">
                {filterInput.trim() === '' ? 'Организация пока пуста.' : 'По вашему запросу ничего не найдено.'}
              </TableEmptyCell>
            </tr>
          )}
          {rows.map((row) => (
            <OrganizationTableRow
              key={row.id}
              feedback={feedback}
              isSelected={selectedNodeId === row.id}
              onFocus={() => setFocusedRowId(row.id)}
              onKeyDown={(event) => handleRowKeyDown(event, row.id)}
              onSelect={onSelectNode}
              row={row}
              tabIndex={focusableRowId === row.id ? 0 : -1}
            />
          ))}
        </tbody>
      </TableShell>
    </TableSurface>
  );
}
