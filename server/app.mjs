import { createServer } from 'node:http';
import orgTreeFixture from './fixtures/org-tree.json' with { type: 'json' };
import { createAiFilterHandler } from './routes/ai-filter-route.mjs';
import { readServerConfig } from './config/config.mjs';
import { sendJson } from './http/http-utils.mjs';
import { createOrgTreeHandler } from './routes/org-tree-route.mjs';
import { createRealtimeStream } from './realtime/realtime-stream.mjs';

export function createMockServer({ env = process.env, fixture = orgTreeFixture, logger = console } = {}) {
  const config = readServerConfig(env, logger);
  const orgTreeHandler = createOrgTreeHandler({ mode: config.orgTreeMode, delayMs: config.orgTreeDelayMs, fixture });
  const aiFilterHandler = createAiFilterHandler();
  const realtimeStream = createRealtimeStream({ fixture, mode: config.realtimeMode, intervalMs: config.realtimeIntervalMs });

  const server = createServer((request, response) => {
    if (request.url === '/api/health' && request.method === 'GET') {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.url === '/api/org-tree') {
      orgTreeHandler(request, response);
      return;
    }

    if (request.url === '/api/ai-filter' && request.method === 'POST') {
      void aiFilterHandler(request, response);
      return;
    }

    if (request.url?.startsWith('/api/org-tree/events') && request.method === 'GET') {
      realtimeStream.handle(request, response);
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  });

  server.getRealtimeClientCount = realtimeStream.getClientCount;
  server.closeRealtimeClients = realtimeStream.closeClients;
  server.once('close', realtimeStream.dispose);

  return server;
}
