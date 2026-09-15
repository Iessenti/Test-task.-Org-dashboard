## 1. Foundation

### Human decision gates

- [ ] 1.1 Obtain human approval for the runtime DTO field types, validation library, and hierarchy-invariant policy listed under “Before Foundation implementation” in `design.md`; verify the approved choices are recorded in the appropriate planning artifact before dependent implementation starts.
- [ ] 1.2 Obtain human approval for the normalized index representation (`Map` or `Record`) and semantic-equality strategy; verify the choice remains compatible with ADR 001 and ADR 002 before normalization or cache reconciliation is implemented.
- [ ] 1.3 Obtain human approval for the non-inline styling approach, the meaning of “second level open by default,” and the accessible performance-indicator mapping; verify the expected initial tree and non-color cue are explicit before tree UI work starts.
- [ ] 1.4 Obtain human approval for TanStack Query retry and stale-revalidation triggers; verify the policy preserves the required five-second stale time, shared request ownership, and SWR behavior before the query client is configured.

### Project and development baseline

- [ ] 1.5 Scaffold the React, Vite, and TypeScript client with absolute imports and the minimal test, typecheck, lint, and build tooling needed by the mandatory stages; verify the starter client passes its focused test, typecheck, lint, and production build.
- [ ] 1.6 Establish the independently running `node:http` mock-server boundary, Vite API proxy, and one-command local development path; verify the client reaches the server through the proxy without browser CORS configuration.
- [ ] 1.7 Apply the approved non-inline styling foundation without adding authentication, a database, or a UI component library; verify repository inspection and linting find no inline CSS or excluded system.
- [ ] 1.8 Run a baseline checkpoint for client start, server start, proxy routing, typecheck, lint, tests, and build; record any baseline failure before organization behavior is added.

### Organization endpoint

- [ ] 1.9 Add a deterministic flat organization fixture with at least 40 nodes and at least three hierarchy levels; verify a targeted fixture test checks unique ids, required fields, parent references, depth, approved numeric constraints, and `performance` values from 0 through 100.
- [ ] 1.10 Expose the fixture from `GET /api/org-tree` with explicit JSON, status, and error handling; verify a focused server/API test observes the required flat response contract.

### Validation and topology snapshot

- [ ] 1.11 Implement runtime validation of the approved DTO field types, including acceptance of an empty array and rejection of malformed fields or out-of-range metrics; verify targeted validator tests cover valid, empty, and representative invalid payloads.
- [ ] 1.12 Implement the approved hierarchy-invariant validation for the flat DTO collection; verify targeted tests cover duplicate ids, missing parents, cycles, and every other approved invalid topology case.
- [ ] 1.13 Normalize a validated collection into the ADR-001 Foundation snapshot with one canonical node per id and stable root/child indexes, without Core aggregates; verify targeted tests cover traversal, multiple branches, input-order preservation where required, and the approved root policy.
- [ ] 1.14 Compose validation and normalization as an atomic acceptance boundary from `unknown` payload to `OrgSnapshot`; verify invalid input never produces or replaces a publishable snapshot.

### Shared cached organization resource

- [ ] 1.15 Implement the organization fetch boundary with HTTP and JSON failure handling and the TanStack Query-provided `AbortSignal`; verify focused tests distinguish transport, HTTP, parsing, validation, and cancellation outcomes.
- [ ] 1.16 Configure the single query-owned organization resource with the approved retry/refetch policy and a five-second stale time; verify a targeted cache test shows fresh data is reused without another GET.
- [ ] 1.17 Implement shared in-flight deduplication and stale-while-revalidate presentation for the organization query; verify targeted tests show concurrent consumers share one GET and stale data remains available during one background revalidation.
- [ ] 1.18 Implement observer-aware cancellation through query ownership; verify targeted tests show one departing observer does not cancel a shared request and the final departing observer aborts it without publishing a normal success or failure.
- [ ] 1.19 Reconcile successful full responses by approved semantic equality, retaining the current snapshot and topology identities for unchanged data and atomically replacing them for changed data; verify focused identity tests cover both no-op and changed responses.
- [ ] 1.20 Verify the complete resource pipeline from unknown HTTP payload to cached normalized snapshot, including invalid revalidation over existing valid data; confirm invalid data is exposed as an error and never becomes the current snapshot.

### Foundation dashboard and tree

- [ ] 1.21 Implement distinct initial loading, error, and valid-empty dashboard states driven directly by the query resource; verify focused component tests cover transport, HTTP, parsing, validation, and empty outcomes without mirroring server data in local state.
- [ ] 1.22 Render the normalized hierarchy as a tree with the approved initial expansion interpretation; verify a component test proves the required second hierarchy level is visible on first display.
- [ ] 1.23 Add accessible expand/collapse controls for branches while keeping expansion as client interaction state; verify keyboard and pointer interaction tests cover expanding, collapsing, and leaf behavior.
- [ ] 1.24 Present each visible node’s name, raw headcount, and approved accessible performance indicator; verify component assertions and a browser check confirm the meaning is not conveyed by color alone.
- [ ] 1.25 Run a Foundation UI checkpoint in the browser for loading, error, empty, initial tree, expansion, collapse, and node content; record observable results before stage documentation and review.

### Foundation documentation and stage closure

- [ ] 1.26 Update `README.md`, `docs/architecture.md`, and `docs/data-model.md` with the verified startup path, current API-to-tree flow, validation boundary, and normalized hierarchy invariants; verify the documents describe only Foundation contracts actually implemented.
- [ ] 1.27 Audit every Foundation requirement and acceptance scenario against implementation and evidence, then run the relevant targeted tests plus stage-level typecheck, lint, build, and browser verification; record any unmet scenario instead of marking the stage complete.
- [ ] 1.28 Obtain an independent read-only Foundation review from a reviewer/context that did not author the implementation, covering the actual repository, requirements, evidence, correctness, cache/cancellation behavior, accessibility, and stage scope; record findings with P0/P1/P2/Nit severity without modifying code during review.
- [ ] 1.29 Fix only the Foundation review findings accepted by the human, adding focused regression coverage for correctness defects; verify each accepted finding is resolved and document any explicitly deferred P2/Nit item.
- [ ] 1.30 Run the final Foundation verification suite and scenario audit after fixes; verify no known P0/P1 finding remains and inspect the final diff for accidental Core, Polish, or Bonus scope.
- [ ] 1.31 Prepare and create the independently reviewable Foundation commit `Step/1` and tag `step/1`; verify the tag resolves to that commit and the application starts and passes the Foundation checks from the tagged state.

## 2. Core

### Human decision gates

- [ ] 2.1 Obtain human approval for toggle-only versus responsive split-view presentation and for numeric versus labeled Level values; verify both choices are explicit before table layout and row projection work starts.
- [ ] 2.2 Obtain human approval for the sort activation states and the exact single-click/double-click interaction; verify the resulting state transitions satisfy deterministic sorting and the required double-click reversal.
- [ ] 2.3 Obtain human approval for name-matching rules and whether filtered results retain contextual ancestors; verify the expected row set is explicit before filter implementation starts.
- [ ] 2.4 Obtain human approval for hidden-node selection behavior, including ancestor expansion and scrolling; verify table-to-tree reveal behavior is explicit before shared selection is wired.

### Initial aggregation

- [ ] 2.5 Extend the accepted snapshot with ADR-001 `aggregatesById` and one post-order initial aggregation pass for total headcount, total budget, and weighted performance sum; verify targeted unit tests prove correct results for leaves, internal nodes, and multiple branches.
- [ ] 2.6 Cover aggregation invariants and edge cases, including zero total headcount, the approved root policy, and input-order independence where applicable; verify the unit suite includes the assignment-required aggregation test and displays no numeric average for a zero denominator.
- [ ] 2.7 Integrate aggregation into atomic acceptance of each new or changed full snapshot while retaining existing aggregates for a semantically unchanged response; verify cache-level tests distinguish changed acceptance from no-op revalidation.
- [ ] 2.8 Prove aggregate reuse across ordinary tree/table rerenders without a data change; verify an instrumentation or deterministic integration test observes no additional full aggregation pass for the same accepted snapshot.

### Analytical table projection

- [ ] 2.9 Implement the approved tree/table presentation access model without duplicating query-owned organization data; verify a browser interaction can reach both representations at the relevant viewport sizes.
- [ ] 2.10 Derive one analytical row per organization node with subdivision, approved level, total employees, total budget, and average performance; verify a focused table test covers all nodes and all five required columns.
- [ ] 2.11 Format aggregate budgets as grouped digits followed by `руб.` and zero-headcount averages as `—`; verify deterministic formatter/component cases include `12 345 678 руб.` and the zero-denominator result.

### Sorting and filtering

- [ ] 2.12 Implement deterministic derived sorting for every table column using the approved state transitions; verify interaction tests cover each column, exposed direction, required double-click reversal, and stable tie handling without mutating canonical node or child order.
- [ ] 2.13 Implement derived name filtering with the approved matching/context rules and a 250 ms debounce; verify fake-timer tests show only the latest settled input applies and source organization data remains unchanged.
- [ ] 2.14 Verify sorting and filtering composition on derived rows; confirm changing either control produces the approved deterministic row set without recomputing aggregates or changing shared snapshot identities.

### Shared selection

- [ ] 2.15 Add id-based shared selection between table and tree without storing node objects or row indexes; verify selecting a table row selects the same node after sorting or filtering changes row positions.
- [ ] 2.16 Implement the approved reveal behavior for a selected node hidden by tree collapse or presentation mode; verify focused browser/component checks cover ancestor expansion, scrolling, and visible selection only as approved.
- [ ] 2.17 Run a Core interaction checkpoint for representation access, all table columns, aggregate values, budget/average formatting, sorting, debounce filtering, and table-to-tree selection; record failures before stage documentation and review.

### Core documentation and stage closure

- [ ] 2.18 Update `docs/architecture.md` and `docs/data-model.md` with the implemented table projection, shared selection flow, aggregation equations, zero-headcount rule, and accurate initial/incremental complexity promises; verify the text agrees with ADR 001 and the implementation.
- [ ] 2.19 Audit every Core acceptance scenario while rerunning all Foundation scenarios and the relevant aggregation, cache, table, and browser checks; record evidence that each newly accepted snapshot receives one full aggregation pass and ordinary rerenders reuse it.
- [ ] 2.20 Obtain an independent read-only Core review from a reviewer/context that did not author the implementation, covering requirements, aggregation correctness, projection consistency, sorting/filtering, selection, accessibility, and stage scope; record severity-ranked findings without modifying code during review.
- [ ] 2.21 Fix only the Core review findings accepted by the human and add focused regression coverage for correctness defects; verify each accepted finding is resolved and document any explicitly deferred P2/Nit item.
- [ ] 2.22 Run the final Core verification suite and Foundation regression checks after fixes; verify no known P0/P1 finding remains and inspect the diff for accidental Polish or Bonus scope.
- [ ] 2.23 Prepare and create the independently reviewable Core commit `Step/2` and tag `step/2`; verify the tag resolves to that commit and all Foundation and Core checks pass from the tagged state.

## 3. Polish

### Human decision gates

- [ ] 3.1 Obtain human approval for WebSocket, SSE, or efficient polling and for the realtime patch envelope; verify the choice accounts for expected change frequency, metric-only scope, and server/client lifecycle before transport code starts.
- [ ] 3.2 Obtain human approval for patch ordering, gap recovery, the in-flight GET-versus-newer-patch race, `updatedAt` semantics, and whether a patch renews whole-resource freshness; verify one coherent reconciliation policy is recorded before cache integration starts.
- [ ] 3.3 Obtain human approval for connection-state labels and exponential-backoff cap/jitter policy; verify observable status transitions and deterministic retry expectations are explicit before connection UX work starts.
- [ ] 3.4 Obtain human approval for the exact cells highlighted by direct and aggregate updates and for repeated updates during the 1.5-second fade; verify the visual feedback contract is explicit before update metadata is designed.
- [ ] 3.5 Obtain human approval for the table focus model and exact Arrow/Home/End/Enter behavior; verify focus movement, boundaries, and Enter activation are explicit before keyboard handling starts.
- [ ] 3.6 Resolve how `docs/data-model.md` will satisfy the assignment’s literal WebSocket-patch wording if another approved transport is selected; verify the documentation obligation is explicit without changing the selected transport.

### Realtime server

- [ ] 3.7 Implement deterministic metric-change generation for existing nodes only, limited to `headcount`, `budget`, and `performance`; verify focused tests prove generated updates never change name, identity, topology, membership, or metric bounds.
- [ ] 3.8 Deliver generated changes through the approved realtime transport and patch envelope with explicit connection cleanup and failure behavior; verify a transport-level test receives ordered valid patches and observes cleanup on disconnect.
- [ ] 3.9 Verify the server rejects or never emits structural, unknown-node, and malformed updates according to the approved contract; record transport-specific evidence before client integration.

### Client connection and reconciliation

- [ ] 3.10 Validate incoming patch envelopes and metric payloads before cache access; verify targeted tests cover valid partial metric patches, malformed values, forbidden fields, unknown nodes, and approved ordering metadata.
- [ ] 3.11 Implement the approved client connection lifecycle and expose its state to the dashboard header; verify deterministic tests cover initial connection, connected state, interruption, reconnecting state, recovery, and disposal.
- [ ] 3.12 Implement exponential reconnect delays with the approved cap/jitter policy; verify fake-timer tests prove increasing delays, reset after recovery, cancellation on disposal, and polling cadence constraints if polling was selected.
- [ ] 3.13 Implement the approved ordering, gap-recovery, `updatedAt`, freshness, and in-flight GET race policy; verify deterministic integration tests cover stale, duplicate, missing, and newer-than-GET events without relying silently on arrival order.

### Atomic patch application and incremental aggregates

- [ ] 3.14 Implement ADR-001 recomputation of one target aggregate and its ancestor chain from current raw metrics and direct-child aggregates; verify unit tests cover leaf and internal targets, simultaneous headcount/performance changes, zero headcount, repeated updates, and unchanged unrelated branches.
- [ ] 3.15 Compose a validated metric patch into one immutable snapshot transition that updates target raw metrics and affected aggregates while retaining topology indexes; verify pure transition tests cover valid changes, semantic no-ops, forbidden topology changes, and identity preservation outside the affected path.
- [ ] 3.16 Apply accepted transitions directly to the TanStack Query cache under the approved reconciliation policy; verify cache tests prove visible projections update without patch-triggered invalidation or a full organization GET.
- [ ] 3.17 Verify realtime transitions remain consistent with a later accepted full snapshot and with concurrent tree/table consumers; confirm both views read the same query-owned snapshot throughout tested races.

### Realtime feedback

- [ ] 3.18 Derive the approved set of directly and aggregately affected visible table cells from each applied transition; verify focused tests cover target rows, ancestor rows, hidden rows, unchanged values, and unrelated branches.
- [ ] 3.19 Implement approximately 1.5-second fade-out feedback with the approved repeated-update behavior; verify fake-timer and browser checks cover start, repeat, and expiration without stale timers marking current values.
- [ ] 3.20 Run a realtime checkpoint from server event through validation, cache transition, incremental aggregate update, both UI projections, header status, and cell feedback; record evidence that no full refetch occurs solely because a patch arrived.

### Keyboard and tree motion

- [ ] 3.21 Implement the approved focus model for the analytical table with correct roles, focusability, and boundary handling; verify keyboard-only focus can enter, remain visible within, and leave the table without pointer input.
- [ ] 3.22 Implement the approved Arrow, Home, End, and Enter behaviors on top of that focus model; verify interaction tests cover each key, first/last boundaries, filtered/sorted rows, and Enter selection.
- [ ] 3.23 Add height-based tree expansion/collapse transitions when motion is allowed and disable non-essential animation for `prefers-reduced-motion`; verify browser checks exercise both media-preference modes.
- [ ] 3.24 Run a Polish accessibility checkpoint for table semantics, focus visibility, keyboard navigation, perceivable connection status, update feedback, and reduced motion; record any observable defect before final documentation and review.

### Mandatory handoff documentation and evidence

- [ ] 3.25 Update `docs/architecture.md` and `docs/data-model.md` with the implemented realtime data flow, patch contract, ordering/recovery policy, cache interaction, incremental aggregation, and the required WebSocket-patch explanation; verify the documents match the accepted decisions, ADRs, and tested behavior.
- [ ] 3.26 Finalize `README.md` with the verified one-command startup path and an accurate `AI в разработке` section distinguishing AI-generated work, manual rewrites, and reasons; verify the instructions work from a clean reviewer checkout or equivalent clean environment.
- [ ] 3.27 Add final screenshots or a GIF showing the completed mandatory dashboard; verify the media is readable, repository-local, and represents the current Polish implementation rather than an earlier stage.
- [ ] 3.28 Audit the mandatory delivery artifacts, including the aggregation unit test, architecture/data-model documentation, relevant ADRs, stage evidence, screenshots/GIF, and source-handoff readiness; verify every `staff-pulse-delivery` scenario is satisfied or explicitly reported unmet.

### Polish stage closure

- [ ] 3.29 Audit every Polish acceptance scenario while rerunning all Foundation and Core scenarios plus relevant realtime, cache, keyboard, motion, typecheck, lint, build, and browser checks; record requirement-to-evidence mapping and any unmet scenario.
- [ ] 3.30 Obtain an independent read-only Polish review from a reviewer/context that did not author the implementation, covering all mandatory requirements, cache/realtime consistency, races, cancellation, aggregation, accessibility, motion, documentation, and stage scope; record severity-ranked findings without modifying code during review.
- [ ] 3.31 Fix only the Polish or mandatory-delivery review findings accepted by the human and add focused regression coverage for correctness defects; verify each accepted finding is resolved and document any explicitly deferred P2/Nit item.
- [ ] 3.32 Run the final mandatory verification suite and scenario audit after fixes; verify no known P0/P1 finding remains, the production build succeeds, and no Bonus work has leaked into the mandatory stages.
- [ ] 3.33 Prepare and create the independently reviewable Polish commit `Step/3` and tag `step/3`, then prepare the public-repository or source-archive handoff from that state; verify the tag resolves to the commit and the complete mandatory dashboard starts and passes its checks from the tagged source.

## 4. Bonus — Optional and Non-Blocking

Tasks 4.2–4.15 apply only if task 4.1 records explicit human approval to undertake
Bonus. If Bonus is declined, record that outcome and treat the remaining Bonus tasks as
not applicable; they do not block completion or delivery of Foundation, Core, or Polish.

### Bonus decision gates

- [ ] 4.1 After the mandatory `step/3` state is complete, obtain the human decision whether to undertake Bonus; verify the decision is recorded without changing the completion status of any mandatory stage.
- [ ] 4.2 If Bonus is approved, obtain human approval for container/deployment topology, `.env` configuration boundary, accepted gzip measurement scope, and AI provider or local interpretation strategy; verify the approved design introduces no prerequisite for mandatory behavior before Bonus implementation starts.

### Containerized production delivery

- [ ] 4.3 If Bonus is approved, package the client and server for `.env`-driven startup through `docker-compose up`; verify both processes start together and the dashboard reaches the API with the documented configuration.
- [ ] 4.4 If Bonus is approved, configure Nginx to serve the production client and proxy API traffic; verify runtime requests load the dashboard and API successfully through the Nginx entry point.
- [ ] 4.5 If Bonus is approved, enable gzip delivery and implement the approved reproducible frontend-size measurement; verify response encoding and measured production assets are no larger than 200 KB gzip.
- [ ] 4.6 Run a deployment checkpoint from a clean container build through application use and shutdown; verify no undocumented local tool or environment value is required beyond the approved `.env` contract.

### Natural-language search

- [ ] 4.7 If Bonus is approved, define and validate the approved structured filter response at the AI boundary; verify focused tests reject malformed or unsupported AI output before it can affect client filtering.
- [ ] 4.8 If Bonus is approved, connect natural-language input to successful AI interpretation and apply the validated structured filter entirely on the client; verify an integration test covers a representative successful query and matching row set.
- [ ] 4.9 If Bonus is approved, fall back to the existing text search when AI interpretation is unavailable, fails, or returns invalid output; verify focused tests cover provider failure, malformed output, and fallback results without breaking mandatory filtering.
- [ ] 4.10 Run an AI-search checkpoint for success, validation failure, provider failure, debounce/interaction compatibility, and mandatory-search regression; record observable results before Bonus review.

### Bonus documentation and stage closure

- [ ] 4.11 If Bonus is approved, update startup/configuration, deployment, gzip measurement, and AI-search documentation and add or revise an ADR only for a genuinely non-trivial approved decision; verify documentation matches the implemented Bonus behavior without rewriting mandatory-stage history.
- [ ] 4.12 Audit every undertaken Bonus acceptance scenario and rerun the complete mandatory regression suite; record requirement-to-evidence mapping and any unmet Bonus scenario without changing mandatory completion.
- [ ] 4.13 Obtain an independent read-only Bonus review from a reviewer/context that did not author the implementation, covering deployment, configuration, gzip evidence, AI boundary/fallback, and mandatory regressions; record severity-ranked findings without modifying code during review.
- [ ] 4.14 Fix only the Bonus review findings accepted by the human and add focused regression coverage for correctness defects; verify each accepted finding is resolved and document any explicitly deferred P2/Nit item.
- [ ] 4.15 Run final Bonus and mandatory verification after fixes, then prepare and create the reviewable Bonus commit `Step/4` and tag `step/4`; verify no known P0/P1 finding remains, the tag resolves to that commit, and mandatory behavior still passes from the tagged state.
