import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { TableShell, TableSurface } from './OrganizationTable.style';
import type { OrgSnapshot } from '@/data/org-tree/org-tree-validation';
import { buildOrganizationTableRows } from '@/features/organization-table/model/table-rows';
import { cycleSort, reverseSort, sortOrganizationTableRows, type TableSort, type TableSortInteraction } from '@/features/organization-table/model/table-sorting';
import { filterOrganizationTableRows } from '@/features/organization-table/model/table-filtering';
import { useDebouncedValue } from '@/features/organization-table/hooks/useDebouncedValue';
import { OrganizationTableHeader } from '@/features/organization-table/components/OrganizationTableHeader';
import { OrganizationTableRow } from '@/features/organization-table/components/OrganizationTableRow';
import type { RealtimeFeedbackController } from '@/data/org-tree/use-realtime-feedback';

export function OrganizationTable({ snapshot, selectedNodeId, onSelectNode, feedback }: {
  snapshot: OrgSnapshot;
  selectedNodeId: string | null;
  onSelectNode: (_nodeId: string) => void;
  feedback: RealtimeFeedbackController;
}) {
  const [sort, setSort] = useState<TableSort>(null);
  const [filterInput, setFilterInput] = useState('');
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const debouncedFilter = useDebouncedValue(filterInput, 250);
  const baseRows = useMemo(() => buildOrganizationTableRows(snapshot), [snapshot]);
  const filteredRows = useMemo(
    () => filterOrganizationTableRows(baseRows, snapshot, debouncedFilter),
    [baseRows, debouncedFilter, snapshot],
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

  return (
    <TableSurface ref={tableSurfaceRef}>
      <TableShell aria-label="Таблица организации" role="grid">
        <OrganizationTableHeader filterInput={filterInput} onFilterChange={setFilterInput} onSortInteraction={handleSortInteraction} sort={sort} />
        <tbody>
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
