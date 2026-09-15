import { createServer } from 'node:http';
import orgTreeFixture from './org-tree.json' with { type: 'json' };

const ORG_TREE_MODES = new Set(['normal', 'delay', 'empty', 'error', 'invalid']);

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

  if (configuredMode !== mode) {
    console.warn(`Unknown ORG_TREE_MODE "${configuredMode}". Falling back to "normal".`);
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

  return createServer((request, response) => {
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

    sendJson(response, 404, { error: 'Not found' });
  });
}
