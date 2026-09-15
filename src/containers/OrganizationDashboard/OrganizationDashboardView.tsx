import type { UseQueryResult } from '@tanstack/react-query';
import type { Dispatch, SetStateAction } from 'react';
import { OrganizationTree } from '@/features/organization-tree/containers/OrganizationTree';
import { OrganizationTable } from '@/features/organization-table/containers/OrganizationTable';
import { BackgroundStatus, LoadingSpinner, RealtimeNotification, RealtimeNotificationRegion, RealtimeStatus, RetryButton, StateContent, StateMessage, StatePanel, StatusGroup } from './OrganizationDashboardView.style';
import type { DashboardMode } from './OrganizationDashboard';
import { ModeButton, ModeSwitch, ViewHeader } from './OrganizationDashboardView.style';
import type { OrgTreeRequestError } from '@/data/org-tree/org-tree-resource';
import type { OrgSnapshot } from '@/data/org-tree/org-tree-validation';
import type { RealtimeConnectionStatus } from '@/data/org-tree/realtime-connection';
import type { RealtimeFeedbackController } from '@/data/org-tree/use-realtime-feedback';
import type { RealtimeNotification as RealtimeNotificationData } from '@/data/org-tree/use-realtime-notifications';

export type OrganizationDashboardQuery = Pick<UseQueryResult<OrgSnapshot, OrgTreeRequestError>, 'data' | 'isError' | 'isFetching' | 'isPending' | 'refetch'>;

export function OrganizationDashboardView({ query, selectedNodeId, onSelectNode, mode, onModeChange, realtimeStatus, feedback, notifications }: {
  query: OrganizationDashboardQuery;
  selectedNodeId: string | null;
  onSelectNode: (_nodeId: string) => void;
  mode: DashboardMode;
  onModeChange: Dispatch<SetStateAction<DashboardMode>>;
  realtimeStatus: RealtimeConnectionStatus;
  feedback: RealtimeFeedbackController;
  notifications: RealtimeNotificationData[];
}) {
  if (query.isPending) {
    return <StatePanel role="status"><StateContent $centered><LoadingSpinner aria-hidden="true" /><StateMessage>Загрузка организации…</StateMessage></StateContent></StatePanel>;
  }
  if (query.isError && query.data === undefined) {
    return <StatePanel role="alert"><StateContent $centered><span>Не удалось загрузить организацию.</span><RetryButton type="button" onClick={() => void query.refetch()}>Повторить</RetryButton></StateContent></StatePanel>;
  }
  if (query.data === undefined || Object.keys(query.data.nodesById).length === 0) {
    return <StatePanel aria-label="Организационная структура"><StateContent $centered>{query.isFetching && <BackgroundStatus role="status">Обновляем…</BackgroundStatus>}<StateMessage role="status">Организация пока пуста.</StateMessage></StateContent></StatePanel>;
  }
  const realtimeStatusLabel = realtimeStatus === 'live' ? 'Live' : realtimeStatus === 'reconnecting' ? 'Reconnecting…' : 'Offline';
  return <StatePanel aria-label="Организационная структура">
    <ViewHeader>
      <StatusGroup>
        <RealtimeStatus $status={realtimeStatus} role="status" aria-label="Статус соединения">
          {realtimeStatusLabel}
        </RealtimeStatus>
        {query.isError && <BackgroundStatus role="status">Не удалось обновить данные. Показана последняя версия.</BackgroundStatus>}
      </StatusGroup>
      <ModeSwitch aria-label="Представление организации">
        <ModeButton type="button" $active={mode === 'canvas'} onClick={() => onModeChange('canvas')}>Карта</ModeButton>
        <ModeButton type="button" $active={mode === 'table'} onClick={() => onModeChange('table')}>Таблица</ModeButton>
      </ModeSwitch>
    </ViewHeader>
    {mode === 'canvas'
      ? <OrganizationTree feedback={feedback} onSelectNode={onSelectNode} selectedNodeId={selectedNodeId} snapshot={query.data} />
      : <OrganizationTable feedback={feedback} onSelectNode={onSelectNode} selectedNodeId={selectedNodeId} snapshot={query.data} />}
    <RealtimeNotificationRegion aria-label="Уведомления об обновлениях" role="status">
      {notifications.map((notification) => <RealtimeNotification key={notification.id}>{notification.message}</RealtimeNotification>)}
    </RealtimeNotificationRegion>
  </StatePanel>;
}
