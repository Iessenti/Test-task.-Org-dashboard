# Realtime checkpoint

Дата проверки: 2026-09-15.

## Автоматические проверки

- Client realtime suite — passed: 8 test files, 17 tests.
- Server realtime suite — passed: 5 tests, including ordered SSE delivery and
  client cleanup.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `git diff --check` — passed.

The cache test observes a direct `QueryClient.setQueryData` transition,
updated aggregate rows, and no `invalidateQueries` call. The realtime cache
updater has no GET call path for an accepted contiguous patch, so the patch
does not trigger a full organization refetch.

## Browser checkpoint

- The dashboard loads the canvas-first view with the header status `Live`.
- The canvas exposes the automatically laid out hierarchy and metric cards.
- Switching to `Таблица` exposes the same query-owned data as 44 analytical
  rows; the status remains `Live`.
- In a clean browser session, an SSE patch changed a visible metric and the
  corresponding `realtime-feedback-fade` animation was observed.
- Repeated SSE updates produced stacked update notifications and the first
  notification disappeared after its 15-second lifetime.

## Scope result

The verified path is server event → SSE stream → client validation and
ordering → direct query-cache transition → incremental target/ancestor
aggregation → canvas/table projections and cell feedback. No full GET is
performed solely because a contiguous metric patch arrives.
