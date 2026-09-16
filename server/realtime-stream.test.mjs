import assert from 'node:assert/strict';
import { once } from 'node:events';
import { request } from 'node:http';
import test from 'node:test';
import orgTreeFixture from './fixtures/org-tree.json' with { type: 'json' };
import { createMockServer } from './app.mjs';

function readEvents(response, count) {
  const events = [];
  let buffer = '';

  return (async () => {
    for await (const chunk of response) {
      buffer += chunk.toString();
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() ?? '';

      for (const chunk of chunks) {
        const dataLine = chunk.split('\n').find((line) => line.startsWith('data: '));
        if (dataLine !== undefined) events.push(JSON.parse(dataLine.slice('data: '.length)));
      }
      if (events.length >= count) break;
    }

    response.destroy();
    return events;
  })();
}

function openEventStream(port, headers = {}) {
  return new Promise((resolve, reject) => {
    const client = request({ host: '127.0.0.1', port, path: '/api/org-tree/events', method: 'GET', headers }, resolve);
    client.once('error', reject);
    client.end();
  });
}

test('SSE stream delivers ordered valid metric patches and cleans up clients', async () => {
  const previousInterval = process.env['REALTIME_INTERVAL_MS'];
  process.env['REALTIME_INTERVAL_MS'] = '5';
  const server = createMockServer();

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const port = server.address().port;

    const response = await openEventStream(port);
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['content-type'], 'text/event-stream; charset=utf-8');
    assert.equal(server.getRealtimeClientCount(), 1);

    const events = await readEvents(response, 3);
    assert.equal(events.length, 3);
    assert.deepEqual(events.map((event) => event.sequence), [1, 2, 3]);
    assert.deepEqual(events.map((event) => event.eventId), ['evt-1', 'evt-2', 'evt-3']);

    const nodeIds = new Set(orgTreeFixture.map((node) => node.id));
    for (const event of events) {
      assert.equal(event.type, 'metric.patch');
      assert.equal(nodeIds.has(event.nodeId), true);
      assert.equal(typeof event.updatedAt, 'string');
      assert.equal(Object.keys(event.metrics).length, 1);
      assert.deepEqual(
        Object.keys(event.metrics),
        Object.keys(event.metrics).filter((metric) => (
          metric === 'headcount' || metric === 'budget' || metric === 'performance'
        )),
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(server.getRealtimeClientCount(), 0);
  } finally {
    if (server.listening) {
      server.close();
      await once(server, 'close');
    }
    if (previousInterval === undefined) {
      delete process.env['REALTIME_INTERVAL_MS'];
    } else {
      process.env['REALTIME_INTERVAL_MS'] = previousInterval;
    }
  }
});

test('SSE replays events after Last-Event-ID', async () => {
  const previousInterval = process.env['REALTIME_INTERVAL_MS'];
  process.env['REALTIME_INTERVAL_MS'] = '5';
  const server = createMockServer();

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const port = server.address().port;
    const firstResponse = await openEventStream(port);
    const firstEvents = await readEvents(firstResponse, 3);
    const replayResponse = await openEventStream(port, { 'Last-Event-ID': firstEvents[0].eventId });
    const replayedEvents = await readEvents(replayResponse, 2);
    assert.deepEqual(replayedEvents.map((event) => event.sequence), [2, 3]);
  } finally {
    if (server.listening) {
      server.close();
      await once(server, 'close');
    }
    if (previousInterval === undefined) delete process.env['REALTIME_INTERVAL_MS'];
    else process.env['REALTIME_INTERVAL_MS'] = previousInterval;
  }
});

test('explicit shutdown closes active SSE clients', async () => {
  const server = createMockServer();

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const port = server.address().port;

    const response = await openEventStream(port);
    await once(response, 'data');
    assert.equal(server.getRealtimeClientCount(), 1);

    const responseClosed = new Promise((resolve) => {
      response.once('error', () => undefined);
      response.once('close', resolve);
    });
    server.closeRealtimeClients();
    await responseClosed;
    assert.equal(server.getRealtimeClientCount(), 0);

    const serverClosed = once(server, 'close');
    server.close();
    await serverClosed;
  } finally {
    if (server.listening) {
      server.close();
      await once(server, 'close');
    }
  }
});
