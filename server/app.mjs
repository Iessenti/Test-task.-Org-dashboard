import { createServer } from 'node:http';
import orgTreeFixture from './org-tree.json' with { type: 'json' };
import { createRealtimeMetricChangeGenerator } from './realtime-generator.mjs';
import { assertMetricPatchContract } from './realtime-contract.mjs';

const ORG_TREE_MODES = new Set(['normal', 'delay', 'empty', 'error', 'invalid']);
const REALTIME_MODES = new Set(['generated', 'scripted']);

const sendJson = (response, statusCode, payload, extraHeaders = {}) => {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    ...extraHeaders,
  });
  response.end(JSON.stringify(payload));
};

export function createMockServer() {
  const configuredMode = process.env['ORG_TREE_MODE'] ?? 'normal';
  const mode = ORG_TREE_MODES.has(configuredMode) ? configuredMode : 'normal';
  const configuredDelay = Number(process.env['ORG_TREE_DELAY_MS'] ?? 0);
  const delayMs = Number.isFinite(configuredDelay) ? Math.max(configuredDelay, 0) : 0;
  const configuredRealtimeInterval = Number(process.env['REALTIME_INTERVAL_MS'] ?? 1000);
  const realtimeIntervalMs = Number.isFinite(configuredRealtimeInterval)
    ? Math.max(configuredRealtimeInterval, 1)
    : 1000;
  const configuredRealtimeMode = process.env['REALTIME_MODE'] ?? 'generated';
  const realtimeMode = REALTIME_MODES.has(configuredRealtimeMode) ? configuredRealtimeMode : 'generated';
  const realtimeClients = new Set();
  const realtimeHistory = [];
  const realtimeHistoryLimit = 1000;
  const metricGenerator = createRealtimeMetricChangeGenerator(orgTreeFixture, realtimeMode);
  let realtimeSequence = 0;
  let realtimeTimer;
  let realtimeHeartbeatTimer;

  if (configuredMode !== mode) {
    console.warn(`Unknown ORG_TREE_MODE "${configuredMode}". Falling back to "normal".`);
  }
  if (configuredRealtimeMode !== realtimeMode) {
    console.warn(`Unknown REALTIME_MODE "${configuredRealtimeMode}". Falling back to "generated".`);
  }

  const sendOrganizationResponse = (response) => {
    if (mode === 'error') {
      sendJson(response, 503, { error: 'Configured mock failure' });
      return;
    }

    if (mode === 'invalid') {
      sendJson(response, 200, { invalid: true });
      return;
    }

    sendJson(response, 200, mode === 'empty' ? [] : orgTreeFixture);
  };

  const stopRealtimeBroadcast = () => {
    if (realtimeTimer !== undefined) {
      clearInterval(realtimeTimer);
      realtimeTimer = undefined;
    }
    if (realtimeHeartbeatTimer !== undefined) {
      clearInterval(realtimeHeartbeatTimer);
      realtimeHeartbeatTimer = undefined;
    }
  };

  const removeRealtimeClient = (response) => {
    realtimeClients.delete(response);
    if (realtimeClients.size === 0) {
      stopRealtimeBroadcast();
    }
  };

  const broadcastMetricPatch = () => {
    const generatedPatch = metricGenerator.next();
    const sequence = ++realtimeSequence;
    const event = {
      type: 'metric.patch',
      eventId: `evt-${sequence}`,
      sequence,
      nodeId: generatedPatch.nodeId,
      metrics: generatedPatch.metrics,
      updatedAt: new Date().toISOString(),
    };
    try {
      assertMetricPatchContract(event, new Set(orgTreeFixture.map((node) => node.id)));
    } catch {
      return;
    }
    const payload = `id: ${event.eventId}\ndata: ${JSON.stringify(event)}\n\n`;
    realtimeHistory.push({ event, payload });
    if (realtimeHistory.length > realtimeHistoryLimit) realtimeHistory.shift();

    for (const client of realtimeClients) {
      try {
        if (!client.write(payload)) {
          removeRealtimeClient(client);
          client.destroy();
        }
      } catch {
        removeRealtimeClient(client);
      }
    }
  };

  const startRealtimeBroadcast = () => {
    if (realtimeTimer === undefined) {
      realtimeTimer = setInterval(broadcastMetricPatch, realtimeIntervalMs);
      realtimeTimer.unref?.();
    }
    if (realtimeHeartbeatTimer === undefined) {
      realtimeHeartbeatTimer = setInterval(() => {
        const payload = 'data: {"type":"heartbeat"}\n\n';
        for (const client of realtimeClients) {
          try {
            if (!client.write(payload)) {
              removeRealtimeClient(client);
              client.destroy();
            }
          } catch {
            removeRealtimeClient(client);
          }
        }
      }, 10_000);
      realtimeHeartbeatTimer.unref?.();
    }
  };

  const sendRealtimeHeaders = (response) => {
    response.writeHead(200, {
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'content-type': 'text/event-stream; charset=utf-8',
      'x-accel-buffering': 'no',
    });
    response.write(': connected\n\n');
  };

  const server = createServer((request, response) => {
    if (request.url === '/api/health' && request.method === 'GET') {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.url === '/api/org-tree') {
      if (request.method !== 'GET') {
        sendJson(response, 405, { error: 'Method not allowed' }, { allow: 'GET' });
        return;
      }

      if (mode === 'delay' && delayMs > 0) {
        const timer = setTimeout(() => {
          if (!response.writableEnded && !response.destroyed) {
            sendOrganizationResponse(response);
          }
        }, delayMs);
        response.once('close', () => clearTimeout(timer));
        return;
      }

      sendOrganizationResponse(response);
      return;
    }

    if (request.url?.startsWith('/api/org-tree/events') && request.method === 'GET') {
      sendRealtimeHeaders(response);
      realtimeClients.add(response);
      response.once('close', () => removeRealtimeClient(response));
      response.once('error', () => removeRealtimeClient(response));

      const requestUrl = new URL(request.url, 'http://127.0.0.1');
      const lastEventId = request.headers['last-event-id'] ?? requestUrl.searchParams.get('lastEventId');
      if (typeof lastEventId === 'string' && lastEventId.length > 0) {
        const lastEventIndex = realtimeHistory.findIndex(({ event }) => event.eventId === lastEventId);
        const replay = lastEventIndex >= 0 ? realtimeHistory.slice(lastEventIndex + 1) : [];
        for (const { payload } of replay) response.write(payload);
      }
      startRealtimeBroadcast();
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  });

  server.getRealtimeClientCount = () => realtimeClients.size;
  server.closeRealtimeClients = () => {
    stopRealtimeBroadcast();
    for (const client of realtimeClients) client.end();
  };
  server.once('close', () => {
    stopRealtimeBroadcast();
    realtimeClients.clear();
  });

  return server;
}
