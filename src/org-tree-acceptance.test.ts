import { describe, expect, it } from 'vitest';
import { parseOrgSnapshot } from './org-tree-validation';

const node = (id: string, parentId: string | null) => ({
  id,
  name: id,
  parentId,
  headcount: 1,
  budget: 1,
  performance: 50,
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('organization snapshot acceptance', () => {
  it('publishes a normalized snapshot only after schema and topology validation', () => {
    const snapshot = parseOrgSnapshot([
      node('root', null),
      node('team', 'root'),
    ]);

    expect(snapshot.rootIds).toEqual(['root']);
    expect(snapshot.nodesById.team.parentId).toBe('root');
    expect(snapshot.childrenByParentId.root).toEqual(['team']);
  });

  it('accepts an empty snapshot', () => {
    expect(parseOrgSnapshot([])).toEqual({
      nodesById: {},
      rootIds: [],
      childrenByParentId: {},
      depthById: {},
    });
  });

  it('rejects malformed payloads before normalization', () => {
    expect(() => parseOrgSnapshot([node('root', null), { ...node('team', 'root'), budget: '1' }])).toThrow();
  });

  it('rejects invalid topology without producing a snapshot', () => {
    expect(() => parseOrgSnapshot([node('a', 'b'), node('b', 'a')])).toThrow(/Cycle/);
    expect(() => parseOrgSnapshot([node('child', 'missing')])).toThrow(/Missing parent/);
  });
});
