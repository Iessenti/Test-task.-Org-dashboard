import { useState, type Dispatch, type SetStateAction } from 'react';
import { useOrgTreeQuery } from '@/data/org-tree/org-tree-query';
import { OrganizationDashboardView } from './OrganizationDashboardView';

export type DashboardMode = 'canvas' | 'table';

export function OrganizationDashboard() {
  const query = useOrgTreeQuery();
  const [mode, setMode] = useState<DashboardMode>('canvas');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
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
    />
  );
}
