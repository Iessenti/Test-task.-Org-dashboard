## Context

See `proposal.md` for motivation and the capability specs for observable
behavior. This is a greenfield implementation constrained by the original
four-stage assignment, a two-to-three-day scope, ADR 001, ADR 002, and the
accepted metric-only realtime patch decision.

The repository currently contains planning and decision records but no
application implementation. Foundation must establish boundaries that support
Core and Polish without implementing those later stages early.

## Goals / Non-Goals

**Goals:**

- Keep one validated, normalized, internally consistent organization snapshot
  from API through tree, table, and realtime updates.
- Make hierarchy conversion, aggregation, cache reconciliation, and patch
  application deterministic and independently testable.
- Preserve the assignment's staged implementation and verification boundaries.
- Prefer small explicit data flows over generalized graph, state, networking,
  or design-system abstractions.

**Non-Goals:**

- Reconsidering the accepted data representation, aggregation, cache ownership,
  or realtime mutation scope.
- Adding authentication, persistence, user-driven organization editing, or
  structural realtime mutations.
- Selecting or designing the realtime transport before human review.
- Designing or implementing the optional Bonus stage before mandatory work is
  complete.

## Decisions

### Server and client remain explicit boundaries

The repository will contain a Vite React TypeScript client and an independently
started mock server. The server owns the flat API fixture and, in Polish, metric
change generation. The client owns runtime validation, normalized traversal,
aggregates, cache reconciliation, and presentation state.

The mock server is implemented directly with Node's built-in `node:http` API,
without a server-framework dependency. Vite's development proxy routes client
API requests to the separately running server, so the standard development path
does not require browser CORS handling. `node:http` also supports streaming if
SSE is selected later, but this server choice does not select or design the
realtime transport; a different approved transport may still require its own
protocol support.

This keeps the API contract observable, avoids embedding mock data in UI
modules, and keeps the Foundation server dependency surface small. The trade-off
is that request routing, response headers, error handling, and any later stream
lifecycle must remain explicit rather than being supplied by a framework.

### Validation precedes publication

The HTTP payload is treated as `unknown`. Field/schema checks and required
hierarchy invariants run before building an `OrgSnapshot`. Invalid input fails
the query without replacing a previously valid cached snapshot.

The normal server fixture contains at least 40 nodes and at least three levels,
but an empty array remains schema-valid so the required empty state can be
verified. Fixture-size compliance is a server acceptance check rather than a
minimum-length rule for every client response.

### TanStack Query owns the complete organization resource

Per ADR 002, one query entry owns request/freshness/error state and the complete
`OrgSnapshot`. Its query function consumes the supplied `AbortSignal`, validates
the response, and publishes a snapshot only after the transformations required
by the current stage succeed: topology normalization in Foundation and initial
aggregation from Core onward.

The query uses a five-second stale time. Concurrent consumers share one request;
an unmount stops that observer, while the network request is aborted only when
no remaining observer needs it. Stale data remains visible during background
revalidation.

Components do not mirror server-derived data into a second state store. Client
interaction state such as selection, expansion, filter, sort, and keyboard
focus remains separate from the query-owned snapshot.

### Successful revalidation reconciles atomically

A validated full response is compared semantically with the current raw node
data. An unchanged response renews freshness while retaining the existing
snapshot and materialized aggregates. A changed response is normalized and
aggregated as a complete replacement before becoming observable.

The mock server must not alter `updatedAt` merely because a GET occurred;
timestamps change only with actual node data changes. This prevents no-op GETs
from appearing semantically different.

### Organization data uses the ADR 001 normalized snapshot

`nodesById` is the only canonical copy of server-provided nodes.
`rootIds`, `childrenByParentId`, and optionally `depthById` are materialized
topology indexes. `aggregatesById` stores total headcount, total budget, and
weighted performance sum and is introduced with Core rather than implemented
prematurely in Foundation. Tree and table rows are projections rather than
independent entity copies, and shared selection is represented by node id.

The initial aggregate pass is post-order and `O(n)`. Average performance is
derived from weighted performance sum and total headcount; a zero denominator
has no numeric result.

### Realtime updates modify the query-owned snapshot directly

Polish accepts patches only for `headcount`, `budget`, and `performance` on an
existing node. Applying a patch creates one logically consistent snapshot
transition: update the target's raw metrics, recompute its aggregate from raw
metrics and direct-child aggregates, and repeat bottom-up through its ancestors.
Topology indexes and unrelated aggregate branches retain their values.

A semantic no-op returns the current snapshot. A valid patch updates the query
cache directly and does not invalidate the query or trigger a full GET solely
because the patch arrived.

### Table operations remain derived

The table projects all node ids from the current snapshot, combines raw node and
aggregate values, then filters and sorts a derived collection. Neither sorting
nor filtering mutates canonical node order, hierarchy indexes, or aggregates.
Selection is id-based so it survives row movement.

### Presentation and visual hierarchy

The canvas is the primary desktop presentation and the table is available as a
separate mode through a compact `Карта / Таблица` segmented control in the
header. The canvas renders the organization top-down: divisions, departments,
and teams are automatically positioned in hierarchy order and connected by
subtle curved directed edges. It uses a light background with a restrained dot
grid; there is one light theme only.

Each canvas card shows the node name, raw headcount, raw budget, and
performance as a numeric value and short colored scale. Cards stay
neutral; `#73ABF5` is reserved for selection, active edges, controls, and focus
states, while performance colors retain their independent low/medium/high
meaning. The selected card receives an accent outline and its ancestor path may
use the active edge treatment.

The initial canvas view shows the first two hierarchy levels. Branches expand
independently, with deeper teams hidden until their parent branch is expanded.
The canvas supports zoom around the pointer, pan, `+`, `-`, and `Fit view`
controls. A later human decision removed the `Reset` control from the product
scope. Its initial framing prioritizes readable top-level and second-level
cards; `Fit view` provides a deliberate whole-organization view.
Nodes are not user-dragged, so the automatic layout remains deterministic.

### Shared selection and detail presentation

Selection is represented by `selectedNodeId` and survives switching between
canvas and table, sorting, and filtering. A table row selects the corresponding
canvas node. If the selected node is hidden by collapsed ancestors, the canvas
expands those ancestors and scrolls or centers the node into view.

On the canvas, selecting a card opens a right-side detail panel. The panel
separates raw metrics from aggregate subtree metrics, includes the selected
node's children, and shows its last update time. The panel is hidden in table
mode, while the selected id and row highlight remain intact.

### Table interaction model

The table uses compact analytical rows with a sticky header. The Level column
uses hierarchy labels (`Дивизион`, `Отдел`, `Команда`). Sorting has three states:
ascending, descending, and cleared/default order. A double-click on the active
sort control reverses the active direction as required by the assignment.

Name filtering is case-insensitive substring matching. Matching rows retain
their ancestor rows as context; source organization data and canonical order
remain unchanged. Table keyboard focus moves between rows with Arrow keys,
`Home`, and `End`; `Enter` activates the focused row and selects its node.

### Request, connection, and update states

Before the first successful snapshot, loading and error are full dashboard
states: loading uses a general spinner and message, while an initial error
offers a retry action. A valid empty response remains a distinct empty state.

Once data is visible, background GET revalidation keeps the canvas/table usable
and exposes a small `Обновляем…` status rather than a blocking overlay. A
background revalidation error preserves the last valid snapshot and exposes a
non-blocking failure notice.

The header uses a compact realtime badge with `Live`, `Reconnecting…`, and
`Offline` states. Connection loss does not disable the dashboard. The exact
transport, patch protocol, ordering/recovery policy, and backoff cap/jitter
remain open until the Polish transport gate is resolved.

An accepted metric patch locally fades only the changed raw metric and the
affected aggregate values on the target and ancestor rows/cards. A repeated
update extends the active fade window from the latest update. Unrelated
branches and unchanged values receive no feedback.

### Verification follows the stage boundary

Foundation verifies API shape, validation, hierarchy construction, caching,
cancellation, request states, and tree behavior. Core adds aggregation and
table behavior tests. Polish adds patch, incremental aggregate, connection,
keyboard, and motion verification. Each mandatory stage is reviewed
independently and has no known P0/P1 findings before its stage commit and tag.

Documentation is updated where the corresponding contract first becomes
concrete rather than duplicated speculatively in Foundation.

### Bonus remains isolated

Bonus work is not a prerequisite of any mandatory task. If undertaken, its
transport, deployment, size measurement, and AI integration design is reviewed
after Polish is complete.

## Risks / Trade-offs

- **[Query cache could become a second copy of domain data]** → Cache the full
  normalized `OrgSnapshot`, not a raw DTO array mirrored elsewhere.
- **[One consumer could cancel a request needed by another]** → Give request
  ownership to the shared query and consume its `AbortSignal`; do not create a
  controller per UI consumer.
- **[A no-op response could rebuild aggregates]** → Compare validated raw data
  semantically and retain the existing snapshot when unchanged.
- **[Non-JSON structures could defeat default structural sharing]** → Resolve
  the `Map` versus `Record` representation before implementing reconciliation
  and cover no-op identity with tests.
- **[A late GET could overwrite a newer realtime patch]** → Resolve ordering
  and recovery semantics before Polish transport work; do not rely on arrival
  order silently.
- **[Weighted averages could drift after repeated patches]** → Recompute each
  affected aggregate from current raw values and direct-child aggregates rather
  than propagating arithmetic deltas.
- **[Tree and table can diverge]** → Derive both from the same query-owned
  snapshot and store shared selection only as an id.
- **[Canvas cards, table rows, and detail state could diverge]** → Keep
  `selectedNodeId` as the only shared selection state and derive all projections
  from the query-owned snapshot.
- **[Non-blocking status feedback could be missed or could obstruct work]** →
  Reserve blocking states for the initial request and use compact status/badge
  feedback after a valid snapshot exists.
- **[Stage history can become non-compliant]** → Verify and review each stage,
  then create its final stage commit and `step/N` tag; keep Bonus optional.

## Migration Plan

There is no existing application or deployed data to migrate. Implementation
proceeds Foundation → Core → Polish, with a verified commit and tag at each
boundary. A stage can be rolled back to the previous stage tag without data
migration. Bonus, if approved later, starts only from the completed Polish tag.

## Unresolved Decisions / Human Review Gates

The following decisions are intentionally not resolved by this proposal and
must be reviewed before their dependent implementation begins:

### Before Foundation implementation

- **Resolved 2026-09-15 — runtime validation.** Use Zod. The accepted DTO
  types are `id`, `name`, and `updatedAt` as strings; `parentId` as
  `string | null`; `headcount` as an integer `>= 0`; `budget` as a finite
  number `>= 0`; and `performance` as a number in the inclusive range
  `0..100`. An empty collection is valid. Hierarchy validation allows a
  forest with multiple roots, requires every non-root parent to exist, and
  rejects duplicate ids, missing parents, cycles, and nodes that do not
  belong to exactly one root.
- **Resolved 2026-09-15 — normalized indexes and equality.** Use JSON-compatible
  `Record<string, ...>` values for normalized indexes. Compare validated full
  responses by node `id` and all DTO field values, independently of input
  array order. A permutation of otherwise identical nodes is a semantic no-op;
  additions, removals, or field changes require a replacement snapshot. A
  no-op retains the current snapshot and topology indexes. This preserves the
  single canonical snapshot required by ADR 001 and the query-owned immutable
  resource and no-op reconciliation required by ADR 002.
- **Resolved 2026-09-15 — styling and initial tree.** Use `styled-components`
  for non-inline styling. “Second level open by default” means roots and their
  direct children are visible initially; deeper descendants remain collapsed
  until their branch is expanded.
- **Resolved 2026-09-15 — performance indicator.** Use color bands `0..49`
  (low), `50..79` (medium), and `80..100` (high), together with the visible
  numeric performance value. Do not render textual band labels such as
  `Низкая`, `Средняя`, or `Высокая`.
- **Resolved 2026-09-15 — TanStack Query policy.** Use a `5000 ms` stale time
  and retry once only for transport errors and HTTP `5xx` responses. Do not
  retry HTTP `4xx`, JSON parsing, runtime-validation, or `AbortError` failures.
  Enable refetch on mount, window focus, and browser reconnect only when the
  cached data is stale; do not use a polling interval. Keep the stale snapshot
  available during background revalidation. This preserves shared query
  ownership, SWR behavior, and the five-second freshness requirement from
  ADR 002.

### Before Polish implementation

- **Resolved 2026-09-15 — realtime transport and patch envelope.** Use
  Server-Sent Events (SSE) for the one-way server-to-client metric stream.
  Each event uses a JSON envelope with `type: "metric.patch"`, a unique
  `eventId`, monotonic `sequence`, an existing `nodeId`, a `metrics` object
  containing only changed values from `headcount`, `budget`, and
  `performance`, and an `updatedAt` ISO timestamp:

  ```json
  {
    "type": "metric.patch",
    "eventId": "evt-123",
    "sequence": 42,
    "nodeId": "node-7",
    "metrics": {
      "headcount": 12,
      "budget": 1000,
      "performance": 84
    },
    "updatedAt": "2026-09-15T12:00:00.000Z"
  }
  ```

  SSE is selected because Polish requires server-to-client updates only and
  the browser provides connection lifecycle support without adding a
  bidirectional protocol. The stream is owned by the dashboard resource and
  must be explicitly cleaned up when its final consumer leaves.
- **Resolved 2026-09-15 — patch ordering, recovery, and freshness.** Treat
  `sequence` as a global monotonic event number. Ignore events whose sequence
  is less than or equal to the last applied sequence. Apply the next
  contiguous event immediately. If a higher sequence reveals a gap, pause
  patch application, perform a full GET for recovery, and resume the SSE
  stream using `Last-Event-ID` after recovery. Each node's `updatedAt` is the
  per-node freshness authority: a newer patch must not be overwritten by an
  older value from an in-flight GET, while a newer full-response value may be
  accepted. Applying a valid patch renews freshness for the complete query
  resource; the normal five-second stale policy still applies afterwards.
- **Resolved 2026-09-15 — reconnect backoff.** Use deterministic capped
  exponential backoff without jitter: retry delays are `1, 2, 4, 8, 16,
  30, 30...` seconds. The 30-second cap applies to every subsequent retry.
  A successful SSE connection resets the delay sequence to one second for a
  later interruption. Deterministic delays keep fake-timer verification
  reproducible; jitter is intentionally unnecessary for the single-client
  mock-server scope.
- **Resolved 2026-09-15 — WebSocket wording in data-model documentation.**
  `docs/data-model.md` will include a clearly labeled explanation that the
  assignment's literal WebSocket-patch requirement is satisfied semantically
  by the selected SSE stream. The document will describe the same
  metric-only patch contract and explicitly distinguish the required patch
  semantics from the actually implemented SSE transport; it will not claim
  that the application uses WebSocket.

### Before optional Bonus implementation

- Whether Bonus will be undertaken at all.
- Mobile-specific map/table presentation and responsive card/table behavior.
- Gzip size measurement scope, container/deployment topology, and AI provider or
  local interpretation strategy.
