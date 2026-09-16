import { sendJson } from '../http/http-utils.mjs';

export function createOrgTreeHandler({ mode, delayMs, fixture }) {
  const sendOrganizationResponse = (response) => {
    if (mode === 'error') {
      sendJson(response, 503, { error: 'Configured mock failure' });
      return;
    }
    if (mode === 'invalid') {
      sendJson(response, 200, { invalid: true });
      return;
    }
    sendJson(response, 200, mode === 'empty' ? [] : fixture);
  };

  return (request, response) => {
    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'Method not allowed' }, { allow: 'GET' });
      return;
    }
    if (mode === 'delay' && delayMs > 0) {
      const timer = setTimeout(() => {
        if (!response.writableEnded && !response.destroyed) sendOrganizationResponse(response);
      }, delayMs);
      response.once('close', () => clearTimeout(timer));
      return;
    }
    sendOrganizationResponse(response);
  };
}
