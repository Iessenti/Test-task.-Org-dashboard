$openspec-apply

Выполни только следующую незавершённую implementation-задачу из `tasks.md` активного OpenSpec change.

Не переходи к следующей задаче после её завершения.

## **Источники истины**

При реализации соблюдай следующий приоритет:

1. исходное тестовое задание;
2. `AGENTS.md`;
3. requirements и scenarios активного OpenSpec change;
4. принятые ADR;
5. `design.md`;
6. `tasks.md`;
7. существующие conventions кодовой базы.

Не пересматривай уже принятые архитектурные решения без обнаружения прямого противоречия требованиям.

## **Перед реализацией**

Перед изменением кода:

1. Определи конкретную следующую незавершённую implementation-задачу.
2. Прочитай только релевантные для неё:
    - requirements/scenarios;
    - части `design.md`;
    - ADR;
    - существующие файлы реализации.
3. Определи ожидаемый результат задачи.
4. Определи минимальную релевантную проверку, которой можно подтвердить результат.
5. Проверь, нет ли блокирующей неоднозначности или необходимости принять новое существенное решение.

Не исследуй нерелевантные части репозитория без необходимости.

## **Работа с вопросами и решениями**

Не принимай самостоятельно новые продуктовые, архитектурные или другие существенные решения, если они не определены существующими requirements, design или ADR.

Если такое решение необходимо:

1. останови реализацию до принятия решения;
2. сформулируй конкретный вопрос;
3. объясни, почему существующих артефактов недостаточно;
4. предложи разумные варианты;
5. кратко укажи trade-offs каждого варианта;
6. используй стандартный интерактивный интерфейс Codex для вопроса пользователю и выбора ответа, если он доступен в текущем режиме;
7. не выбирай вариант от моего имени;
8. после моего ответа продолжи выполнение этой же задачи.

Для локальных, легко обратимых implementation details можешь принимать решение самостоятельно.

Не задавай вопрос, если ответ уже однозначно следует из OpenSpec, ADR, `AGENTS.md` или существующего кода.

## **Реализация**

При выполнении задачи:

- изменяй только то, что необходимо для текущей задачи;
- придерживайся принятого `design.md` и ADR;
- не реализуй следующие tasks заранее;
- не реализуй Bonus заранее;
- не выполняй unrelated refactoring;
- не добавляй speculative abstractions;
- не добавляй зависимости без необходимости;
- не дублируй canonical state;
- предпочитай минимальную реализацию, полностью удовлетворяющую текущим требованиям;
- сохраняй существующее рабочее поведение.

Если во время реализации обнаруживается, что OpenSpec/design необходимо изменить, не обходи проблему в коде. Остановись и сообщи, какой артефакт требует пересмотра и почему.

## **Проверка**

После реализации выполни минимальный набор проверок, релевантный текущей задаче.

Предпочитай targeted verification вместо запуска всех возможных проверок.

В зависимости от задачи это могут быть:

- targeted unit tests;
- typecheck;
- lint;
- build;
- runtime/browser verification;
- проверка конкретного code path.

Если проверка не проходит:

1. выясни причину;
2. исправь проблему, если исправление остаётся в scope текущей задачи;
3. повтори релевантную проверку.

Не скрывай failing checks.

Если исправление требует изменения scope, requirements, design или принятой архитектуры — остановись и запроси решение.

## **Self-review**

После успешной проверки просмотри собственный diff.

Проверь:

- нет ли изменений вне scope задачи;
- соответствует ли реализация релевантным requirements/scenarios;
- соответствует ли она `design.md` и ADR;
- не появилась ли ненужная сложность;
- нет ли очевидных edge cases или ошибок;
- не реализована ли случайно функциональность следующих этапов.

Не проводи полноценный архитектурный review всей системы.

## **Учёт использования AI**

Во время выполнения задачи отслеживай происхождение внесённых изменений, чтобы эту информацию позднее можно было использовать для обязательного раздела об использовании AI в README.

Фиксируй только то, что можешь достоверно определить в рамках текущего запуска. Используй для этого файл ai-usage.md

Различай:

- **AI-generated** — код, тесты, документация или конфигурация, непосредственно созданные или существенно изменённые тобой в рамках текущей задачи;
- **Human decision** — решения, которые были явно приняты пользователем и которые ты только реализуешь;
- **Human-modified** — ручные изменения пользователя только в тех случаях, когда их происхождение достоверно известно из текущего контекста или Git diff/history;
- **Unknown provenance** — существующие изменения, происхождение которых нельзя достоверно определить.

Не приписывай пользователю ручную работу без достаточных оснований.

Не добавляй AI-комментарии в исходный код.\
&#x20;Не добавляй AI/manual-маркеры в названия файлов.\
&#x20;Не изменяй формат Git-коммитов ради provenance.\
&#x20;Не обновляй README после каждой задачи, если это отдельно не запрошено.

Эта информация нужна как рабочий журнал для последующего составления итогового раздела `AI Usage`.

## **OpenSpec tasks**

Отмечай текущую задачу выполненной в `tasks.md` только если её результат подтверждён достаточной проверкой.

Не отмечай следующие задачи выполненными только потому, что часть их функциональности появилась побочно.

Если задача не может считаться полностью проверенной, оставь её незавершённой и явно укажи причину.

## **Завершение**

После выполнения текущей задачи остановись.

В конце сообщи кратко:

1. **Задача** — какая task была выполнена.
2. **Изменения** — какие файлы/части системы изменены.
3. **Проверка** — какие проверки были выполнены и их результат.
4. **OpenSpec** — отмечена ли task выполненной.
5. **Неопределённость** — остались ли риски или непроверенные аспекты.
6. **AI provenance**:
    - что непосредственно сгенерировано или изменено Codex;
    - какие решения были заранее приняты пользователем;
    - какие достоверно известные ручные изменения пользователя были сохранены или переработаны;
    - что имеет неизвестное происхождение, если такое есть.
7. **Следующая задача** — какая task идёт следующей, но не начинай её выполнять.

Не делай commit и не создавай tag без отдельной команды пользователя.\
&#x20;Не начинай следующую task.

---

## Task 1.11 provenance

- **AI-generated:** Zod schema, payload parser, focused validator tests, and the minimal Vitest configuration and dependency changes were generated or modified by Codex in this task.
- **Human decision:** The user previously approved Zod and the accepted DTO field types and metric bounds recorded in design.md.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes are not attributed here.

## Task 1.12 provenance

- **AI-generated:** The hierarchy invariant validator and its focused topology tests were generated by Codex in this task.
- **Human decision:** The user-approved hierarchy policy in design.md determines the accepted forest shape and rejected topology cases.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes are not attributed here.

## Task 1.13 provenance

- **AI-generated:** The Foundation snapshot type, normalization function, focused normalization tests, and this provenance entry were generated by Codex in this task.
- **Human decision:** The user-approved `Record` index representation and ADR-001 snapshot shape determine the normalization result.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes are not attributed here.

## Task 1.14 provenance

- **AI-generated:** The atomic `unknown`-payload-to-snapshot acceptance function, focused acceptance tests, and this provenance entry were generated by Codex in this task.
- **Human decision:** The approved Zod validation, hierarchy invariants, and ADR-001 normalization boundary determine the composition order.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes are not attributed here.

## Task 1.15 provenance

- **AI-generated:** The typed organization fetch boundary, error classification, focused tests, and this provenance entry were generated by Codex in this task.
- **Human decision:** The approved API boundary, runtime validation pipeline, and TanStack Query signal ownership come from the OpenSpec design and ADR-002.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes are not attributed here.

## Task 1.16 provenance

- **AI-generated:** The TanStack Query options, retry policy, fresh-cache verification test, dependency addition, and this provenance entry were generated by Codex in this task.
- **Human decision:** TanStack Query, five-second stale time, retry/refetch policy, and query ownership were previously approved in the OpenSpec design and ADR-002.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes are not attributed here.

## Task 1.17 provenance

- **AI-generated:** The shared query hook/provider boundary, in-flight deduplication test, stale-while-revalidate test, and this provenance entry were generated by Codex in this task.
- **Human decision:** TanStack Query ownership, shared request behavior, and stale-while-revalidate semantics were previously approved in OpenSpec and ADR-002.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes are not attributed here.

## Task 1.18 provenance

- **AI-generated:** The observer-aware cancellation test and this provenance entry were generated by Codex in this task; cancellation behavior uses the existing TanStack Query signal boundary.
- **Human decision:** Query-owned cancellation semantics, including retaining work for remaining observers and aborting after the last observer leaves, were previously approved in ADR-002 and the OpenSpec design.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes are not attributed here.

## Task 1.19 provenance

- **AI-generated:** The order-independent snapshot equality, structural-sharing reconciliation, focused identity tests, and this provenance entry were generated by Codex in this task.
- **Human decision:** Equality by node id and DTO fields, independent of input order, was explicitly approved by the user and recorded in design.md.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes are not attributed here.

## Task 1.20 provenance

- **AI-generated:** The complete query-pipeline revalidation test and this provenance entry were generated by Codex in this task; the pipeline uses the previously implemented fetch, validation, normalization, and query layers.
- **Human decision:** Invalid responses must not replace a valid cached snapshot, as required by the approved OpenSpec design and ADR-002.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes are not attributed here.

## Architecture extraction and TypeScript robustness provenance

- **AI-generated:** The `src/data/org-tree/` relocation, strict TypeScript hardening, unused test cleanup, and Vite config compatibility fix were performed by Codex in this task.
- **Human decision:** The user requested a separate architecture-aligned folder, deletion of tests, and strict TypeScript robustness evaluation.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes outside this task remain unattributed.

## Foundation task 1.21 provenance

- **AI-generated:** The initial dashboard state view and query-provider wiring were generated or modified by Codex; no tests were added per the user's explicit instruction.
- **Human decision:** The dashboard reads loading/error/empty state directly from the query resource, as defined by the approved Foundation requirements and ADR-002.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes outside this task remain unattributed.

## Foundation task 1.24b provenance

- **AI-generated:** The canvas viewport state, deterministic zoom controls, pointer pan handling, fit/reset actions, and this provenance entry were generated or modified by Codex in this task; no tests were added per the user's explicit instruction.
- **Human decision:** Canvas navigation changes only the viewport while automatic node layout and organization data remain unchanged, following the approved Foundation design.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes outside this task remain unattributed.

## Canvas text-selection fix provenance

- **AI-generated:** The canvas `user-select` rule and pointer default prevention were added by Codex in response to the user's selected interaction fix.
- **Human decision:** The user explicitly approved preventing text selection during canvas pan.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Canvas card selection provenance

- **AI-generated:** The selected-card state, click and keyboard selection handlers, drag threshold, selected-card outline, and accessibility attributes were generated or modified by Codex in response to the user's request.
- **Human decision:** The user explicitly requested selectable canvas cards while retaining pan behavior.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Canvas card cursor fix provenance

- **AI-generated:** The card-specific cursor styling was added by Codex to prevent the inherited pan cursor from appearing over selectable cards.
- **Human decision:** The user reported the cursor issue and requested the interaction to work correctly.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Canvas selection animation provenance

- **AI-generated:** The selected-card halo, outline transition, reduced-motion fallback, and this provenance entry were generated or modified by Codex.
- **Human decision:** The user selected the outline-plus-shadow indication with a small animation.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Canvas card selection click fix provenance

- **AI-generated:** The pointer default-prevention removal was generated or modified by Codex to preserve native click dispatch for card selection while retaining CSS-based text-selection prevention.
- **Human decision:** The user reported that card selection did not work and requested the fix.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Canvas card click and pan compatibility provenance

- **AI-generated:** Deferred pointer capture until the pan threshold is crossed, preserving click dispatch for card selection while retaining drag navigation.
- **Human decision:** The user reported that card selection still did not work and requested a working interaction.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Tidy tree positioning provenance

- **AI-generated:** The visible-subtree measurement, parent-centering layout, and animated card repositioning were generated or modified by Codex in response to the user's selected tidy-tree option.
- **Human decision:** The user explicitly selected the tidy tree layout with animation.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Synchronized canvas layout animation provenance

- **AI-generated:** The shared requestAnimationFrame position interpolation for cards and SVG connections, including the reduced-motion fallback, was generated or modified by Codex to remove visual synchronization drift.
- **Human decision:** The user reported that the connections appeared delayed relative to the cards and requested the layout animation to feel synchronized.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Canvas arrowhead layering provenance

- **AI-generated:** The separate arrowhead layer, z-index ordering, overlap offset, and centered SVG marker geometry were generated or modified by Codex in response to the user's visual feedback.
- **Human decision:** The user requested arrowheads above cards with slight overlap and paths ending at the arrowhead's top center.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Application loading optimization provenance

- **AI-generated:** The lazy-loaded canvas chunk, Suspense loading fallback, and this provenance entry were generated or modified by Codex in response to the user's request to optimize application loading.
- **Human decision:** The user approved proceeding with bundle analysis and code splitting.
- **Human-modified:** No manual changes were observed during this optimization.
- **Unknown provenance:** Existing repository changes outside this optimization remain unattributed.

## Branch toggle alignment provenance

- **AI-generated:** The flex centering and padding reset for the branch toggle glyph were generated or modified by Codex in response to the user's visual feedback.
- **Human decision:** The user requested centered `+`/`−` glyphs inside card controls.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Branch toggle SVG icon provenance

- **AI-generated:** The compact inline SVG plus/minus branch-toggle icon and its styling were generated or modified by Codex in response to the user's request.
- **Human decision:** The user requested SVG icons instead of text glyphs in the card controls.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Environment-driven mock states provenance

- **AI-generated:** The mock-server modes, delay handling, invalid-response fixture, environment example, and this provenance entry were generated or modified by Codex in response to the user's request.
- **Human decision:** The user approved an env-driven approach for reproducible loading, error, and empty-state checks in the take-home assignment.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Canvas controls and loading alignment provenance

- **AI-generated:** The centered loading-state layout, reused SVG zoom icons, Russian reset label, removed Fit view handler, and this provenance entry were generated or modified by Codex in response to the user's requested UI adjustments.
- **Human decision:** The user explicitly requested all four presentation and control changes.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Empty and loading message typography provenance

- **AI-generated:** The centered empty-state content and shared enlarged state-message typography were generated or modified by Codex in response to the user's visual feedback.
- **Human decision:** The user explicitly requested a centered empty state and larger loading/empty-state text.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Fixed dashboard state height provenance

- **AI-generated:** The shared fixed-height dashboard panel, fixed canvas viewport height, and centered empty-state content were generated or modified by Codex in response to the user's request.
- **Human decision:** The user explicitly requested a constant container height for canvas and loading/error states.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Viewport-bounded dashboard height provenance

- **AI-generated:** The viewport-bounded panel height and flex-based canvas sizing were generated or modified by Codex in response to the user's correction that the fixed container must not exceed the window height.
- **Human decision:** The user explicitly requested a shared state height bounded by the browser viewport.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Mobile canvas sizing provenance

- **AI-generated:** The responsive app/panel padding and viewport-bounded mobile panel height were generated or modified by Codex in response to the user's request for a wider and taller mobile canvas area.
- **Human decision:** The user explicitly requested more mobile space for the canvas while keeping it within the screen height.
- **Human-modified:** No manual changes were observed during this fix.
- **Unknown provenance:** Existing repository changes outside this fix remain unattributed.

## Foundation task 1.22 provenance

- **AI-generated:** The normalized hierarchy tree projection and its dashboard integration were generated or modified by Codex in this task; no tests were added per the user's explicit instruction.
- **Human decision:** Roots and direct children are visible by default, while deeper descendants remain collapsed, as explicitly resolved in design.md.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes outside this task remain unattributed.

## Foundation task 1.23 provenance

- **AI-generated:** The branch expansion state, accessible controls, and tree integration were generated or modified by Codex in this task; no tests were added per the user's explicit instruction.
- **Human decision:** Expansion is client interaction state, and the approved tree uses accessible expand/collapse controls for branches.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes outside this task remain unattributed.

## Foundation task 1.24 provenance

- **AI-generated:** The node metric presentation, performance-band mapping, accessible text label, and provenance entry were generated or modified by Codex in this task; no tests were added per the user's explicit instruction.
- **Human decision:** The performance thresholds and requirement for text label plus numeric value were explicitly approved by the user and recorded in design.md.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes outside this task remain unattributed.

## Foundation task 1.24a provenance

- **AI-generated:** The deterministic top-down canvas layout, metric cards, directed SVG connections, and migration from nested-list rendering were generated or modified by Codex in this task; no tests were added per the user's explicit instruction.
- **Human decision:** Canvas-first presentation, automatic top-down layout, metric card contents, and initial two-level visibility follow the updated approved design and requirements.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes outside this task remain unattributed.

## Foundation task 1.21a provenance

- **AI-generated:** The spinner, initial retry action, non-blocking revalidation status, and background failure notice were generated or modified by Codex in this task; no tests were added per the user's explicit instruction.
- **Human decision:** Request-state behavior follows the approved Foundation design: initial failures block with retry, while stale snapshots remain usable during revalidation.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes outside this task remain unattributed.

## Task 1.21 provenance

- **AI-generated:** The initial dashboard state view, query-provider wiring, focused component tests, Vitest alias configuration, and this provenance entry were generated or modified by Codex in this task.
- **Human decision:** The loading/error/empty state contract and direct query ownership follow the approved Foundation requirements and ADR-002.
- **Human-modified:** No manual changes were observed during this task.
- **Unknown provenance:** Existing repository changes outside this task remain unattributed.
