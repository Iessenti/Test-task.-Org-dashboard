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
