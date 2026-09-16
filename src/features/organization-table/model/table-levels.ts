import type { OrganizationTableRow } from './table-types';

export function getOrganizationLevel(depth: number): OrganizationTableRow['level'] {
  if (depth === 0) return 'Дивизион';
  if (depth === 1) return 'Отдел';
  return 'Команда';
}
