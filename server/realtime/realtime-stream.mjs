import { createRealtimeMetricChangeGenerator } from './realtime-generator.mjs';
import { assertMetricPatchContract } from './realtime-contract.mjs';

const HISTORY_LIMIT = 1000;
const HEARTBEAT_INTERVAL_MS = 10_000;

export function createRealtimeStream({ fixture, mode, intervalMs }) {
  const clients = new Set();
  const history = [];
  const knownNodeIds = new Set(fixture.map((node) => node.id));
  const generator = createRealtimeMetricChangeGenerator(fixture, mode);
  let sequence = 0;
  let broadcastTimer;
  let heartbeatTimer;

  const stopBroadcast = () => {
    if (broadcastTimer !== undefined) {
      clearInterval(broadcastTimer);
      broadcastTimer = undefined;
    }
    if (heartbeatTimer !== undefined) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = undefined;
    }
  };

  const removeClient = (response) => {
    clients.delete(response);
    if (clients.size === 0) stopBroadcast();
  };

  const writeToClients = (payload) => {
    for (const client of clients) {
      try {
        if (!client.write(payload)) {
          removeClient(client);
          client.destroy();
        }
      } catch {
        removeClient(client);
      }
    }
  };

  const broadcastPatch = () => {
    const generatedPatch = generator.next();
    const eventSequence = ++sequence;
    const event = {
      type: 'metric.patch',
      eventId: `evt-${eventSequence}`,
      sequence: eventSequence,
      nodeId: generatedPatch.nodeId,
      metrics: generatedPatch.metrics,
      updatedAt: new Date().toISOString(),
    };
    try {
      assertMetricPatchContract(event, knownNodeIds);
    } catch {
      return;
    }
    const payload = `id: ${event.eventId}\ndata: ${JSON.stringify(event)}\n\n`;
    history.push({ event, payload });
    if (history.length > HISTORY_LIMIT) history.shift();
    writeToClients(payload);
  };

  const startBroadcast = () => {
    if (broadcastTimer === undefined) {
      broadcastTimer = setInterval(broadcastPatch, intervalMs);
      broadcastTimer.unref?.();
    }
    if (heartbeatTimer === undefined) {
      heartbeatTimer = setInterval(() => writeToClients('data: {"type":"heartbeat"}\n\n'), HEARTBEAT_INTERVAL_MS);
      heartbeatTimer.unref?.();
    }
  };

  const sendHeaders = (response) => {
    response.writeHead(200, {
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'content-type': 'text/event-stream; charset=utf-8',
      'x-accel-buffering': 'no',
    });
    response.write(': connected\n\n');
  };

  const replayAfter = (response, lastEventId) => {
    if (typeof lastEventId !== 'string' || lastEventId.length === 0) return;
    const lastEventIndex = history.findIndex(({ event }) => event.eventId === lastEventId);
    const replay = lastEventIndex >= 0 ? history.slice(lastEventIndex + 1) : [];
    for (const { payload } of replay) response.write(payload);
  };

  return {
    handle(request, response) {
      sendHeaders(response);
      clients.add(response);
      response.once('close', () => removeClient(response));
      response.once('error', () => removeClient(response));
      const requestUrl = new URL(request.url, 'http://127.0.0.1');
      replayAfter(response, request.headers['last-event-id'] ?? requestUrl.searchParams.get('lastEventId'));
      startBroadcast();
    },
    getClientCount: () => clients.size,
    closeClients() {
      stopBroadcast();
      for (const client of clients) client.end();
    },
    dispose() {
      stopBroadcast();
      clients.clear();
    },
  };
}
