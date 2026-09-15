import type { KeyboardEvent } from 'react';
import { formatAveragePerformance, formatBudget } from '@/features/organization-table/model/formatters';
import type { OrganizationTableRow as OrganizationTableRowData } from '@/features/organization-table/model/table-rows';
import type { RealtimeFeedbackController } from '@/data/org-tree/use-realtime-feedback';
import { FeedbackValue } from '@/features/organization-table/containers/OrganizationTable.style';

export function OrganizationTableRow({ row, isSelected, onFocus, onKeyDown, onSelect, feedback, tabIndex }: {
  row: OrganizationTableRowData;
  isSelected: boolean;
  onFocus: () => void;
  onKeyDown: (_event: KeyboardEvent<HTMLTableRowElement>) => void;
  onSelect: (_nodeId: string) => void;
  feedback: RealtimeFeedbackController;
  tabIndex: 0 | -1;
}) {
  return (
    <tr
      data-node-id={row.id}
      aria-selected={isSelected}
      onClick={() => onSelect(row.id)}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      role="row"
      tabIndex={tabIndex}
    >
      <td role="gridcell">{row.subdivision}</td>
      <td role="gridcell">{row.level}</td>
      <td role="gridcell"><FeedbackValue key={feedback.getToken(row.id, 'totalHeadcount')} $active={feedback.isActive(row.id, 'totalHeadcount')} $color="#18212f">{row.totalEmployees}</FeedbackValue></td>
      <td role="gridcell"><FeedbackValue key={feedback.getToken(row.id, 'totalBudget')} $active={feedback.isActive(row.id, 'totalBudget')} $color="#18212f">{formatBudget(row.totalBudget)}</FeedbackValue></td>
      <td role="gridcell"><FeedbackValue key={feedback.getToken(row.id, 'averagePerformance')} $active={feedback.isActive(row.id, 'averagePerformance')} $color="#18212f">{formatAveragePerformance(row.averagePerformance)}</FeedbackValue></td>
    </tr>
  );
}
