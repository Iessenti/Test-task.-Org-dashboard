import { describe, expect, it } from 'vitest';
import {
  normalizeOrgTree,
  parseOrgTreePayload,
} from './org-tree-validation';

const node = (id: string, parentId: string | null) => ({
  id,
  name: id,
  parentId,
  headcount: 1,
  budget: 1,
  performance: 50,
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('organization tree normalization', () => {
  it('builds canonical nodes and stable topology indexes', () => {
    const nodes = parseOrgTreePayload([
      node('team-b', 'department-a'),
      node('root-b', null),
      node('team-a', 'department-a'),
      node('department-a', 'root-a'),
      node('root-a', null),
    ]);

    const snapshot = normalizeOrgTree(nodes);

    expect(snapshot.nodesById).toEqual({
      'team-b': nodes[0],
      'root-b': nodes[1],
      'team-a': nodes[2],
      'department-a': nodes[3],
      'root-a': nodes[4],
    });
    expect(snapshot.rootIds).toEqual(['root-b', 'root-a']);
    expect(snapshot.childrenByParentId).toEqual({
      'team-b': [],
      'root-b': [],
      'team-a': [],
      'department-a': ['team-b', 'team-a'],
      'root-a': ['department-a'],
    });
    expect(snapshot.depthById).toEqual({
      'team-b': 2,
      'root-b': 0,
      'team-a': 2,
      'department-a': 1,
      'root-a': 0,
    });
    expect(snapshot).not.toHaveProperty('aggregatesById');
  });

  it('supports traversal of an empty collection', () => {
    const snapshot = normalizeOrgTree(parseOrgTreePayload([]));

    expect(snapshot).toEqual({
      nodesById: {},
      rootIds: [],
      childrenByParentId: {},
      depthById: {},
    });
  });
});
