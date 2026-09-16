export function formatBudget(budget: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(budget).replace(/[\u00a0\u202f]/g, ' ')} руб.`;
}

export function formatAveragePerformance(averagePerformance: number | null): string {
  return averagePerformance === null ? '—' : formatMetricNumber(averagePerformance);
}
import { formatMetricNumber } from '@/data/org-tree/formatting/number-formatters';
