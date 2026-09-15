# Архитектура

## Слои

- `server/` — независимый mock API на встроенном `node:http`. Он владеет
  детерминированным плоским fixture и отвечает на `GET /api/org-tree`.
- `src/data/org-tree/` — граница данных клиента: HTTP/JSON обработка,
  runtime-валидация, проверка инвариантов и нормализация в `OrgSnapshot`.
- TanStack Query — единственный владелец состояния запроса и кэша
  организации. Для ресурса используется stale time 5 секунд, общие
  concurrent-запросы, SWR-поведение и переданный `AbortSignal`.
- `src/features/organization-tree/` — производная canvas-проекция
  нормализованной иерархии. Здесь находятся автоматический layout, directed
  connections, controls viewport, локальное состояние раскрытия/сворачивания
  и canvas detail panel.
- `src/features/organization-table/` — производная аналитическая проекция:
  строки строятся из snapshot, затем фильтруются и сортируются без изменения
  canonical data.
- `src/containers/OrganizationDashboard/` — orchestration и представление
  loading, initial error, valid empty и non-blocking background update states.

## Поток данных API → UI

1. Vite proxy направляет `/api/*` на независимо запущенный mock API.
2. Query function выполняет GET с `Accept: application/json` и переданным
   TanStack Query `AbortSignal`.
3. Клиент различает transport, HTTP, JSON, validation и abort ошибки.
4. Payload сначала принимается как `unknown`, затем проходит Zod-проверку
   полей и проверку topology invariants.
5. Только валидный payload нормализуется в `OrgSnapshot`; невалидный ответ не
   заменяет ранее опубликованный валидный snapshot. При нормализации Core
   выполняется один post-order расчёт `aggregatesById`.
6. Query публикует snapshot в dashboard. Canvas и table читают один snapshot
   через props и строят свои производные представления; server-derived data
   не копируется в локальный store.

Fresh snapshot используется до пяти секунд. При revalidation устаревший
snapshot остаётся видимым, пока один общий запрос получает новую версию.
Неизменившийся ответ сохраняет identity текущего snapshot и topology indexes;
изменившийся валидный ответ заменяется атомарно вместе с его агрегатами.

## Core-проекции и выбор

Таблица строит по одной строке на каждый узел из `nodesById`, `depthById` и
`aggregatesById`. В строку входят подразделение, метка уровня, total employees,
total budget и average performance. Поиск и сортировка применяются к этой
производной коллекции; они не меняют canonical порядок узлов, topology indexes
или агрегаты.

Canvas использует те же узлы и агрегаты для карточек и directed connections.
Выбор хранится на уровне dashboard как `selectedNodeId`. Поэтому строка,
карточка и detail panel всегда ссылаются на одну identity, а сортировка,
фильтрация и переключение представлений не создают отдельных selected objects.
На canvas detail panel показывает raw-метрики выбранного узла отдельно от
агрегатов его поддерева, список детей и `updatedAt`; в table mode панель скрыта,
но общий selected id сохраняется.

## Оценка сложности

Для snapshot из `n` узлов и `e` связей валидация и построение topology indexes
занимают `O(n + e)`. Начальный post-order расчёт всех агрегатов также занимает
`O(n + e)` (в валидной иерархии `e <= n - 1`), поэтому считается линейным.
Построение table rows — `O(n)`, фильтрация — `O(n)`, а сортировка — `O(n log n)`
для активной сортировки. Обычные React-рендеры canvas/table используют уже
принятые snapshot и агрегаты и не запускают новый полный aggregate pass.

В Polish ADR 001 предусматривает пересчёт только изменённого узла и цепочки
его предков. Выбранный алгоритм заново суммирует direct children каждого
затронутого узла: его стоимость равна числу обработанных узлов и прямых
связей в этой цепочке, в худшем случае `O(n + e)`, а не обещанному строго
`O(h)`. Полный пересчёт unrelated branches не выполняется.
