import type { OrgSnapshot } from '@/data/org-tree/org-tree-validation';
import { formatTimestamp } from '@/data/org-tree/date-formatters';
import { formatMetricNumber } from '@/data/org-tree/number-formatters';
import {
  DetailChildren,
  DetailCloseButton,
  DetailMetric,
  DetailMetricValue,
  DetailMetrics,
  DetailMuted,
  DetailPanel,
  DetailSection,
  DetailSectionTitle,
  DetailTitle,
} from './OrganizationTreeDetailPanel.style';

function formatBudget(budget: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(budget)} ₽`;
}

export function OrganizationTreeDetailPanel({ snapshot, selectedNodeId, onClearSelection }: {
  snapshot: OrgSnapshot;
  selectedNodeId: string | null;
  onClearSelection: () => void;
}) {
  if (selectedNodeId === null) return null;

  const node = snapshot.nodesById[selectedNodeId];
  const aggregate = snapshot.aggregatesById[selectedNodeId];
  if (node === undefined || aggregate === undefined) return null;

  const childIds = snapshot.childrenByParentId[selectedNodeId] ?? [];
  const averagePerformance = aggregate.totalHeadcount === 0
    ? '—'
    : formatMetricNumber(aggregate.weightedPerformanceSum / aggregate.totalHeadcount);

  return (
    <DetailPanel aria-label={`Детали: ${node.name}`}>
      <DetailTitle>{node.name}<DetailCloseButton type="button" aria-label="Снять выбор" onClick={onClearSelection}>×</DetailCloseButton></DetailTitle>
      <DetailSection>
        <DetailSectionTitle>Raw-метрики</DetailSectionTitle>
        <DetailMetrics>
          <DetailMetric><dt>Сотрудники</dt><DetailMetricValue>{node.headcount}</DetailMetricValue></DetailMetric>
          <DetailMetric><dt>Бюджет</dt><DetailMetricValue>{formatBudget(node.budget)}</DetailMetricValue></DetailMetric>
          <DetailMetric><dt>Эффективность</dt><DetailMetricValue>{formatMetricNumber(node.performance)}</DetailMetricValue></DetailMetric>
        </DetailMetrics>
      </DetailSection>
      <DetailSection>
        <DetailSectionTitle>Агрегаты подразделения</DetailSectionTitle>
        <DetailMetrics>
          <DetailMetric><dt>Всего сотрудников</dt><DetailMetricValue>{aggregate.totalHeadcount}</DetailMetricValue></DetailMetric>
          <DetailMetric><dt>Общий бюджет</dt><DetailMetricValue>{formatBudget(aggregate.totalBudget)}</DetailMetricValue></DetailMetric>
          <DetailMetric><dt>Средняя эффективность</dt><DetailMetricValue>{averagePerformance}</DetailMetricValue></DetailMetric>
        </DetailMetrics>
      </DetailSection>
      <DetailSection>
        <DetailSectionTitle>Дочерние узлы</DetailSectionTitle>
        {childIds.length > 0
          ? <DetailChildren>{childIds.map((childId) => <li key={childId}>{snapshot.nodesById[childId]?.name}</li>)}</DetailChildren>
          : <DetailMuted>Нет дочерних узлов</DetailMuted>}
      </DetailSection>
      <DetailSection>
        <DetailSectionTitle>Последнее обновление</DetailSectionTitle>
        <DetailMuted>{formatTimestamp(node.updatedAt)}</DetailMuted>
      </DetailSection>
    </DetailPanel>
  );
}
