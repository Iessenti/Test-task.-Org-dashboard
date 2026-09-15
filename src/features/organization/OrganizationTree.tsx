import { useState } from 'react';
import type { ReactElement } from 'react';
import { styled } from 'styled-components';
import type { OrgSnapshot } from '@/data/org-tree/org-tree-validation';

const Tree = styled.ul`
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const TreeItem = styled.li<{ $depth: number }>`
  margin-left: ${({ $depth }) => $depth * 24}px;
  padding: 12px 16px;
  border: 1px solid #dce3ee;
  border-radius: 12px;
  background: #ffffff;
`;

const NodeContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const NodeName = styled.span`
  font-weight: 600;
`;

const NodeToggle = styled.button`
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
`;

const NodeMetrics = styled.span`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
  color: #526176;
  font-size: 0.9rem;
`;

const PerformanceIndicator = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ $color }) => $color};
  font-weight: 600;
`;

const PerformanceDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

function getPerformanceBand(performance: number) {
  if (performance < 50) {
    return { label: 'Низкая', color: '#b42318' };
  }

  if (performance < 80) {
    return { label: 'Средняя', color: '#9a6700' };
  }

  return { label: 'Высокая', color: '#067647' };
}

export function OrganizationTree({ snapshot }: { snapshot: OrgSnapshot }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set(snapshot.rootIds));

  const toggleNode = (id: string) => {
    setExpandedIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }

      return nextIds;
    });
  };

  const renderNode = (id: string, depth: number): ReactElement => {
    const node = snapshot.nodesById[id];
    if (node === undefined) {
      return <></>;
    }

    const childIds = snapshot.childrenByParentId[id] ?? [];
    const isExpanded = expandedIds.has(id);
    const branchId = `organization-branch-${encodeURIComponent(id)}`;
    const performanceBand = getPerformanceBand(node.performance);

    return (
      <TreeItem key={id} $depth={depth} role="treeitem" aria-level={depth + 1}>
        <NodeContent>
          {childIds.length > 0 ? (
            <NodeToggle
              type="button"
              aria-controls={branchId}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Свернуть' : 'Развернуть'} ${node.name}`}
              onClick={() => toggleNode(id)}
            >
              {node.name}
            </NodeToggle>
          ) : (
            <NodeName>{node.name}</NodeName>
          )}
          <NodeMetrics>
            <span>Сотрудники: {node.headcount}</span>
            <PerformanceIndicator
              $color={performanceBand.color}
              aria-label={`Эффективность: ${performanceBand.label}, ${node.performance}`}
            >
              <PerformanceDot $color={performanceBand.color} aria-hidden="true" />
              {performanceBand.label}: {node.performance}
            </PerformanceIndicator>
          </NodeMetrics>
        </NodeContent>
        {childIds.length > 0 && isExpanded && (
          <Tree id={branchId} aria-label={`Подразделения ${node.name}`}>
            {childIds.map((childId) => renderNode(childId, depth + 1))}
          </Tree>
        )}
      </TreeItem>
    );
  };

  return (
    <Tree aria-label="Организационная структура" role="tree">
      {snapshot.rootIds.map((rootId) => renderNode(rootId, 0))}
    </Tree>
  );
}
