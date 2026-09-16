import { requestAiFilter } from '@/data/org-tree/bonus/ai-filter-resource';
import type { AiFilter } from './ai-filtering';

export type AiSearchResult =
  | { kind: 'ai'; filter: AiFilter }
  | { kind: 'text'; query: string };

export async function resolveAiSearch(
  query: string,
  signal: AbortSignal,
  requester: typeof requestAiFilter = requestAiFilter,
): Promise<AiSearchResult> {
  try {
    return { kind: 'ai', filter: await requester(query, signal) };
  } catch {
    return { kind: 'text', query };
  }
}
