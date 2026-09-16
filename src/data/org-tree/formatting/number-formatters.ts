export function formatMetricNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value).replace(/[\u00a0\u202f]/g, ' ');
}
