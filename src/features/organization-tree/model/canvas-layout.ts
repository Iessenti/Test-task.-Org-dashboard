import type { OrgSnapshot } from '@/data/org-tree/org-tree-validation';

export const CARD_WIDTH = 232;
export const CARD_HEIGHT = 216;
export const HORIZONTAL_GAP = 40;
export const VERTICAL_GAP = 88;
export const CANVAS_PADDING = 40;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 2;
export const ZOOM_STEP = 0.1;
export const ARROW_LENGTH = 12;
export const ARROW_OVERLAP = 6;

export type LayoutNode = {
  id: string;
  parentId: string | null;
  depth: number;
  x: number;
  y: number;
};

type VisibleTreeNode = {
  children: VisibleTreeNode[];
  depth: number;
  id: string;
  parentId: string | null;
  subtreeWidth: number;
};

export type CanvasLayout = {
  nodes: LayoutNode[];
  width: number;
  height: number;
  positions: Record<string, LayoutNode>;
};

export function getTopologySignature(snapshot: OrgSnapshot): string {
  return JSON.stringify([snapshot.rootIds, snapshot.childrenByParentId]);
}

export function interpolatePositions(
  from: Readonly<Record<string, LayoutNode>>,
  to: Readonly<Record<string, LayoutNode>>,
  progress: number,
) {
  const positions: Record<string, LayoutNode> = {};
  for (const target of Object.values(to)) {
    const previous = from[target.id]
      ?? (target.parentId === null ? undefined : from[target.parentId]);
    if (previous === undefined) {
      positions[target.id] = target;
      continue;
    }

    positions[target.id] = {
      ...target,
      x: previous.x + (target.x - previous.x) * progress,
      y: previous.y + (target.y - previous.y) * progress,
    };
  }

  return positions;
}

export function buildLayout(snapshot: OrgSnapshot, expandedIds: ReadonlySet<string>): CanvasLayout {
  const createVisibleNode = (id: string, depth: number, parentId: string | null): VisibleTreeNode | null => {
    if (snapshot.nodesById[id] === undefined) {
      return null;
    }

    const children = expandedIds.has(id)
      ? (snapshot.childrenByParentId[id] ?? [])
          .map((childId) => createVisibleNode(childId, depth + 1, id))
          .filter((child): child is VisibleTreeNode => child !== null)
      : [];

    return { children, depth, id, parentId, subtreeWidth: CARD_WIDTH };
  };

  const roots = snapshot.rootIds
    .map((rootId) => createVisibleNode(rootId, 0, null))
    .filter((root): root is VisibleTreeNode => root !== null);

  const measureSubtree = (node: VisibleTreeNode): number => {
    if (node.children.length === 0) {
      return node.subtreeWidth;
    }

    const childrenWidth = node.children.reduce(
      (total, child, index) => total + measureSubtree(child) + (index > 0 ? HORIZONTAL_GAP : 0),
      0,
    );
    node.subtreeWidth = Math.max(CARD_WIDTH, childrenWidth);
    return node.subtreeWidth;
  };

  roots.forEach(measureSubtree);
  const positions: Record<string, LayoutNode> = {};

  const positionSubtree = (node: VisibleTreeNode, left: number) => {
    positions[node.id] = {
      id: node.id,
      parentId: node.parentId,
      depth: node.depth,
      x: left + (node.subtreeWidth - CARD_WIDTH) / 2,
      y: CANVAS_PADDING + node.depth * (CARD_HEIGHT + VERTICAL_GAP),
    };

    let childLeft = left;
    for (const child of node.children) {
      positionSubtree(child, childLeft);
      childLeft += child.subtreeWidth + HORIZONTAL_GAP;
    }
  };

  let rootLeft = CANVAS_PADDING;
  for (const root of roots) {
    positionSubtree(root, rootLeft);
    rootLeft += root.subtreeWidth + HORIZONTAL_GAP;
  }

  const contentWidth = Math.max(rootLeft - CANVAS_PADDING - HORIZONTAL_GAP, CARD_WIDTH);
  const maxDepth = Math.max(...Object.values(positions).map((node) => node.depth), 0);
  return {
    nodes: Object.values(positions),
    width: CANVAS_PADDING + contentWidth + CANVAS_PADDING,
    height: CANVAS_PADDING * 2 + (maxDepth + 1) * CARD_HEIGHT + maxDepth * VERTICAL_GAP,
    positions,
  };
}
