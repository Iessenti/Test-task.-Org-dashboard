# React development guidelines

Этот документ — рабочий prompt для разработки и ревью React-кода в проекте.
Его цель — проверять не только работоспособность UI, но и то, естественно ли
задача выражена через модель React.

## Prompt

> Работай как строгий reviewer React-кода. Перед изменением прочитай исходное
> задание, OpenSpec, ADR и существующую реализацию. Не изобретай требования и
> не расширяй scope без решения владельца продукта.
>
> Для каждого изменения сначала определи observable behavior, owner состояния,
> границы компонентов и способ проверки. Предпочитай прямой data flow сверху
> вниз и события снизу вверх. Ищи code-judo решение: можно ли удалить слой,
> флаг, эффект, ветку или дублируемую модель, а не просто переместить код.
>
> Главный вопрос для каждой задачи: **естественно ли эта задача выражена через
> модель React?**

## 1. State model

- Храни только минимальное состояние, которое нельзя вычислить из props,
  server state или другого state.
- Не храни derived state: фильтрованные строки, layout, totals, display labels,
  `isEmpty`, `isSelected` и подобные значения вычисляются во время render или в
  чистой функции.
- Не дублируй один объект в нескольких state/store. Для entity используй одну
  canonical identity, обычно `id`.
- Определи owner каждого state до написания компонента:
  - server state — query/cache;
  - shared UI state — ближайший общий контейнер;
  - локальное взаимодействие — feature container или hook;
  - transient imperative data — ref внутри поведения.
- Модель должна не позволять противоречивые состояния. Предпочитай union/reducer
  или атомарный переход вместо набора независимых boolean-флагов.
- Не исправляй state через `setState` во время render и не создавай цепочки
  эффектов для согласования нескольких state.

## 2. Effects model

- `useEffect` допустим, когда React синхронизируется с внешней системой:
  DOM API, subscription, timer, animation frame, network bridge или browser
  API.
- Не используй effect для вычислений, derived state, копирования props в state,
  запуска React data flow или последовательной передачи результата между
  эффектами.
- Каждый effect должен иметь ясные dependencies, cleanup и понятную модель
  повторного запуска.
- Проверяй поведение при StrictMode, быстрых изменениях props и unmount.
- Для animation frame/timer cleanup обязан отменять старую работу и не должен
  позволять устаревшему callback менять актуальное состояние.

## 3. Component model

- Компонент должен выражать композицию UI, а не быть процедурным контроллером.
- Один компонент не должен одновременно владеть data fetching, layout engine,
  pointer lifecycle, animation loop, SVG-рендерингом и деталями карточки.
- Используй явные boundaries:
  - container — orchestration и ownership;
  - component — визуальная композиция;
  - hook — reusable behavior;
  - model/helper — pure computation;
  - style file — styled-components.
- Каждый React-компонент размещай в отдельном файле.
- Styled-components размещай в соседнем `ComponentName.style.ts`.
- Не создавай компонент только ради механического переноса пяти строк. Граница
  должна уменьшать число концепций, которые читатель держит в голове.
- Не допускай файлов и компонентов, которые растут до монолита; при заметном
  росте сначала пересмотри boundary.

## 4. Hooks

- Custom hook должен иметь имя, описывающее behavior, и небольшой понятный
  контракт входов/выходов.
- Hook оправдан, если инкапсулирует reusable lifecycle или interaction
  behavior, а не просто скрывает JSX или перемещает код в другой файл.
- Не смешивай в одном hook server fetching, layout, selection и DOM gesture,
  если это разные owners.
- Возвращай семантические actions (`zoomIn`, `resetView`, `consumePan`), а не
  внутренние setters и refs без необходимости.
- Не создавай hook для одноразовой чистой функции — вынеси её в model/helper.

## 5. Data flow

- Данные идут предсказуемо сверху вниз через typed props.
- События идут обратно через callbacks с узким контрактом.
- Не синхронизируй sibling-компоненты через refs, эффекты, module globals или
  скрытый Context.
- Shared selection передавай как identity (`selectedNodeId`), а не как объект
  entity или индекс строки.
- Feature не должна импортировать соседнюю feature. Их координирует container.
- Для двух представлений используй одну точку orchestration:

  ```text
  OrganizationDashboard
    ├── OrganizationTree
    └── OrganizationTable
  ```

## 6. Identity и lifecycle

- `key` должен описывать identity entity и быть стабильным между render’ами.
- Не используй index как key для reorderable/filterable списка.
- Понимай, когда key вызывает reset state, а когда React сохраняет state.
- Не привязывай selection к позиции строки или layout position.
- Ref используй только для mutable imperative value, который не должен вызывать
  render.
- Не читай и не мутируй refs во время render. Чтение и mutation допустимы в
  event handler/effect, если lifecycle этого требует.
- Учитывай stale closures: event handler должен использовать functional state
  update, когда зависит от предыдущего state.

## 7. Server state

- Server state не копируй в `useState`, Context или самодельный cache.
- Для TanStack Query:
  - query key должен однозначно описывать ресурс;
  - query function должна использовать переданный `AbortSignal`;
  - `staleTime`, retry и refetch triggers должны быть явной policy;
  - stale data остаётся видимой во время background refetch;
  - invalid response не заменяет последнюю валидную snapshot;
  - semantic no-op должен сохранять identity snapshot, если это важно для
    projections;
  - mutation/update должен быть атомарным и менять только затронутую область;
  - не инвалидируй query без необходимости полного refetch.
- Query cache может быть canonical owner server-derived snapshot, но не должен
  превращаться в неявный domain store с несогласованными локальными копиями.

## 8. Rendering model

- Render должен быть pure, deterministic и повторяемым.
- Не выполняй в render DOM mutation, network request, timer, subscription или
  запись в ref.
- Чистые преобразования данных допустимы во время render; дорогие вычисления
  выноси в pure model и мемоизируй только при доказанной необходимости.
- Не полагайся на то, что render произойдёт один раз.
- Loading, initial error, empty, background error и usable stale data должны
  быть отдельными состояниями, если это предусмотрено требованиями.

## 9. Performance model

- Сначала устраняй архитектурные причины render’ов: слишком высокий owner,
  широкие props, смешанные responsibilities и state, который можно локализовать.
- `memo`, `useMemo` и `useCallback` не добавляй профилактически.
- Мемоизируй pure projection/layout, когда identity inputs стабильны и есть
  реальная стоимость повторного вычисления.
- Animation state может обновляться часто, но animation surface должна быть
  отделена от тяжёлого data/render tree.
- Не оптимизируй микроскопические участки ценой менее понятной модели.

## 10. React API usage

- `useState` — для client interaction state.
- `useReducer` — для нескольких связанных переходов и инвариантов.
- `useMemo` — для дорогого derived computation, а не для маскировки плохих
  dependencies.
- `useCallback` — только если стабильная identity callback нужна downstream.
- `useRef` — для imperative mutable value без render.
- `useEffect` — только для external synchronization.
- Context — для действительно shared ambient dependency, не для обхода props
  и не для скрытого event bus.
- `key` — для identity/lifecycle, не для случайного forcing rerender.

## Архитектура файлов

Используй абсолютные импорты `@/*` между слоями и feature-модулями. Относительный
импорт допустим только для тесно связанных файлов в одной небольшой папке.

```text
src/
  containers/
    OrganizationDashboard/
      OrganizationDashboard.tsx
      OrganizationDashboardView.tsx
      OrganizationDashboardView.style.ts

  features/
    organization-tree/
      containers/
      components/
      hooks/
      model/

    organization-table/
      containers/
      components/
      hooks/
      model/

  data/
    org-tree/
```

Глубина вложенности — не более четырёх уровней. `organization-tree` и
`organization-table` не импортируют друг друга. Общие server/domain данные
живут в `data`, orchestration двух интерфейсов — в `containers`.

## Review protocol

Перед ревью ответь на вопросы:

1. Какой observable behavior меняется?
2. Кто владеет каждым state и почему?
3. Какой state является derived и почему он не хранится?
4. Каждый ли effect синхронизирует React с внешней системой?
5. Можно ли удалить effect, boolean, wrapper или слой?
6. Не смешаны ли container, pure model и visual component?
7. Что происходит при повторном render, StrictMode и unmount?
8. Стабильны ли keys и identity после sort/filter/update?
9. Не появился ли второй cache server state?
10. Какие automated/runtime evidence подтверждают поведение?

После реализации обязательно:

- запусти релевантные tests;
- выполни `typecheck`, `lint` и `build`;
- проверь браузерное поведение для пользовательских сценариев;
- проверь diff и незапланированное scope expansion;
- зафиксируй остаточную неопределённость;
- для значимых изменений получи независимое read-only review.

