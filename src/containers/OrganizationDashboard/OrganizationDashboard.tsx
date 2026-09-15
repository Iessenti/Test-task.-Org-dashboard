import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useOrgTreeQuery } from '@/data/org-tree/org-tree-query';
import { useRealtimeConnection } from '@/data/org-tree/use-realtime-connection';
import type { RealtimeConnection } from '@/data/org-tree/realtime-connection';
import { orgTreeQueryClient } from '@/data/org-tree/org-tree-query';
import { createRealtimeCacheUpdater } from '@/data/org-tree/org-tree-realtime-cache';
import { useRealtimeFeedback } from '@/data/org-tree/use-realtime-feedback';
import { useRealtimeNotifications } from '@/data/org-tree/use-realtime-notifications';
import type { OrgSnapshot } from '@/data/org-tree/org-tree-validation';
import { OrganizationDashboardView } from './OrganizationDashboardView';

export type DashboardMode = 'canvas' | 'table';

export function OrganizationDashboard() {
  const query = useOrgTreeQuery();
  const [mode, setMode] = useState<DashboardMode>('canvas');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [realtimeUpdater] = useState(() => createRealtimeCacheUpdater(orgTreeQueryClient));
  const realtimeConnectionRef = useRef<RealtimeConnection | null>(null);
  const feedback = useRealtimeFeedback();
  const notifications = useRealtimeNotifications();
  const hasOrganizationSnapshot = query.data !== undefined && Object.keys(query.data.nodesById).length > 0;
  const onRealtimeMessage = useCallback((payload: string) => {
    const result = realtimeUpdater.applyPayload(payload);
    if (result.kind === 'recovery-required') {
      void query.refetch().then(() => {
        // The full GET is only a baseline: the mock server does not persist
        // generated metric patches. Resume from the last applied event so the
        // SSE replay can deliver every event that exposed the gap.
        const recovery = realtimeUpdater.acceptRecovery(result.decision.lastAppliedSequence);
        realtimeConnectionRef.current?.restart(recovery.resumeFromEventId);
      }).catch(() => {
        realtimeUpdater.acceptRecovery(result.decision.lastAppliedSequence);
        realtimeConnectionRef.current?.restart();
      });
      return;
    }
    if (result.kind !== 'applied' || result.feedbackCells.length === 0) return;
    feedback.markUpdated(result.feedbackCells);
    const nodeName = orgTreeQueryClient.getQueryData<OrgSnapshot>(['org-tree'])?.nodesById[result.patch.nodeId]?.name ?? result.patch.nodeId;
    const fields = Object.keys(result.patch.metrics).map((metric) => metric === 'headcount' ? 'сотрудники' : metric === 'budget' ? 'бюджет' : 'эффективность');
    notifications.notify(`Обновлено: ${nodeName} — ${fields.join(', ')}`);
  }, [feedback, notifications, query, realtimeUpdater]);
  const onConnection = useCallback((connection: RealtimeConnection) => {
    realtimeConnectionRef.current = connection;
  }, []);
  const realtimeStatus = useRealtimeConnection({
    enabled: hasOrganizationSnapshot,
    onMessage: onRealtimeMessage,
    onConnection,
  });
  const toggleNodeSelection: Dispatch<SetStateAction<string | null>> = (next) => {
    if (typeof next === 'function') {
      setSelectedNodeId(next);
      return;
    }
    setSelectedNodeId((currentId) => currentId === next ? null : next);
  };
  const effectiveSelectedNodeId = query.data !== undefined
    && selectedNodeId !== null
    && query.data.nodesById[selectedNodeId] === undefined
    ? null
    : selectedNodeId;

  return (
    <OrganizationDashboardView
      query={query}
      selectedNodeId={effectiveSelectedNodeId}
      onSelectNode={(nodeId) => toggleNodeSelection(nodeId)}
    mode={mode}
    onModeChange={setMode}
      realtimeStatus={realtimeStatus}
      feedback={feedback}
      notifications={notifications.notifications}
  />
  );
}
