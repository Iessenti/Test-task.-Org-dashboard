import assert from 'node:assert/strict';
import test from 'node:test';
import orgTreeFixture from './org-tree.json' with { type: 'json' };
import { createMetricChangeGenerator, createRealtimeMetricChangeGenerator, createScriptedMetricChangeGenerator } from './realtime-generator.mjs';

test('metric generator is deterministic and changes only bounded metrics', () => {
  const first = createMetricChangeGenerator(orgTreeFixture);
  const second = createMetricChangeGenerator(orgTreeFixture);
  const nodesById = new Map(orgTreeFixture.map((node) => [node.id, node]));
  const currentMetricsById = new Map(
    orgTreeFixture.map((node) => [node.id, {
      headcount: node.headcount,
      budget: node.budget,
      performance: node.performance,
    }]),
  );
  const generated = Array.from({ length: 100 }, () => first.next());

  assert.deepEqual(generated, Array.from({ length: 100 }, () => second.next()));

  for (const patch of generated) {
    const node = nodesById.get(patch.nodeId);
    assert.ok(node);
    assert.deepEqual(Object.keys(patch.metrics).length, 1);
    assert.ok(Object.keys(patch.metrics).every((metric) => (
      metric === 'headcount' || metric === 'budget' || metric === 'performance'
    )));
    assert.equal(typeof node.name, 'string');
    assert.equal(node.parentId, nodesById.get(node.id).parentId);

    const [metric, value] = Object.entries(patch.metrics)[0];
    const currentMetrics = currentMetricsById.get(patch.nodeId);
    assert.notEqual(value, currentMetrics[metric]);
    currentMetrics[metric] = value;
    if (metric === 'headcount') {
      assert.equal(Number.isInteger(value), true);
      assert.equal(value >= 0, true);
    }
    if (metric === 'budget') {
      assert.equal(Number.isFinite(value), true);
      assert.equal(value >= 0, true);
    }
    if (metric === 'performance') {
      assert.equal(value >= 0 && value <= 100, true);
    }
  }
});

test('metric generator rejects invalid or empty source collections', () => {
  assert.throws(() => createMetricChangeGenerator([]), /at least one/);
  assert.throws(
    () => createMetricChangeGenerator([{ id: 'node-1', name: 'Node', headcount: 0, budget: 0, performance: 101 }]),
    /Invalid performance/,
  );
});

test('scripted generator emits the documented aggregate-demo cycle', () => {
  const generator = createScriptedMetricChangeGenerator(orgTreeFixture);

  assert.deepEqual(Array.from({ length: 6 }, () => generator.next()), [
    { nodeId: 'division-1-department-1-team-1', metrics: { performance: 48 } },
    { nodeId: 'division-1-department-1-team-2', metrics: { headcount: 10 } },
    { nodeId: 'division-1-department-1-team-3', metrics: { budget: 43_250 } },
    { nodeId: 'division-1-department-1-team-1', metrics: { performance: 41 } },
    { nodeId: 'division-1-department-1-team-2', metrics: { headcount: 7 } },
    { nodeId: 'division-1-department-1-team-3', metrics: { budget: 42_250 } },
  ]);
  assert.deepEqual(generator.next(), {
    nodeId: 'division-1-department-1-team-1',
    metrics: { performance: 48 },
  });
});

test('realtime generator selector enables the scripted mode only when requested', () => {
  assert.deepEqual(createRealtimeMetricChangeGenerator(orgTreeFixture, 'scripted').next(), {
    nodeId: 'division-1-department-1-team-1',
    metrics: { performance: 48 },
  });
  assert.deepEqual(createRealtimeMetricChangeGenerator(orgTreeFixture, 'generated').next(), {
    nodeId: 'division-1',
    metrics: { headcount: 131 },
  });
});
