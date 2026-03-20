# Tasks: Drag-and-Drop Widget Builder

**Input**: Design documents from `/specs/001-drag-drop-widget-builder/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story for independent implementation and testing.
**Tests**: Not requested in spec — no test tasks generated.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1–US4 maps to spec.md priorities P1–P4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create the file skeleton.

- [ ] T001 Install new npm dependencies: `npm install @dnd-kit/core @dnd-kit/utilities react-rnd` (updates `package.json` and `package-lock.json`)
- [ ] T002 [P] Create directory `src/components/widget-builder/` (empty, to be populated in later phases)
- [ ] T003 [P] Create route directory `app/widget-builder/` and stub file `app/widget-builder/page.tsx` that renders a placeholder `<div>Widget Builder</div>` — verify `http://localhost:3000/widget-builder` returns 200

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data, state shape, and root editor shell that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Create `src/data/widgetDefinitions.ts` — export a `WIDGETS: Widget[]` constant with 4 entries: `company-info` (公司信息, 300×160), `sales-info` (销售信息, 280×200), `product-list` (产品列表, 480×300), `payment-plan` (付款计划, 360×220); each with `id`, `label`, `icon` (emoji), `defaultSize: {w, h}`, and `fields: WidgetField[]` with placeholder text per `data-model.md`
- [ ] T005 Create `src/components/widget-builder/types.ts` — export TypeScript interfaces `Widget`, `WidgetField`, `CanvasItem`, `CanvasState`, and the `EditorAction` discriminated union (`ADD_ITEM | MOVE_ITEM | RESIZE_ITEM | DELETE_ITEM`) as specified in `data-model.md`
- [ ] T006 Create `src/components/widget-builder/canvasReducer.ts` — implement `canvasReducer(state: CanvasState, action: EditorAction): CanvasState` handling all four action types; include boundary-clamp logic (`x >= 0`, `y >= 0`, `x + w <= canvas.width`, `y + h <= canvas.height`) and single-instance guard on `ADD_ITEM`
- [ ] T007 Create `src/components/widget-builder/WidgetBuilderEditor.tsx` — `"use client"` root component; initialise `useReducer(canvasReducer, initialState)` with `canvas = { width: 900, height: 1200, items: [] }`; wrap children in `<DndContext onDragEnd={handleDragEnd}>`; render three-column layout (left 240px fixed / center flex-grow / right 320px fixed) using Tailwind; pass `dispatch` and `canvas` to child zones (props only, no Context yet); implement `handleDragEnd` stub that logs the event
- [ ] T008 Update `app/widget-builder/page.tsx` — replace placeholder with `import WidgetBuilderEditor from '@/src/components/widget-builder/WidgetBuilderEditor'; export default function Page() { return <WidgetBuilderEditor />; }` — verify three-column shell renders at `/widget-builder`

**Checkpoint**: Three-column shell visible at `/widget-builder`. No drag functionality yet.

---

## Phase 3: User Story 1 — 拖拽组件到画布 (Priority: P1) 🎯 MVP

**Goal**: User can drag a widget card from the left panel and drop it onto the canvas; the widget renders at the drop position with its placeholder content.

**Independent Test**: Open `/widget-builder`, drag "公司信息" from the panel to the canvas — it appears at the release position showing company-info placeholder fields.

- [ ] T009 [US1] Create `src/components/widget-builder/DraggableCard.tsx` — `"use client"`; accepts `widget: Widget` and `disabled: boolean`; uses `useDraggable({ id: widget.id, data: { type: 'WIDGET_DROP', widgetId: widget.id, defaultSize: widget.defaultSize } })` from `@dnd-kit/core`; renders a card with icon + label; applies `opacity-40 cursor-not-allowed` when `disabled`; attaches `listeners`, `attributes`, `setNodeRef` per dnd-kit API
- [ ] T010 [US1] Create `src/components/widget-builder/WidgetPanel.tsx` — `"use client"`; accepts `widgets: Widget[]` and `placedWidgetIds: string[]`; renders a scrollable left-column panel with a heading "组件"; maps over `WIDGETS` and renders `<DraggableCard>` for each, passing `disabled={placedWidgetIds.includes(w.id)}`; style: white background, border-right, padding
- [ ] T011 [US1] Create `src/components/widget-builder/CanvasItemContent.tsx` — pure display component; accepts `widget: Widget`; renders widget label as header bar + each `field.label: field.placeholder` row; no drag/resize handles (shared between canvas and preview)
- [ ] T012 [US1] Create `src/components/widget-builder/BuilderCanvas.tsx` — `"use client"`; accepts `canvas: CanvasState`, `widgets: Widget[]`, and `dispatch`; uses `useDroppable({ id: 'canvas' })` to make the canvas div a drop target; renders canvas as `position: relative`, `width: canvas.width`, `height: canvas.height`, `overflow: auto` inside a scrollable wrapper; renders `<CanvasItemStub>` placeholder per item in `canvas.items` (stub renders a div at absolute position for now); highlights drop area with `isOver` state from `useDroppable`
- [ ] T013 [US1] Implement `handleDragEnd` in `WidgetBuilderEditor.tsx` — replace the stub: when `event.over?.id === 'canvas'` and payload `type === 'WIDGET_DROP'`, compute drop coordinates as `{ x: event.activatorEvent.clientX - canvasRect.left - dragOffset.x, y: event.activatorEvent.clientY - canvasRect.top - dragOffset.y }` using `useRef` on the canvas div; dispatch `{ type: 'ADD_ITEM', widgetId, position, size: defaultSize }`; attach `ref` to `BuilderCanvas` and pass it up via callback ref
- [ ] T014 [US1] Wire `WidgetPanel` and `BuilderCanvas` into `WidgetBuilderEditor.tsx` — replace placeholder zones with real components; pass `placedWidgetIds={canvas.items.map(i => i.widgetId)}` to `WidgetPanel`; verify end-to-end: drag card → drops on canvas → item appears

**Checkpoint**: US1 fully functional. Dropped widget renders on canvas. Panel card becomes disabled after drop.

---

## Phase 4: User Story 2 — 在画布上移动和调整组件大小 (Priority: P2)

**Goal**: Items already on the canvas can be freely dragged to new positions and resized by dragging handles, staying within canvas bounds.

**Independent Test**: Place two widgets; drag one to a new position — other is unaffected; drag a corner handle to resize — size persists after release.

- [ ] T015 [US2] Create `src/components/widget-builder/CanvasItem.tsx` — `"use client"`; accepts `item: CanvasItem`, `widget: Widget`, `dispatch`; wraps `<CanvasItemContent>` in `<Rnd>` from `react-rnd` with `bounds="parent"`, `position={{ x: item.x, y: item.y }}`, `size={{ width: item.w, height: item.h }}`, `minWidth={100}`, `minHeight={60}`; `onDragStop` dispatches `MOVE_ITEM`; `onResizeStop` dispatches `RESIZE_ITEM` with new size and position from callback args; includes a `×` delete button (top-right, visible on hover) that dispatches `DELETE_ITEM`
- [ ] T016 [US2] Update `BuilderCanvas.tsx` — replace `CanvasItemStub` with real `<CanvasItem>` components; ensure canvas div has `position: relative` and explicit `width`/`height` so `bounds="parent"` works correctly with `react-rnd`; verify items stay within canvas boundary during drag and resize

**Checkpoint**: US1 + US2 both work. Items can be dropped, moved, and resized. Boundary enforced.

---

## Phase 5: User Story 3 — 实时预览最终效果 (Priority: P3)

**Goal**: Right-side preview panel reflects all canvas changes in real time, scaled to fit the preview column width.

**Independent Test**: Drop and move widgets; the right preview updates instantly without any user action, preserving relative positions and proportions.

- [ ] T017 [US3] Create `src/components/widget-builder/PreviewPane.tsx` — `"use client"`; accepts `canvas: CanvasState`, `widgets: Widget[]`; computes `scale = 320 / canvas.width`; renders a container `div` with fixed width 320px and `overflow: hidden`; inside renders a `position: relative` div with `width: canvas.width`, `height: canvas.height`, `transform: scale(${scale})`, `transformOrigin: 'top left'`; maps `canvas.items` to `<div style={{ position: 'absolute', left: item.x, top: item.y, width: item.w, height: item.h }}>` containing `<CanvasItemContent>`; no drag/resize handles; show a subtle page-frame border
- [ ] T018 [US3] Wire `PreviewPane` into `WidgetBuilderEditor.tsx` — replace right-column placeholder with `<PreviewPane canvas={canvas} widgets={WIDGETS} />`; verify preview updates synchronously as items are dropped, moved, or resized

**Checkpoint**: US1 + US2 + US3 all work. Preview syncs with every canvas change.

---

## Phase 6: User Story 4 — 从画布移除组件 (Priority: P4)

**Goal**: User can delete any placed widget from the canvas; the widget type becomes available again in the panel.

**Independent Test**: Drop "公司信息"; click its `×` button — it disappears from canvas and preview; "公司信息" card in panel returns to active (draggable) state.

- [ ] T019 [US4] Verify `CanvasItem.tsx` delete button already dispatches `DELETE_ITEM` (implemented in T015); confirm `canvasReducer` `DELETE_ITEM` case filters out the item by `id`; confirm `WidgetPanel` re-enables the card when `placedWidgetIds` no longer includes the `widgetId`

**Note**: If T015 was implemented correctly, US4 is already functional — T019 is a verification task only. If the delete button was skipped in T015, implement it here.

**Checkpoint**: All four user stories functional end-to-end.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge case handling, visual refinements, and accessibility improvements.

- [ ] T020 [P] Add drag overlay in `WidgetBuilderEditor.tsx` — use `<DragOverlay>` from `@dnd-kit/core` to show a semi-transparent ghost of the dragged card during panel-to-canvas drag; import `active` from `useDndContext()` to render the correct widget
- [ ] T021 [P] Add canvas drop highlight — in `BuilderCanvas.tsx`, apply a visible dashed border or background tint when `isOver === true` to indicate the canvas is a valid drop target (FR-008)
- [ ] T022 [P] Enforce minimum resize dimensions — verify `CanvasItem.tsx` `minWidth={100}` and `minHeight={60}` props prevent the item from becoming unusably small
- [ ] T023 [P] Handle canvas overflow scrolling — wrap the canvas div in a scrollable container (`overflow: auto`) so items near the bottom of the 1200px canvas are reachable without breaking the three-column layout
- [ ] T024 Add empty-canvas placeholder — in `BuilderCanvas.tsx`, when `canvas.items.length === 0`, render a centered hint text ("从左侧拖拽组件到此处") to guide first-time users (SC-001 / SC-005)
- [ ] T025 [P] Tailwind style pass — apply consistent colors, spacing, and typography across `WidgetPanel`, `BuilderCanvas`, `CanvasItem`, and `PreviewPane` to match the existing project's visual style (reference `app/page.tsx` and existing components for design language)
- [ ] T026 [P] TypeScript strict check — run `npx tsc --noEmit` and fix any type errors across all new files in `src/components/widget-builder/` and `src/data/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **blocks all user stories**
- **US1 (Phase 3)**: Depends on Foundational — no dependency on US2/US3/US4
- **US2 (Phase 4)**: Depends on US1 (reuses `BuilderCanvas` and `CanvasItem` skeleton)
- **US3 (Phase 5)**: Depends on Foundational only — `PreviewPane` reads shared state; can be built in parallel with US2
- **US4 (Phase 6)**: Depends on US2 (`CanvasItem` must exist with delete button)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

| Story | Depends On | Can Parallelise With |
|-------|-----------|---------------------|
| US1 (P1) | Foundational | — |
| US2 (P2) | US1 (needs CanvasItem) | US3 |
| US3 (P3) | Foundational | US2 |
| US4 (P4) | US2 (needs CanvasItem delete button) | — |

### Within Each Phase

- Models / types before reducers
- Reducers before components
- Leaf components (`DraggableCard`, `CanvasItemContent`) before container components (`WidgetPanel`, `BuilderCanvas`)
- Root editor component last in each phase

---

## Parallel Execution Examples

### Phase 2 (Foundational) — run in parallel

```
T004  Create src/data/widgetDefinitions.ts
T005  Create src/components/widget-builder/types.ts
```
Then sequentially: T006 (uses types) → T007 (uses reducer + types) → T008 (uses editor)

### Phase 3 (US1) — run in parallel

```
T009  DraggableCard.tsx
T011  CanvasItemContent.tsx
```
Then: T010 (uses DraggableCard) + T012 (uses CanvasItemContent) in parallel → T013 → T014

### Phase 5 & 4 — run in parallel (different files)

```
Phase 4: T015 CanvasItem.tsx → T016 BuilderCanvas update
Phase 5: T017 PreviewPane.tsx → T018 wire into Editor
```

### Phase 7 — all [P] tasks run in parallel

```
T020  DragOverlay
T021  Canvas drop highlight
T022  Min resize check
T023  Canvas overflow
T025  Tailwind pass
T026  TypeScript check
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (drop widget onto canvas)
4. **STOP and VALIDATE**: Drag-and-drop works end-to-end at `/widget-builder`
5. Demo to stakeholder if sufficient

### Incremental Delivery

1. Setup + Foundational → shell visible
2. US1 → drag-drop working (MVP)
3. US2 + US3 in parallel → move/resize + live preview
4. US4 → delete to complete CRUD cycle
5. Polish → production-ready prototype

### Total Task Count

| Phase | Tasks | Notes |
|-------|-------|-------|
| Setup | 3 | T001–T003 |
| Foundational | 5 | T004–T008 |
| US1 (P1) | 6 | T009–T014 |
| US2 (P2) | 2 | T015–T016 |
| US3 (P3) | 2 | T017–T018 |
| US4 (P4) | 1 | T019 |
| Polish | 7 | T020–T026 |
| **Total** | **26** | |

---

## Notes

- All new files go under `src/components/widget-builder/` or `src/data/` — no existing files modified except `package.json`
- Every component in `widget-builder/` requires `"use client"` directive
- `app/widget-builder/page.tsx` stays as a Server Component (imports the client editor)
- [P] = different files, no incomplete dependencies — safe to parallelise
- Commit after each phase checkpoint for clean rollback points
- Run `npm run dev` and visit `http://localhost:3000/widget-builder` to verify after each checkpoint
