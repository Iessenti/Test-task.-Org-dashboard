import { calculateOrgAggregates } from '../aggregation/org-tree-aggregation';
import { orgTreeSchema } from '../model/org-tree-schema';
import { buildOrgTopology, validateOrgTreeHierarchy } from '../model/org-tree-topology';
import type { OrgSnapshot } from '../model/org-tree-types';

export function parseOrgTreePayload(payload: unknown) {
  return orgTreeSchema.parse(payload);
}

export function normalizeOrgTree(nodes: Parameters<typeof buildOrgTopology>[0]): OrgSnapshot {
  const topology = buildOrgTopology(nodes);
  return { ...topology, aggregatesById: calculateOrgAggregates(topology) };
}

export function parseOrgSnapshot(payload: unknown): OrgSnapshot {
  const nodes = parseOrgTreePayload(payload);
  validateOrgTreeHierarchy(nodes);
  return normalizeOrgTree(nodes);
}
