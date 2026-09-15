import { describe, expect, it } from 'vitest';
import {
  parseRealtimePatch,
  RealtimePatchValidationError,
  type RealtimeMetricPatch,
} from './org-tree-realtime';

const knownNodeIds = new Set(['node-1', 'node-2']);
const validPatch: RealtimeMetricPatch = {
  type: 'metric.patch',
  eventId: 'evt-1',
  sequence: 7,
  nodeId: 'node-1',
  metrics: { performance: 84 },
  updatedAt: '2026-09-15T12:00:00.000Z',
};

describe('parseRealtimePatch', () => {
  it('accepts a valid partial metric patch and ordering metadata', () => {
    expect(parseRealtimePatch(JSON.stringify(validPatch), knownNodeIds)).toEqual(validPatch);
  });

  it('rejects malformed, forbidden, out-of-range, and unknown-node patches', () => {
    const invalidPayloads = [
      '{not-json',
      { ...validPatch, nodeId: 'missing-node' },
      { ...validPatch, metrics: { parentId: 'node-2' } },
      { ...validPatch, metrics: { performance: 101 } },
      { ...validPatch, metrics: { headcount: 1.5 } },
      { ...validPatch, metrics: { budget: Number.NaN } },
      { ...validPatch, metrics: {} },
      { ...validPatch, sequence: 0 },
      { ...validPatch, sequence: 1.2 },
      { ...validPatch, extra: true },
      { ...validPatch, updatedAt: 'not-a-date' },
    ];

    for (const payload of invalidPayloads) {
      expect(() => parseRealtimePatch(payload, knownNodeIds)).toThrow(RealtimePatchValidationError);
    }
  });
});
