# Core verification record

Дата проверки: 2026-09-15.

## Выполненные проверки

- Targeted Vitest suite — passed: 8 test files, 20 tests.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed; production bundle `121.37 kB` gzip.
- `git diff --check` — passed.

## Browser checkpoint

- Initial presentation is the canvas; `Карта / Таблица` switches to the table
  and reload returns to canvas.
- The table displays all 40 organization rows and five columns: subdivision,
  level, total employees, total budget, and average performance.
- Aggregate values are visible on rows, including descendant totals; budgets
  display grouped digits with `руб.`.
- A single click on a column control exposes ascending sort and changes row
  order. A double-click on the active control exposes descending sort and
  reverses the order.
- Entering `1.1.1` and waiting at least 250 ms leaves the matching team and its
  `Дивизион 1`/`Отдел 1.1` context rows visible.
- Selecting `Команда 1.1.1` in the table, switching to canvas, and returning to
  the table preserves the same selected id and row highlight.
- The canvas detail panel shows separate raw and aggregate metrics, child list,
  and last update time. It is absent in table mode without clearing selection.
- A selected team hidden by collapsed canvas ancestors is revealed; the
  selected card is visible with `aria-selected="true"` and the viewport centers
  on its automatic layout position.

## Невыполненные или ограниченные аспекты

- Zero-headcount average is covered by the domain/formatter tests; the standard
  fixture does not contain a zero-headcount row for a separate browser sample.
- Keyboard table navigation and realtime behavior are outside the Core
  checkpoint scope and remain Polish work.
- No current Core behavior failure remains after the checks above.

## Core acceptance audit (task 2.19)

### Foundation regression evidence

- `./node_modules/.bin/vitest run` — passed: 8 test files, 20 tests.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed.
- `git diff --check` — passed.
- Browser rerun on `http://localhost:5176/` loaded the canvas-first dashboard;
  the accessibility tree exposed `Карта / Таблица`, canvas controls, visible
  second-level cards, numeric performance values and directed canvas content.
- Browser table switch exposed all five column headers, the search field and
  40 organization rows. The table projection showed aggregate totals and
  formatted budgets/averages.
- The earlier Foundation record covers API smoke, initial loading/error/empty
  boundaries, normalized hierarchy, canvas connections, zoom/pan, fit, expand
  and collapse behavior.

### Core scenario audit

- Analytics table: passed — one row per organization node, five required
  columns and labeled levels observed in the browser.
- Descendant aggregation: passed — leaf, internal-node, multiple-branch and
  zero-headcount cases are covered by the aggregation tests; zero denominator
  produces `null` and the UI formatter produces `—`.
- Initial aggregate reuse: passed — `org-tree-query.test.ts` and
  `table-projection.test.ts` instrument `calculateOrgAggregates`; repeated
  reconciliation/projection does not invoke another full pass.
- Presentation access and shared selection: passed in the prior browser
  checkpoint — canvas-first mode, table switch, table selection, return to
  canvas, hidden-node reveal and detail-panel visibility were observed.
- Sorting: passed — all supported columns and deterministic tie handling are
  covered by `table-sorting.test.ts`; browser evidence covers active direction
  and double-click reversal. Current UI keeps table scroll position while
  sorting.
- Filtering: passed — `table-filtering.test.ts` and
  `useDebouncedValue.test.ts` cover contextual ancestors and the 250 ms latest
  value; browser evidence covers the `1.1.1` match and its ancestors.
- Composition and snapshot identity: passed by
  `table-projection.test.ts`; derived filter/sort operations preserve node and
  aggregate identities.

### Aggregate-pass evidence

Each newly parsed full snapshot calls `calculateOrgAggregates` once during
normalization. A semantic no-op revalidation retains the previous snapshot and
`aggregatesById`; reconciliation of the same accepted snapshot and ordinary
table projection do not run another full aggregation pass. This is directly
asserted by `org-tree-query.test.ts` and `table-projection.test.ts`.

### Resolved product-scope change

The human confirmed that the later product instruction removing `Сбросить`
supersedes the earlier Foundation wording. `design.md` and task 1.24b now
describe the implemented canvas controls: zoom in, zoom out and `Fit view`.
The current browser accessibility tree matches that approved scope.

## Independent Core review (task 2.20)

The human-confirmed independent read-only review covered Core requirements,
aggregation correctness, table projection consistency, sorting/filtering,
shared selection, accessibility and stage scope. No findings were reported:
P0 — none; P1 — none; P2 — none; Nit — none. The review made no code changes.

## Core review resolution (task 2.21)

There were no accepted findings, so no code fixes or correctness regression
tests were required. No P2/Nit item was deferred.

## Final Core verification (task 2.22)

- `./node_modules/.bin/vitest run` — passed: 7 test files, 19 tests.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed.
- `git diff --check` — passed.
- Changed source contains no realtime transport, deployment, or AI/Bonus
  implementation. The additional UI refinements were explicit user-requested
  presentation changes and do not add a Polish realtime or Bonus dependency.
- The independent review reported no P0/P1 findings, so no known P0/P1 issue
  remains in the reviewed Core scope.

### Verification limitation

The earlier Core checkpoint recorded 8 test files / 20 tests, while the current
working tree contains 7 test files / 19 tests; `useDebouncedValue.test.ts` is
not currently present and has no tracked deletion in the checkout. The
debounce implementation remains covered by the prior checkpoint/browser
evidence, but the current automated rerun has one fewer test file.
