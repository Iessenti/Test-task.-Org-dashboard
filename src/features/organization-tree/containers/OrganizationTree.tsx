import { useEffect, useMemo, useRef, useState } from 'react';
import type { OrgSnapshot } from '@/data/org-tree/model/org-tree-types';
import {
  buildLayout,
  getTopologySignature,
} from '@/features/organization-tree/model/canvas-layout';
import { useCanvasViewport } from '@/features/organization-tree/hooks/useCanvasViewport';
import { useLayoutTransition } from '@/features/organization-tree/hooks/useLayoutTransition';
import {
  CanvasFrame,
  CanvasContent,
  CanvasSurface,
  CanvasViewport,
} from '@/features/organization-tree/containers/OrganizationTree.style';
import { OrganizationTreeControls } from '@/features/organization-tree/components/OrganizationTreeControls';
import { OrganizationTreeEdges } from '@/features/organization-tree/components/OrganizationTreeEdges';
import { OrganizationTreeNode } from '@/features/organization-tree/components/OrganizationTreeNode';
import { OrganizationTreeDetailPanel } from '@/features/organization-tree/components/OrganizationTreeDetailPanel';
import type { RealtimeFeedbackController } from '@/data/org-tree/hooks/use-realtime-feedback';

export function OrganizationTree({
  snapshot,
  selectedNodeId,
  onSelectNode,
  feedback,
}: {
  snapshot: OrgSnapshot;
  selectedNodeId: string | null;
  onSelectNode: (_nodeId: string) => void;
  feedback: RealtimeFeedbackController;
}) {
  const topologySignature = useMemo(() => getTopologySignature(snapshot), [snapshot]);
  const [expansionState, setExpansionState] = useState(() => ({
    ids: new Set(snapshot.rootIds),
    topologySignature,
  }));
  const expandedIds = useMemo(
    () => expansionState.topologySignature === topologySignature
      ? expansionState.ids
      : new Set(snapshot.rootIds),
    [expansionState, snapshot.rootIds, topologySignature],
  );

  const revealedExpandedIds = useMemo(() => {
    const nextIds = new Set(expandedIds);
    let currentId = selectedNodeId === null ? null : snapshot.nodesById[selectedNodeId]?.parentId ?? null;
    while (currentId !== null) {
      nextIds.add(currentId);
      currentId = snapshot.nodesById[currentId]?.parentId ?? null;
    }
    return nextIds;
  }, [expandedIds, selectedNodeId, snapshot]);

  const layout = useMemo(() => buildLayout(snapshot, revealedExpandedIds), [snapshot, revealedExpandedIds]);
  const renderedPositions = useLayoutTransition(layout.positions);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const panMovedRef = useRef(false);
  const canvasViewport = useCanvasViewport(layout, canvasViewportRef, panMovedRef);
  const { centerOn } = canvasViewport;
  const selectedPosition = selectedNodeId === null ? undefined : layout.positions[selectedNodeId];
  const selectedPositionKey = selectedPosition === undefined
    ? 'none'
    : `${selectedPosition.x}:${selectedPosition.y}`;

  useEffect(() => {
    if (selectedNodeId === null || selectedPositionKey === 'none') return;
    const frame = requestAnimationFrame(() => centerOn(selectedNodeId));
    return () => cancelAnimationFrame(frame);
  }, [centerOn, selectedNodeId, selectedPositionKey]);

  const toggleNode = (id: string) => {
    setExpansionState((currentState) => {
      const nextIds = new Set(
        currentState.topologySignature === topologySignature
          ? currentState.ids
          : snapshot.rootIds,
      );
      if (nextIds.has(id)) nextIds.delete(id);
      else nextIds.add(id);
      return { ids: nextIds, topologySignature };
    });
  };

  const handleNodeClick = (id: string) => {
    if (canvasViewport.consumePan()) {
      return;
    }

    onSelectNode(id);
  };

  const handleClearSelection = () => {
    if (selectedNodeId === null) return;

    setExpansionState({
      ids: new Set(revealedExpandedIds),
      topologySignature,
    });
    onSelectNode(selectedNodeId);
  };

  const visibleEdges = Object.entries(snapshot.childrenByParentId).flatMap(([parentId, childIds]) => {
    const parent = renderedPositions[parentId];
    if (parent === undefined) return [];
    return childIds.flatMap((childId) => {
      const child = renderedPositions[childId];
      if (child === undefined) return [];
      return [{
        child,
        parent,
        isVisible: layout.positions[parentId] !== undefined && layout.positions[childId] !== undefined,
      }];
    });
  });

  return <CanvasFrame>
    <OrganizationTreeControls onFit={canvasViewport.fitView} onZoomIn={() => canvasViewport.zoomAroundCenter(1)} onZoomOut={() => canvasViewport.zoomAroundCenter(-1)} />
    <CanvasContent>
      <CanvasViewport ref={canvasViewportRef} $isPanning={canvasViewport.isPanning} aria-label="Организационная структура canvas" onPointerCancel={canvasViewport.stopPanning} onPointerDown={canvasViewport.handlePointerDown} onPointerMove={canvasViewport.handlePointerMove} onPointerUp={canvasViewport.stopPanning} onWheel={canvasViewport.handleWheel} role="tree">
        <CanvasSurface $height={layout.height} $offsetX={canvasViewport.viewport.offsetX} $offsetY={canvasViewport.viewport.offsetY} $scale={canvasViewport.viewport.scale} $width={layout.width}>
          <OrganizationTreeEdges edges={visibleEdges} height={layout.height} width={layout.width} />
          {Object.values(snapshot.nodesById).map((node) => {
          const layoutNode = renderedPositions[node.id];
          if (layoutNode === undefined) return null;
          if (node === undefined) return null;
          const aggregate = snapshot.aggregatesById[node.id];
          if (aggregate === undefined) return null;
          return <OrganizationTreeNode
            aggregate={aggregate}
            key={node.id}
            hasChildren={(snapshot.childrenByParentId[node.id] ?? []).length > 0}
            isExpanded={revealedExpandedIds.has(node.id)}
            isVisible={layout.positions[node.id] !== undefined}
            isPanning={canvasViewport.isPanning}
            isSelected={selectedNodeId === node.id}
            layout={layoutNode}
            node={node}
            onClick={() => handleNodeClick(node.id)}
            onSelect={onSelectNode}
            onToggle={() => toggleNode(node.id)}
            renderedPosition={renderedPositions[layoutNode.id] ?? layoutNode}
            feedback={feedback}
          />;
          })}
        </CanvasSurface>
      </CanvasViewport>
      <OrganizationTreeDetailPanel onClearSelection={handleClearSelection} selectedNodeId={selectedNodeId} snapshot={snapshot} />
    </CanvasContent>
  </CanvasFrame>;
}
