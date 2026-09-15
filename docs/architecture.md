# Архитектура Foundation

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
  connections, controls viewport и локальное состояние раскрытия/сворачивания.
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
   заменяет ранее опубликованный валидный snapshot.
6. Query публикует snapshot в dashboard. Canvas читает его через props и
   строит видимые cards и connections; server-derived data не копируется в
   локальный store.

Fresh snapshot используется до пяти секунд. При revalidation устаревший
snapshot остаётся видимым, пока один общий запрос получает новую версию.
Неизменившийся ответ сохраняет identity текущего snapshot и topology indexes;
изменившийся валидный ответ заменяется атомарно.

