# Implementation Plan: Drag-and-Drop Widget Builder

**Branch**: `001-drag-drop-widget-builder` | **Date**: 2026-03-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-drag-drop-widget-builder/spec.md`

---

## Summary

Build a three-column prototype editor that lets users drag Proposal widget modules (Company Info, Sales Info, Product List, Payment Plan) from a left panel onto a free-form canvas, freely reposition and resize them, and see a live scaled preview in the right column. Uses `@dnd-kit/core` for panel-to-canvas drag-and-drop and `react-rnd` for in-canvas movement and resizing.

---

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19
**Primary Dependencies**: Next.js 15, Tailwind CSS 4, `@dnd-kit/core`, `@dnd-kit/utilities`, `react-rnd`
**Storage**: None (prototype — in-memory state only, no persistence)
**Testing**: Manual / visual verification (no automated test suite in current project)
**Target Platform**: Web browser (desktop), served via Next.js dev server
**Project Type**: Web application — single-page prototype UI
**Performance Goals**: Drag interaction at 60fps; preview updates synchronously with canvas state
**Constraints**: No backend, no authentication, no data persistence; prototype scope only
**Scale/Scope**: Single editor page, 4 widget types, up to ~10 canvas items

---

## Constitution Check

*No `.specify/memory/constitution.md` found — no project-level gates to enforce.*

All architectural decisions default to simplest viable approach:
- ✅ Single page, no routing complexity introduced
- ✅ No new backend services
- ✅ Minimal dependency footprint (2 new packages)
- ✅ No persistence layer added
- ✅ Existing components and views untouched

---

## Project Structure

### Documentation (this feature)

```text
specs/001-drag-drop-widget-builder/
├── plan.md              # This file
├── research.md          # Phase 0: library decisions
├── data-model.md        # Phase 1: entities and state shape
├── quickstart.md        # Phase 1: implementation guide
├── contracts/
│   └── ui-contracts.md  # Phase 1: zone behavioral contracts
└── tasks.md             # Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (repository root)

项目使用 Next.js 15 App Router，所有页面位于 `/app/` 目录下。新增一个独立路由页面，与现有页面并列：

```text
app/
├── page.tsx                             # 现有 — 主提案页
├── proposal-v2/page.tsx                 # 现有
├── compare/page.tsx                     # 现有
├── proposal-pdf/page.tsx                # 现有
├── proposal-pdf2/page.tsx               # 现有
├── proposal-pdf3/page.tsx               # 现有
└── widget-builder/
    └── page.tsx                         # NEW: 路由入口，访问 /widget-builder

src/
├── data/
│   └── widgetDefinitions.ts             # NEW: 静态 Widget 定义（4 种类型）
├── components/
│   ├── widget-builder/
│   │   ├── WidgetBuilderEditor.tsx      # NEW: 编辑器根组件（owns EditorState + DndContext）
│   │   ├── WidgetPanel.tsx              # NEW: 左列 — 可拖拽组件卡片列表
│   │   ├── DraggableCard.tsx            # NEW: 单个 @dnd-kit 拖拽卡片
│   │   ├── BuilderCanvas.tsx            # NEW: 中列 — drop target + CanvasItem 列表
│   │   ├── CanvasItem.tsx               # NEW: react-rnd 包裹的单个画布实例
│   │   └── PreviewPane.tsx              # NEW: 右列 — 等比缩放只读预览
│   └── (现有 components 不变)
└── (现有 views / assets / data 不变)

package.json                             # MODIFIED: +@dnd-kit/core, +@dnd-kit/utilities, +react-rnd
```

**访问路径**: `http://localhost:3000/widget-builder`

**Structure Decision**: 遵循项目现有 App Router 惯例，新增 `app/widget-builder/page.tsx` 作为路由入口，渲染 `src/components/widget-builder/WidgetBuilderEditor.tsx`。所有新逻辑完全隔离在 `src/components/widget-builder/` 下，不修改任何现有文件（除 `package.json`）。

**`use client` 说明**: `WidgetBuilderEditor.tsx` 及其所有子组件均需标注 `"use client"`，因为拖拽和状态管理依赖浏览器事件。`app/widget-builder/page.tsx` 本身保持 Server Component，仅导入并渲染 `WidgetBuilderEditor`。

---

## Phase 0: Research Output

See [research.md](./research.md) for full decisions. Summary:

| Decision | Choice | Key Reason |
|----------|--------|-----------|
| DnD library | `@dnd-kit/core` | Best panel-to-canvas architecture; React 19 compatible |
| Resize library | `react-rnd` | Built-in 8-direction handles + `bounds="parent"` boundary enforcement |
| State management | React `useReducer` | Prototype scope; no external state library needed |
| Canvas layout | Absolute positioning in fixed-size div | Matches free-form placement requirement |
| Preview rendering | CSS `transform: scale()` | Zero-recalculation proportional scaling |

---

## Phase 1: Design Output

### Data Model Summary

See [data-model.md](./data-model.md) for full schema. Key shapes:

```
Widget        — static definition: id, label, icon, defaultSize, fields[]
CanvasItem    — runtime instance: id, widgetId, x, y, w, h
Canvas        — root state: width, height, items: CanvasItem[]
```

State transitions:
- Drop from panel → new CanvasItem appended to `canvas.items`
- Drag on canvas → CanvasItem x/y updated
- Resize on canvas → CanvasItem w/h (and optionally x/y) updated
- Delete → CanvasItem removed from `canvas.items`

### UI Contracts Summary

See [contracts/ui-contracts.md](./contracts/ui-contracts.md). Three zones:

| Zone | Input | Emits |
|------|-------|-------|
| WidgetPanel | Widget[], placedWidgetIds[] | DnD drag start |
| BuilderCanvas | CanvasItem[], canvasSize | onDrop, onMove, onResize, onDelete |
| PreviewPane | CanvasItem[], Widget[], previewWidth | nothing (read-only) |

### Implementation Sequence

See [quickstart.md](./quickstart.md) for code patterns. Ordered steps:

1. **Static layout** — three-column shell page
2. **Widget definitions** — `widgetDefinitions.ts` + static panel cards
3. **Drop zone** — `DndContext` + `useDraggable` + `useDroppable` → ADD_ITEM
4. **CanvasItem rendering** — `react-rnd` positioned divs with placeholder content
5. **Move & resize** — `onDragStop` + `onResizeStop` → MOVE_ITEM / RESIZE_ITEM
6. **Delete** — `×` button → DELETE_ITEM
7. **Live preview** — scaled read-only render in PreviewPane
