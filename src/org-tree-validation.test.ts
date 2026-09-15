import { describe, expect, it } from 'vitest';
import { parseOrgTreePayload } from './org-tree-validation';

const validNode = {
  id: 'division-1',
  name: 'Дивизион 1',
  parentId: null,
  headcount: 10,
  budget: 100_000,
  performance: 75,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('organization payload validation', () => {
  it('accepts a valid node collection', () => {
    expect(parseOrgTreePayload([validNode])).toEqual([validNode]);
  });

  it('accepts an empty collection', () => {
    expect(parseOrgTreePayload([])).toEqual([]);
  });

  it('rejects malformed fields and out-of-range metrics', () => {
    expect(() => parseOrgTreePayload([{ ...validNode, headcount: 1.5 }])).toThrow();
    expect(() => parseOrgTreePayload([{ ...validNode, performance: 101 }])).toThrow();
    expect(() => parseOrgTreePayload([{ ...validNode, budget: '100000' }])).toThrow();
    expect(() => parseOrgTreePayload([{ ...validNode, parentId: 42 }])).toThrow();
    expect(() => parseOrgTreePayload([{ ...validNode, name: undefined }])).toThrow();
  });
});
