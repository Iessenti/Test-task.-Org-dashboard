import { describe, expect, it } from 'vitest';
import {
  parseOrgTreePayload,
  validateOrgTreeHierarchy,
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

describe('organization hierarchy validation', () => {
  it('accepts an empty forest and multiple roots', () => {
    const nodes = parseOrgTreePayload([node('root-a', null), node('root-b', null)]);

    expect(() => validateOrgTreeHierarchy(nodes)).not.toThrow();
  });

  it('rejects duplicate ids', () => {
    const nodes = parseOrgTreePayload([node('root', null), node('root', null)]);

    expect(() => validateOrgTreeHierarchy(nodes)).toThrow(/Duplicate/);
  });

  it('rejects a missing parent', () => {
    const nodes = parseOrgTreePayload([node('child', 'missing-parent')]);

    expect(() => validateOrgTreeHierarchy(nodes)).toThrow(/Missing parent/);
  });

  it('rejects a self-parent cycle', () => {
    const nodes = parseOrgTreePayload([node('node', 'node')]);

    expect(() => validateOrgTreeHierarchy(nodes)).toThrow(/Cycle/);
  });

  it('rejects a cycle spanning multiple nodes', () => {
    const nodes = parseOrgTreePayload([
      node('a', 'b'),
      node('b', 'a'),
    ]);

    expect(() => validateOrgTreeHierarchy(nodes)).toThrow(/Cycle/);
  });

  it('accepts a valid chain belonging to one root', () => {
    const nodes = parseOrgTreePayload([
      node('root', null),
      node('department', 'root'),
      node('team', 'department'),
    ]);

    expect(() => validateOrgTreeHierarchy(nodes)).not.toThrow();
  });
});
