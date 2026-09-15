import { z } from 'zod';

export const orgNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
  headcount: z.number().int().nonnegative(),
  budget: z.number().finite().nonnegative(),
  performance: z.number().min(0).max(100),
  updatedAt: z.string(),
});

export const orgTreeSchema = z.array(orgNodeSchema);

export type OrgNodeDto = z.infer<typeof orgNodeSchema>;

export type OrgSnapshot = {
  nodesById: Record<string, OrgNodeDto>;
  rootIds: string[];
  childrenByParentId: Record<string, string[]>;
  depthById: Record<string, number>;
};

export function parseOrgTreePayload(payload: unknown): OrgNodeDto[] {
  return orgTreeSchema.parse(payload);
}

export function validateOrgTreeHierarchy(nodes: readonly OrgNodeDto[]): void {
  const nodesById = new Map<string, OrgNodeDto>();

  for (const node of nodes) {
    if (nodesById.has(node.id)) {
      throw new Error(`Duplicate organization node id: ${node.id}`);
    }

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
      if (visited.has(current.id)) {
        throw new Error(`Cycle detected in organization hierarchy: ${current.id}`);
      }

      visited.add(current.id);
      current = nodesById.get(current.parentId)!;
    }
  }
}

export function normalizeOrgTree(nodes: readonly OrgNodeDto[]): OrgSnapshot {
  const nodesById: Record<string, OrgNodeDto> = {};
  const rootIds: string[] = [];
  const childrenByParentId: Record<string, string[]> = {};

  for (const node of nodes) {
    nodesById[node.id] = node;
    childrenByParentId[node.id] = [];
  }

  for (const node of nodes) {
    if (node.parentId === null) {
      rootIds.push(node.id);
    } else {
      const children = childrenByParentId[node.parentId];
      if (children === undefined) {
        throw new Error(`Cannot normalize missing parent: ${node.parentId}`);
      }

      children.push(node.id);
    }
  }

  const depthById: Record<string, number> = {};
  const getDepth = (id: string): number => {
    const knownDepth = depthById[id];
    if (knownDepth !== undefined) {
      return knownDepth;
    }

    const node = nodesById[id];
    if (node === undefined) {
      throw new Error(`Cannot normalize unknown organization node: ${id}`);
    }

    const depth = node.parentId === null ? 0 : getDepth(node.parentId) + 1;
    depthById[id] = depth;
    return depth;
  };

  for (const node of nodes) {
    getDepth(node.id);
  }

  return {
    nodesById,
    rootIds,
    childrenByParentId,
    depthById,
  };
}

export function parseOrgSnapshot(payload: unknown): OrgSnapshot {
  const nodes = parseOrgTreePayload(payload);
  validateOrgTreeHierarchy(nodes);
  return normalizeOrgTree(nodes);
}
