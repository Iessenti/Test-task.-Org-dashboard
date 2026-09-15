import { useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { OrgSnapshot } from '@/data/org-tree/org-tree-validation';
import {
  buildLayout,
  getTopologySignature,
  type LayoutNode,
} from '@/features/organization-tree/model/canvas-layout';
import { useCanvasViewport } from '@/features/organization-tree/hooks/useCanvasViewport';
import { useLayoutTransition } from '@/features/organization-tree/hooks/useLayoutTransition';
import {
  CanvasFrame,
  CanvasSurface,
  CanvasViewport,
} from '@/features/organization-tree/containers/OrganizationTree.style';
import { OrganizationTreeControls } from '@/features/organization-tree/components/OrganizationTreeControls';
import { OrganizationTreeEdges } from '@/features/organization-tree/components/OrganizationTreeEdges';
import { OrganizationTreeNode } from '@/features/organization-tree/components/OrganizationTreeNode';

export function OrganizationTree({
  snapshot,
  selectedNodeId,
  onSelectNode,
}: {
  snapshot: OrgSnapshot;
  selectedNodeId: string | null;
  onSelectNode: Dispatch<SetStateAction<string | null>>;
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
  const layout = useMemo(() => buildLayout(snapshot, expandedIds), [snapshot, expandedIds]);
  const renderedPositions = useLayoutTransition(layout.positions);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const panMovedRef = useRef(false);
  const canvasViewport = useCanvasViewport(layout, canvasViewportRef, panMovedRef);

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

  const visibleEdges = layout.nodes.flatMap((parent) =>
    (snapshot.childrenByParentId[parent.id] ?? [])
      .map((childId) => layout.positions[childId])
      .filter((child): child is LayoutNode => child !== undefined)
      .map((child) => ({
        child: renderedPositions[child.id] ?? child,
        parent: renderedPositions[parent.id] ?? parent,
      })),
  );

  return <CanvasFrame>
    <OrganizationTreeControls onFit={canvasViewport.fitView} onReset={canvasViewport.resetView} onZoomIn={() => canvasViewport.zoomAroundCenter(1)} onZoomOut={() => canvasViewport.zoomAroundCenter(-1)} />
    <CanvasViewport ref={canvasViewportRef} $isPanning={canvasViewport.isPanning} aria-label="Организационная структура canvas" onPointerCancel={canvasViewport.stopPanning} onPointerDown={canvasViewport.handlePointerDown} onPointerMove={canvasViewport.handlePointerMove} onPointerUp={canvasViewport.stopPanning} onWheel={canvasViewport.handleWheel} role="tree">
      <CanvasSurface $height={layout.height} $offsetX={canvasViewport.viewport.offsetX} $offsetY={canvasViewport.viewport.offsetY} $scale={canvasViewport.viewport.scale} $width={layout.width}>
        <OrganizationTreeEdges edges={visibleEdges} height={layout.height} width={layout.width} />
        {layout.nodes.map((layoutNode) => {
          const node = snapshot.nodesById[layoutNode.id];
          if (node === undefined) return null;
          return <OrganizationTreeNode
            key={node.id}
            hasChildren={(snapshot.childrenByParentId[node.id] ?? []).length > 0}
            isExpanded={expandedIds.has(node.id)}
            isPanning={canvasViewport.isPanning}
            isSelected={selectedNodeId === node.id}
            layout={layoutNode}
            node={node}
            onClick={() => handleNodeClick(node.id)}
            onSelect={onSelectNode}
            onToggle={() => toggleNode(node.id)}
            renderedPosition={renderedPositions[layoutNode.id] ?? layoutNode}
          />;
        })}
      </CanvasSurface>
    </CanvasViewport>
  </CanvasFrame>;
}
