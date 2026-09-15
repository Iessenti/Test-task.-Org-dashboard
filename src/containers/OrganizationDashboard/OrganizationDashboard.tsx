import { useState } from 'react';
import { useOrgTreeQuery } from '@/data/org-tree/org-tree-query';
import { OrganizationDashboardView } from './OrganizationDashboardView';

export function OrganizationDashboard() {
  const query = useOrgTreeQuery();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const effectiveSelectedNodeId = query.data !== undefined
    && selectedNodeId !== null
    && query.data.nodesById[selectedNodeId] === undefined
    ? null
    : selectedNodeId;

  return (
    <OrganizationDashboardView
      query={query}
      selectedNodeId={effectiveSelectedNodeId}
      onSelectNode={setSelectedNodeId}
    />
  );
}
