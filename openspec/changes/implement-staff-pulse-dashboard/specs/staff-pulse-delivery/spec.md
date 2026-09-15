## Purpose

Defines the required technical baseline, staged evidence, documentation, and
source handoff for the Staff Pulse take-home assignment.

## ADDED Requirements

### Requirement: Required project baseline
The delivered project MUST use React, Vite, and TypeScript with absolute
imports, MUST include its own server, and MUST contain no inline CSS. It SHALL
not add authentication, a database, or a UI component library such as MUI or
Ant Design.

#### Scenario: Delivered source is inspected
- **WHEN** a reviewer inspects the project configuration and source
- **THEN** the required stack, absolute imports, own server, and styling constraint are present and the excluded systems are absent

### Requirement: Staged git delivery
Each implemented assignment stage MUST end in a separate reviewable commit
tagged `step/N`, where Foundation, Core, Polish, and an undertaken Bonus stage
retain their original ordering. Bonus MUST NOT block completion of the three
mandatory stages.

#### Scenario: Mandatory history is reviewed
- **WHEN** a reviewer inspects the delivered git history and tags
- **THEN** Foundation, Core, and Polish each have a distinct stage commit with the corresponding `step/N` tag and each stage is independently understandable

#### Scenario: Bonus is omitted
- **WHEN** the optional Bonus stage is not undertaken
- **THEN** the three mandatory stage commits remain complete and deliverable without a Bonus commit or tag

### Requirement: Stage verification and review
Before each mandatory stage is tagged, its relevant acceptance scenarios and
automated checks MUST be verified, it MUST receive an independent review, and
no known P0 or P1 finding may remain.

#### Scenario: Mandatory stage is prepared for tagging
- **WHEN** implementation work for Foundation, Core, or Polish is complete
- **THEN** scenario evidence, relevant test/type/lint/build results, and independent review findings are recorded before the stage commit and tag

### Requirement: README handoff
The development process MUST use AI assistance. The README MUST document a
one-command startup path and contain an `AI в разработке` section that
accurately states what AI generated, what was manually rewritten, and why.

#### Scenario: Reviewer follows the README
- **WHEN** a reviewer follows the documented one-command startup instructions
- **THEN** the required application processes start without undocumented setup steps

#### Scenario: Reviewer reads the AI disclosure
- **WHEN** a reviewer opens the README AI section
- **THEN** it identifies the AI-assisted work, distinguishes it from manually rewritten work, and explains the reasons for manual changes

### Requirement: Required test and visual evidence
The delivered project MUST include at least one unit test protecting the
aggregation function and MUST include screenshots or a GIF of the final result.

#### Scenario: Delivery evidence is inspected
- **WHEN** a reviewer inspects the automated tests and repository artifacts
- **THEN** an aggregation unit test and final-result screenshots or GIF are present

### Requirement: Architecture documentation
The delivered `docs/architecture.md` MUST describe application layers and the
end-to-end flow of data from the API to the user interface.

#### Scenario: Architecture document is reviewed
- **WHEN** a reviewer reads `docs/architecture.md`
- **THEN** the application layers and API-to-UI data flow are explained

### Requirement: Data-model documentation
The delivered `docs/data-model.md` MUST describe the organization tree, the
aggregation algorithm, and the realtime patch contract, including the
assignment's WebSocket-patch documentation requirement.

#### Scenario: Data-model document is reviewed
- **WHEN** a reviewer reads `docs/data-model.md`
- **THEN** the hierarchy model, aggregate calculations, and realtime patch contract are explicit enough to verify the implementation

### Requirement: Architectural decision records
Non-trivial architectural decisions MUST be recorded under
`docs/adr/NNN-name.md` with context, decision, alternatives, and consequences.

#### Scenario: Non-trivial decision is reviewed
- **WHEN** a reviewer inspects an architectural choice that affects multiple parts of the implementation
- **THEN** a corresponding ADR records its context, chosen option, considered alternatives, and consequences

### Requirement: Source handoff
The completed source MUST be delivered as a public repository or as a source
archive.

#### Scenario: Assignment is submitted
- **WHEN** the final mandatory implementation is handed off
- **THEN** the reviewer receives either a public repository location or a source archive containing the required source and artifacts
