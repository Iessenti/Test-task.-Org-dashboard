# AGENTS.md

## Purpose

This repository is a frontend take-home assignment developed with AI-assisted,
spec-driven engineering.

AI agents are engineering collaborators, not autonomous owners of product or
architecture decisions.

The human developer owns:

- interpretation of product requirements;
- scope;
- UX decisions;
- architecture and high-impact technical decisions;
- acceptance of generated code;
- final quality.

Agents should maximize useful autonomy inside those boundaries.

---

## Sources of truth

Use the following precedence when making decisions:

1. Original assignment.
2. Approved OpenSpec requirements and scenarios.
3. Approved design decisions and ADRs.
4. Approved Figma design for visual and interaction behavior.
5. Existing repository conventions.
6. Agent judgment for local implementation details.

If two higher-level sources materially conflict, do not silently choose one.
Report the conflict.

Do not invent product requirements to fill unspecified behavior.

---

## Engineering principles

Prefer:

- correctness over cleverness;
- simple solutions over speculative extensibility;
- explicit data flow over hidden coupling;
- derived state over duplicated state;
- existing platform/library capabilities over custom abstractions;
- measurable requirements over vague "best practices";
- evidence over assumptions.

Avoid:

- premature abstractions;
- speculative generalization;
- unnecessary dependencies;
- unnecessary global state;
- duplicated server state;
- abstractions used only once without a clear boundary;
- defensive code for impossible states without evidence;
- unrelated refactoring while implementing a scoped task;
- comments that merely restate the code.

Do not optimize for appearing "production-grade" when doing so adds complexity
without satisfying a requirement or mitigating a concrete risk.

---

## Decision ownership

Classify non-trivial decisions by impact.

### Type 1 — Agent-owned

Agents may decide autonomously:

- local variable/function naming;
- small helper extraction;
- test implementation details;
- file-local refactoring;
- routine TypeScript typing;
- other easily reversible implementation details.

### Type 2 — Agent proposes, human approves when material

Examples:

- component boundaries;
- reusable hook extraction;
- error-handling patterns;
- caching abstractions;
- non-trivial styling abstractions;
- changes affecting several modules.

If an established design or repository convention already determines the
answer, follow it without unnecessary escalation.

### Type 3 — Human-owned

Do not silently decide:

- product behavior;
- requirement interpretation where multiple meaningful interpretations exist;
- application architecture;
- state ownership boundaries;
- public interfaces/contracts;
- data model changes;
- major dependencies;
- networking/realtime strategy;
- scope expansion;
- high-cost or difficult-to-reverse decisions.

For these decisions, present:

1. problem;
2. constraints;
3. realistic alternatives;
4. trade-offs;
5. recommendation;
6. reversal cost.

Then wait for a decision unless an approved OpenSpec design or ADR already
settles the question.

---

## Spec-driven workflow

Before implementing a meaningful feature:

1. Read the relevant OpenSpec change.
2. Identify the requirements and acceptance scenarios involved.
3. Inspect the relevant existing implementation.
4. Identify assumptions and unresolved decisions.
5. Escalate unresolved Type 3 decisions.
6. Implement only the agreed scope.

OpenSpec describes intended behavior and accepted design, not immutable
implementation instructions.

If implementation reveals evidence that invalidates the current design or
specification, report it and update the relevant artifact rather than working
around an incorrect assumption.

---

## Implementation workflow

Work in small, verifiable vertical slices.

Before editing:

- understand the observable outcome;
- inspect affected code;
- determine relevant acceptance criteria;
- avoid unrelated changes.

During implementation:

- preserve existing working behavior unless intentionally changed;
- keep state ownership explicit;
- keep data transformations testable;
- handle required loading/error/empty/realtime states explicitly;
- maintain accessibility for interactive behavior.

After implementation:

1. run relevant tests;
2. run type checking;
3. run linting when configured;
4. run/build the application when relevant;
5. inspect the resulting diff;
6. verify behavior against relevant OpenSpec scenarios;
7. report remaining uncertainty.

Do not claim completion solely because code compiles.

---

## Evidence policy

A requirement is not considered verified merely because the implementation
looks plausible.

Prefer evidence from:

- automated tests;
- type checking;
- lint/build output;
- browser/runtime verification;
- explicit analysis of deterministic code paths.

For each completed slice, be able to map:

requirement → implementation → verification evidence.

Do not mark something as verified when it was only inferred.

---

## React implementation

All React implementation must follow `docs/development/react-guidelines.md`.

These guidelines are implementation constraints, not product requirements.
If a guideline conflicts with an explicit OpenSpec requirement, accepted ADR, or approved product behavior, do not silently resolve the conflict. Escalate it.

---

## Review policy

Implementation and review are different roles.

For meaningful changes, prefer independent review by an agent/context that did
not author the implementation.

Reviewers should inspect the actual repository state and requirements rather
than trusting the implementation agent's summary.

Review priorities:

1. requirement violations;
2. correctness bugs;
3. data/state consistency;
4. concurrency, cancellation, caching and realtime behavior;
5. accessibility and keyboard behavior;
6. missing edge cases;
7. unnecessary complexity;
8. maintainability;
9. cosmetic issues.

Reviewers should report findings before modifying code unless explicitly asked
to implement fixes.

Use severity:

- P0 — blocks correctness or assignment completion;
- P1 — significant issue that should be fixed;
- P2 — worthwhile improvement;
- Nit — cosmetic/non-essential.

Do not propose refactoring solely because another implementation style is
preferred.

---

## Testing

Tests should protect behavior and important algorithms, not implementation
details.

Prioritize:

- aggregation correctness;
- hierarchy transformations;
- cache/update behavior where practical;
- realtime patch application;
- critical user-visible states;
- regressions discovered during implementation.

For algorithmic code, include edge cases and invariants.

Do not generate large quantities of low-value tests merely to increase test
count or coverage.

---

## Assignment discipline

The assignment is intentionally staged.

Respect the required stage/commit structure and do not silently implement
future stages while working on an earlier one.

Keep each stage independently understandable and reviewable.

Do not implement bonus functionality before mandatory functionality is
correct and verified.

Do not add features that are explicitly outside the assignment scope.

---

## Documentation

Documentation should explain decisions that cannot be understood from the code
alone.

Keep:

- OpenSpec for requirements, scenarios and change planning;
- `docs/architecture.md` for application layers and end-to-end data flow;
- `docs/data-model.md` for hierarchy, aggregation and realtime patch contracts;
- ADRs for genuinely non-trivial architectural decisions.

Do not duplicate the same explanation across multiple artifacts.

When AI materially contributes to implementation or design, preserve enough
information to accurately document:

- what AI helped generate;
- what was changed manually;
- why it was changed;
- which important decisions remained human-owned.

---

## Escalation rules

Do not interrupt the human for routine reversible decisions.

Stop and escalate when:

- requirements materially conflict;
- an important requirement is ambiguous;
- implementation requires scope expansion;
- a new production dependency is needed without prior approval;
- a Type 3 decision is unresolved;
- implementation evidence contradicts an approved design;
- a destructive or difficult-to-reverse action is required.

When escalating, provide analysis and a recommendation rather than only asking
"What should I do?"

---

## Definition of done

A task is complete only when:

- relevant requirements are implemented;
- acceptance scenarios are satisfied;
- relevant automated checks pass;
- required edge states are handled;
- implementation has been reviewed;
- no known P0/P1 findings remain;
- documentation is updated when the implementation changed an important
  decision or contract.

Completion means demonstrated behavior, not generated code.
