import type { OrgNodeDto } from './org-tree-types';

export type OrgTopology = {
  nodesById: Record<string, OrgNodeDto>;
  rootIds: string[];
  childrenByParentId: Record<string, string[]>;
  depthById: Record<string, number>;
};

export function validateOrgTreeHierarchy(nodes: readonly OrgNodeDto[]): void {
  const nodesById = new Map<string, OrgNodeDto>();
  for (const node of nodes) {
    if (nodesById.has(node.id)) throw new Error(`Duplicate organization node id: ${node.id}`);
    nodesById.set(node.id, node);
  }
  for (const node of nodes) {
    if (node.parentId !== null && !nodesById.has(node.parentId)) {
      throw new Error(`Missing parent for organization node: ${node.id}`);
    }
  }
  for (const node of nodes) {
    const visited = new Set<string>();
    let current = node;
    while (current.parentId !== null) {
      if (visited.has(current.id)) throw new Error(`Cycle detected in organization hierarchy: ${current.id}`);
      visited.add(current.id);
      current = nodesById.get(current.parentId)!;
    }
  }
}

export function buildOrgTopology(nodes: readonly OrgNodeDto[]): OrgTopology {
  const nodesById: Record<string, OrgNodeDto> = {};
  const rootIds: string[] = [];
  const childrenByParentId: Record<string, string[]> = {};
  for (const node of nodes) {
    nodesById[node.id] = node;
    childrenByParentId[node.id] = [];
  }
  for (const node of nodes) {
    if (node.parentId === null) rootIds.push(node.id);
    else childrenByParentId[node.parentId]?.push(node.id);
  }

  const depthById: Record<string, number> = {};
  const getDepth = (id: string): number => {
    if (depthById[id] !== undefined) return depthById[id];
    const node = nodesById[id];
    if (node === undefined) throw new Error(`Cannot normalize unknown organization node: ${id}`);
    const depth = node.parentId === null ? 0 : getDepth(node.parentId) + 1;
    depthById[id] = depth;
    return depth;
  };
  nodes.forEach((node) => getDepth(node.id));
  return { nodesById, rootIds, childrenByParentId, depthById };
}
