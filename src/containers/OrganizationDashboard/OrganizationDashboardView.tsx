import type { UseQueryResult } from '@tanstack/react-query';
import type { Dispatch, SetStateAction } from 'react';
import { OrganizationTree } from '@/features/organization-tree/containers/OrganizationTree';
import { OrganizationTable } from '@/features/organization-table/containers/OrganizationTable';
import { BackgroundStatus, LoadingSpinner, RetryButton, StateContent, StateMessage, StatePanel } from './OrganizationDashboardView.style';
import type { DashboardMode } from './OrganizationDashboard';
import { ModeButton, ModeSwitch, ViewHeader } from './OrganizationDashboardView.style';
import type { OrgTreeRequestError } from '@/data/org-tree/org-tree-resource';
import type { OrgSnapshot } from '@/data/org-tree/org-tree-validation';

export type OrganizationDashboardQuery = Pick<UseQueryResult<OrgSnapshot, OrgTreeRequestError>, 'data' | 'isError' | 'isFetching' | 'isPending' | 'refetch'>;

export function OrganizationDashboardView({ query, selectedNodeId, onSelectNode, mode, onModeChange }: {
  query: OrganizationDashboardQuery;
  selectedNodeId: string | null;
  onSelectNode: (_nodeId: string) => void;
  mode: DashboardMode;
  onModeChange: Dispatch<SetStateAction<DashboardMode>>;
}) {
  if (query.isPending) {
    return <StatePanel role="status"><StateContent $centered><LoadingSpinner aria-hidden="true" /><StateMessage>Загрузка организации…</StateMessage></StateContent></StatePanel>;
  }
  if (query.isError && query.data === undefined) {
    return <StatePanel role="alert"><StateContent><span>Не удалось загрузить организацию.</span><RetryButton type="button" onClick={() => void query.refetch()}>Повторить</RetryButton></StateContent></StatePanel>;
  }
  if (query.data === undefined || Object.keys(query.data.nodesById).length === 0) {
    return <StatePanel aria-label="Организационная структура"><StateContent $centered>{query.isFetching && <BackgroundStatus role="status">Обновляем…</BackgroundStatus>}<StateMessage role="status">Организация пока пуста.</StateMessage></StateContent></StatePanel>;
  }
  return <StatePanel aria-label="Организационная структура">
    <ViewHeader>
      {query.isFetching ? <BackgroundStatus role="status">Обновляем…</BackgroundStatus> : <span aria-hidden="true" />}
      <ModeSwitch aria-label="Представление организации">
        <ModeButton type="button" $active={mode === 'canvas'} onClick={() => onModeChange('canvas')}>Карта</ModeButton>
        <ModeButton type="button" $active={mode === 'table'} onClick={() => onModeChange('table')}>Таблица</ModeButton>
      </ModeSwitch>
    </ViewHeader>
    {query.isError && <BackgroundStatus role="status">Не удалось обновить данные. Показана последняя версия.</BackgroundStatus>}
    {mode === 'canvas'
      ? <OrganizationTree onSelectNode={onSelectNode} selectedNodeId={selectedNodeId} snapshot={query.data} />
      : <OrganizationTable onSelectNode={onSelectNode} selectedNodeId={selectedNodeId} snapshot={query.data} />}
  </StatePanel>;
}
