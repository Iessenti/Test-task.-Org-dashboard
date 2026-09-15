import type { UseQueryResult } from '@tanstack/react-query';
import { styled } from 'styled-components';
import { useOrgTreeQuery } from '@/data/org-tree/org-tree-query';
import type { OrgTreeRequestError } from '@/data/org-tree/org-tree-resource';
import type { OrgSnapshot } from '@/data/org-tree/org-tree-validation';
import { OrganizationTree } from './OrganizationTree';

const StatePanel = styled.section`
  padding: 24px;
  border: 1px solid #dce3ee;
  border-radius: 16px;
  background: #ffffff;
`;

export type OrganizationDashboardQuery = Pick<
  UseQueryResult<OrgSnapshot, OrgTreeRequestError>,
  'data' | 'error' | 'isError' | 'isPending'
>;

export function OrganizationDashboardView({ query }: { query: OrganizationDashboardQuery }) {
  if (query.isPending) {
    return <StatePanel role="status">Загрузка организации…</StatePanel>;
  }

  if (query.isError && query.data === undefined) {
    return <StatePanel role="alert">Не удалось загрузить организацию.</StatePanel>;
  }

  if (query.data === undefined || Object.keys(query.data.nodesById).length === 0) {
    return <StatePanel role="status">Организация пока пуста.</StatePanel>;
  }

  return (
    <StatePanel aria-label="Организационная структура">
      <OrganizationTree snapshot={query.data} />
    </StatePanel>
  );
}

export function OrganizationDashboard() {
  return <OrganizationDashboardView query={useOrgTreeQuery()} />;
}
