import { formatAveragePerformance, formatBudget } from '@/features/organization-table/model/formatters';
import type { OrganizationTableRow as OrganizationTableRowData } from '@/features/organization-table/model/table-rows';

export function OrganizationTableRow({ row, isSelected, onSelect }: {
  row: OrganizationTableRowData;
  isSelected: boolean;
  onSelect: (_nodeId: string) => void;
}) {
  return (
    <tr data-node-id={row.id} aria-selected={isSelected} tabIndex={-1} onClick={() => onSelect(row.id)}>
      <td>{row.subdivision}</td>
      <td>{row.level}</td>
      <td>{row.totalEmployees}</td>
      <td>{formatBudget(row.totalBudget)}</td>
      <td>{formatAveragePerformance(row.averagePerformance)}</td>
    </tr>
  );
}
