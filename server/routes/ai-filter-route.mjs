import { interpretNaturalLanguageFilter } from '../ai-filter/ai-filter-provider.mjs';
import { readJsonBody, sendJson } from '../http/http-utils.mjs';

export function createAiFilterHandler({ interpretFilter = interpretNaturalLanguageFilter } = {}) {
  return async (request, response) => {
    let payload;
    try {
      payload = await readJsonBody(request);
    } catch {
      sendJson(response, 400, { error: 'Request body must be valid JSON' });
      return;
    }
    if (typeof payload?.query !== 'string' || payload.query.trim() === '') {
      sendJson(response, 400, { error: 'query must be a non-empty string' });
      return;
    }
    try {
      sendJson(response, 200, await interpretFilter(payload.query));
    } catch (error) {
      const status = error?.name === 'AiFilterValidationError' ? 502 : 503;
      sendJson(response, status, {
        error: error instanceof Error ? error.message : 'AI filter unavailable',
      });
    }
  };
}
