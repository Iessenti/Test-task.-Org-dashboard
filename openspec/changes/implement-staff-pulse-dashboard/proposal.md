## Why

Staff Pulse needs a reviewable implementation of the take-home assignment: an
organization dashboard that presents hierarchical data as an interactive tree
and analytical table, remains correct under live metric updates, and
demonstrates explicit reliability, caching, accessibility, documentation, and
delivery discipline.

## What Changes

- Add a React, Vite, and TypeScript client and a mock organization server whose
  validated flat dataset contains at least 40 nodes and at least three hierarchy
  levels.
- Add a cached organization tree presented as a top-down, automatically laid
  out canvas with metric cards, directed connections, zoom/pan controls,
  required request states, five-second freshness, request cancellation, and
  expand/collapse behavior.
- Add an analytical table with memoized descendant aggregates, weighted
  performance, labeled hierarchy levels, three-state sorting, contextual name
  filtering, formatted budgets, and shared node selection with the canvas.
- Add realtime metric updates for existing nodes, incremental ancestor-only
  aggregate recomputation, non-blocking connection/update UX, targeted cell
  feedback, keyboard navigation, and reduced-motion-aware tree animation.
- Deliver each mandatory stage as an independently verified and reviewed state,
  with the required commits, tags, tests, screenshots, README disclosures, and
  architecture/data-model documentation.
- Keep Docker, Nginx, the compressed production-size target, and natural-language
  AI search in a separate optional Bonus stage that cannot block mandatory work.

## Capabilities

### New Capabilities

- `staff-pulse-dashboard`: Observable Foundation, Core, and Polish behavior for
  loading, presenting, aggregating, selecting, and live-updating organization
  data.
- `staff-pulse-delivery`: Required staged delivery, verification evidence,
  documentation, AI disclosure, and source handoff.
- `staff-pulse-bonus`: Conditional production packaging and AI-search behavior
  when the optional Bonus stage is undertaken.

### Modified Capabilities

None. The project has no existing capability specifications.

## Impact

- Introduces the client application, mock server, automated checks, and delivery
  documentation into a repository that currently contains planning material
  only.
- Uses the accepted normalized `OrgSnapshot` and aggregation model from ADR 001.
- Uses TanStack Query as the single owner of cached server-derived state, as
  accepted in ADR 002; components do not mirror that state.
- Requires an explicit human decision on realtime transport and
  protocol/order/recovery semantics before their dependent implementation tasks
  begin; the accepted result is recorded in ADR 003.
- Defers mobile-specific presentation and all optional Bonus behavior until the
  Bonus decision gate after Polish.
- Adds no authentication, database, or UI component library.
