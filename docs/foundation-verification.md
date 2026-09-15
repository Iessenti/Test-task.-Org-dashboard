# Foundation verification record

Дата проверки: 2026-09-15.

## Выполненные проверки

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed; production bundle `118.81 kB` gzip.
- Mock API smoke check в браузере — `GET /api/org-tree` отдал валидную
  организацию; в UI отображены 12 узлов начального canvas, 8 узлов второго
  уровня и 17 connection paths в текущем viewport.
- Browser checkpoint — начальная загрузка, canvas, card content, текстовая и
  числовая performance-индикация, `+`, `−`, `Fit view`, `Сбросить`, zoom, pan,
  expand и collapse наблюдались. После expand `Отдел 1.1` команды появились,
  после collapse исчезли.

## Аудит Foundation-сценариев

- Runtime validation, hierarchy invariants, normalization, query ownership,
  stale time, semantic reconciliation, cancellation и initial/background
  request states реализованы в `src/data/org-tree/` и
  `src/containers/OrganizationDashboard/`; ранее выполненные Foundation
  tasks фиксируют targeted проверки этих boundary cases.
- Canvas hierarchy, initial second-level visibility, connections, controls,
  card metrics и independent branch expansion подтверждены browser evidence
  выше.
- Core table, aggregation и Polish realtime не входят в текущий Foundation
  scope и в этот record не засчитываются.

## Невыполненное evidence

В текущем checkout нет test-файлов и test script в `package.json`, поэтому
targeted automated tests, требуемые задачей 1.27, не удалось запустить. В
истории Git обнаруживаются прежние test-файлы, но их восстановление или
изменение тестовой инфраструктуры выходит за пределы простого stage audit и
требует отдельного решения/действия. До устранения этого ограничения задача
1.27 не отмечается выполненной.

