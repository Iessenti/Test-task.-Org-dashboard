import { parseOrgSnapshot, type OrgSnapshot } from '../model/org-tree-validation';

export type OrgTreeRequestErrorKind =
  | 'transport'
  | 'http'
  | 'json'
  | 'validation'
  | 'aborted';

export class OrgTreeRequestError extends Error {
  public readonly kind: OrgTreeRequestErrorKind;
  public readonly status: number | undefined;

  constructor(
    kind: OrgTreeRequestErrorKind,
    message: string,
    options?: ErrorOptions,
    status?: number,
  ) {
    super(message, options);
    this.kind = kind;
    this.status = status;
    this.name = 'OrgTreeRequestError';
  }
}

export async function fetchOrgSnapshot(
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<OrgSnapshot> {
  let response: Response;

  try {
    response = await fetcher('/api/org-tree', {
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (error) {
    if (signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
      throw new OrgTreeRequestError('aborted', 'Organization request was aborted', {
        cause: error,
      });
    }

    throw new OrgTreeRequestError('transport', 'Organization request failed', {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new OrgTreeRequestError(
      'http',
      `Organization request failed with HTTP status ${response.status}`,
      undefined,
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new OrgTreeRequestError('json', 'Organization response is not valid JSON', {
      cause: error,
    });
  }

  try {
    return parseOrgSnapshot(payload);
  } catch (error) {
    throw new OrgTreeRequestError('validation', 'Organization response failed validation', {
      cause: error,
    });
  }
}
