# ADR 002: Владение серверными данными и кэширование

- Статус: принято
- Дата: 2026-09-15

## Контекст

Клиенту нужны общий кэш `GET /api/org-tree`, stale time 5 секунд,
дедупликация, SWR-подобная ревалидация, корректная отмена общего запроса и
последующее применение realtime-патчей без полного refetch. Кэш должен хранить
целостный нормализованный `OrgSnapshot`, определённый в ADR 001, без второй
копии серверных данных в React state.

## Рассмотренные варианты

- **TanStack Query.** Прямо поддерживает `staleTime`, общий in-flight request,
  `AbortSignal`, background revalidation и иммутабельное обновление кэша.
  Минусы — новая production dependency и необходимость осознанно настроить
  автоматические refetch/retry.
- **SWR.** Имеет простой cache/mutate API, дедупликацию и удобные состояния
  revalidation. Точный stale time 5 секунд и cancellation общего запроса
  требуют дополнительной логики.
- **Небольшой custom resource layer.** Даёт полный контроль и не добавляет
  зависимостей, но заставляет самостоятельно реализовать и тестировать
  freshness, deduplication, subscriber-aware cancellation и concurrency.
- **Локальный React state/Context.** Прост на старте, но сам по себе не решает
  кэширование и дедупликацию и создаёт риск нескольких источников истины.

## Решение

Использовать TanStack Query. Один query entry владеет полным `OrgSnapshot` и
состояниями загрузки, ошибки, ревалидации и свежести. Runtime validation,
нормализация и первоначальная агрегация выполняются до записи snapshot в кэш.

Fresh data не запрашивается повторно в течение 5 секунд. Stale snapshot
остаётся доступным во время фоновой ревалидации. Одинаковый ответ обновляет
freshness metadata, но сохраняет существующий snapshot и агрегаты.

Общий запрос принадлежит query, а не компоненту: unmount одного observer не
отменяет запрос для остальных; после ухода последнего observer запрос может
быть отменён через переданный в `fetch` `AbortSignal`.

В Polish realtime-патч применяется иммутабельно непосредственно к cached
`OrgSnapshot`: обновляет raw-метрики целевого узла и агрегаты его цепочки
предков без invalidation и полного refetch.

## Последствия

- дерево и таблица читают один canonical cached snapshot;
- компоненты не зеркалируют server-derived data в локальном state;
- selection, sorting, filtering и expansion остаются отдельным client state;
- invalid response никогда не попадает в кэш;
- policy для retry/refetch triggers, semantic equality и race между GET и
  realtime patch фиксируется отдельно.
