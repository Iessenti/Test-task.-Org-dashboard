import { useEffect, useMemo, useRef, useState } from 'react';
import { TableShell, TableSurface } from './OrganizationTable.style';
import type { OrgSnapshot } from '@/data/org-tree/org-tree-validation';
import { buildOrganizationTableRows } from '@/features/organization-table/model/table-rows';
import { cycleSort, reverseSort, sortOrganizationTableRows, type TableSort, type TableSortInteraction } from '@/features/organization-table/model/table-sorting';
import { filterOrganizationTableRows } from '@/features/organization-table/model/table-filtering';
import { useDebouncedValue } from '@/features/organization-table/hooks/useDebouncedValue';
import { OrganizationTableHeader } from '@/features/organization-table/components/OrganizationTableHeader';
import { OrganizationTableRow } from '@/features/organization-table/components/OrganizationTableRow';

export function OrganizationTable({ snapshot, selectedNodeId, onSelectNode }: {
  snapshot: OrgSnapshot;
  selectedNodeId: string | null;
  onSelectNode: (_nodeId: string) => void;
}) {
  const [sort, setSort] = useState<TableSort>(null);
  const [filterInput, setFilterInput] = useState('');
  const debouncedFilter = useDebouncedValue(filterInput, 250);
  const baseRows = useMemo(() => buildOrganizationTableRows(snapshot), [snapshot]);
  const filteredRows = useMemo(
    () => filterOrganizationTableRows(baseRows, snapshot, debouncedFilter),
    [baseRows, debouncedFilter, snapshot],
  );
  const rows = useMemo(() => sortOrganizationTableRows(filteredRows, sort), [filteredRows, sort]);

  const tableSurfaceRef = useRef<HTMLDivElement>(null);
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
      <TableShell aria-label="Таблица организации">
        <OrganizationTableHeader filterInput={filterInput} onFilterChange={setFilterInput} onSortInteraction={handleSortInteraction} sort={sort} />
        <tbody>{rows.map((row) => <OrganizationTableRow key={row.id} isSelected={selectedNodeId === row.id} onSelect={onSelectNode} row={row} />)}</tbody>
      </TableShell>
    </TableSurface>
  );
}
