export type OrganizationTableRow = {
  id: string;
  subdivision: string;
  level: 'Дивизион' | 'Отдел' | 'Команда';
  totalEmployees: number;
  totalBudget: number;
  averagePerformance: number | null;
};

export type TableColumn = keyof Pick<OrganizationTableRow, 'subdivision' | 'level' | 'totalEmployees' | 'totalBudget' | 'averagePerformance'>;
