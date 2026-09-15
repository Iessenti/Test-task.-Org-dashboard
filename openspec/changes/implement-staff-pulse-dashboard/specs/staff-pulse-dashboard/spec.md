## Purpose

Defines the observable Foundation, Core, and Polish behavior of the Staff Pulse
dashboard and its organization-data server.

## ADDED Requirements

### Requirement: Organization tree endpoint
The server SHALL expose `GET /api/org-tree` and return a flat JSON array whose
nodes contain `id`, `name`, `parentId`, `headcount`, `budget`, `performance`,
and `updatedAt`. The standard mock dataset SHALL contain at least 40 nodes,
span at least three hierarchy levels, and keep every `performance` value in the
inclusive range 0 through 100.

#### Scenario: Standard organization dataset is requested
- **WHEN** a client successfully requests `GET /api/org-tree`
- **THEN** the server returns the flat node array with at least 40 nodes, at least three hierarchy levels, and all required fields and performance bounds

### Requirement: Runtime response validation
The client MUST validate an organization response at runtime before making it
available as application data. A response that violates the accepted schema or
hierarchy invariants MUST be handled as an error.

#### Scenario: Server returns an invalid response
- **WHEN** the endpoint returns data that fails runtime validation
- **THEN** the client exposes an error state and does not publish the invalid data as the current organization snapshot

### Requirement: Cached organization requests
The client SHALL request organization data through a shared cache with a stale
time of five seconds, deduplicate concurrent requests for the same resource,
and use stale-while-revalidate behavior or an equivalent that avoids
unnecessary requests.

#### Scenario: Fresh cached data is requested again
- **WHEN** organization data was successfully validated less than five seconds ago and another consumer requests it
- **THEN** the client serves the cached snapshot without issuing another GET

#### Scenario: Stale cached data is requested
- **WHEN** cached organization data is at least five seconds old and an enabled revalidation trigger occurs
- **THEN** the client keeps the cached snapshot available while one deduplicated background GET revalidates it

#### Scenario: Concurrent consumers request uncached data
- **WHEN** multiple consumers request organization data while the same GET is already in flight
- **THEN** they share that in-flight request rather than starting duplicate GET requests

#### Scenario: Revalidation returns unchanged data
- **WHEN** a successful validated revalidation contains no real organization-data change
- **THEN** freshness is renewed without replacing the current snapshot or invalidating its derived hierarchy and aggregates

### Requirement: Shared request cancellation
An in-flight organization request MUST be cancellable when its final consumer
unmounts. Unmounting one of multiple consumers MUST stop that consumer from
observing the request without cancelling work still required by the others.

#### Scenario: Last request consumer unmounts
- **WHEN** the final consumer of an in-flight organization request unmounts
- **THEN** the client aborts the network request and does not publish its result as a normal success or failure

#### Scenario: One shared-request consumer unmounts
- **WHEN** one consumer unmounts while another consumer still observes the same in-flight request
- **THEN** the request continues for the remaining consumer

### Requirement: Initial request states
The dashboard SHALL present distinct loading, error, and empty states for the
initial organization request. A valid empty array SHALL produce the empty state
even though the standard mock fixture contains at least 40 nodes. Loading SHALL
use a general dashboard spinner and message, and an initial error SHALL offer a
retry action.

#### Scenario: Initial request is pending
- **WHEN** the first organization request has not completed and no cached snapshot exists
- **THEN** the dashboard presents its loading state

#### Scenario: Initial request fails
- **WHEN** the initial request fails through transport, HTTP, parsing, or validation and no cached snapshot exists
- **THEN** the dashboard presents its error state with a retry action

#### Scenario: Valid response is empty
- **WHEN** runtime validation accepts an empty organization array
- **THEN** the dashboard presents its empty state

#### Scenario: Background revalidation fails after data is visible
- **WHEN** a background revalidation fails while a valid organization snapshot is already visible
- **THEN** the dashboard keeps the existing data usable and presents a non-blocking update failure notice

#### Scenario: Background revalidation runs after data is visible
- **WHEN** a stale visible snapshot is being revalidated in the background
- **THEN** the dashboard keeps the canvas or table usable and presents a non-blocking updating status

### Requirement: Interactive organization tree
The Foundation dashboard SHALL render the organization hierarchy as a
top-down, automatically laid out canvas tree in which branches can be expanded
and collapsed and the second hierarchy level is visible by default. Every
displayed node card SHALL show its name, raw headcount, raw budget, and
performance as a numeric value and color indicator.

#### Scenario: Tree is first displayed
- **WHEN** a non-empty organization snapshot is first rendered
- **THEN** nodes on the second hierarchy level are visible as connected cards and each visible card shows the required name, raw headcount, raw budget, and performance indicator

#### Scenario: User toggles a branch
- **WHEN** the user activates the expand or collapse control for a node with children
- **THEN** that node's descendant branch becomes visible or hidden accordingly

#### Scenario: User navigates the organization canvas
- **WHEN** the user zooms, pans, or activates a canvas view control
- **THEN** the automatically laid out cards and their directed hierarchy connections remain usable without changing the organization data

### Requirement: Analytics table
The Core dashboard SHALL provide an analytical table for all organization
nodes with columns for subdivision, labeled hierarchy level, total employees,
total budget, and average performance. The table SHALL use a compact analytical
layout with a persistent header while its rows are scrolled.

#### Scenario: Table is displayed
- **WHEN** the user opens the table representation for a non-empty snapshot
- **THEN** every organization node is represented by a compact row with all five required columns and a level label such as `Дивизион`, `Отдел`, or `Команда`

### Requirement: Descendant aggregation
For each node, total employees and total budget MUST include the node's own raw
contribution and those of all descendants. Average performance MUST equal the
sum of `performance * headcount` over the subtree divided by total subtree
headcount. A subtree with zero total headcount SHALL display no numeric average.

#### Scenario: Parent row contains descendant contributions
- **WHEN** a node has one or more descendants
- **THEN** its table row shows headcount and budget sums over the complete subtree and performance weighted by each node's headcount

#### Scenario: Subtree headcount is zero
- **WHEN** a node and all of its descendants have zero headcount
- **THEN** its average-performance cell displays `—`

### Requirement: Initial aggregate reuse
The complete set of aggregates MUST be calculated once for each newly accepted
organization snapshot and reused while its underlying data remains unchanged.

#### Scenario: Dashboard rerenders without a data change
- **WHEN** the canvas or table rerenders while the accepted organization snapshot is unchanged
- **THEN** the client reuses the existing aggregates rather than running another complete aggregation

### Requirement: Tree and table presentation access
The dashboard SHALL make the top-down canvas and analytical table available
through a `Карта / Таблица` mode switch. The canvas is the primary presentation
when the dashboard is opened.

#### Scenario: User accesses both representations
- **WHEN** the dashboard has loaded organization data
- **THEN** the user can inspect the canvas and analytical table through the mode switch, with the canvas selected initially

### Requirement: Shared node selection
Selecting a table row SHALL select the same node in the canvas. Selection SHALL
be represented by the organization node identity and SHALL survive switching
presentations, sorting, and filtering.

#### Scenario: User selects a table row
- **WHEN** the user activates a row for an organization node
- **THEN** the corresponding canvas card is visibly selected when the canvas representation is shown

#### Scenario: Selected node is hidden by a collapsed canvas branch
- **WHEN** the user selects a table row whose canvas node is hidden by collapsed ancestors
- **THEN** the canvas expands the required ancestors and scrolls or centers the selected card into view

### Requirement: Canvas detail presentation
When a canvas node is selected, the dashboard SHALL provide a detail panel
showing the node's raw metrics, aggregate subtree metrics, child nodes, and
last update time. The detail panel SHALL be hidden in table mode without
clearing the shared node selection.

#### Scenario: User selects a canvas card
- **WHEN** the user activates a canvas card
- **THEN** the dashboard opens a detail panel containing separate raw and aggregate metrics, the selected node's children, and its last update time

#### Scenario: User switches to the table
- **WHEN** the user switches from the canvas to the table while a node is selected
- **THEN** the detail panel is hidden and the corresponding table row remains selected

### Requirement: Table sorting
The user SHALL be able to sort the table by any column. A column sort SHALL
cycle through ascending, descending, and cleared/default ordering. A
double-click on the currently active column control SHALL reverse its active
direction.

#### Scenario: User sorts a column
- **WHEN** the user activates the sort control for any table column
- **THEN** the table displays a deterministic ordering based on that column and exposes the active direction

#### Scenario: User reverses table sorting
- **WHEN** the user double-clicks the control for the currently sorted column
- **THEN** the table reverses the active ordering for that column

#### Scenario: User clears table sorting
- **WHEN** the user activates a currently descending column sort control according to the table's sort cycle
- **THEN** the table returns to its deterministic default ordering and exposes that no column sort is active

### Requirement: Debounced name filtering
The table SHALL filter organization nodes by name in response to user input,
using case-insensitive substring matching and applying the latest input 250
milliseconds after the user stops changing it. Matching rows SHALL retain the
ancestor rows needed to preserve hierarchy context.

#### Scenario: User enters a name filter
- **WHEN** the filter value remains unchanged for 250 milliseconds
- **THEN** the table displays matching rows and their contextual ancestors without mutating source organization data

### Requirement: Budget formatting
Displayed table budgets SHALL use grouped digits followed by `руб.`, matching
the form `12 345 678 руб.`.

#### Scenario: Budget is displayed
- **WHEN** a table row has an aggregate budget of 12345678
- **THEN** its budget cell displays `12 345 678 руб.`

### Requirement: Realtime metric updates
In Polish, the server SHALL provide realtime updates using one selected option
from WebSocket, SSE, or efficient polling. Each accepted patch SHALL target an
existing node and MAY change only `headcount`, `budget`, and `performance`;
node identity and organization topology MUST remain unchanged.

#### Scenario: Existing node receives a metric patch
- **WHEN** the client accepts a realtime patch for an existing node
- **THEN** the changed metrics become visible without changing the node's id, name, parent, or membership in the organization

#### Scenario: Patch would change topology
- **WHEN** a realtime update attempts to reparent, insert, or delete a node
- **THEN** the client does not apply that update as a valid metric patch

#### Scenario: Efficient polling is selected
- **WHEN** the approved realtime transport is polling
- **THEN** its request cadence accounts for the expected change frequency, backs off after failures, and avoids requests that are unnecessary under the approved polling policy

### Requirement: Patch application without full refetch
The client MUST apply an accepted realtime metric patch directly to the cached
organization snapshot without performing a full GET solely because that patch
arrived.

#### Scenario: Valid patch arrives
- **WHEN** an accepted metric patch changes an existing node
- **THEN** the cached snapshot and visible projections update without a full organization refetch

### Requirement: Incremental realtime aggregation
After an accepted metric patch, the client MUST recompute aggregates only for
the changed node and its ancestor chain. Aggregates in unrelated branches MUST
remain unchanged.

#### Scenario: Descendant metric changes
- **WHEN** a node's metric patch changes one or more aggregate contributions
- **THEN** the visible aggregates for that node and its ancestors are updated while aggregates in unrelated branches remain unchanged

#### Scenario: Patch is a semantic no-op
- **WHEN** an accepted patch contains the same metric values already held for its target
- **THEN** the canonical snapshot and aggregates remain unchanged

### Requirement: Updated-cell feedback
Only the changed raw metric and affected aggregate values on the patched node
and its ancestors SHALL show a fade-out visual indication lasting approximately
1.5 seconds. Unchanged values and unrelated branches SHALL not be highlighted.

#### Scenario: Visible cell value changes after a patch
- **WHEN** an applied patch changes a value currently visible in the table
- **THEN** the affected cell presents a change indication that fades out over approximately 1.5 seconds

#### Scenario: Repeated patch updates an active indication
- **WHEN** another accepted patch changes the same visible value before its previous indication has faded
- **THEN** the indication remains active for approximately 1.5 seconds from the latest change

### Requirement: Realtime connection feedback
The dashboard header SHALL display the current realtime connection status and
the client SHALL use exponential backoff after a connection interruption.

#### Scenario: Realtime connection is interrupted
- **WHEN** the selected realtime connection reports an interruption
- **THEN** the header reflects `Live`, `Reconnecting…`, or `Offline` as appropriate and successive retry delays increase exponentially

### Requirement: Keyboard table navigation
The analytical table SHALL support keyboard navigation using arrow keys,
Home, End, and Enter. Arrow keys SHALL move focus between rows, Home and End
SHALL move to the first and last available row, and Enter SHALL activate the
focused row.

#### Scenario: User navigates the table by keyboard
- **WHEN** keyboard focus is within the table and the user presses an arrow key, Home, End, or Enter
- **THEN** the table performs the defined navigation or activation behavior for that key without requiring pointer input

### Requirement: Motion preferences
Canvas branch expansion and collapse SHALL use a height transition when motion
is allowed and SHALL respect the user's `prefers-reduced-motion` preference.

#### Scenario: User allows motion
- **WHEN** a canvas branch is expanded or collapsed and reduced motion is not requested
- **THEN** the branch uses a height transition

#### Scenario: User requests reduced motion
- **WHEN** a canvas branch is expanded or collapsed while `prefers-reduced-motion` is active
- **THEN** the dashboard avoids the non-essential expansion animation
