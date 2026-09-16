import assert from 'node:assert/strict';
import test from 'node:test';
import orgTreeFixture from './fixtures/org-tree.json' with { type: 'json' };
import { assertMetricPatchContract } from './realtime/realtime-contract.mjs';

const knownNodeIds = new Set(orgTreeFixture.map((node) => node.id));
const validEvent = {
  type: 'metric.patch',
  eventId: 'evt-1',
  sequence: 1,
  nodeId: orgTreeFixture[0].id,
  metrics: { performance: 84 },
  updatedAt: '2026-09-15T12:00:00.000Z',
};

test('server realtime contract accepts a valid metric-only event', () => {
  assert.doesNotThrow(() => assertMetricPatchContract(validEvent, knownNodeIds));
});

test('server realtime contract rejects structural, unknown-node, and malformed events', () => {
  const invalidEvents = [
    { ...validEvent, nodeId: 'missing-node' },
    { ...validEvent, metrics: { parentId: 'another-node' } },
    { ...validEvent, metrics: { performance: 101 } },
    { ...validEvent, metrics: { headcount: 1.5 } },
    { ...validEvent, metrics: { budget: Number.NaN } },
    { ...validEvent, metrics: {} },
    { ...validEvent, sequence: 0 },
    { ...validEvent, updatedAt: 'not-a-date' },
    { ...validEvent, type: 'org.replace' },
  ];

  for (const event of invalidEvents) {
    assert.throws(() => assertMetricPatchContract(event, knownNodeIds));
  }
});
