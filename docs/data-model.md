# Модель данных

## Плоский DTO

API возвращает массив узлов:

```ts
type OrgNodeDto = {
  id: string;
  name: string;
  parentId: string | null;
  headcount: number;   // integer, >= 0
  budget: number;      // finite, >= 0
  performance: number; // 0..100
  updatedAt: string;
};
```

Пустой массив валиден. Для непустой коллекции клиент проверяет уникальность
`id`, существование каждого `parentId` и отсутствие циклов. Невалидная
коллекция не публикуется как snapshot.

## Нормализованный snapshot

Foundation хранит одну каноническую запись узла на `id`:

```ts
type OrgSnapshot = {
  nodesById: Record<string, OrgNodeDto>;
  rootIds: string[];
  childrenByParentId: Record<string, string[]>;
  depthById: Record<string, number>;
  aggregatesById: Record<string, OrgAggregate>;
};

type OrgAggregate = {
  totalHeadcount: number;
  totalBudget: number;
  weightedPerformanceSum: number;
};
```

`rootIds` сохраняет порядок корней из API. `childrenByParentId` сохраняет
порядок детей из API и содержит пустой список для каждого узла. `depthById`
вычисляется от корня, где корень имеет depth `0`. Эти индексы являются
производными от `nodesById`; отдельные копии узлов для UI не создаются.

`aggregatesById` добавляется в Core и является частью текущего опубликованного
snapshot. Для каждого узла он содержит агрегат полного поддерева, включая
собственный raw-вклад узла. Среднее performance не хранится отдельно, чтобы
не создавать второй источник истины.

## Агрегация

Первоначальный расчёт выполняется одним post-order обходом после валидации и
построения topology indexes. Для узла `v`:

```text
totalHeadcount(v) = headcount(v) + Σ totalHeadcount(child)
totalBudget(v) = budget(v) + Σ totalBudget(child)
weightedPerformanceSum(v) = performance(v) * headcount(v)
  + Σ weightedPerformanceSum(child)
averagePerformance(v) = weightedPerformanceSum(v) / totalHeadcount(v)
```

Если `totalHeadcount(v) = 0`, числовое среднее отсутствует и UI отображает
`—`. Так сохраняется корректность и для leaf, и для внутренних узлов с нулевой
численностью.

Начальный расчёт обрабатывает каждый узел и каждую связь один раз и имеет
сложность `O(n + e)`, линейную для валидного дерева/леса. После принятия нового
полного snapshot этот расчёт выполняется один раз для нового snapshot. При
семантически неизменном revalidation текущий snapshot и
`aggregatesById` сохраняют identity; обычные rerenders проекций повторно
агрегаты не вычисляют.

## Проекции Core

Табличная строка является производной структурой и не заменяет canonical
узел:

```ts
type OrganizationTableRow = {
  id: string;
  subdivision: string;
  level: 'Дивизион' | 'Отдел' | 'Команда';
  totalEmployees: number;
  totalBudget: number;
  averagePerformance: number | null;
};
```

`totalEmployees`, `totalBudget` и `averagePerformance` берутся из
`aggregatesById`; `subdivision` и level — из узла и его depth. Фильтрация по
имени добавляет к совпадениям необходимые ancestor rows, а сортировка работает
только с производными rows. Ни одна из операций не мутирует `nodesById`,
`rootIds`, `childrenByParentId`, `depthById` или `aggregatesById`.

Canvas cards, detail panel и table rows используют тот же snapshot. Общий
выбор хранится отдельно как `selectedNodeId: string | null`; node objects и
row indexes в selection state не сохраняются. При скрытом выбранном canvas-узле
его ancestors раскрываются, после чего viewport центрирует узел. Detail panel
показывает raw-метрики, агрегаты поддерева, детей и `updatedAt`, а в table mode
скрывается без сброса `selectedNodeId`.

## Публикация и identity

Преобразование `unknown → validated DTO → OrgSnapshot` атомарно. При успешной
revalidation семантически равных raw-узлов текущий snapshot и topology
identity сохраняются, а обновляется только freshness query. При реальном
изменении публикуется новый полностью нормализованный snapshot.

Canvas expansion, viewport и selection — client interaction state. Они не
являются частью server-derived модели.

## Сложность обновлений

До Polish Core принимает полные snapshots и выполняет их валидацию,
нормализацию и начальную агрегацию до публикации. В дальнейшем для одобренного
ADR 001 metric-only patch пересчитывается только target и цепочка его предков.
Поскольку каждый затронутый aggregate заново собирается из raw-вклада и
direct-child aggregates, стоимость равна обработанным узлам и связям в этой
цепочке и в худшем случае `O(n + e)`. Это точнее, чем обещание строго `O(h)`;
unrelated branches не пересчитываются.
