# Модель данных Foundation

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
};
```

`rootIds` сохраняет порядок корней из API. `childrenByParentId` сохраняет
порядок детей из API и содержит пустой список для каждого узла. `depthById`
вычисляется от корня, где корень имеет depth `0`. Эти индексы являются
производными от `nodesById`; отдельные копии узлов для UI не создаются.

Foundation намеренно не содержит `aggregatesById`: агрегаты относятся к
следующей стадии и не являются частью текущего опубликованного контракта.

## Публикация и identity

Преобразование `unknown → validated DTO → OrgSnapshot` атомарно. При успешной
revalidation семантически равных raw-узлов текущий snapshot и topology
identity сохраняются, а обновляется только freshness query. При реальном
изменении публикуется новый полностью нормализованный snapshot.

Canvas expansion, viewport и selection — client interaction state. Они не
являются частью server-derived модели.

