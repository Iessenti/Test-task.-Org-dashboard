import { createServer } from 'node:http';
import orgTreeFixture from './org-tree.json' with { type: 'json' };

const sendJson = (response, statusCode, payload, extraHeaders = {}) => {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    ...extraHeaders,
  });
  response.end(JSON.stringify(payload));
};

export function createMockServer() {
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

      sendJson(response, 200, orgTreeFixture);
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  });
}
