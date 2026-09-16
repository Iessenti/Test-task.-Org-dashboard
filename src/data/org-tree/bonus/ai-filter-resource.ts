import type { AiFilter } from '@/features/organization-table/model/ai-filtering';

export class AiFilterRequestError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AiFilterRequestError';
  }
}

export async function requestAiFilter(query: string, signal: AbortSignal): Promise<AiFilter> {
  let response: Response;
  try {
    response = await fetch('/api/ai-filter', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal,
    });
  } catch (error) {
    throw new AiFilterRequestError('AI filter request failed', { cause: error });
  }

  if (!response.ok) throw new AiFilterRequestError(`AI filter request failed with HTTP status ${response.status}`);

  try {
    return await response.json() as AiFilter;
  } catch (error) {
    throw new AiFilterRequestError('AI filter response is not valid JSON', { cause: error });
  }
}
